'use client'

import { useEffect, useState } from 'react'
interface PlanInfo {
  plan: string
  status: string
  startedAt?: string
  endsAt?: string
  mesasLimit?: number
  usersLimit?: number
  stripeEnabled?: boolean
}
import { useSession } from 'next-auth/react'
import { Table, Package, DollarSign, Clock, X, ExternalLink, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

interface Ticket {
  id: string
  total: number
  pngUrl: string
  items: any // JSON de items
  createdAt: string
  ticketNumber?: string
  table: {
    number: number
    responsibleName: string
    responsiblePhone?: string // Teléfono para WhatsApp
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
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)

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

  const loadPlan = async () => {
    try {
      setLoadingPlan(true)
      const res = await fetch('/api/tenant/plan')
      const data = await res.json()
      setPlanInfo(data)
    } catch (error) {
      setPlanInfo(null)
    } finally {
      setLoadingPlan(false)
    }
  }

  useEffect(() => {
    if (session) {
      loadStats()
      loadPlan()
      // Sincronizar cada 15 segundos
      const interval = setInterval(loadStats, 15000)
      const planInterval = setInterval(loadPlan, 60000)
      return () => clearInterval(interval)
      // Limpiar también el intervalo de plan
      return () => {
        clearInterval(interval)
        clearInterval(planInterval)
      }
    }
  }, [session])

  if (!session) {
    router.push('/login')
    return null
  }

  // Función para compartir ticket por WhatsApp
  const shareTicketOnWhatsApp = async (ticket: Ticket, phone: string = '') => {
    try {
      // Evitar uso de `window`/`document` cuando no exista (seguro para SSR)
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        toast.error('Operación no soportada en este contexto')
        return
      }

      // Usar ruta relativa para evitar depender de window.location en tiempo de build
      const imageUrl = `/api/tickets/${ticket.id}/image`

      // Descargar automáticamente la imagen PNG
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Error al descargar la imagen del ticket')
      }
      
      const blob = await response.blob()
      const imageObjectUrl = URL.createObjectURL(blob)
      
      // Crear un enlace temporal para descargar (solo en navegador)
      const link = document.createElement('a')
      link.href = imageObjectUrl
      link.download = `ticket-${ticket.ticketNumber || ticket.id.slice(-8)}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpiar el objeto URL después de un momento
      setTimeout(() => {
        if (typeof URL !== 'undefined' && URL.revokeObjectURL) {
          URL.revokeObjectURL(imageObjectUrl)
        }
      }, 1000)
      
      // Formatear el texto del ticket con enlace a la imagen PNG
      let ticketText = `🍺 TICKET DE VENTA\n\n`
      ticketText += `ID: ${ticket.id.slice(-8).toUpperCase()}\n`
      ticketText += `Mesa: ${ticket.table.number}\n`
      ticketText += `Responsable: ${ticket.table.responsibleName}\n`
      ticketText += `Atendido por: ${ticket.user.name}\n`
      ticketText += `Fecha: ${new Date(ticket.createdAt).toLocaleString('es-MX')}\n\n`
      
      if (ticket.items && Array.isArray(ticket.items) && ticket.items.length > 0) {
        ticketText += `CONSUMO:\n`
        ticket.items.forEach((item: any) => {
          ticketText += `${item.quantity}x ${item.name} - $${(item.subtotal || item.price * item.quantity).toFixed(2)}\n`
        })
        ticketText += `\n`
      } else {
        ticketText += `CONSUMO:\nSin detalle disponible\n\n`
      }
      
      ticketText += `TOTAL: $${ticket.total.toFixed(2)}\n\n`
      ticketText += `📎 Ver/Descargar ticket completo (PNG):\n${imageUrl}\n\n`
      ticketText += `💡 La imagen PNG se ha descargado automáticamente. Puedes arrastrarla a WhatsApp.\n\n`
      ticketText += `¡Gracias por su visita!`

      const encodedText = encodeURIComponent(ticketText)
      let url = 'https://wa.me/'
      
      if (phone) {
        // Limpiar el teléfono: solo números, sin +
        const cleanPhone = phone.replace(/[^0-9]/g, '')
        url += `${cleanPhone}?text=${encodedText}`
      } else {
        url += `?text=${encodedText}`
      }
      
      // Abrir WhatsApp después de un breve delay para que la descarga se complete
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.open) {
          window.open(url, '_blank')
        }
      }, 500)
    } catch (error: any) {
      console.error('Error al compartir ticket por WhatsApp:', error)
      toast.error(error.message || 'Error al compartir el ticket por WhatsApp')
    }
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-amber-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/90">Panel</p>
              <h1 className="text-3xl md:text-4xl font-bold mt-1">Dashboard</h1>
              <p className="text-white/90 mt-2">Bienvenido, {session.user.name}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl px-4 py-3 shadow-lg w-full md:w-auto">
              {loadingPlan ? (
                <span className="text-white/80 text-sm">Cargando plan...</span>
              ) : planInfo ? (
                <span className="text-white text-sm">
                  <b>Plan:</b> {planInfo.plan}{' '}
                  <span className="ml-2 px-2 py-1 rounded-full bg-white/20 text-white text-xs uppercase">
                    {planInfo.status}
                  </span>
                  {planInfo.endsAt && planInfo.status === 'active' && (
                    <span className="ml-2 text-white/80">
                      (Vence: {new Date(planInfo.endsAt).toLocaleDateString('es-MX')})
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-white text-sm">No se pudo cargar el plan</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.name}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-white/70 ring-1 ring-black/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">{stat.name}</p>
                  <p className={`text-2xl font-bold ${stat.color} mt-2`}>
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`${stat.color} opacity-60`} size={32} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Tickets */}
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/70 ring-1 ring-black/5">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Tickets Recientes</h2>
          <div className="space-y-2">
            {loading ? (
              <p className="text-slate-500">Cargando...</p>
            ) : stats.recentTickets.length === 0 ? (
              <p className="text-slate-500">No hay tickets recientes</p>
            ) : (
              stats.recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white rounded-2xl hover:shadow-md hover:-translate-y-[1px] transition-all cursor-pointer border border-slate-100"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      Mesa {ticket.table.number} - {ticket.table.responsibleName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(ticket.createdAt).toLocaleString('es-MX')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <p className="text-lg font-bold text-botanero-accent">
                      ${ticket.total.toFixed(2)}
                    </p>
                    <ExternalLink size={16} className="text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button title="Acción" aria-label="Acción"
              onClick={() => setSelectedTicket(null)}
              className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
            
            {/* Ticket Content */}
            <div className="flex flex-col items-center text-center space-y-4 pt-2" id="ticket-content">
              <div className="w-full border-b-2 border-dashed border-gray-300 pb-4">
                <h3 className="text-2xl font-bold text-botanero-dark">TICKET DE VENTA</h3>
                <p className="text-gray-500 text-sm">#{selectedTicket.id.slice(-8).toUpperCase()}</p>
                <p className="text-gray-500 text-xs mt-1">{new Date(selectedTicket.createdAt).toLocaleString('es-MX')}</p>
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between text-botanero-dark">
                  <span>Mesa:</span>
                  <span className="font-bold">{selectedTicket.table.number}</span>
                </div>
                <div className="flex justify-between text-botanero-dark">
                  <span>Responsable:</span>
                  <span className="font-bold">{selectedTicket.table.responsibleName}</span>
                </div>
                <div className="flex justify-between text-botanero-dark">
                  <span>Atendido por:</span>
                  <span className="font-bold">{selectedTicket.user.name}</span>
                </div>
              </div>

              {/* Items List */}
              {selectedTicket.items && Array.isArray(selectedTicket.items) && (
                <div className="w-full py-4 border-t border-dashed border-gray-300">
                  <div className="text-xs font-bold text-gray-500 mb-2 flex justify-between">
                    <span>PRODUCTO</span>
                    <span>IMPORTE</span>
                  </div>
                  <div className="space-y-1">
                    {selectedTicket.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm text-botanero-dark">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="w-full border-t-2 border-dashed border-gray-300 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-xl font-bold text-botanero-dark">TOTAL</span>
                  <span className="text-3xl font-bold text-botanero-primary">${selectedTicket.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 mt-4">
                <QRCodeSVG
                  value={`TICKET #${selectedTicket.id}
Mesa: ${selectedTicket.table.number}
Fecha: ${new Date(selectedTicket.createdAt).toLocaleString('es-MX')}

CONSUMO:
${selectedTicket.items && Array.isArray(selectedTicket.items) && selectedTicket.items.length > 0
  ? selectedTicket.items.map((item: any) => `- ${item.quantity}x ${item.name} ($${(item.subtotal || item.price * item.quantity).toFixed(2)})`).join('\n')
  : 'Sin detalle disponible'}

TOTAL: $${selectedTicket.total.toFixed(2)}
Gracias por su visita!`}
                  size={150}
                  level="M"
                  includeMargin={true}
                />
              </div>
              
              <p className="text-xs text-gray-400 mt-2">Escanea para verificar</p>
            </div>

            <div className="mt-6 flex justify-center">
              <button 
                onClick={() => shareTicketOnWhatsApp(selectedTicket, selectedTicket.table.responsiblePhone || '')}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm"
              >
                <MessageCircle size={16} />
                <span>Compartir por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
