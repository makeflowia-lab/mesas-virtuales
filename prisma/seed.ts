import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedTenant } from '../lib/seed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Crear tenant de ejemplo
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Botanero El Buen Sabor',
      subdomain: 'buensabor',
      primaryColor: '#FF6B35',
      secondaryColor: '#F7931E',
    },
  })

  console.log('✅ Tenant creado:', tenant.name)

  // Crear usuario dueño
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const owner = await prisma.user.create({
    data: {
      email: 'admin@buensabor.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'DUENO',
      tenantId: tenant.id,
    },
  })

  console.log('✅ Usuario dueño creado:', owner.email)

  // Crear usuario gerente
  const managerPassword = await bcrypt.hash('gerente123', 10)
  const manager = await prisma.user.create({
    data: {
      email: 'gerente@buensabor.com',
      password: managerPassword,
      name: 'Gerente',
      role: 'GERENTE',
      tenantId: tenant.id,
    },
  })

  console.log('✅ Usuario gerente creado:', manager.email)

  // Crear usuario mesero
  const waiterPassword = await bcrypt.hash('mesero123', 10)
  const waiter = await prisma.user.create({
    data: {
      email: 'mesero@buensabor.com',
      password: waiterPassword,
      name: 'Mesero',
      role: 'MESERO',
      tenantId: tenant.id,
    },
  })

  console.log('✅ Usuario mesero creado:', waiter.email)

  // Cargar catálogo inicial
  await seedTenant(tenant.id)
  console.log('✅ Catálogo inicial cargado')

  console.log('🎉 Seed completado!')
  console.log('\nCredenciales de acceso:')
  console.log('Dueño: admin@buensabor.com / admin123')
  console.log('Gerente: gerente@buensabor.com / gerente123')
  console.log('Mesero: mesero@buensabor.com / mesero123')
  console.log('\nPIN de gerente por defecto: 1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

