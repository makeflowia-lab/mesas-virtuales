import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo gerentes y dueños pueden eliminar
    if (session.user.role !== 'GERENTE' && session.user.role !== 'DUENO') {
      return NextResponse.json(
        { error: 'No tienes permisos para esta acción' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { pin } = body

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN requerido' },
        { status: 400 }
      )
    }

    // Verificar que el consumo pertenezca al tenant
    const consumption = await prisma.consumption.findFirst({
      where: {
        id: params.id,
        deleted: false,
      },
      include: {
        table: true,
      },
    })

    if (!consumption || consumption.table.tenantId !== session.user.tenantId) {
      return NextResponse.json(
        { error: 'Consumo no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que la mesa esté abierta
    if (consumption.table.status !== 'ABIERTA') {
      return NextResponse.json(
        { error: 'La mesa está cerrada' },
        { status: 400 }
      )
    }

    // Obtener configuración del tenant para verificar PIN
    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: session.user.tenantId },
    })

    if (!settings) {
      return NextResponse.json(
        { error: 'Configuración no encontrada' },
        { status: 404 }
      )
    }

    // Verificar PIN
    const isValidPin = await bcrypt.compare(pin, settings.managerPin)

    if (!isValidPin) {
      return NextResponse.json(
        { error: 'PIN incorrecto' },
        { status: 401 }
      )
    }

    // Marcar como eliminado y crear registro en bitácora
    const [updated] = await Promise.all([
      prisma.consumption.update({
        where: { id: params.id },
        data: {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: session.user.id,
          deletedReason: 'Eliminado por Gerencia',
        },
      }),
      prisma.deletionLog.create({
        data: {
          consumptionId: params.id,
          userId: session.user.id,
          reason: 'Eliminado por Gerencia',
        },
      }),
    ])

    return NextResponse.json({ success: true, consumption: updated })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al eliminar consumo' },
      { status: 500 }
    )
  }
}

