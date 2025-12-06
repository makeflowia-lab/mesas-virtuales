'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
}

export default function NuevaMesaPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    number: '',
    responsibleName: '',
    responsiblePhone: '',
    responsibleId: '',
    waiterId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Preparar datos, excluyendo campos vacíos
      const dataToSend: any = {
        number: formData.number,
        responsibleName: formData.responsibleName,
        responsiblePhone: formData.responsiblePhone,
      }
      
      if (formData.responsibleId && formData.responsibleId.trim() !== '') {
        dataToSend.responsibleId = formData.responsibleId
      }
      
      if (formData.waiterId && formData.waiterId.trim() !== '') {
        dataToSend.waiterId = formData.waiterId
      }

      const res = await fetch('/api/mesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la mesa')
      }

      toast.success('Mesa creada exitosamente')
      router.push(`/dashboard/mesas/${data.id}`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard/mesas"
        className="inline-flex items-center space-x-2 text-botanero-primary hover:text-botanero-secondary"
      >
        <ArrowLeft size={20} />
        <span>Volver a Mesas</span>
      </Link>

      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light">
        <h1 className="text-2xl font-bold text-botanero-primary mb-6">
          Nueva Mesa
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Número de Mesa *
            </label>
            <input
              type="number"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="input"
              placeholder="1"
              required
              min="1"
            />
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
              ID del mesero o empleado que atiende la mesa. Si no se especifica, se asumirá el usuario actual.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Mesa'}
            </button>
            <Link
              href="/dashboard/mesas"
              className="btn-secondary px-6"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

