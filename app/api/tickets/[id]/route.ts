import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        table: {
          include: {
            consumptions: {
              include: {
                product: true,
              },
            },
          },
        },
        tenant: {
          include: {
            settings: true,
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      )
    }

      // Asegurarse de que `items` siempre sea un array en la respuesta
      const normalized = {
        ...ticket,
        items: Array.isArray(ticket.items) ? ticket.items : (ticket.items ? [ticket.items] : []),
      };

      return NextResponse.json({ ticket: normalized })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener ticket' },
      { status: 500 }
    )
  }
}









