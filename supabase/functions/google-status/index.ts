import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { getSupabaseAdmin, getUserFromAuth } from '../_shared/supabase.ts'
import { getClientId } from '../_shared/google.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const configured = !!getClientId()

    const user = await getUserFromAuth(req)
    if (!user) {
      return jsonResponse({ configured, connected: false })
    }

    const supabase = getSupabaseAdmin()
    const { data: userData } = await supabase
      .from('users')
      .select('google_refresh_token, google_email')
      .eq('id', user.id)
      .single()

    return jsonResponse({
      configured,
      connected: !!(userData?.google_refresh_token),
      google_email: userData?.google_email || null
    })
  } catch (e) {
    return errorResponse(e.message, 500)
  }
})
