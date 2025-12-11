import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tenantName, subdomain, name, email, password } = body

    if (!tenantName || !subdomain || !name || !email || !password) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // Verificar email único
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
    }

    // Verificar subdominio único
    const existing = await prisma.tenant.findUnique({ where: { subdomain } })
    if (existing) {
      return NextResponse.json({ error: 'El subdominio ya está en uso' }, { status: 400 })
    }

    // Crear tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        subdomain,
        subscriptionPlan: 'free',
        subscriptionStatus: 'inactive',
      },
    })

    // Crear settings con PIN por defecto '0000' (hashed) — el usuario puede cambiarlo luego
    const defaultPin = await bcrypt.hash('0000', 10)
    await prisma.tenantSettings.create({
      data: {
        tenantId: tenant.id,
        managerPin: defaultPin,
        whatsappMessage: 'Aquí está tu ticket de consumo. ¡Gracias por tu visita!',
      },
    })

    // Crear usuario dueño
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: 'DUENO',
        tenantId: tenant.id,
      },
    })

    return NextResponse.json({ ok: true, tenantId: tenant.id, userId: user.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error registrando usuario' }, { status: 500 })
  }
}
