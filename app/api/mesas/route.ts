
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const body = await req.json()
    const { id, status, ...updateData } = body
    if (!id) {
      return NextResponse.json({ error: 'Falta id de mesa' }, { status: 400 })
    }
    const table = await prisma.table.findUnique({ where: { id } })
    if (!table) {
      return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 })
    }
    // Solo el usuario que abrió la mesa puede cerrarla o modificarla
    if (table.openedByUserId !== session.user.id) {
      return NextResponse.json({ error: 'Solo el usuario que abrió la mesa puede modificarla o cerrarla' }, { status: 403 })
    }
    // Si se quiere cerrar la mesa
    if (status === 'CERRADA') {
      updateData.closedAt = new Date()
    }
    const updated = await prisma.table.update({
      where: { id },
      data: { ...updateData, status },
    })
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al modificar la mesa' }, { status: 500 })
  }
}
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

    // Validar límite de mesas activas por plan
    const { canCreateTable, getTenantPlan } = await import('@/lib/limits')
    const puedeCrear = await canCreateTable(session.user.tenantId)
    const plan = await getTenantPlan(session.user.tenantId)
    if (!puedeCrear) {
      return NextResponse.json(
        {
          error: `Has alcanzado el límite de mesas activas (${plan.mesasLimit}) para tu plan (${plan.name}). Mejora tu suscripción para más mesas.`,
          plan: plan.name,
          mesasLimit: plan.mesasLimit,
          upgradeUrl: '/suscripcion',
        },
        { status: 403 }
      )
    }
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
        openedByUserId: session.user.id,
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

    // Lógica robusta para mostrar solo una mesa por número
    // Prioridad: 1. Abierta (la más reciente si hay varias por error), 2. Cerrada (la más reciente)
    const uniqueTablesMap = new Map<number, typeof allTables[0]>()

    // Primero procesar todas para encontrar la "ganadora" de cada número
    allTables.forEach(table => {
      const existing = uniqueTablesMap.get(table.number)
      
      if (!existing) {
        // Si no hay candidata, esta es la primera
        uniqueTablesMap.set(table.number, table)
        return
      }

      // Si ya hay candidata, decidimos si reemplazarla
      const currentIsOpen = existing.status === 'ABIERTA'
      const newIsOpen = table.status === 'ABIERTA'

      if (newIsOpen && !currentIsOpen) {
        // Si la nueva está abierta y la actual no, gana la nueva
        uniqueTablesMap.set(table.number, table)
      } else if (newIsOpen && currentIsOpen) {
        // Ambas abiertas: gana la más reciente (por seguridad, aunque no debería pasar)
        if (new Date(table.createdAt) > new Date(existing.createdAt)) {
          uniqueTablesMap.set(table.number, table)
        }
      } else if (!newIsOpen && !currentIsOpen) {
        // Ambas cerradas: gana la más reciente (última sesión cerrada)
        // Preferir closedAt para comparar cerradas, sino createdAt
        const newDate = table.closedAt ? new Date(table.closedAt) : new Date(table.createdAt)
        const existingDate = existing.closedAt ? new Date(existing.closedAt) : new Date(existing.createdAt)
        
        if (newDate > existingDate) {
          uniqueTablesMap.set(table.number, table)
        }
      }
      // Si la actual está abierta y la nueva cerrada, se queda la actual (no hacemos nada)
    })

    const tablesToShow = Array.from(uniqueTablesMap.values())

    // Ordenar: abiertas primero, luego por número
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

