import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'

export async function getTenantFromRequest(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const subdomain = hostname.split('.')[0]
  
  // En desarrollo, puede venir como localhost:3000 o subdomain.localhost:3000
  const isLocalhost = hostname.includes('localhost')
  
  if (isLocalhost) {
    // En desarrollo, buscar por subdomain en el path o header
    const pathSubdomain = request.nextUrl.pathname.split('/')[1]
    if (pathSubdomain && pathSubdomain !== 'api' && pathSubdomain !== '_next') {
      const tenant = await prisma.tenant.findUnique({
        where: { subdomain: pathSubdomain },
      })
      if (tenant) return tenant
    }
    
    // Fallback: buscar por header
    const headerSubdomain = request.headers.get('x-tenant-subdomain')
    if (headerSubdomain) {
      const tenant = await prisma.tenant.findUnique({
        where: { subdomain: headerSubdomain },
      })
      if (tenant) return tenant
    }
  } else {
    // En producción, usar subdomain del hostname
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
    })
    if (tenant) return tenant
    
    // Intentar por dominio completo
    const tenantByDomain = await prisma.tenant.findUnique({
      where: { domain: hostname },
    })
    if (tenantByDomain) return tenantByDomain
  }
  
  return null
}

export function withTenant(
  handler: (req: NextRequest, tenant: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const tenant = await getTenantFromRequest(req)
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant no encontrado' },
        { status: 404 }
      )
    }
    
    return handler(req, tenant)
  }
}

