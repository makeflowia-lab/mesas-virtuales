import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createConsumptionSchema = z.object({
  tableId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const data = createConsumptionSchema.parse({
      ...body,
      quantity: parseInt(body.quantity) || 1,
    })

    // Verificar que la mesa pertenezca al tenant y esté abierta
    const table = await prisma.table.findFirst({
      where: {
        id: data.tableId,
        tenantId: session.user.tenantId,
        status: 'ABIERTA',
      },
    })

    if (!table) {
      return NextResponse.json(
        { error: 'Mesa no encontrada o cerrada' },
        { status: 404 }
      )
    }

    // Obtener el producto para obtener el precio actual
    const product = await prisma.product.findFirst({
      where: {
        id: data.productId,
        tenantId: session.user.tenantId,
        available: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const consumption = await prisma.consumption.create({
      data: {
        tableId: data.tableId,
        productId: data.productId,
        quantity: data.quantity,
        price: product.price,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(consumption)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al agregar consumo' },
      { status: 500 }
    )
  }
}

