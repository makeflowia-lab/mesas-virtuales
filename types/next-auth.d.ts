import 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    role: Role
    tenantId: string
    tenant?: {
      id: string
      subdomain: string
      name: string
    }
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
      tenantId: string
      tenant?: {
        id: string
        subdomain: string
        name: string
      }
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
    tenantId: string
    tenant?: {
      id: string
      subdomain: string
      name: string
    }
  }
}









