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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-amber-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white rounded-3xl p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-wide text-white/85">Administración</p>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-white/90 mt-1">Personaliza tu negocio y ajustes generales</p>
        </div>

        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/70 ring-1 ring-black/5 p-4 sm:p-6 lg:p-8">
          <ConfiguracionClient
            tenant={JSON.parse(JSON.stringify(tenant))}
            settings={JSON.parse(JSON.stringify(settings))}
          />
        </div>
      </div>
    </div>
  )
}

