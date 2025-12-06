import { canCreateUser } from '@/lib/limits'
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const plan = await getTenantPlan(session.user.tenantId)
    const puedeCrear = await canCreateUser(session.user.tenantId)
    if (!puedeCrear) {
      return NextResponse.json(
        {
          error: `Has alcanzado el límite de usuarios activos (${plan.usersLimit}) para tu plan (${plan.name}). Mejora tu suscripción para más usuarios.`,
          plan: plan.name,
          usersLimit: plan.usersLimit,
          upgradeUrl: '/suscripcion',
        },
        { status: 403 }
      )
    }
    // Aquí iría la lógica de creación de usuario (validación, guardado, etc.)
    // Ejemplo:
    // const body = await req.json()
    // const nuevoUsuario = await prisma.user.create({ data: { ...body, tenantId: session.user.tenantId } })
    // return NextResponse.json(nuevoUsuario)
    return NextResponse.json({ ok: true, message: 'Validación de límite de usuarios exitosa. Implementa la lógica de creación aquí.' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear usuario' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: {
        tenantId: session.user.tenantId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(users)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}



