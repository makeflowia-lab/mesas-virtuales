import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { sessionId } = body
    if (!sessionId) return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 })

    const stripe = getStripe()
    if (!stripe) return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })

    // Recuperar sesión de checkout (expandir suscripción y customer si existe)
    const checkout = await stripe.checkout.sessions.retrieve(sessionId as string, { expand: ['subscription', 'customer'] as any })

    const metadata = checkout.metadata || {}
    const tenantId = metadata.tenantId || session.user.tenantId
    const planId = metadata.planId || undefined

    if (!tenantId) return NextResponse.json({ error: 'No se pudo determinar tenant' }, { status: 400 })

    // Verificar que el tenant coincida con el usuario actual
    if (session.user.tenantId && session.user.tenantId !== tenantId) {
      return NextResponse.json({ error: 'El tenant no coincide con la sesión' }, { status: 403 })
    }

    // Si hay una suscripción asociada, usar sus datos para calcular fechas
    const subscription = (checkout as any).subscription
    const customer = (checkout as any).customer

    const updateData: any = {
      subscriptionPlan: planId || undefined,
      subscriptionStatus: subscription ? 'active' : 'active',
      subscriptionStartedAt: new Date(),
    }

    if (subscription && subscription.current_period_end) {
      updateData.subscriptionEndsAt = new Date(subscription.current_period_end * 1000)
    }

    if (customer && (typeof customer === 'string' || customer?.id)) {
      updateData.stripeCustomerId = typeof customer === 'string' ? customer : customer.id
    } else if (checkout.customer) {
      updateData.stripeCustomerId = checkout.customer as string
    }

    // Actualizar tenant
    await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al confirmar sesión' }, { status: 500 })
  }
}
