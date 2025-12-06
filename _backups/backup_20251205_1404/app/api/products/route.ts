import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  category: z.enum(['BOTANA', 'CERVEZA', 'BEBIDA', 'OTRO']),
  price: z.number().positive(),
  available: z.boolean().optional().default(true),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(products)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo dueños y gerentes pueden crear productos
    if (session.user.role !== 'DUENO' && session.user.role !== 'GERENTE') {
      return NextResponse.json(
        { error: 'No tienes permisos para esta acción' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = createProductSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        ...data,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json(product)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al crear producto' },
      { status: 500 }
    )
  }
}

