import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { MenuProductosClient } from '@/components/productos/MenuProductosClient'

export default async function ProductosPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const tenantId = session.user.tenantId

  const products = await prisma.product.findMany({
    where: { 
      tenantId,
      available: true, // Solo productos disponibles
    },
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
  })

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-amber-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white rounded-3xl shadow-2xl p-6 sticky top-4 z-10 backdrop-blur">
        <div className="flex items-center space-x-3">
          <Package className="text-white" size={32} />
          <div>
            <p className="text-sm uppercase tracking-wide text-white/85">Catálogo</p>
            <h1 className="text-3xl font-bold">Menú</h1>
            <p className="text-white/90 mt-1">Productos disponibles para tu negocio</p>
          </div>
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/70 ring-1 ring-black/5 overflow-hidden">
        <MenuProductosClient 
          initialProducts={JSON.parse(JSON.stringify(products))}
        />
      </div>
      </div>
    </div>
  )
}
