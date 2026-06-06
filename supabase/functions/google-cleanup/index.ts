// Bulk delete Google Calendar events created by Productivity Tracker
// Iterates: list events → delete batch → list again → repeat until empty
// Handles rate limits with delays and retries
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { getSupabaseAdmin, getUserFromAuth } from '../_shared/supabase.ts'
import { getValidAccessToken } from '../_shared/google.ts'

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
const BATCH_SIZE = 20  // delete this many in parallel per batch
const BATCH_DELAY_MS = 500  // wait this long between batches
const MAX_ITERATIONS = 50  // safety: max number of list→delete cycles

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function refreshAndUpdateToken(supabase: any, userId: number, user: any) {
  const tokenResult = await getValidAccessToken(user)
  if (tokenResult.refreshed) {
    await supabase
      .from('users')
      .update({
        google_access_token: tokenResult.newAccessToken,
        google_token_expiry: tokenResult.newExpiry
      })
      .eq('id', userId)
  }
  return tokenResult.accessToken
}

async function listEvents(accessToken: string, timeMin: string, timeMax: string, pageToken?: string) {
  const params = new URLSearchParams({
    q: 'Productivity Tracker',
    timeMin,
    timeMax,
    maxResults: '250',
    singleEvents: 'true'
  })
  if (pageToken) params.set('pageToken', pageToken)

  const res = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`List failed: HTTP ${res.status} - ${err}`)
  }
  return await res.json()
}

async function deleteEvent(accessToken: string, eventId: string, retry = 0): Promise<{ success: boolean, error?: string }> {
  try {
    const res = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )

    // 200/204/404/410 = success or already gone
    if (res.ok || res.status === 404 || res.status === 410) {
      return { success: true }
    }

    // 403 rate limit OR 429 too many requests → retry with backoff
    if ((res.status === 403 || res.status === 429) && retry < 3) {
      await sleep(1000 * (retry + 1))  // 1s, 2s, 3s backoff
      return deleteEvent(accessToken, eventId, retry + 1)
    }

    const err = await res.text().catch(() => 'unknown')
    return { success: false, error: `HTTP ${res.status}: ${err.substring(0, 100)}` }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const authUser = await getUserFromAuth(req)
    if (!authUser) return errorResponse('Unauthorized', 401)

    const body = await req.json().catch(() => ({}))
    const { user_id, time_min, time_max } = body

    const targetUserId = user_id || authUser.id

    const supabase = getSupabaseAdmin()
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, google_refresh_token, google_access_token, google_token_expiry')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) return errorResponse('User not found', 404)
    if (!targetUser.google_refresh_token) return errorResponse('Google not connected', 400)

    let accessToken = await refreshAndUpdateToken(supabase, targetUserId, targetUser)

    const timeMin = time_min || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    const timeMax = time_max || new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString()  // 2 years ahead for long recurrences

    let totalFound = 0
    let totalDeleted = 0
    let totalFailed = 0
    const errors: string[] = []

    // Iterate: list → delete batch → list again → repeat
    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      // Refresh token periodically (every 10 iterations to be safe)
      if (iteration > 0 && iteration % 10 === 0) {
        try {
          const { data: refreshedUser } = await supabase
            .from('users')
            .select('id, google_refresh_token, google_access_token, google_token_expiry')
            .eq('id', targetUserId)
            .single()
          if (refreshedUser) {
            accessToken = await refreshAndUpdateToken(supabase, targetUserId, refreshedUser)
          }
        } catch (e) {
          console.error(`[Cleanup] Token refresh at iteration ${iteration} failed:`, e.message)
        }
      }

      // Fetch a page of events
      let listData: any
      try {
        listData = await listEvents(accessToken, timeMin, timeMax)
      } catch (e) {
        console.error(`[Cleanup] List failed at iteration ${iteration}:`, e.message)
        errors.push(`List iteration ${iteration}: ${e.message}`)
        break
      }

      const events = listData.items || []
      console.log(`[Cleanup] Iteration ${iteration}: found ${events.length} events`)

      if (events.length === 0) {
        console.log(`[Cleanup] No more events. Done.`)
        break
      }

      totalFound += events.length

      // Delete in batches of BATCH_SIZE in parallel
      for (let i = 0; i < events.length; i += BATCH_SIZE) {
        const batch = events.slice(i, i + BATCH_SIZE)
        const results = await Promise.all(
          batch.map((ev: any) => deleteEvent(accessToken, ev.id))
        )
        const successCount = results.filter(r => r.success).length
        totalDeleted += successCount
        totalFailed += (batch.length - successCount)
        results.filter(r => !r.success && r.error).forEach(r => {
          if (errors.length < 10) errors.push(r.error!)  // keep first 10 errors only
        })

        // Small delay between batches to avoid rate limit
        if (i + BATCH_SIZE < events.length) {
          await sleep(BATCH_DELAY_MS)
        }
      }

      // Delay between iterations
      await sleep(BATCH_DELAY_MS)

      // If everything in this batch failed, give up to avoid infinite loop
      if (totalDeleted === 0 && iteration > 2) {
        console.log(`[Cleanup] Nothing deleted in last 3 iterations, giving up`)
        break
      }
    }

    return jsonResponse({
      total_found: totalFound,
      deleted_count: totalDeleted,
      failed_count: totalFailed,
      errors: errors.slice(0, 5)  // return only first 5 errors for debug
    })
  } catch (e) {
    console.error('google-cleanup error:', e)
    return errorResponse(e.message, 500)
  }
})
