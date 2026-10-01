import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured, getSupabasePublicConfig } from './env'

const PUBLIC_PORTAL_PATHS = [
  '/portal/login',
  '/portal/forgot-password',
  '/portal/reset-password',
  '/portal/auth/callback',
]

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next({ request })

  let response = NextResponse.next({ request })
  const { url, key } = getSupabasePublicConfig()
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname
  const isPublic = PUBLIC_PORTAL_PATHS.some((path) => pathname.startsWith(path))

  if (!user && pathname.startsWith('/portal') && !isPublic) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/portal/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user && pathname === '/portal/login') {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/portal/dashboard'
    dashboardUrl.search = ''
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}
