import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Table as TableIcon } from 'lucide-react'

export default async function MesasPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const tenantId = session.user.tenantId

  const allTables = await prisma.table.findMany({
    where: { tenantId },
    include: {
      waiter: true,
      consumptions: {
        include: {
          product: true,
        },
        where: {
          deleted: false,
        },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
  })

  // Lógica robusta para mostrar solo una mesa por número
  // Prioridad: 1. Abierta (la más reciente si hay varias por error), 2. Cerrada (la más reciente)
  const uniqueTablesMap = new Map<number, typeof allTables[0]>()

  // Primero procesar todas para encontrar la "ganadora" de cada número
  allTables.forEach(table => {
    const existing = uniqueTablesMap.get(table.number)
    
    if (!existing) {
      // Si no hay candidata, esta es la primera
      uniqueTablesMap.set(table.number, table)
      return
    }

    // Si ya hay candidata, decidimos si reemplazarla
    const currentIsOpen = existing.status === 'ABIERTA'
    const newIsOpen = table.status === 'ABIERTA'

    if (newIsOpen && !currentIsOpen) {
      // Si la nueva está abierta y la actual no, gana la nueva
      uniqueTablesMap.set(table.number, table)
    } else if (newIsOpen && currentIsOpen) {
      // Ambas abiertas: gana la más reciente (por seguridad, aunque no debería pasar)
      if (new Date(table.createdAt) > new Date(existing.createdAt)) {
        uniqueTablesMap.set(table.number, table)
      }
    } else if (!newIsOpen && !currentIsOpen) {
      // Ambas cerradas: gana la más reciente (última sesión cerrada)
      // Preferir closedAt para comparar cerradas, sino createdAt
      const newDate = table.closedAt ? new Date(table.closedAt) : new Date(table.createdAt)
      const existingDate = existing.closedAt ? new Date(existing.closedAt) : new Date(existing.createdAt)
      
      if (newDate > existingDate) {
        uniqueTablesMap.set(table.number, table)
      }
    }
    // Si la actual está abierta y la nueva cerrada, se queda la actual (no hacemos nada)
  })

  const tables = Array.from(uniqueTablesMap.values())

  // Ordenar: abiertas primero, luego por número
  tables.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'ABIERTA' ? -1 : 1
    }
    return a.number - b.number
  })

  const getTableTotal = (consumptions: any[]) => {
    return consumptions.reduce((sum, c) => sum + (c.price * c.quantity), 0)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-botanero-primary">Mesas</h1>
          <p className="text-botanero-dark mt-2">Gestiona las mesas activas</p>
        </div>
        <Link href="/dashboard/mesas/nueva" className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Nueva Mesa</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => {
          const total = getTableTotal(table.consumptions)
          const isOpen = table.status === 'ABIERTA'
          
          return (
            <Link
              key={table.id}
              href={`/dashboard/mesas/${table.id}`}
              className="bg-white rounded-xl p-6 shadow-lg border-2 border-botanero-primary-light hover:border-botanero-primary hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TableIcon className="text-botanero-primary" size={24} />
                  <div>
                    <h3 className="font-bold text-lg text-botanero-dark">Mesa {table.number}</h3>
                    <p className="text-sm text-botanero-dark-light">{table.responsibleName}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isOpen
                      ? 'bg-botanero-primary text-white'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {isOpen ? 'Abierta' : 'Cerrada'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-botanero-dark-light">Productos:</span>
                  <span className="font-semibold text-botanero-dark">{table.consumptions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-botanero-dark-light">Total:</span>
                  <span className="font-bold text-botanero-primary text-lg">
                    ${total.toFixed(2)}
                  </span>
                </div>
                {table.waiter && (
                  <div className="flex justify-between text-sm">
                    <span className="text-botanero-dark-light">Mesero:</span>
                    <span className="text-botanero-dark">{table.waiter.name}</span>
                  </div>
                )}
                <div className="text-xs text-botanero-dark-light mt-2">
                  {isOpen ? (
                    <>Abierta: {new Date(table.openedAt).toLocaleTimeString('es-MX')}</>
                  ) : table.closedAt ? (
                    <>Cerrada: {new Date(table.closedAt).toLocaleTimeString('es-MX')}</>
                  ) : (
                    <>Abierta: {new Date(table.openedAt).toLocaleTimeString('es-MX')}</>
                  )}
                </div>
              </div>
            </Link>
          )
        })}

        {tables.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl p-8 border-2 border-botanero-primary-light">
            <TableIcon className="mx-auto text-botanero-dark-light mb-4" size={48} />
            <p className="text-botanero-dark-light mb-4">No hay mesas creadas aún</p>
            <Link href="/dashboard/mesas/nueva" className="btn-primary mt-4 inline-block">
              Crear Primera Mesa
            </Link>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

