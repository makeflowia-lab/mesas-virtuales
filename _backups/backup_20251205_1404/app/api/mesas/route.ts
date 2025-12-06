import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTableSchema = z.object({
  number: z.number().int().positive(),
  responsibleName: z.string().min(1),
  responsiblePhone: z.string().min(1),
  responsibleId: z.string().optional(),
  waiterId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const data = createTableSchema.parse({
      ...body,
      number: parseInt(body.number),
    })

    // Verificar que no exista otra mesa ABIERTA con el mismo número
    // Permite múltiples mesas cerradas con el mismo número (sesiones históricas)
    const existingOpenTable = await prisma.table.findFirst({
      where: {
        tenantId: session.user.tenantId,
        number: data.number,
        status: 'ABIERTA',
      },
    })

    if (existingOpenTable) {
      return NextResponse.json(
        { error: 'Ya existe una mesa abierta con ese número' },
        { status: 400 }
      )
    }

    // Validar waiterId si se proporciona
    let waiterId = data.waiterId || null
    if (waiterId && waiterId.trim() !== '') {
      const waiter = await prisma.user.findFirst({
        where: {
          id: waiterId,
          tenantId: session.user.tenantId,
          active: true,
        },
      })

      if (!waiter) {
        return NextResponse.json(
          { error: 'Mesero no encontrado o no pertenece a este negocio' },
          { status: 400 }
        )
      }
    } else {
      waiterId = null
    }

    // Limpiar el teléfono: remover espacios y caracteres especiales, solo números
    const cleanPhone = data.responsiblePhone.replace(/\D/g, '')

    const table = await prisma.table.create({
      data: {
        number: data.number,
        responsibleName: data.responsibleName.trim(),
        responsiblePhone: cleanPhone,
        responsibleId: data.responsibleId?.trim() || null,
        responsibleUserId: null, // No asignamos usuario del sistema como "responsable cliente"
        waiterId: waiterId,
        tenantId: session.user.tenantId,
        status: 'ABIERTA',
      },
    })

    return NextResponse.json(table)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al crear la mesa' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener todas las mesas
    const allTables = await prisma.table.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        waiter: true,
        responsibleUser: true,
        consumptions: {
          include: { product: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }], // Más recientes primero
    })

    // Filtrar: mostrar todas las mesas abiertas + la más reciente cerrada de cada número
    const openTables = allTables.filter(t => t.status === 'ABIERTA')
    const closedTables = allTables.filter(t => t.status === 'CERRADA')
    
    // Agrupar cerradas por número y tomar la más reciente de cada grupo
    const latestClosedByNumber = new Map<number, typeof allTables[0]>()
    closedTables.forEach(table => {
      const existing = latestClosedByNumber.get(table.number)
      if (!existing || new Date(table.createdAt) > new Date(existing.createdAt)) {
        latestClosedByNumber.set(table.number, table)
      }
    })

    // Combinar: todas las abiertas + las más recientes cerradas (solo si no hay una abierta con ese número)
    const openTableNumbers = new Set(openTables.map(t => t.number))
    const tablesToShow = [
      ...openTables,
      ...Array.from(latestClosedByNumber.values()).filter(t => !openTableNumbers.has(t.number))
    ]

    // Ordenar: abiertas primero, luego cerradas, ambas por número
    tablesToShow.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'ABIERTA' ? -1 : 1
      }
      return a.number - b.number
    })

    return NextResponse.json(tablesToShow)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener las mesas' },
      { status: 500 }
    )
  }
}

