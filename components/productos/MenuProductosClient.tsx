'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
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
          className={`px-4 py-2 rounded-full font-medium transition-all shadow-sm ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
              : 'bg-white/80 backdrop-blur border border-white/70 text-slate-700 hover:shadow-md'
          }`}
        >
          Todas
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium transition-all shadow-sm ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                : 'bg-white/80 backdrop-blur border border-white/70 text-slate-700 hover:shadow-md'
            }`}
          >
            {categoryLabels[category] || category}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      {Object.keys(groupedProducts).length === 0 ? (
        <div className="text-center py-12 bg-white/85 backdrop-blur-xl rounded-2xl border border-white/70 ring-1 ring-black/5 shadow-xl">
          <Package className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-500">No hay productos disponibles</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
            <div key={category} className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 border border-white/70 ring-1 ring-black/5 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
                {categoryLabels[category] || category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white/90 backdrop-blur-lg rounded-2xl p-4 border border-white/70 ring-1 ring-black/5 shadow-md hover:shadow-2xl hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={400}
                        height={160}
                        className="w-full h-40 object-cover rounded-xl mb-3"
                        unoptimized
                      />
                    )}
                    <div className="flex flex-col h-full">
                      <h3 className="font-semibold text-slate-900 mb-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-slate-600 mb-2 flex-1">
                          {product.description}
                        </p>
                      )}
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <p className="font-bold text-orange-600 text-xl">
                          {formatCurrency(product.price)}
                        </p>
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                          {categoryLabels[product.category] || product.category}
                        </span>
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

