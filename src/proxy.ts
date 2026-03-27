import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt, SESSION_COOKIE } from '@/lib/session'

// Public routes that do NOT require authentication
const PUBLIC_PATHS = ['/login', '/register', '/403']

// If explicitly set to 'false', the landing page is disabled and root acts as a protected route.
if (process.env.NEXT_PUBLIC_ENABLE_LANDING_PAGE !== 'false') {
  PUBLIC_PATHS.push('/', '/landing')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  // Read the session token directly from cookies on the request
  // (cannot await cookies() in proxy — use request.cookies instead)
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = await decrypt(token)

  const isAuthenticated = Boolean(session?.userId)

  // Redirect unauthenticated users attempting to access protected routes
  if (!isPublic && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isPublic && isAuthenticated && pathname !== '/403') {
    const redirectPath = session?.role === 'CASHIER' ? '/dashboard/pos' : '/dashboard'
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  // CASHIER role restrictions: can ONLY access /dashboard/pos
  if (isAuthenticated && session?.role === 'CASHIER') {
    if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/pos')) {
      return NextResponse.redirect(new URL('/dashboard/pos', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - api (route handlers)
     * - _next/static (static assets)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)',
  ],
}
