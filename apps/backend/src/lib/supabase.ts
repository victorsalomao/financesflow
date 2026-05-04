import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

// Cliente admin — bypassa RLS, usar apenas em operações internas do servidor
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY)

// Cliente com JWT do usuário — respeita RLS
export function supabaseAuth(token: string) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}
