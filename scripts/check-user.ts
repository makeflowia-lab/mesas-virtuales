/**
 * Script para verificar usuarios en la base de datos
 * Uso: npx tsx scripts/check-user.ts <email>
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌ Por favor proporciona un email: npx tsx scripts/check-user.ts <email>')
    process.exit(1)
  }

  console.log(`\n🔍 Buscando usuario: ${email}\n`)

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    })

    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos')
      process.exit(1)
    }

    console.log('✅ Usuario encontrado:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.name}`)
    console.log(`   Rol: ${user.role}`)
    console.log(`   Activo: ${user.active ? '✅ Sí' : '❌ No'}`)
    console.log(`   Tenant: ${user.tenant?.name || 'N/A'}`)
    console.log(`   Tenant ID: ${user.tenantId}`)
    
    // Verificar formato del password
    const isHashed = user.password.startsWith('$2a$') || 
                     user.password.startsWith('$2b$') || 
                     user.password.startsWith('$2y$')
    
    console.log(`\n🔐 Información de contraseña:`)
    console.log(`   Está hasheada: ${isHashed ? '✅ Sí' : '❌ No'}`)
    console.log(`   Longitud: ${user.password.length} caracteres`)
    
    if (!isHashed) {
      console.log('\n⚠️  ADVERTENCIA: La contraseña NO está hasheada correctamente!')
      console.log('   Esto puede causar problemas de autenticación.')
    }

    if (!user.active) {
      console.log('\n⚠️  ADVERTENCIA: El usuario está INACTIVO!')
      console.log('   Esto impedirá el inicio de sesión.')
    }

    // Probar con una contraseña común
    console.log('\n🧪 Pruebas de contraseña comunes:')
    const commonPasswords = ['admin123', 'password', '123456', 'admin', 'password123']
    
    for (const testPassword of commonPasswords) {
      try {
        const isValid = await bcrypt.compare(testPassword, user.password)
        if (isValid) {
          console.log(`   ✅ "${testPassword}" - CORRECTA`)
        }
      } catch (error) {
        // Si falla, probablemente la contraseña no está hasheada
      }
    }

    console.log('\n💡 Para resetear la contraseña, usa:')
    console.log(`   curl -X POST http://localhost:3000/api/admin/reset-password \\`)
    console.log(`     -H "Content-Type: application/json" \\`)
    console.log(`     -d '{"email":"${email}","newPassword":"nuevaPassword123","adminKey":"reset-key-change-in-production"}'`)
    console.log('')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

