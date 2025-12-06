'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image: string | null
  category: string
  available: boolean
}

export function AddProductDialog({
  tableId,
  onClose,
}: {
  tableId: string
  onClose: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.filter((p: Product) => p.available))
        setLoading(false)
      })
      .catch(() => {
        toast.error('Error al cargar productos')
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProduct) {
      toast.error('Selecciona un producto')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/consumptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          productId: selectedProduct,
          quantity,
        }),
      })

      if (!res.ok) {
        throw new Error('Error al agregar producto')
      }

      toast.success('Producto agregado')
      onClose()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedProductData = products.find(p => p.id === selectedProduct)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-botanero-dark">Agregar Producto</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-botanero-primary-light rounded-lg text-botanero-dark"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <p className="text-center py-8 text-botanero-dark">Cargando productos...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-botanero-dark">
                Producto *
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="input"
                required
              >
                <option value="">Selecciona un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {selectedProductData && (
              <div className="p-4 bg-botanero-primary-light rounded-lg border-2 border-botanero-primary-light">
                <div className="flex items-center space-x-4">
                  {selectedProductData.image && (
                    <Image
                      src={selectedProductData.image}
                      alt={selectedProductData.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg"
                      unoptimized
                    />
                  )}
                  <div>
                    <p className="font-semibold text-botanero-dark">{selectedProductData.name}</p>
                    <p className="text-sm text-botanero-dark-light">
                      {selectedProductData.category}
                    </p>
                    <p className="text-botanero-primary font-bold mt-1">
                      ${selectedProductData.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-botanero-dark">
                Cantidad *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="input"
                min="1"
                required
              />
            </div>

            {selectedProductData && (
              <div className="p-4 bg-botanero-secondary-light rounded-lg border-2 border-botanero-secondary-light">
                <div className="flex justify-between text-botanero-dark">
                  <span>Subtotal:</span>
                  <span className="font-bold text-lg">
                    ${(selectedProductData.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {saving ? 'Agregando...' : 'Agregar'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-6"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

