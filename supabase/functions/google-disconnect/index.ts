import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { getSupabaseAdmin, getUserFromAuth } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const user = await getUserFromAuth(req)
    if (!user) return errorResponse('Unauthorized', 401)

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('users')
      .update({
        google_refresh_token: null,
        google_access_token: null,
        google_token_expiry: null,
        google_email: null
      })
      .eq('id', user.id)

    if (error) throw error

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse(e.message, 500)
  }
})
