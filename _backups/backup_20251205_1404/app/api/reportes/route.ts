import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const waiterId = searchParams.get('waiterId')
    const category = searchParams.get('category')
    const tableId = searchParams.get('tableId')

    // Construir filtros para mesas
    const tableWhere: any = {
      tenantId: session.user.tenantId,
    }

    if (waiterId) {
      tableWhere.waiterId = waiterId
    }

    if (tableId) {
      tableWhere.id = tableId
    }

    // Construir filtros para consumos
    const consumptionWhere: any = {
      deleted: false,
    }

    if (category) {
      consumptionWhere.product = {
        category: category as any,
      }
    }

    // Si hay filtros de fecha, filtrar por fecha de creación del consumo
    if (startDate || endDate) {
      consumptionWhere.createdAt = {}
      if (startDate) {
        consumptionWhere.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        consumptionWhere.createdAt.lte = end
      }
    }

    // Obtener todas las mesas (abiertas y cerradas) que tengan consumos
    const tables = await prisma.table.findMany({
      where: tableWhere,
      include: {
        waiter: true,
        consumptions: {
          include: {
            product: true,
          },
          where: consumptionWhere,
        },
        tickets: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Solo el ticket más reciente para el reporte
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Preparar datos para el reporte
    const reportData: any[] = []
    let totalGeneral = 0
    const uniqueTables = new Set<string>()

    tables.forEach((table) => {
      // Solo procesar mesas que tengan consumos después del filtrado
      if (table.consumptions.length === 0) return

      const tableTotal = table.consumptions
        .filter(c => !c.deleted)
        .reduce((sum, c) => sum + (c.price * c.quantity), 0)
      
      totalGeneral += tableTotal
      uniqueTables.add(table.id)

      // Calcular tiempo abierto
      // Si la mesa está cerrada, usar fecha de cierre; si está abierta, usar fecha actual
      const endDate = table.closedAt || new Date()
      const timeOpen = table.openedAt
        ? Math.round((endDate.getTime() - table.openedAt.getTime()) / (1000 * 60))
        : 0

      // Agregar cada consumo como una fila en el reporte
      table.consumptions
        .filter(c => !c.deleted)
        .forEach((consumption) => {
          reportData.push({
            date: consumption.createdAt || table.openedAt,
            tableNumber: table.number,
            responsibleName: table.responsibleName,
            waiterName: table.waiter?.name || null,
            productName: consumption.product.name,
            category: consumption.product.category,
            quantity: consumption.quantity,
            price: consumption.price,
            tableTotal,
            timeOpen: `${timeOpen} min`,
          })
        })
    })

    const summary = {
      total: totalGeneral,
      totalTables: uniqueTables.size,
      averagePerTable: uniqueTables.size > 0 ? totalGeneral / uniqueTables.size : 0,
    }

    return NextResponse.json({
      reportData,
      summary,
    })
  } catch (error: any) {
    console.error('Error al generar reporte:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar reporte' },
      { status: 500 }
    )
  }
}

