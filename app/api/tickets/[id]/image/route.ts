import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Obtener el ticket (público para compartir)
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      )
    }

    // Si el pngUrl es una data URL, extraer el base64
    if (ticket.pngUrl.startsWith('data:image/png;base64,')) {
      const base64Data = ticket.pngUrl.split(',')[1]
      const imageBuffer = Buffer.from(base64Data, 'base64')
      
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `inline; filename="ticket-${ticket.ticketNumber}.png"`,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*', // Permitir acceso desde cualquier origen
        },
      })
    }

    // Si es una URL externa, redirigir
    return NextResponse.redirect(ticket.pngUrl)
  } catch (error: any) {
    console.error('Error sirviendo imagen del ticket:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener la imagen' },
      { status: 500 }
    )
  }
}


