import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protéger /admin mais pas /admin/login ni /api/admin-auth
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/admin-auth')) {
    const token = req.cookies.get('admin_token')?.value
    if (token !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/admin-login', req.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
