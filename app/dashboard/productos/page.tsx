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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto py-8 space-y-6">
      <div className="bg-white/90 border border-botanero-primary-light rounded-2xl shadow-sm sticky top-4 z-10 p-6 backdrop-blur">
        <div className="flex items-center space-x-3">
          <Package className="text-botanero-primary" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-botanero-dark">Menú</h1>
            <p className="text-botanero-dark-light mt-1">Catálogo de productos disponibles</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <MenuProductosClient 
          initialProducts={JSON.parse(JSON.stringify(products))}
        />
      </div>
      </div>
    </div>
  )
}
