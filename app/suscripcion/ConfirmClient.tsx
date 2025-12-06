'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function ConfirmClient({ sessionId }: { sessionId?: string }) {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('no-session')
      setLoading(false)
      return
    }

    const confirm = async () => {
      try {
        const res = await fetch('/api/stripe/confirm-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error confirmando sesión')
        setStatus('confirmed')
        toast.success('Suscripción confirmada')
      } catch (err: any) {
        setStatus('error')
        toast.error(err.message || 'Error al confirmar suscripción')
      } finally {
        setLoading(false)
      }
    }

    confirm()
  }, [sessionId])

  if (loading) return <p>Confirmando suscripción...</p>
  if (status === 'confirmed') return <p>Suscripción activada. Redirigiendo...</p>
  if (status === 'no-session') return <p>No se encontró session_id para confirmar.</p>
  return <p>Error al confirmar suscripción.</p>
}
