import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { PORTAL_ENABLED } from '@/lib/launch'

export async function proxy(request: NextRequest) {
  // Launch 1.0: the investor portal is not exposed by the public deployment. Its code, data and policies are untouched;
  // set NEXT_PUBLIC_PORTAL_ENABLED=true (Preview/staging) to use it. A rewrite to a non-existent path yields the site's regular 404.
  if (!PORTAL_ENABLED) return NextResponse.rewrite(new URL('/portal-not-available', request.url))
  return updateSession(request)
}

export const config = {
  matcher: ['/portal/:path*'],
}
