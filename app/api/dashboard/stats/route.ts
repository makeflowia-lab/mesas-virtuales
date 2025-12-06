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

    const tenantId = session.user.tenantId

    // Estadísticas sincronizadas desde la base de datos
    const [openTables, totalProducts, totalRevenue, recentTickets] = await Promise.all([
      prisma.table.count({
        where: { tenantId, status: 'ABIERTA' },
      }),
      prisma.product.count({
        where: { tenantId, available: true },
      }),
      prisma.ticket.aggregate({
        where: { tenantId },
        _sum: { total: true },
      }),
      prisma.ticket.findMany({
        where: { tenantId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          table: true,
          user: true,
        },
      }),
    ])

    return NextResponse.json({
      openTables,
      totalProducts,
      totalRevenue: totalRevenue._sum.total || 0,
      recentTickets: recentTickets.map(t => ({
        id: t.id,
        total: t.total,
        pngUrl: t.pngUrl,
        items: t.items, // Incluir items
        createdAt: t.createdAt,
        table: {
          number: t.table.number,
          responsibleName: t.table.responsibleName,
          responsiblePhone: t.table.responsiblePhone, // Incluir teléfono para WhatsApp
        },
        user: {
          name: t.user.name,
        },
      })),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}

