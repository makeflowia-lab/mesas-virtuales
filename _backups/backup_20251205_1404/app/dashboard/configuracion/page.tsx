import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ConfiguracionClient } from '@/components/configuracion/ConfiguracionClient'

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  // Solo dueños pueden acceder a configuración
  if (session.user.role !== 'DUENO') {
    redirect('/dashboard')
  }

  const tenantId = session.user.tenantId

  const [tenant, settings] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
    }),
    prisma.tenantSettings.findUnique({
      where: { tenantId },
    }),
  ])

  if (!tenant || !settings) {
    redirect('/dashboard')
  }

  return (
    <ConfiguracionClient
      tenant={JSON.parse(JSON.stringify(tenant))}
      settings={JSON.parse(JSON.stringify(settings))}
    />
  )
}

