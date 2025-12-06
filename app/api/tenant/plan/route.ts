import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plans'

// Consulta el estado de suscripción del tenant
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const tenant = await prisma.tenant.findUnique({ where: { id: session.user.tenantId } })
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 })
    }
    const plan = PLANS.find(p => p.id === tenant.subscriptionPlan) || PLANS[0]
    return NextResponse.json({
      plan: plan.name,
      status: tenant.subscriptionStatus,
      startedAt: tenant.subscriptionStartedAt,
      endsAt: tenant.subscriptionEndsAt,
      mesasLimit: plan.mesasLimit,
      usersLimit: plan.usersLimit,
      stripeEnabled: plan.stripeEnabled,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al consultar suscripción' }, { status: 500 })
  }
}

// Cambia el plan de suscripción del tenant (manual)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const body = await req.json()
    const { planId } = body
    if (!planId || !PLANS.find(p => p.id === planId)) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }
    const updated = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        subscriptionPlan: planId,
        subscriptionStatus: 'active',
        subscriptionStartedAt: new Date(),
        subscriptionEndsAt: null,
      },
    })
    return NextResponse.json({ ok: true, plan: planId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al cambiar plan' }, { status: 500 })
  }
}
