import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protéger UNIQUEMENT /admin (pas /admin-login, pas /api)
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin-login') &&
    !pathname.startsWith('/api/')
  ) {
    const token = req.cookies.get('admin_token')?.value
    const adminPwd = process.env.ADMIN_PASSWORD
    if (!adminPwd || !token || token !== adminPwd) {
      return NextResponse.redirect(new URL('/admin-login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
