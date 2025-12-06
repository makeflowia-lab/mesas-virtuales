import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'
import { PLANS } from '@/lib/plans'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-11-17.clover' })

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const body = await req.json()
    const { planId, billingCycle } = body // billingCycle: 'monthly' | 'annual'
    const plan = PLANS.find(p => p.id === planId)
    if (!plan || !plan.stripeEnabled) {
      return NextResponse.json({ error: 'Plan inválido o no disponible para pago.' }, { status: 400 })
    }
    // Aquí deberías tener los IDs de productos/precios de Stripe para cada plan y ciclo
    // Ejemplo: stripePriceId
    const stripePriceId = process.env[`STRIPE_PRICE_${planId.toUpperCase()}_${billingCycle === 'annual' ? 'ANNUAL' : 'MONTHLY'}`]
    if (!stripePriceId) {
      return NextResponse.json({ error: 'No se encontró el precio de Stripe para este plan.' }, { status: 400 })
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      customer_email: session.user.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/suscripcion/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/suscripcion/cancel`,
      metadata: {
        tenantId: session.user.tenantId,
        planId,
        billingCycle,
      },
    })
    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear sesión de pago' }, { status: 500 })
  }
}
