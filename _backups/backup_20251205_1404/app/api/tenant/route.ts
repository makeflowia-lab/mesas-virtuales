import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTenantSchema = z.object({
  name: z.string().min(1),
  subdomain: z.string().min(1),
  domain: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo dueños pueden editar configuración del tenant
    if (session.user.role !== 'DUENO') {
      return NextResponse.json(
        { error: 'No tienes permisos para esta acción' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = updateTenantSchema.parse(body)

    // Verificar que el subdomain no esté en uso por otro tenant
    if (data.subdomain !== session.user.tenant?.subdomain) {
      const existing = await prisma.tenant.findUnique({
        where: { subdomain: data.subdomain },
      })
      
      if (existing) {
        return NextResponse.json(
          { error: 'Este subdominio ya está en uso' },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}

