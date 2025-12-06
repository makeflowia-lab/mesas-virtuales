import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reopenTableSchema = z.object({
  responsibleName: z.string().min(1),
  responsiblePhone: z.string().min(1),
  responsibleId: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const data = reopenTableSchema.parse(body)

    // Verificar que la mesa pertenezca al tenant y esté cerrada
    const originalTable = await prisma.table.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
        status: 'CERRADA',
      },
    })

    if (!originalTable) {
      return NextResponse.json(
        { error: 'Mesa no encontrada o no está cerrada' },
        { status: 404 }
      )
    }

    // Verificar que no exista otra mesa abierta con el mismo número
    const existingOpenTable = await prisma.table.findFirst({
      where: {
        tenantId: session.user.tenantId,
        number: originalTable.number,
        status: 'ABIERTA',
      },
    })

    if (existingOpenTable) {
      return NextResponse.json(
        { error: 'Ya existe una mesa abierta con ese número' },
        { status: 400 }
      )
    }

    // Limpiar el teléfono: remover espacios y caracteres especiales, solo números
    const cleanPhone = data.responsiblePhone.replace(/\D/g, '')

    // Crear una NUEVA mesa con el mismo número pero ID único
    // Esto permite reutilizar el número de mesa sin afectar el registro histórico
    const reopenedTable = await prisma.table.create({
      data: {
        number: originalTable.number, // Mismo número de mesa física
        responsibleName: data.responsibleName.trim(),
        responsiblePhone: cleanPhone,
        responsibleId: data.responsibleId?.trim() || null,
        responsibleUserId: null, // No asignamos usuario del sistema como "responsable cliente"
        waiterId: null, // Sin mesero al reabrir
        tenantId: session.user.tenantId,
        status: 'ABIERTA',
        openedAt: new Date(), // Nueva fecha de apertura = nueva sesión
      },
    })

    return NextResponse.json({
      success: true,
      table: reopenedTable,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error al reabrir mesa:', error)
    return NextResponse.json(
      { error: error.message || 'Error al reabrir la mesa' },
      { status: 500 }
    )
  }
}

