import React from 'react'
import Link from 'next/link'
import ConfirmClient from '../ConfirmClient'

export default function SuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams?.session_id
  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">¡Gracias! Suscripción completada</h1>
      <p className="text-gray-700 mb-4">Tu pago se ha procesado correctamente.</p>
      {sessionId && <p className="text-sm text-gray-500 mb-4">Session: {sessionId}</p>}
      <div className="mb-4">
        <ConfirmClient sessionId={sessionId} />
      </div>
      <Link href="/dashboard" className="btn btn-primary">Ir al Dashboard</Link>
    </div>
  )
}
