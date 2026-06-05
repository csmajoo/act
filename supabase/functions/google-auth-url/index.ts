import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { getUserFromAuth } from '../_shared/supabase.ts'
import { buildAuthUrl, getClientId } from '../_shared/google.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    if (!getClientId()) {
      return errorResponse('Google Client ID not configured', 500)
    }

    const user = await getUserFromAuth(req)
    if (!user) return errorResponse('Unauthorized', 401)

    // Use user_id as state so we know which user to link tokens to
    const state = `${user.id}`
    const url = buildAuthUrl(state)

    return jsonResponse({ url })
  } catch (e) {
    return errorResponse(e.message, 500)
  }
})
