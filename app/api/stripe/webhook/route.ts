import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: '2025-11-17.clover' })
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  let event
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe secret key not configured' }, { status: 500 })
  }
  try {
    const buf = Buffer.from(await req.arrayBuffer())
    event = stripe.webhooks.constructEvent(buf, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Manejar eventos relevantes de Stripe
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const tenantId = session.metadata?.tenantId
    const planId = session.metadata?.planId
    const billingCycle = session.metadata?.billingCycle
    const stripeCustomerId = session.customer as string
    if (tenantId && planId) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionPlan: planId,
          subscriptionStatus: 'active',
          subscriptionStartedAt: new Date(),
          subscriptionEndsAt: null,
          stripeCustomerId,
        },
      })
    }
  }
  // Puedes manejar otros eventos como subscription.updated, invoice.payment_failed, etc.

  return NextResponse.json({ received: true })
}
