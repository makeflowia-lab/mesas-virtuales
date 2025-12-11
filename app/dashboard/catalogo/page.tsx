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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 lg:p-8">
          <GestionProductos />
        </div>
      </div>
    </div>
  )
}









