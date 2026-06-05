import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase admin client with service role key (bypasses RLS)
export function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

// Get user from session token in Authorization header
export async function getUserFromAuth(req: Request): Promise<{ id: number; email: string } | null> {
  const auth = req.headers.get('Authorization')
  if (!auth) return null

  const token = auth.replace('Bearer ', '').trim()
  if (!token) return null

  const supabase = getSupabaseAdmin()
  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single()

  if (!session) return null
  if (new Date(session.expires_at) < new Date()) return null

  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', session.user_id)
    .single()

  return user
}
