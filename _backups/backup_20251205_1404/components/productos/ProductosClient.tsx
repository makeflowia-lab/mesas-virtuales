'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Edit, Trash2, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ConfirmDialog } from '@/components/mesas/ConfirmDialog'

interface Product {
  id: string
  name: string
  description: string | null
  image: string | null
  category: string
  price: number
  available: boolean
}

const categoryLabels: Record<string, string> = {
  BOTANA: 'Botana',
  CERVEZA: 'Cerveza',
  BEBIDA: 'Bebida',
  OTRO: 'Otro',
}

export function ProductosClient({
  initialProducts,
  canEdit,
}: {
  initialProducts: Product[]
  canEdit: boolean
}) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)

  const handleDelete = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Error al eliminar producto')
      }

      toast.success('Producto eliminado')
      setProducts(products.filter(p => p.id !== productId))
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <div className="space-y-6">
      {Object.keys(groupedProducts).length === 0 ? (
        <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light text-center py-12">
          <Package className="mx-auto text-botanero-dark-light mb-4" size={48} />
          <p className="text-botanero-dark-light mb-4">No hay productos en el catálogo</p>
          {canEdit && (
            <Link href="/dashboard/productos/nuevo" className="btn-primary inline-block">
              Agregar Primer Producto
            </Link>
          )}
        </div>
      ) : (
        Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <div key={category} className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light">
            <h2 className="text-xl font-bold mb-4 text-botanero-primary">
              {categoryLabels[category]}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-botanero-dark">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-botanero-dark-light mt-1">
                          {product.description}
                        </p>
                      )}
                    </div>
                    {!product.available && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                        No disponible
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-botanero-primary text-lg">
                      {formatCurrency(product.price)}
                    </span>
                    {canEdit && (
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/productos/${product.id}/editar`}
                          className="p-2 bg-botanero-secondary-light text-botanero-secondary rounded-lg hover:bg-botanero-secondary hover:text-white"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => setShowDeleteDialog(product.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showDeleteDialog && (
        <ConfirmDialog
          title="Eliminar Producto"
          message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          onConfirm={() => {
            handleDelete(showDeleteDialog)
            setShowDeleteDialog(null)
          }}
          onCancel={() => setShowDeleteDialog(null)}
        />
      )}
    </div>
  )
}

