import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import { MesaDetailClient } from '@/components/mesas/MesaDetailClient'

export default async function MesaDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const tenantId = session.user.tenantId

  const table = await prisma.table.findFirst({
    where: {
      id: params.id,
      tenantId,
    },
    include: {
      waiter: true,
      responsibleUser: true,
      consumptions: {
        include: {
          product: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!table) {
    notFound()
  }

  // Filtrar consumos de la sesión actual (creados después de openedAt)
  const sessionConsumptions = table.consumptions.filter(
    c => !c.deleted && new Date(c.createdAt) >= new Date(table.openedAt)
  )
  
  const total = sessionConsumptions
    .reduce((sum, c) => sum + (c.price * c.quantity), 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/dashboard/mesas"
        className="inline-flex items-center space-x-2 text-botanero-primary hover:text-botanero-secondary"
      >
        <ArrowLeft size={20} />
        <span>Volver a Mesas</span>
      </Link>

      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-botanero-primary">
              Mesa {table.number}
            </h1>
            <p className="text-botanero-dark mt-2">
              Responsable: {table.responsibleName} ({table.responsiblePhone})
            </p>
            {table.responsibleUser && (
              <p className="text-botanero-dark-light text-sm mt-1">
                Usuario Sistema: {table.responsibleUser.name} ({table.responsibleUser.email})
              </p>
            )}
            {table.waiter && (
              <p className="text-botanero-dark-light text-sm mt-1">
                Mesero: {table.waiter.name}
              </p>
            )}
            {table.status === 'ABIERTA' ? (
              <p className="text-botanero-dark-light text-sm mt-1">
                Abierta: {new Date(table.openedAt).toLocaleString('es-MX')}
              </p>
            ) : table.closedAt ? (
              <p className="text-botanero-dark-light text-sm mt-1">
                Cerrada: {new Date(table.closedAt).toLocaleString('es-MX')}
              </p>
            ) : (
              <p className="text-botanero-dark-light text-sm mt-1">
                Abierta: {new Date(table.openedAt).toLocaleString('es-MX')}
              </p>
            )}
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              table.status === 'ABIERTA'
                ? 'bg-botanero-primary text-white'
                : 'bg-gray-600 text-white'
            }`}
          >
            {table.status === 'ABIERTA' ? 'Abierta' : 'Cerrada'}
          </span>
        </div>

        <MesaDetailClient 
          table={JSON.parse(JSON.stringify(table))} 
          userRole={session.user.role}
          total={total}
        />
      </div>
    </div>
  )
}

