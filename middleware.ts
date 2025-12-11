import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  async function middleware(req: NextRequest) {
    // Permitir acceso público a ciertas rutas
    const publicPaths = ['/login', '/register', '/landing', '/api/auth', '/_next', '/favicon.ico', '/api/tickets']
    const isPublicPath = publicPaths.some(path => 
      req.nextUrl.pathname.startsWith(path)
    )
    
    if (isPublicPath) {
      return NextResponse.next()
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Landing y home deben ser públicas
        if (pathname === '/' || pathname.startsWith('/landing')) {
          return true
        }

        // Rutas públicas de auth / APIs específicas
        const publicPaths = ['/login', '/register', '/api/auth', '/api/tickets']
        if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
          return true
        }
        
        // Requerir autenticación para otras rutas
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}


