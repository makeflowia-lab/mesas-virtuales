'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Package, Save, X, Image as ImageIcon } from 'lucide-react'
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

export function GestionProductos() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    category: 'BOTANA',
    price: '',
    available: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
      setLoading(false)
    } catch (error) {
      toast.error('Error al cargar productos')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let imageUrl = formData.image // Mantener URL existente si no hay archivo nuevo
      
      // Si hay un archivo nuevo, convertirlo a base64
      if (imageFile) {
        imageUrl = await convertImageToBase64(imageFile)
      }
      
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      
      const method = editingProduct ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          price: parseFloat(formData.price),
        }),
      })

      if (!res.ok) {
        throw new Error('Error al guardar producto')
      }

      toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado')
      setShowForm(false)
      setEditingProduct(null)
      resetForm()
      setImageFile(null)
      setImagePreview(null)
      await loadProducts()
      router.refresh()
      
      // Forzar actualización de la página de productos (menú del mesero)
      // Esto asegura que los cambios se reflejen inmediatamente
      if (typeof window !== 'undefined') {
        // Disparar evento personalizado para notificar cambios
        window.dispatchEvent(new CustomEvent('productsUpdated'))
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen')
        return
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe exceder 5MB')
        return
      }

      setImageFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      image: product.image || '',
      category: product.category,
      price: product.price.toString(),
      available: product.available,
    })
    setImageFile(null)
    setImagePreview(product.image || null)
    setShowForm(true)
  }

  const handleDelete = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Error al eliminar producto')
      }

      toast.success('Producto eliminado')
      await loadProducts()
      router.refresh()
      
      // Forzar actualización de la página de productos (menú del mesero)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('productsUpdated'))
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      category: 'BOTANA',
      price: '',
      available: true,
    })
    setImageFile(null)
    setImagePreview(null)
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-botanero-dark">Gestión de Productos</h2>
          <p className="text-botanero-dark-light mt-1">Administra tu catálogo completo</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingProduct(null)
            setShowForm(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 border-2 border-botanero-primary-light">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-botanero-dark">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingProduct(null)
                resetForm()
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} className="text-black" />
            </button>
          </div>

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
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-botanero-dark">
                Imagen del Producto
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input"
              />
              <p className="text-xs text-botanero-dark-light mt-1">
                Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
              </p>
              
              {/* Vista previa de la imagen */}
              {(imagePreview || formData.image) && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2 text-botanero-dark">Vista previa:</p>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview || formData.image}
                      alt="Vista previa"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-botanero-primary-light"
                    />
                    {imageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(formData.image || null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Opción alternativa: URL (opcional) */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2 text-botanero-dark">
                  O ingresa una URL de imagen (opcional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value })
                    if (e.target.value && !imageFile) {
                      setImagePreview(e.target.value)
                    }
                  }}
                  className="input"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={!!imageFile}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  step="0.01"
                  min="0"
                  required
                />
              </div>
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
                className="btn-primary flex items-center space-x-2"
              >
                <Save size={18} />
                <span>{editingProduct ? 'Actualizar' : 'Crear'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingProduct(null)
                  resetForm()
                }}
                className="btn-secondary px-6"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-center py-8 text-botanero-dark">Cargando productos...</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
            <div key={category} className="bg-white rounded-lg p-6 border-2 border-botanero-primary-light">
              <h3 className="text-xl font-bold mb-4 text-botanero-dark">
                {categoryLabels[category]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-botanero-primary-light rounded-lg p-4 border-2 border-botanero-primary-light hover:border-botanero-primary hover:shadow-md transition-all"
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
                        <h4 className="font-semibold text-botanero-dark">{product.name}</h4>
                        {product.description && (
                          <p className="text-sm text-botanero-dark-light mt-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                      {!product.available && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                          No disponible
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-bold text-botanero-primary text-lg">
                        {formatCurrency(product.price)}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 bg-botanero-secondary-light text-botanero-secondary rounded-lg hover:bg-botanero-secondary hover:text-white"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteDialog(product.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-botanero-primary-light">
              <Package className="mx-auto text-botanero-dark-light mb-4" size={48} />
              <p className="text-botanero-dark-light mb-4">No hay productos en el catálogo</p>
              <button
                onClick={() => {
                  resetForm()
                  setShowForm(true)
                }}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Agregar Primer Producto</span>
              </button>
            </div>
          )}
        </div>
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

