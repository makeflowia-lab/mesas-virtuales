import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { GestionProductos } from '@/components/configuracion/GestionProductos'

export default async function CatalogoPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  // Solo dueños y gerentes pueden acceder a esta sección
  if (session.user.role !== 'DUENO' && session.user.role !== 'GERENTE') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-amber-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white rounded-3xl p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-wide text-white/85">Catálogo</p>
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <p className="text-white/90 mt-1">Administra tu inventario y disponibilidad</p>
        </div>

        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/70 ring-1 ring-black/5 p-4 sm:p-6 lg:p-8">
          <GestionProductos />
        </div>
      </div>
    </div>
  )
}









