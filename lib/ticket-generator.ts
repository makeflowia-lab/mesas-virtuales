interface TicketData {
  tenant: any
  table: any
  consumptions: any[]
  subtotal: number
  tip: number
  total: number
  ticketNumber: string
  closedBy: string
}

declare const canvas: any

export async function generateTicketPNG(data: TicketData): Promise<Buffer> {
  const {
    tenant,
    table,
    consumptions,
    subtotal,
    tip,
    total,
    ticketNumber,
    closedBy,
  } = data

  // Crear HTML del ticket
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', sans-serif;
          background: white;
          padding: 20px;
          width: 400px;
          color: #000;
        }
        .ticket {
          background: white;
          border: 2px solid #000;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .ticket-number {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        .info {
          margin-bottom: 15px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 14px;
        }
        .items {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 15px 0;
          margin: 15px 0;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .item-name {
          flex: 1;
        }
        .item-qty {
          margin: 0 10px;
        }
        .item-price {
          font-weight: bold;
        }
        .totals {
          margin-top: 15px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .total-final {
          font-size: 20px;
          font-weight: bold;
          border-top: 2px solid #000;
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px dashed #000;
          font-size: 12px;
          color: #666;
        }
        .stamp {
          text-align: center;
          margin-top: 15px;
          padding: 10px;
          background: #f0f0f0;
          border: 2px solid #000;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          <div class="logo">${tenant.name || 'Botanero'}</div>
          <div class="ticket-number">Ticket: ${ticketNumber}</div>
        </div>
        
        <div class="info">
          <div class="info-row">
            <span>Mesa:</span>
            <span><strong>${table.number}</strong></span>
          </div>
          <div class="info-row">
            <span>Responsable:</span>
            <span><strong>${table.responsibleName}</strong></span>
          </div>
          <div class="info-row">
            <span>Apertura:</span>
            <span>${new Date(table.openedAt).toLocaleString('es-MX')}</span>
          </div>
          <div class="info-row">
            <span>Cierre:</span>
            <span>${new Date().toLocaleString('es-MX')}</span>
          </div>
          ${table.waiter ? `
          <div class="info-row">
            <span>Mesero:</span>
            <span>${table.waiter.name}</span>
          </div>
          ` : ''}
        </div>

        <div class="items">
          ${consumptions.map(c => `
            <div class="item">
              <span class="item-name">${c.product.name}</span>
              <span class="item-qty">${c.quantity}x</span>
              <span class="item-price">$${(c.price * c.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          ${tip > 0 ? `
          <div class="total-row">
            <span>Propina:</span>
            <span>$${tip.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="total-row total-final">
            <span>TOTAL:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="stamp">
          ✓ CUENTA CERRADA / PAGADA
        </div>

        <div class="footer">
          <div>Cerrado por: ${closedBy}</div>
          <div style="margin-top: 10px;">¡Gracias por su visita!</div>
          ${tenant.settings?.notes ? `
          <div style="margin-top: 10px;">${tenant.settings.notes}</div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `

  // Convertir HTML a PNG
  // Nota: html-to-image funciona en el cliente, necesitamos usar una solución server-side
  // Por ahora, retornamos un buffer simulado. En producción usarías puppeteer o similar
  
  // Para desarrollo, creamos una imagen simple
  // En producción, deberías usar puppeteer o un servicio como Vercel Edge Functions
  
  try {
    // Usar siempre la generación básica de tickets
    // Canvas requiere dependencias nativas que no están disponibles en todos los entornos
    // La generación básica funciona perfectamente para tickets PNG usando sharp
    return await generateBasicTicketPNG(data)
    
    const { createCanvas, loadImage } = canvas.default || canvas
    
    const width = 400
    let height = 200 // Base height
    
    // Calcular altura necesaria
    height += consumptions.length * 30
    height += 150 // Para header, footer y totales
    
    const c = createCanvas(width, height)
    const ctx = c.getContext('2d')
    
    // Fondo blanco
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)
    
    // Borde
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, width - 20, height - 20)
    
    let y = 40
    
    // Logo/Nombre del negocio
    ctx.fillStyle = 'black'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(tenant.name || 'Botanero', width / 2, y)
    
    y += 30
    ctx.font = '12px Arial'
    ctx.fillText(`Ticket: ${ticketNumber}`, width / 2, y)
    
    y += 30
    ctx.strokeStyle = '#ccc'
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(width - 20, y)
    ctx.stroke()
    
    y += 20
    
    // Información de la mesa
    ctx.font = '14px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Mesa: ${table.number}`, 20, y)
    y += 20
    ctx.fillText(`Responsable: ${table.responsibleName}`, 20, y)
    y += 20
    ctx.fillText(`Apertura: ${new Date(table.openedAt).toLocaleString('es-MX')}`, 20, y)
    y += 20
    ctx.fillText(`Cierre: ${new Date().toLocaleString('es-MX')}`, 20, y)
    
    if (table.waiter) {
      y += 20
      ctx.fillText(`Mesero: ${table.waiter.name}`, 20, y)
    }
    
    y += 20
    ctx.strokeStyle = '#ccc'
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(width - 20, y)
    ctx.stroke()
    
    y += 20
    
    // Productos
    consumptions.forEach(consumption => {
      const productText = `${consumption.product.name} x${consumption.quantity}`
      const priceText = `$${(consumption.price * consumption.quantity).toFixed(2)}`
      
      ctx.fillText(productText, 20, y)
      ctx.textAlign = 'right'
      ctx.fillText(priceText, width - 20, y)
      ctx.textAlign = 'left'
      y += 25
    })
    
    y += 10
    ctx.strokeStyle = '#ccc'
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(width - 20, y)
    ctx.stroke()
    
    y += 20
    
    // Totales
    ctx.font = '14px Arial'
    ctx.fillText('Subtotal:', 20, y)
    ctx.textAlign = 'right'
    ctx.fillText(`$${subtotal.toFixed(2)}`, width - 20, y)
    ctx.textAlign = 'left'
    
    if (tip > 0) {
      y += 20
      ctx.fillText('Propina:', 20, y)
      ctx.textAlign = 'right'
      ctx.fillText(`$${tip.toFixed(2)}`, width - 20, y)
      ctx.textAlign = 'left'
    }
    
    y += 20
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(width - 20, y)
    ctx.stroke()
    
    y += 25
    ctx.font = 'bold 20px Arial'
    ctx.fillText('TOTAL:', 20, y)
    ctx.textAlign = 'right'
    ctx.fillText(`$${total.toFixed(2)}`, width - 20, y)
    ctx.textAlign = 'left'
    
    y += 30
    
    // Sello
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(20, y, width - 40, 40)
    ctx.strokeStyle = 'black'
    ctx.strokeRect(20, y, width - 40, 40)
    ctx.fillStyle = 'black'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('✓ CUENTA CERRADA / PAGADA', width / 2, y + 25)
    
    y += 50
    
    // Footer
    ctx.font = '12px Arial'
    ctx.fillText(`Cerrado por: ${closedBy}`, width / 2, y)
    y += 20
    ctx.fillText('¡Gracias por su visita!', width / 2, y)
    
    if (tenant.settings?.notes) {
      y += 20
      ctx.font = '11px Arial'
      ctx.fillText(tenant.settings.notes, width / 2, y)
    }
    
    return c.toBuffer('image/png')
  } catch (error) {
    console.error('Error generando ticket PNG:', error)
    // Fallback: generar ticket básico
    return generateBasicTicketPNG(data)
  }
}

// Función alternativa para desarrollo (sin canvas)
async function generateBasicTicketPNG(data: TicketData): Promise<Buffer> {
  const {
    tenant,
    table,
    consumptions,
    subtotal,
    tip,
    total,
    ticketNumber,
    closedBy,
  } = data

  // Calcular altura dinámica basada en cantidad de productos
  const baseHeight = 400
  const itemHeight = 25
  const minItemsHeight = 25 // Altura mínima para la sección de productos
  const itemsHeight = consumptions.length > 0 
    ? consumptions.length * itemHeight 
    : minItemsHeight
  const calculatedHeight = baseHeight + itemsHeight

  // Función para escapar caracteres especiales en SVG
  const escapeXml = (str: string) => {
    if (!str) return ''
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  // Calcular posiciones dinámicas
  const itemsCount = consumptions.length
  // Usar itemsHeight ya definido arriba
  const itemsStartY = 220
  const itemsEndY = itemsStartY + itemsHeight
  const totalsStartY = itemsEndY + 10

  // Generar productos en el SVG
  const productsSection = consumptions.length > 0
    ? consumptions.map((c, i) => {
        const productName = escapeXml(c.product?.name || 'Producto sin nombre')
        const quantity = c.quantity || 1
        const price = c.price || 0
        const subtotal = price * quantity
        const yPos = itemsStartY + i * 25
        return `
          <text x="20" y="${yPos}" font-family="Arial" font-size="14">${productName} x${quantity}</text>
          <text x="350" y="${yPos}" font-family="Arial" font-size="14" text-anchor="end">$${subtotal.toFixed(2)}</text>
        `
      }).join('')
    : `
      <text x="200" y="${itemsStartY + 12}" font-family="Arial" font-size="14" text-anchor="middle" fill="gray">Sin productos consumidos</text>
    `

  // Generar un SVG simple que se puede convertir a PNG
  const svg = `
    <svg width="400" height="${calculatedHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="${calculatedHeight}" fill="white" stroke="black" stroke-width="2"/>
      <text x="200" y="40" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle">${escapeXml(tenant.name || 'Botanero')}</text>
      <text x="200" y="60" font-family="Arial" font-size="12" text-anchor="middle" fill="gray">Ticket: ${escapeXml(ticketNumber)}</text>
      <line x1="20" y1="80" x2="380" y2="80" stroke="#ccc" stroke-width="1"/>
      <text x="20" y="110" font-family="Arial" font-size="14">Mesa: ${table.number}</text>
      <text x="20" y="130" font-family="Arial" font-size="14">Responsable: ${escapeXml(table.responsibleName)}</text>
      <text x="20" y="150" font-family="Arial" font-size="14">Apertura: ${escapeXml(new Date(table.openedAt).toLocaleString('es-MX'))}</text>
      <text x="20" y="170" font-family="Arial" font-size="14">Cierre: ${escapeXml(new Date().toLocaleString('es-MX'))}</text>
      <line x1="20" y1="190" x2="380" y2="190" stroke="#ccc" stroke-width="1"/>
      ${productsSection}
      <line x1="20" y1="${totalsStartY}" x2="380" y2="${totalsStartY}" stroke="#ccc" stroke-width="1"/>
      <text x="20" y="${totalsStartY + 30}" font-family="Arial" font-size="16">Subtotal:</text>
      <text x="350" y="${totalsStartY + 30}" font-family="Arial" font-size="16" text-anchor="end">$${subtotal.toFixed(2)}</text>
      ${tip > 0 ? `
        <text x="20" y="${totalsStartY + 55}" font-family="Arial" font-size="16">Propina:</text>
        <text x="350" y="${totalsStartY + 55}" font-family="Arial" font-size="16" text-anchor="end">$${tip.toFixed(2)}</text>
      ` : ''}
      <line x1="20" y1="${totalsStartY + 75}" x2="380" y2="${totalsStartY + 75}" stroke="black" stroke-width="2"/>
      <text x="20" y="${totalsStartY + 105}" font-family="Arial" font-size="20" font-weight="bold">TOTAL:</text>
      <text x="350" y="${totalsStartY + 105}" font-family="Arial" font-size="20" font-weight="bold" text-anchor="end">$${total.toFixed(2)}</text>
      <rect x="20" y="${totalsStartY + 125}" width="360" height="40" fill="#f0f0f0" stroke="black" stroke-width="2"/>
      <text x="200" y="${totalsStartY + 150}" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle">✓ CUENTA CERRADA / PAGADA</text>
      <text x="200" y="${totalsStartY + 190}" font-family="Arial" font-size="12" text-anchor="middle" fill="gray">Cerrado por: ${escapeXml(closedBy)}</text>
      <text x="200" y="${totalsStartY + 210}" font-family="Arial" font-size="12" text-anchor="middle" fill="gray">¡Gracias por su visita!</text>
    </svg>
  `

  // Convertir SVG a PNG usando sharp
  try {
    const sharp = (await import('sharp')).default
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer()
    return pngBuffer
  } catch (error) {
    console.error('Error convirtiendo SVG a PNG:', error)
    // Fallback: retornar SVG como buffer (aunque no sea PNG ideal)
    return Buffer.from(svg)
  }
}

