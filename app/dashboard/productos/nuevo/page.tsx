'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NuevoProductoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    category: 'BOTANA',
    price: '',
    available: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear el producto')
      }

      toast.success('Producto creado exitosamente')
      router.push('/dashboard/productos')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard/productos"
        className="inline-flex items-center space-x-2 text-botanero-primary hover:text-botanero-secondary"
      >
        <ArrowLeft size={20} />
        <span>Volver a Productos</span>
      </Link>

      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light">
        <h1 className="text-2xl font-bold text-botanero-primary mb-6">
          Nuevo Producto
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Ej: Chicharrón preparado"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder="Descripción del producto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              URL de Imagen
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="input"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Categoría *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              required
            >
              <option value="BOTANA">Botana</option>
              <option value="CERVEZA">Cerveza</option>
              <option value="BEBIDA">Bebida</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Precio *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="available" className="text-sm text-botanero-dark">
              Producto disponible
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Producto'}
            </button>
            <Link
              href="/dashboard/productos"
              className="btn-secondary px-6"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

