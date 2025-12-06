'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Save, Lock, Palette, MessageSquare, Package, Receipt, ExternalLink, X, MessageCircle } from 'lucide-react'
import { GestionProductos } from './GestionProductos'
import { QRCodeSVG } from 'qrcode.react'

interface Tenant {
  id: string
  name: string
  subdomain: string
  domain: string | null
  logo: string | null
}

interface Settings {
  id: string
  managerPin: string
  whatsappMessage: string
  enableTips: boolean
  notes: string | null
}

interface Ticket {
  id: string
  total: number
  pngUrl: string
  items: any
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

export function ConfiguracionClient({
  tenant,
  settings,
}: {
  tenant: Tenant
  settings: Settings
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [tenantData, setTenantData] = useState({
    name: tenant.name,
    subdomain: tenant.subdomain,
    domain: tenant.domain || '',
    logo: tenant.logo || '',
  })
  const [settingsData, setSettingsData] = useState({
    managerPin: '',
    newManagerPin: '',
    confirmPin: '',
    whatsappMessage: settings.whatsappMessage,
    enableTips: settings.enableTips,
    notes: settings.notes || '',
  })
  const [seeding, setSeeding] = useState(false)

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantData),
      })

      if (!res.ok) {
        throw new Error('Error al guardar configuración')
      }

      toast.success('Configuración guardada')
      // Disparar evento para actualizar el header
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tenantUpdated'))
      }
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (settingsData.newManagerPin) {
        if (settingsData.newManagerPin !== settingsData.confirmPin) {
          throw new Error('Los PINs no coinciden')
        }
        if (settingsData.newManagerPin.length < 4) {
          throw new Error('El PIN debe tener al menos 4 dígitos')
        }
      }

      const res = await fetch('/api/tenant/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsappMessage: settingsData.whatsappMessage,
          enableTips: settingsData.enableTips,
          notes: settingsData.notes,
          newPin: settingsData.newManagerPin || undefined,
          currentPin: settingsData.managerPin || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar configuración')
      }

      toast.success('Configuración guardada')
      setSettingsData({
        ...settingsData,
        managerPin: '',
        newManagerPin: '',
        confirmPin: '',
      })
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Cargar tickets recientes
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const res = await fetch('/api/dashboard/stats')
        const data = await res.json()
        if (data.recentTickets) {
          setTickets(data.recentTickets)
        }
      } catch (error) {
        console.error('Error cargando tickets:', error)
        // No mostrar toast en cada error para no molestar
      } finally {
        setLoadingTickets(false)
      }
    }

    // Cargar inmediatamente
    loadTickets()
    
    // Escuchar eventos de actualización cuando se cierra una mesa (si hay window)
    const handleTicketCreated = () => {
      loadTickets()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('ticketCreated', handleTicketCreated)
    }

    // Actualizar cada 10 segundos
    const interval = setInterval(loadTickets, 10000)
    
    return () => {
      clearInterval(interval)
      if (typeof window !== 'undefined') {
        window.removeEventListener('ticketCreated', handleTicketCreated)
      }
    }
  }, [])

  // Generar texto para el QR
  const generateQRText = (ticket: Ticket) => {
    let text = `TICKET #${ticket.id}\\n`
    text += `Mesa: ${ticket.table.number}\\n`
    text += `Fecha: ${new Date(ticket.createdAt).toLocaleString('es-MX')}\\n`
    
    if (ticket.items && Array.isArray(ticket.items) && ticket.items.length > 0) {
      text += `\\nCONSUMO:\\n`
      ticket.items.forEach((item: any) => {
        text += `- ${item.quantity}x ${item.name} ($${(item.subtotal || item.price * item.quantity).toFixed(2)})\\n`
      })
    } else {
      text += `\\nCONSUMO:\\nSin detalle disponible\\n`
    }
    
    text += `\\nTOTAL: $${ticket.total.toFixed(2)}\\n`
    text += `Gracias por su visita!`
    
    return text
  }

  // Función para compartir ticket por WhatsApp
  const shareTicketOnWhatsApp = async (ticket: Ticket, phone: string = '') => {
    try {
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

      // Crear un enlace temporal para descargar
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

  // Ejecutar seed de productos desde la UI (solo admin autenticado)
  const handleSeedProducts = async () => {
    try {
      setSeeding(true)
      const res = await fetch('/api/admin/seed-products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ force: false }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error creando productos')
      const created = typeof data.created === 'number' ? data.created : 0
      if (created > 0) {
        toast.success(`${created} productos semilla creados`)
      } else {
        toast.success('No se crearon nuevos productos (ya existían)')
      }
      // Notificar al resto de la UI para recargar catálogos
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('productsSeeded'))
      // After seeding, fetch list to confirm and show count
      try {
        const listRes = await fetch('/api/admin/list-products')
        const listData = await listRes.json()
        if (listRes.ok) {
          toast.success(`${listData.count || 0} productos disponibles ahora`)
        } else {
          console.warn('List products failed', listData)
        }
      } catch (e) {
        console.warn('Error fetching products list after seed', e)
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al crear productos')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-botanero-primary">Configuración</h1>
        <p className="text-botanero-dark-light mt-2">Personaliza tu negocio</p>
      </div>

      {/* Configuración del Tenant */}
      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light">
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="text-botanero-primary" size={24} />
          <h2 className="text-xl font-bold text-botanero-dark">Marca y Apariencia</h2>
        </div>

        <form onSubmit={handleSaveTenant} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Nombre del Negocio *
            </label>
            <input
              type="text"
              value={tenantData.name}
              onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
              className="input"
              required
              title="Nombre del Negocio"
              placeholder="Nombre del negocio"
              aria-label="Nombre del Negocio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Subdominio *
            </label>
            <input
              type="text"
              value={tenantData.subdomain}
              onChange={(e) => setTenantData({ ...tenantData, subdomain: e.target.value })}
              className="input"
              required
              title="Subdominio"
              placeholder="subdominio"
              aria-label="Subdominio"
            />
            <p className="text-xs text-botanero-dark-light mt-1">
              Tu URL será: {tenantData.subdomain}.mesasvirtual.com
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Dominio Personalizado (Opcional)
            </label>
            <input
              type="text"
              value={tenantData.domain}
              onChange={(e) => setTenantData({ ...tenantData, domain: e.target.value })}
              className="input"
              title="Dominio Personalizado"
              placeholder="ejemplo.com"
              aria-label="Dominio Personalizado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              URL del Logo
            </label>
            <input
              type="url"
              value={tenantData.logo}
              onChange={(e) => setTenantData({ ...tenantData, logo: e.target.value })}
              className="input"
              title="URL del Logo"
              placeholder="https://ejemplo.com/logo.png"
              aria-label="URL del Logo"
            />
            {tenantData.logo && (
              <div className="mt-2 flex items-center space-x-2">
                <img 
                  src={tenantData.logo} 
                  alt="Logo del negocio" 
                  className="h-12 w-12 object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <span className="text-xs text-botanero-dark-light">Vista previa del logo</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            title="Guardar Cambios"
            aria-label="Guardar Cambios"
          >
            <Save size={18} />
            <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </form>
      </div>

      {/* Configuración de Seguridad */}
      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light">
        <div className="flex items-center space-x-2 mb-4">
          <Lock className="text-botanero-primary" size={24} />
          <h2 className="text-xl font-bold text-botanero-dark">Seguridad</h2>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              PIN Actual (para cambiar PIN)
            </label>
            <input
              type="password"
              value={settingsData.managerPin}
              onChange={(e) => setSettingsData({ ...settingsData, managerPin: e.target.value })}
              className="input"
              title="PIN Actual"
              placeholder="Ingresa tu PIN actual"
              aria-label="PIN Actual"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Nuevo PIN de Gerente
            </label>
            <input
              type="password"
              value={settingsData.newManagerPin}
              onChange={(e) => setSettingsData({ ...settingsData, newManagerPin: e.target.value })}
              className="input"
              title="Nuevo PIN de Gerente"
              placeholder="Deja vacío para mantener el actual"
              aria-label="Nuevo PIN de Gerente"
            />
          </div>

          {settingsData.newManagerPin && (
            <div>
              <label className="block text-sm font-medium mb-2 text-botanero-dark">
                Confirmar Nuevo PIN
              </label>
              <input
                type="password"
                value={settingsData.confirmPin}
                onChange={(e) => setSettingsData({ ...settingsData, confirmPin: e.target.value })}
                className="input"
                placeholder="Confirma el nuevo PIN"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableTips"
              checked={settingsData.enableTips}
              onChange={(e) => setSettingsData({ ...settingsData, enableTips: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="enableTips" className="text-sm text-botanero-dark">
              Habilitar propinas en tickets
            </label>
          </div>

          <div>
            <label className="flex text-sm font-medium mb-2 items-center space-x-2 text-botanero-dark">
              <MessageSquare size={16} />
              <span>Mensaje de WhatsApp</span>
            </label>
            <textarea
              value={settingsData.whatsappMessage}
              onChange={(e) => setSettingsData({ ...settingsData, whatsappMessage: e.target.value })}
              className="input"
              rows={3}
              placeholder="Mensaje que se enviará con el ticket"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Notas del Negocio (aparecen en tickets)
            </label>
            <textarea
              value={settingsData.notes}
              onChange={(e) => setSettingsData({ ...settingsData, notes: e.target.value })}
              className="input"
              rows={3}
              placeholder="Mensaje personalizado para los clientes"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{loading ? 'Guardando...' : 'Guardar Configuración'}</span>
          </button>
        </form>
      </div>

      {/* Gestión de Productos */}
      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="text-botanero-primary" size={24} />
          <h2 className="text-xl font-bold text-botanero-dark">Gestión de Productos</h2>
        </div>
        <GestionProductos />
      </div>

      {/* Acciones Administrativas */}
      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="text-botanero-primary" size={24} />
          <h2 className="text-xl font-bold text-botanero-dark">Acciones Administrativas</h2>
        </div>
        <div>
          <p className="text-sm text-botanero-dark-light mb-3">Recarga los productos iniciales (botanas y cervezas) para este tenant.</p>
          <button
            onClick={handleSeedProducts}
            disabled={seeding}
            className="btn-primary"
            aria-label="Recargar productos iniciales"
          >
            {seeding ? 'Sembrando productos...' : 'Recargar productos iniciales'}
          </button>
        </div>
      </div>

      {/* Tickets Recientes */}
      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light">
        <div className="flex items-center space-x-2 mb-4">
          <Receipt className="text-botanero-primary" size={24} />
          <h2 className="text-xl font-bold text-botanero-dark">Tickets Recientes</h2>
        </div>
        
        {loadingTickets ? (
          <p className="text-botanero-dark-light text-center py-4">Cargando tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-botanero-dark-light text-center py-4">No hay tickets recientes</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="flex items-center justify-between p-4 bg-botanero-primary-light rounded-lg border-2 border-botanero-primary-light hover:border-botanero-primary hover:shadow-md transition-all cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-botanero-dark">
                    Mesa {ticket.table.number} - {ticket.table.responsibleName}
                  </p>
                  <p className="text-sm text-botanero-dark-light mt-1">
                    {new Date(ticket.createdAt).toLocaleString('es-MX')} • Cerrado por: {ticket.user.name}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <p className="text-lg font-bold text-botanero-primary">
                    ${ticket.total.toFixed(2)}
                  </p>
                  <ExternalLink size={18} className="text-botanero-dark-light" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              title="Cerrar vista previa del ticket"
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
              {selectedTicket.items && Array.isArray(selectedTicket.items) && selectedTicket.items.length > 0 && (
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
                  value={generateQRText(selectedTicket)}
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
                title="Compartir ticket por WhatsApp"
              >
                <MessageCircle size={16} />
                <span>Compartir por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

