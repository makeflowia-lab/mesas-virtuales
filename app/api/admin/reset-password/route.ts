import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Endpoint para resetear contraseña de un usuario
// IMPORTANTE: En producción, esto debería estar protegido con autenticación de administrador
// Por ahora, lo dejamos accesible solo con una clave secreta en el body
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, newPassword, adminKey } = body

    // Clave de administrador simple (en producción usar autenticación real)
    // Esta clave debería estar en variables de entorno
    const ADMIN_KEY = process.env.ADMIN_RESET_KEY || 'reset-key-change-in-production'

    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email y nueva contraseña requeridos' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar la contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
      email: user.email,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al resetear contraseña' },
      { status: 500 }
    )
  }
}

