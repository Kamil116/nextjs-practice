import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest, verifyJWT } from '@/lib/jwt'

const protectedPagePrefixes = ['/dashboard', '/issues']

function isProtectedPage(pathname: string) {
  return protectedPagePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = getTokenFromRequest(request)
  const payload = token ? await verifyJWT(token) : null

  if (pathname.startsWith('/api/')) {
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Valid authorization is required' },
        { status: 401 }
      )
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  if (isProtectedPage(pathname) && !payload) {
    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard', '/dashboard/:path*', '/issues/:path*'],
}
