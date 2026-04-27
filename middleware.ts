import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin-login') && !pathname.startsWith('/api/')) {
    const token = req.cookies.get('admin_token')?.value
    const adminPwd = process.env.ADMIN_PASSWORD

    // Si pas de mot de passe configuré OU token invalide → refuser
    if (!adminPwd || !token || token !== adminPwd) {
      return NextResponse.redirect(new URL('/admin-login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
