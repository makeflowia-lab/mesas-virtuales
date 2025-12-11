const { PrismaClient } = require('@prisma/client')
const path = require('path')

async function main() {
  const prisma = new PrismaClient()
  try {
    const tenants = await prisma.tenant.findMany({ select: { id: true, name: true } })
    console.log('Found tenants:', tenants.length)
    const defaultProducts = [
      { name: 'Chicharrón preparado', category: 'BOTANA', price: 85, description: 'Chicharrón crujiente con limón y salsa' },
      { name: 'Tostadas de cueritos', category: 'BOTANA', price: 75, description: 'Tostadas con cueritos, crema y salsa' },
      { name: 'Nachos con queso', category: 'BOTANA', price: 95, description: 'Nachos crujientes con queso derretido' },
      { name: 'Cacahuates estilo japonés', category: 'BOTANA', price: 45, description: 'Cacahuates con salsa agridulce' },
      { name: 'Papas fritas', category: 'BOTANA', price: 55, description: 'Papas fritas caseras con sal' },
      { name: 'Alitas BBQ', category: 'BOTANA', price: 120, description: 'Alitas de pollo con salsa BBQ' },
      { name: 'Queso fundido', category: 'BOTANA', price: 110, description: 'Queso fundido con chorizo' },
      { name: 'Pepinos con chile y limón', category: 'BOTANA', price: 35, description: 'Pepinos frescos con chile y limón' },
      { name: 'Tacos dorados', category: 'BOTANA', price: 90, description: 'Tacos dorados con pollo o papa' },
      { name: 'Botana mixta', category: 'BOTANA', price: 150, description: 'Mezcla de botanas variadas' },
      { name: 'Corona', category: 'CERVEZA', price: 35, description: 'Cerveza Corona 355ml' },
      { name: 'Victoria', category: 'CERVEZA', price: 32, description: 'Cerveza Victoria 355ml' },
      { name: 'Modelo Especial', category: 'CERVEZA', price: 35, description: 'Cerveza Modelo Especial 355ml' },
      { name: 'Negra Modelo', category: 'CERVEZA', price: 38, description: 'Cerveza Negra Modelo 355ml' },
      { name: 'Indio', category: 'CERVEZA', price: 33, description: 'Cerveza Indio 355ml' },
      { name: 'Tecate Roja', category: 'CERVEZA', price: 30, description: 'Cerveza Tecate Roja 355ml' },
      { name: 'Tecate Light', category: 'CERVEZA', price: 30, description: 'Cerveza Tecate Light 355ml' },
      { name: 'Pacífico', category: 'CERVEZA', price: 32, description: 'Cerveza Pacífico 355ml' },
      { name: 'Superior', category: 'CERVEZA', price: 31, description: 'Cerveza Superior 355ml' },
      { name: 'Sol', category: 'CERVEZA', price: 30, description: 'Cerveza Sol 355ml' },
      { name: 'Café Americano', category: 'BEBIDA', price: 30, description: 'Café negro tradicional' },
      { name: 'Croissant', category: 'OTRO', price: 25, description: 'Pan francés hojaldrado' },
      { name: 'Jugo de Naranja', category: 'BEBIDA', price: 35, description: 'Jugo natural de naranja' }
    ]

    for (const t of tenants) {
      console.log(`Processing tenant ${t.name} (${t.id})`)
      // find existing product names
      const existing = await prisma.product.findMany({ where: { tenantId: t.id }, select: { name: true } })
      const existingNames = new Set(existing.map(e => e.name))
      let created = 0
      for (const p of defaultProducts) {
        if (!existingNames.has(p.name)) {
          await prisma.product.create({ data: { ...p, tenantId: t.id, available: true } })
          created++
        }
      }
      // upsert settings
      const bcrypt = require('bcryptjs')
      const hashedPin = await bcrypt.hash('1234', 10)
      await prisma.tenantSettings.upsert({ where: { tenantId: t.id }, update: { managerPin: hashedPin, enableTips: false, whatsappMessage: 'Aquí está tu ticket de consumo. ¡Gracias por tu visita!' }, create: { tenantId: t.id, managerPin: hashedPin, enableTips: false, whatsappMessage: 'Aquí está tu ticket de consumo. ¡Gracias por tu visita!' } })
      console.log(`Tenant ${t.name}: created ${created} products`)
    }
  } catch (err) {
    console.error('Error seeding tenants:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
