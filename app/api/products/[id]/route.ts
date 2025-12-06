import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  category: z.enum(['BOTANA', 'CERVEZA', 'BEBIDA', 'OTRO']).optional(),
  price: z.number().positive().optional(),
  available: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo dueños y gerentes pueden editar productos
    if (session.user.role !== 'DUENO' && session.user.role !== 'GERENTE') {
      return NextResponse.json(
        { error: 'No tienes permisos para esta acción' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = updateProductSchema.parse(body)

    // Verificar que el producto pertenezca al tenant
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo dueños pueden eliminar productos
    if (session.user.role !== 'DUENO') {
      return NextResponse.json(
        { error: 'No tienes permisos para esta acción' },
        { status: 403 }
      )
    }

    // Verificar que el producto pertenezca al tenant
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}

