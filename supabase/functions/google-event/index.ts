// Unified Edge Function for create/update/delete Google Calendar events
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { getSupabaseAdmin, getUserFromAuth } from '../_shared/supabase.ts'
import {
  getValidAccessToken,
  buildCalendarEvent,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '../_shared/google.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const authUser = await getUserFromAuth(req)
    if (!authUser) return errorResponse('Unauthorized', 401)

    const body = await req.json()
    const { action, user_id, activity, event_id, include_meet } = body

    if (!action) return errorResponse('Action required: create, update, or delete')

    // Use the activity's on_duty_user_id (or fallback to current user)
    const targetUserId = user_id || authUser.id

    const supabase = getSupabaseAdmin()
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, google_refresh_token, google_access_token, google_token_expiry')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) return errorResponse('User not found', 404)
    if (!targetUser.google_refresh_token) return errorResponse('Google not connected', 400)

    // Get valid access token
    const tokenResult = await getValidAccessToken(targetUser)

    // Persist new token if refreshed
    if (tokenResult.refreshed) {
      await supabase
        .from('users')
        .update({
          google_access_token: tokenResult.newAccessToken,
          google_token_expiry: tokenResult.newExpiry
        })
        .eq('id', targetUserId)
    }

    const accessToken = tokenResult.accessToken

    // Perform requested action
    if (action === 'create') {
      if (!activity) return errorResponse('Activity required')
      const event = buildCalendarEvent(activity, include_meet)
      const eventId = await createCalendarEvent(accessToken, event, include_meet)
      return jsonResponse({ event_id: eventId })
    }

    if (action === 'update') {
      if (!activity) return errorResponse('Activity required')
      if (!event_id) return errorResponse('Event ID required')
      const event = buildCalendarEvent(activity, include_meet)
      const newEventId = await updateCalendarEvent(accessToken, event_id, event, include_meet)
      return jsonResponse({ event_id: newEventId })
    }

    if (action === 'delete') {
      if (!event_id) return errorResponse('Event ID required')
      await deleteCalendarEvent(accessToken, event_id)
      return jsonResponse({ success: true })
    }

    return errorResponse(`Unknown action: ${action}`)
  } catch (e) {
    console.error('google-event error:', e)
    return errorResponse(e.message, 500)
  }
})
