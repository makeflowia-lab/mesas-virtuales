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
  { name: 'Guacamole con totopos', category: Category.BOTANA, price: 95, description: 'Guacamole fresco con totopos crujientes' },
  { name: 'Frijoles charros', category: Category.BOTANA, price: 70, description: 'Frijoles charros con tocino y chorizo' },
  { name: 'Choriqueso', category: Category.BOTANA, price: 125, description: 'Queso fundido con chorizo y tortillas' },
  { name: 'Sopes (3 pzas)', category: Category.BOTANA, price: 85, description: 'Sopes con frijol, crema, queso y salsa' },
  { name: 'Tostilocos', category: Category.BOTANA, price: 80, description: 'Tostitos con cueritos, pepino, chamoy y chile' },
  { name: 'Esquites', category: Category.BOTANA, price: 55, description: 'Elote en vaso con mayonesa, queso y chile' },
  { name: 'Elote preparado', category: Category.BOTANA, price: 50, description: 'Elote con mayonesa, queso y chile' },
  { name: 'Quesadillas (3 pzas)', category: Category.BOTANA, price: 90, description: 'Quesadillas en comal con queso Oaxaca' },
  { name: 'Molletes (2 pzas)', category: Category.BOTANA, price: 75, description: 'Molletes con frijol, queso y pico de gallo' },
  { name: 'Tacos al pastor (4 pzas)', category: Category.BOTANA, price: 120, description: 'Tacos al pastor con piña y salsa' },
  
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
  { name: 'Bohemia Clara', category: Category.CERVEZA, price: 42, description: 'Cerveza Bohemia Clara 355ml' },
  { name: 'Bohemia Oscura', category: Category.CERVEZA, price: 44, description: 'Cerveza Bohemia Oscura 355ml' },
  { name: 'Dos Equis Lager', category: Category.CERVEZA, price: 38, description: 'Cerveza Dos Equis Lager 355ml' },
  { name: 'Dos Equis Ambar', category: Category.CERVEZA, price: 40, description: 'Cerveza Dos Equis Ambar 355ml' },
  { name: 'Carta Blanca', category: Category.CERVEZA, price: 34, description: 'Cerveza Carta Blanca 355ml' },
  { name: 'Estrella Jalisco', category: Category.CERVEZA, price: 36, description: 'Cerveza Estrella Jalisco 355ml' },
  { name: 'León', category: Category.CERVEZA, price: 36, description: 'Cerveza León 355ml' },
  { name: 'Montejo', category: Category.CERVEZA, price: 36, description: 'Cerveza Montejo 355ml' },
  { name: 'Barrilito', category: Category.CERVEZA, price: 32, description: 'Cerveza Barrilito 355ml' },
  { name: 'Ultra', category: Category.CERVEZA, price: 40, description: 'Cerveza Michelob Ultra 355ml' },
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











