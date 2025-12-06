import { prisma } from './prisma'
import { Category } from '@prisma/client'
import bcrypt from 'bcryptjs'

const defaultProducts = [
  // Botanas
  { name: 'Chicharrón preparado', category: Category.BOTANA, price: 85, description: 'Chicharrón crujiente con limón y salsa' },
  { name: 'Tostadas de cueritos', category: Category.BOTANA, price: 75, description: 'Tostadas con cueritos, crema y salsa' },
  { name: 'Nachos con queso', category: Category.BOTANA, price: 95, description: 'Nachos crujientes con queso derretido' },
  { name: 'Cacahuates estilo japonés', category: Category.BOTANA, price: 45, description: 'Cacahuates con salsa agridulce' },
  { name: 'Papas fritas', category: Category.BOTANA, price: 55, description: 'Papas fritas caseras con sal' },
  { name: 'Alitas BBQ', category: Category.BOTANA, price: 120, description: 'Alitas de pollo con salsa BBQ' },
  { name: 'Queso fundido', category: Category.BOTANA, price: 110, description: 'Queso fundido con chorizo' },
  { name: 'Pepinos con chile y limón', category: Category.BOTANA, price: 35, description: 'Pepinos frescos con chile y limón' },
  { name: 'Tacos dorados', category: Category.BOTANA, price: 90, description: 'Tacos dorados con pollo o papa' },
  { name: 'Botana mixta', category: Category.BOTANA, price: 150, description: 'Mezcla de botanas variadas' },
  
  // Cervezas
  { name: 'Corona', category: Category.CERVEZA, price: 35, description: 'Cerveza Corona 355ml' },
  { name: 'Victoria', category: Category.CERVEZA, price: 32, description: 'Cerveza Victoria 355ml' },
  { name: 'Modelo Especial', category: Category.CERVEZA, price: 35, description: 'Cerveza Modelo Especial 355ml' },
  { name: 'Negra Modelo', category: Category.CERVEZA, price: 38, description: 'Cerveza Negra Modelo 355ml' },
  { name: 'Indio', category: Category.CERVEZA, price: 33, description: 'Cerveza Indio 355ml' },
  { name: 'Tecate Roja', category: Category.CERVEZA, price: 30, description: 'Cerveza Tecate Roja 355ml' },
  { name: 'Tecate Light', category: Category.CERVEZA, price: 30, description: 'Cerveza Tecate Light 355ml' },
  { name: 'Pacífico', category: Category.CERVEZA, price: 32, description: 'Cerveza Pacífico 355ml' },
  { name: 'Superior', category: Category.CERVEZA, price: 31, description: 'Cerveza Superior 355ml' },
  { name: 'Sol', category: Category.CERVEZA, price: 30, description: 'Cerveza Sol 355ml' },
  {
    name: 'Café Americano',
    category: Category.BEBIDA,
    price: 30,
    description: 'Café negro tradicional',
  },
  {
    name: 'Croissant',
    category: Category.OTRO,
    price: 25,
    description: 'Pan francés hojaldrado',
  },
  {
    name: 'Jugo de Naranja',
    category: Category.BEBIDA,
    price: 35,
    description: 'Jugo natural de naranja',
  },
]

export async function seedTenant(tenantId: string, options?: { force?: boolean }) {
  // Obtener productos existentes del tenant por nombre
  const existing = await prisma.product.findMany({
    where: { tenantId },
    select: { name: true },
  })
  const existingNames = new Set(existing.map(e => e.name))

  const toCreate = defaultProducts.filter(p => options?.force ? true : !existingNames.has(p.name))

  let createdCount = 0
  if (toCreate.length > 0) {
    // Crear sólo los que no existían
    for (const product of toCreate) {
      await prisma.product.create({
        data: {
          ...product,
          tenantId,
          available: true,
        },
      })
      createdCount++
    }
  }

  // Upsert configuración por defecto (no duplicar)
  const hashedPin = await bcrypt.hash('1234', 10)
  await prisma.tenantSettings.upsert({
    where: { tenantId },
    update: {
      managerPin: hashedPin,
      enableTips: false,
      whatsappMessage: 'Aquí está tu ticket de consumo. ¡Gracias por tu visita!',
    },
    create: {
      tenantId,
      managerPin: hashedPin,
      enableTips: false,
      whatsappMessage: 'Aquí está tu ticket de consumo. ¡Gracias por tu visita!',
    },
  })

  return { createdCount }
}





