import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, newPassword, adminKey } = body

    // Clave simple para emergencia - CAMBIAR EN PRODUCCIÓN
    if (adminKey !== 'reset123') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ success: true, email: user.email })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
