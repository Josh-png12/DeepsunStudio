const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const SUPABASE_CONFIGURATION_ERROR =
  'El portal no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && publishableKey)
}

export function getSupabasePublicConfig() {
  if (!supabaseUrl || !publishableKey) {
    throw new Error(SUPABASE_CONFIGURATION_ERROR)
  }

  return { url: supabaseUrl, key: publishableKey }
}

