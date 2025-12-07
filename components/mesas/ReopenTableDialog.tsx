'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { X, RotateCcw } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
}

interface ReopenTableDialogProps {
  tableId: string
  tableNumber: number
  onClose: () => void
}

export function ReopenTableDialog({
  tableId,
  tableNumber,
  onClose,
}: ReopenTableDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    responsibleName: '',
    responsiblePhone: '',
    responsibleId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Preparar datos, excluyendo campos vacíos
      const dataToSend: any = {
        responsibleName: formData.responsibleName,
        responsiblePhone: formData.responsiblePhone,
      }
      
      if (formData.responsibleId && formData.responsibleId.trim() !== '') {
        dataToSend.responsibleId = formData.responsibleId
      }

      const res = await fetch(`/api/tables/${tableId}/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al reabrir la mesa')
      }

      toast.success('Mesa reabierta exitosamente')
      // Redirigir a la nueva mesa creada usando router
      router.push(`/dashboard/mesas/${data.table.id}`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-botanero-dark">Reabrir Mesa {tableNumber}</h2>
          <button
            title="Reabrir mesa"
            onClick={onClose}
            className="p-2 hover:bg-botanero-primary-light rounded-lg text-botanero-dark"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-botanero-secondary-light border-2 border-botanero-secondary-light rounded-lg p-4">
            <p className="text-sm text-botanero-dark">
              Completa los datos del cliente responsable para esta nueva sesión de la mesa.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Nombre del Responsable (Cliente) *
            </label>
            <input
              type="text"
              value={formData.responsibleName}
              onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
              className="input"
              placeholder="Nombre del cliente"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Teléfono del Responsable (Cliente) *
            </label>
            <input
              type="tel"
              value={formData.responsiblePhone}
              onChange={(e) => {
                // Solo permitir números
                const value = e.target.value.replace(/\D/g, '')
                setFormData({ ...formData, responsiblePhone: value })
              }}
              className="input"
              placeholder="5551234567"
              required
              maxLength={15}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              ID de Empleado (Opcional)
            </label>
            <input
              type="text"
              value={formData.responsibleId}
              onChange={(e) => setFormData({ ...formData, responsibleId: e.target.value })}
              className="input"
              placeholder="M001"
            />
            <p className="text-xs text-botanero-dark-light mt-1">
              ID del mesero o empleado que atiende la mesa.
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
                  <span>Reabriendo...</span>
                </>
              ) : (
                <>
                  <RotateCcw size={18} />
                  <span>Reabrir Mesa</span>
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
    </div>
  )
}

