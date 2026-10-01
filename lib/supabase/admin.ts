import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { getSupabasePublicConfig } from './env'

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para esta operación administrativa del servidor.')
  }
  const { url } = getSupabasePublicConfig()
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
