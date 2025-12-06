import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const tenantId = session.user.tenantId as string
    if (!tenantId) return NextResponse.json({ error: 'Tenant no disponible' }, { status: 400 })

    const products = await prisma.product.findMany({ where: { tenantId }, orderBy: { name: 'asc' }, take: 200 })

    return NextResponse.json({ ok: true, count: products.length, products })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error listando productos' }, { status: 500 })
  }
}
