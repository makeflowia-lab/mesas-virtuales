import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { seedTenant } from '@/lib/seed'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const tenantId = session.user.tenantId as string
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant no disponible en sesión' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const force = !!body.force

    const result = await seedTenant(tenantId, { force })

    return NextResponse.json({ ok: true, created: result.createdCount, message: 'Productos semilla procesados' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear productos' }, { status: 500 })
  }
}
