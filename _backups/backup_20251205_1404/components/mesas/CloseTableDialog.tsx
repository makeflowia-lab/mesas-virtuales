'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { X, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ConfirmDialog } from './ConfirmDialog'

export function CloseTableDialog({
  tableId,
  total,
  onClose,
}: {
  tableId: string
  total: number
  onClose: () => void
}) {
  const [tip, setTip] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false)
  const [whatsappData, setWhatsappData] = useState<{ phone: string; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/tables/${tableId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tip }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al cerrar la mesa')
      }

      toast.success('Mesa cerrada exitosamente')
      
      // Descargar y ofrecer compartir por WhatsApp
      if (data.ticket?.ticketUrl) {
        // Crear un elemento temporal para descargar
        const link = document.createElement('a')
        link.href = data.ticket.ticketUrl
        link.download = `ticket-${data.ticket.ticketNumber}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Opción para compartir por WhatsApp después de un breve delay
        if (data.ticket.phoneNumber && data.ticket.whatsappMessage) {
          setTimeout(() => {
            const phone = data.ticket.phoneNumber.replace(/[^0-9]/g, '')
            const message = data.ticket.whatsappMessage
            setWhatsappData({ phone, message })
            setShowWhatsAppDialog(true)
          }, 1000)
        } else {
          onClose()
        }
      } else {
        onClose()
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const finalTotal = total + tip

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-botanero-primary">
            Cerrar Mesa
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-botanero-primary-light rounded-lg text-botanero-dark"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-botanero-primary-light rounded-lg p-4 space-y-2 border-2 border-botanero-primary-light">
            <div className="flex justify-between text-botanero-dark">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-botanero-dark">
                Propina (Opcional)
              </label>
              <input
                type="number"
                value={tip}
                onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                className="input"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="border-t-2 border-botanero-primary pt-2 flex justify-between text-lg font-bold text-botanero-dark">
              <span>Total:</span>
              <span className="text-botanero-primary">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>

          <div className="bg-botanero-secondary-light border-2 border-botanero-secondary-light rounded-lg p-4">
            <p className="text-sm text-botanero-dark">
              Se generará un ticket en formato PNG que podrás compartir por
              WhatsApp.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <span>Generando ticket...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Cerrar Mesa y Generar Ticket</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-6"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {showWhatsAppDialog && whatsappData && (
        <ConfirmDialog
          title="Compartir Ticket"
          message="¿Deseas compartir el ticket por WhatsApp?"
          confirmText="Compartir"
          cancelText="Cancelar"
          type="info"
          onConfirm={() => {
            const message = encodeURIComponent(whatsappData.message)
            const whatsappUrl = `https://wa.me/${whatsappData.phone}?text=${message}`
            window.open(whatsappUrl, '_blank')
            setShowWhatsAppDialog(false)
            setWhatsappData(null)
            onClose()
          }}
          onCancel={() => {
            setShowWhatsAppDialog(false)
            setWhatsappData(null)
            onClose()
          }}
        />
      )}
    </div>
  )
}

