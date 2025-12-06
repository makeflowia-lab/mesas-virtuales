import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-botanero-accent mb-4">404</h1>
        <p className="text-xl text-white/80 mb-8">Página no encontrada</p>
        <Link href="/dashboard" className="btn-primary">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  )
}




