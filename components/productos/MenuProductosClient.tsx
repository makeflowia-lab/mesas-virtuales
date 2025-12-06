'use client'

'use client'

import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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
  BOTANA: '🍽️ Botanas',
  CERVEZA: '🍺 Cervezas',
  BEBIDA: '🥤 Bebidas',
  OTRO: '📦 Otros',
}

export function MenuProductosClient({
  initialProducts,
}: {
  initialProducts: Product[]
}) {
  const [products, setProducts] = useState(initialProducts)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Sincronización automática cada 10 segundos + escuchar eventos de actualización
  useEffect(() => {
    const syncProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data.filter((p: Product) => p.available))
      } catch (error) {
        console.error('Error sincronizando productos:', error)
      }
    }

    // Sincronizar inmediatamente al montar
    syncProducts()

    // Escuchar eventos de actualización desde la gestión de productos
    const handleProductsUpdate = () => {
      syncProducts()
    }
    window.addEventListener('productsUpdated', handleProductsUpdate)

    // Sincronizar cada 10 segundos
    const interval = setInterval(syncProducts, 10000)

    return () => {
      clearInterval(interval)
      window.removeEventListener('productsUpdated', handleProductsUpdate)
    }
  }, [])

  const categories = Array.from(new Set(products.map(p => p.category)))
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      {/* Filtros por categoría */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-botanero-primary text-white'
              : 'bg-botanero-primary-light text-botanero-dark hover:bg-botanero-primary hover:text-white'
          }`}
        >
          Todas
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-botanero-primary text-white'
                : 'bg-botanero-primary-light text-botanero-dark hover:bg-botanero-primary hover:text-white'
            }`}
          >
            {categoryLabels[category] || category}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      {Object.keys(groupedProducts).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-botanero-primary-light">
          <Package className="mx-auto text-botanero-dark-light mb-4" size={48} />
          <p className="text-botanero-dark-light">No hay productos disponibles</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
            <div key={category} className="bg-white rounded-lg p-6 border-2 border-botanero-primary-light shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-botanero-dark">
                {categoryLabels[category] || category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-botanero-primary-light rounded-lg p-4 border-2 border-botanero-primary-light hover:border-botanero-primary hover:shadow-lg transition-all cursor-pointer"
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <div className="flex flex-col h-full">
                      <h3 className="font-semibold text-botanero-dark mb-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-botanero-dark-light mb-2 flex-1">
                          {product.description}
                        </p>
                      )}
                      <div className="mt-auto pt-2">
                        <p className="font-bold text-botanero-primary text-xl">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

