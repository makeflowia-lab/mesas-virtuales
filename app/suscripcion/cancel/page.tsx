import React from 'react'
import Link from 'next/link'

export default function CancelPage() {
  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Pago cancelado</h1>
      <p className="text-gray-700 mb-4">No se completó el pago. Puedes intentar nuevamente.</p>
      <Link href="/register" className="btn btn-secondary">Volver a planes</Link>
    </div>
  )
}
