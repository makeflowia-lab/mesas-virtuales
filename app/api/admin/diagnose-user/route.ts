import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Endpoint de diagnóstico para verificar usuarios
// Solo para desarrollo/depuración - en producción debería estar protegido
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado',
        exists: false 
      }, { status: 404 })
    }

    // Verificar si el password está hasheado (bcrypt tiene un formato específico)
    const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')

    return NextResponse.json({
      exists: true,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      tenantId: user.tenantId,
      tenantName: user.tenant?.name,
      passwordIsHashed: isHashed,
      passwordLength: user.password.length,
      // NO retornar la contraseña real por seguridad
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al diagnosticar usuario' },
      { status: 500 }
    )
  }
}



