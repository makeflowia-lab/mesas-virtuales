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
    <div className="space-y-6 min-h-screen bg-botanero-primary-light">
      <GestionProductos />
    </div>
  )
}





