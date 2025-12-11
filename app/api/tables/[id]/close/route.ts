import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTicketPNG } from '@/lib/ticket-generator'
import { generateTicketNumber } from '@/lib/utils'

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
    const tip = parseFloat(body.tip) || 0

    // Obtener la mesa con todos sus datos
    const table = await prisma.table.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
        status: 'ABIERTA',
      },
      include: {
        tenant: {
          include: {
            settings: true,
          },
        },
        waiter: true,
        consumptions: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!table) {
      return NextResponse.json(
        { error: 'Mesa no encontrada o ya cerrada' },
        { status: 404 }
      )
    }

    // Filtrar consumos de la sesión actual (creados después de openedAt)
    const sessionConsumptions = table.consumptions.filter(
      c => !c.deleted && new Date(c.createdAt) >= new Date(table.openedAt)
    )

    // Calcular totales solo de la sesión actual
    const subtotal = sessionConsumptions
      .reduce((sum, c) => sum + (c.price * c.quantity), 0)
    
    const total = subtotal + tip

    // Generar número de ticket
    const ticketNumber = generateTicketNumber()

    // Generar PNG del ticket solo con consumos de la sesión actual
    const pngBuffer = await generateTicketPNG({
      tenant: table.tenant,
      table,
      consumptions: sessionConsumptions,
      subtotal,
      tip,
      total,
      ticketNumber,
      closedBy: session.user.name || 'Sistema',
    })

    // Guardar PNG como base64 (en producción deberías subirlo a storage)
    const pngBase64 = `data:image/png;base64,${pngBuffer.toString('base64')}`
    const pngUrl = pngBase64
    
    // TODO: En producción, subir a Vercel Blob Storage o S3:
    // const blob = await put(`tickets/${ticketNumber}.png`, pngBuffer, {
    //   access: 'public',
    // })
    // const pngUrl = blob.url

    // Preparar items para guardar en el ticket (como JSON)
    // SIEMPRE guardar items, incluso si es un array vacío
    const itemsData = sessionConsumptions.map(c => ({
      name: c.product?.name || 'Producto sin nombre',
      quantity: c.quantity,
      price: c.price,
      subtotal: c.price * c.quantity
    }))
    
    // Debug: verificar que los items se estén preparando correctamente
    console.log('=== DEBUG CERRAR MESA ===')
    console.log('Consumos de sesión encontrados:', sessionConsumptions.length)
    console.log('Items a guardar en ticket:', JSON.stringify(itemsData, null, 2))
    console.log('Consumos detallados:', sessionConsumptions.map(c => ({
      id: c.id,
      productName: c.product?.name,
      quantity: c.quantity,
      price: c.price,
      deleted: c.deleted,
      createdAt: c.createdAt
    })))

    // Cerrar la mesa y crear el ticket
    // Ya no hay constraint único, así que podemos crear múltiples tickets por mesa
    const ticketData = {
      tableId: params.id,
      tenantId: session.user.tenantId,
      userId: session.user.id,
      ticketNumber,
      pngUrl,
      total,
      tip: tip || 0,
      items: itemsData, // SIEMPRE incluir items, incluso si es array vacío
    }

    const [closedTable, ticket] = await Promise.all([
      prisma.table.update({
        where: { id: params.id },
        data: {
          status: 'CERRADA',
          closedAt: new Date(),
        },
      }),
      prisma.ticket.create({
        data: ticketData,
      }),
    ])

    // Mensaje detallado para WhatsApp con consumos, mesa y total
    const baseMessage = table.tenant.settings?.whatsappMessage || 'Aquí está tu ticket de consumo. ¡Gracias por tu visita!'
    const itemsLines = itemsData.length
      ? itemsData.map(i => `${i.quantity}x ${i.name} - $${i.subtotal.toFixed(2)}`).join('\n')
      : 'Sin detalle disponible'
    const responsable = table.responsibleName || 'N/D'
    // En "Atendido por" usar el ID/manual (ej. M001) si existe, caso contrario nombre
    const atendidoPor = table.waiter?.employeeCode || table.waiter?.name || session.user.name || 'Equipo'
    const fecha = new Date().toLocaleString('es-MX')
    const detailedWhatsAppMessage =
      `${baseMessage}\n\n` +
      `Ticket: #${ticketNumber}\n` +
      `Mesa: ${table.number}\n` +
      `Responsable: ${responsable}\n` +
      `Atendido por: ${atendidoPor}\n` +
      `Fecha: ${fecha}\n\n` +
      `Consumo:\n${itemsLines}\n\n` +
      `Total: $${total.toFixed(2)}\n\n` +
      `Ver ticket: ${pngUrl}`

    return NextResponse.json({
      success: true,
      ticket: {
        ...ticket,
        ticketUrl: pngUrl,
        whatsappMessage: detailedWhatsAppMessage,
        phoneNumber: table.responsiblePhone,
      },
    })
  } catch (error: any) {
    console.error('Error al cerrar mesa:', error)
    return NextResponse.json(
      { error: error.message || 'Error al cerrar la mesa' },
      { status: 500 }
    )
  }
}
