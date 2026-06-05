import { handleCors } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabase.ts'
import { exchangeCodeForTokens, getGoogleUserInfo, getFrontendUrl } from '../_shared/google.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  const frontendUrl = getFrontendUrl()

  // Handle user cancellation
  if (error) {
    return Response.redirect(`${frontendUrl}?google=error&msg=${encodeURIComponent(error)}`, 302)
  }

  if (!code || !state) {
    return Response.redirect(`${frontendUrl}?google=error&msg=missing_params`, 302)
  }

  try {
    const userId = parseInt(state)
    if (!userId || isNaN(userId)) {
      return Response.redirect(`${frontendUrl}?google=error&msg=invalid_state`, 302)
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    const expiry = Date.now() + (tokens.expires_in * 1000)

    // Get user's Google email
    let googleEmail = null
    try {
      const userInfo = await getGoogleUserInfo(tokens.access_token)
      googleEmail = userInfo.email
    } catch (e) {
      console.error('Failed to get Google user info:', e)
    }

    // Store tokens in users table
    const supabase = getSupabaseAdmin()
    const { error: updateError } = await supabase
      .from('users')
      .update({
        google_refresh_token: tokens.refresh_token,
        google_access_token: tokens.access_token,
        google_token_expiry: expiry,
        google_email: googleEmail
      })
      .eq('id', userId)

    if (updateError) throw updateError

    return Response.redirect(`${frontendUrl}?google=connected`, 302)
  } catch (e) {
    console.error('Google callback error:', e)
    return Response.redirect(`${frontendUrl}?google=error&msg=${encodeURIComponent(e.message)}`, 302)
  }
})
