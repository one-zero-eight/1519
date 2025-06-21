import { NextRequest, NextResponse } from 'next/server'

const AUTH_WHITELIST = ['/auth']

export async function middleware(request: NextRequest) {
  // Allow access to /auth always
  if (AUTH_WHITELIST.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check authorization via whoami endpoint
  const apiServer = process.env.NEXT_PUBLIC_SERVER
  const cookie = request.headers.get('cookie') || ''

  try {
    const whoamiRes = await fetch(`${apiServer}/patron/me`, {
      headers: { cookie },
      credentials: 'include'
    })
    if (whoamiRes.ok) {
      // Authorized
      return NextResponse.next()
    }
  } catch (e) {
    // Ignore fetch errors, treat as unauthorized
  }

  // Not authorized — redirect to /auth
  const loginUrl = new URL('/auth', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    // All routes except /auth and static assets
    '/((?!auth|_next|static|favicon.ico|assets|applicant).*)'
  ]
}
