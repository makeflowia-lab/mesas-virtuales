'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { X, Lock } from 'lucide-react'

export function DeleteConsumptionDialog({
  consumptionId,
  onClose,
}: {
  consumptionId: string
  onClose: () => void
}) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pin) {
      toast.error('Ingresa el PIN de gerente')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/consumptions/${consumptionId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar')
      }

      toast.success('Producto eliminado')
      onClose()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-red-600">
            Eliminar Producto
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-botanero-primary-light rounded-lg text-botanero-dark"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-botanero-dark">
            Esta acción requiere autorización de gerencia. El producto será
            marcado como eliminado y quedará registrado en la bitácora.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center space-x-2 text-botanero-dark">
              <Lock size={16} />
              <span>PIN de Gerente *</span>
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="input"
              placeholder="Ingresa el PIN"
              required
              maxLength={10}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Eliminando...' : 'Confirmar Eliminación'}
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

