import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const quantity = parseInt(body.quantity)

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'La cantidad debe ser al menos 1' },
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

    const updated = await prisma.consumption.update({
      where: { id: params.id },
      data: { quantity },
      include: {
        product: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar consumo' },
      { status: 500 }
    )
  }
}









