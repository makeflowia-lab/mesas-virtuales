import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.log('Uso: npx tsx scripts/check-user.ts <email>')
    return
  }

  console.log(`Buscando usuario: ${email}...`)
  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true }
  })

  if (!user) {
    console.log('Usuario no encontrado.')
    return
  }

  console.log('Usuario encontrado:')
  console.log('ID:', user.id)
  console.log('Email:', user.email)
  console.log('Activo:', user.active)
  console.log('Tenant:', user.tenant?.name)
  console.log('Password Hash:', user.password.substring(0, 10) + '...')

  const isHashed = user.password.startsWith('$2')
  console.log('¿Password parece hasheado?:', isHashed ? 'Sí' : 'No')

  // Prueba rápida con 'admin123' si es el usuario admin por defecto
  if (email === 'admin@buensabor.com') {
    const match = await bcrypt.compare('admin123', user.password)
    console.log("Prueba con 'admin123':", match ? 'CORRECTO' : 'INCORRECTO')
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
