'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Table, Package, DollarSign, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Ticket {
  id: string
  total: number
  createdAt: string
  table: {
    number: number
    responsibleName: string
  }
  user: {
    name: string
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    openTables: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentTickets: [] as Ticket[],
  })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      const data = await res.json()
      setStats(data)
      setLoading(false)
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      loadStats()
      // Sincronizar cada 15 segundos
      const interval = setInterval(loadStats, 15000)
      return () => clearInterval(interval)
    }
  }, [session])

  if (!session) {
    router.push('/login')
    return null
  }

  const statCards = [
    {
      name: 'Mesas Abiertas',
      value: stats.openTables,
      icon: Table,
      color: 'text-botanero-neon',
    },
    {
      name: 'Productos Activos',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-botanero-accent',
    },
    {
      name: 'Ingresos Totales',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-botanero-primary',
    },
    {
      name: 'Tickets Recientes',
      value: stats.recentTickets.length,
      icon: Clock,
      color: 'text-botanero-secondary',
    },
  ]

  return (
    <div className="space-y-6 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-botanero-accent">
          Dashboard
        </h1>
        <p className="text-white/80 mt-2">
          Bienvenido, {session.user.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{stat.name}</p>
                <p className={`text-2xl font-bold ${stat.color} mt-2`}>
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`${stat.color} opacity-50`} size={32} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tickets */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Tickets Recientes</h2>
        <div className="space-y-2">
          {loading ? (
            <p className="text-white/80">Cargando...</p>
          ) : stats.recentTickets.length === 0 ? (
            <p className="text-white/80">No hay tickets recientes</p>
          ) : (
            stats.recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="font-semibold">
                    Mesa {ticket.table.number} - {ticket.table.responsibleName}
                  </p>
                  <p className="text-sm text-white/70">
                    {new Date(ticket.createdAt).toLocaleString('es-MX')}
                  </p>
                </div>
                <p className="text-lg font-bold text-botanero-accent">
                  ${ticket.total.toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
