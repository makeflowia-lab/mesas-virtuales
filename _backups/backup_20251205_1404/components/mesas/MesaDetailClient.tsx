'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Trash2, Minus, Check, X, RotateCcw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { AddProductDialog } from './AddProductDialog'
import { DeleteConsumptionDialog } from './DeleteConsumptionDialog'
import { CloseTableDialog } from './CloseTableDialog'
import { ConfirmDialog } from './ConfirmDialog'
import { ReopenTableDialog } from './ReopenTableDialog'

interface Consumption {
  id: string
  quantity: number
  price: number
  deleted: boolean
  deletedAt: string | null
  deletedBy: string | null
  deletedReason: string | null
  createdAt: string
  product: {
    id: string
    name: string
    image: string | null
    category: string
  }
}

interface Table {
  id: string
  number: number
  status: string
  openedAt: string
  consumptions: Consumption[]
}

export function MesaDetailClient({ 
  table: initialTable, 
  userRole, 
  total: initialTotal 
}: { 
  table: Table
  userRole: string
  total: number
}) {
  const router = useRouter()
  const [table, setTable] = useState(initialTable)
  const [total, setTotal] = useState(initialTotal)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [showReopenDialog, setShowReopenDialog] = useState(false)

  // Sincronización automática cada 10 segundos para mesas abiertas
  useEffect(() => {
    if (table.status !== 'ABIERTA') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/mesas`)
        const data = await res.json()
        const updatedTable = data.find((t: Table) => t.id === table.id)
        if (updatedTable) {
          // Filtrar consumos de la sesión actual
          const sessionConsumptions = updatedTable.consumptions.filter(
            (c: Consumption) => !c.deleted && new Date(c.createdAt) >= new Date(updatedTable.openedAt)
          )
          const newTotal = sessionConsumptions
            .reduce((sum: number, c: Consumption) => sum + (c.price * c.quantity), 0)
          setTable(updatedTable)
          setTotal(newTotal)
        }
      } catch (error) {
        console.error('Error sincronizando mesa:', error)
      }
    }, 10000) // 10 segundos

    return () => clearInterval(interval)
  }, [table.id, table.status])

  // Filtrar consumos de la sesión actual (creados después de openedAt)
  // Solo mostrar consumos activos de la sesión actual, no de sesiones anteriores
  const activeConsumptions = table.consumptions.filter(
    c => !c.deleted && new Date(c.createdAt) >= new Date(table.openedAt)
  )
  // Los consumos eliminados también solo de la sesión actual
  const deletedConsumptions = table.consumptions.filter(
    c => c.deleted && new Date(c.createdAt) >= new Date(table.openedAt)
  )

  const handleUpdateQuantity = async (consumptionId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      toast.error('La cantidad debe ser al menos 1')
      return
    }

    try {
      const res = await fetch(`/api/consumptions/${consumptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (!res.ok) {
        throw new Error('Error al actualizar la cantidad')
      }

      toast.success('Cantidad actualizada')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }


  const canDelete = userRole === 'GERENTE' || userRole === 'DUENO'

  return (
    <div className="space-y-6">
      {/* Lista de productos activos */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-black">Productos</h2>
          {table.status === 'ABIERTA' && (
            <button
              onClick={() => setShowAddProduct(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Agregar Producto</span>
            </button>
          )}
        </div>

        {activeConsumptions.length === 0 ? (
          <p className="text-botanero-dark-light text-center py-8 bg-botanero-primary-light rounded-lg">
            No hay productos agregados aún
          </p>
        ) : (
          <div className="space-y-3">
            {activeConsumptions.map((consumption) => (
              <div
                key={consumption.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-botanero-primary-light rounded-lg border-2 border-botanero-primary-light hover:border-botanero-primary transition-colors"
              >
                {consumption.product.image && (
                  <img
                    src={consumption.product.image}
                    alt={consumption.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-botanero-dark">{consumption.product.name}</h3>
                  <p className="text-sm text-botanero-dark-light">
                    {consumption.product.category}
                  </p>
                  <p className="text-sm text-botanero-primary font-semibold mt-1">
                    {formatCurrency(consumption.price)} c/u
                  </p>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  {table.status === 'ABIERTA' && (
                    <>
                      <button
                        onClick={() => handleUpdateQuantity(consumption.id, consumption.quantity - 1)}
                        className="p-2 bg-botanero-secondary-light rounded-lg hover:bg-botanero-secondary text-botanero-dark disabled:opacity-50"
                        disabled={consumption.quantity <= 1}
                      >
                        <Minus size={18} />
                      </button>
                      <span className="font-bold text-lg w-8 text-center text-botanero-dark">
                        {consumption.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(consumption.id, consumption.quantity + 1)}
                        className="p-2 bg-botanero-secondary-light rounded-lg hover:bg-botanero-secondary text-botanero-dark"
                      >
                        <Plus size={18} />
                      </button>
                    </>
                  )}
                  {canDelete && table.status === 'ABIERTA' && (
                    <button
                      onClick={() => setShowDeleteDialog(consumption.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="text-right sm:text-left sm:ml-auto">
                  <p className="font-bold text-lg text-botanero-primary">
                    {formatCurrency(consumption.price * consumption.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Productos eliminados */}
      {deletedConsumptions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-botanero-dark-light">
            Productos Eliminados
          </h2>
          <div className="space-y-2">
            {deletedConsumptions.map((consumption) => (
              <div
                key={consumption.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold line-through text-botanero-dark-light">
                      {consumption.product.name}
                    </h3>
                    <span className="px-2 py-1 bg-red-200 text-red-700 text-xs rounded">
                      Eliminado por Gerencia
                    </span>
                  </div>
                  {consumption.deletedAt && (
                    <p className="text-xs text-botanero-dark-light mt-1">
                      {new Date(consumption.deletedAt).toLocaleString('es-MX')}
                    </p>
                  )}
                </div>
                <div className="text-right sm:text-left sm:ml-auto">
                  <p className="text-sm line-through text-botanero-dark-light">
                    {formatCurrency(consumption.price * consumption.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="border-t-2 border-botanero-primary pt-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold text-botanero-dark">Total:</span>
          <span className="text-3xl font-bold text-botanero-primary">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Botones de acción según estado */}
      {table.status === 'ABIERTA' ? (
        <button
          onClick={() => setShowCloseDialog(true)}
          className="btn-primary w-full py-3 text-lg"
        >
          Cerrar Mesa y Generar Ticket
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-botanero-secondary-light border-2 border-botanero-secondary-light rounded-lg p-4">
            <p className="text-center text-botanero-dark font-semibold">
              Esta mesa está cerrada. Puedes reabrirla para iniciar una nueva sesión.
            </p>
            <p className="text-center text-botanero-dark-light text-sm mt-2">
              Al reabrir, deberás completar los datos del nuevo responsable.
            </p>
          </div>
          <button
            onClick={() => setShowReopenDialog(true)}
            className="btn-primary w-full py-3 text-lg flex items-center justify-center space-x-2"
          >
            <RotateCcw size={20} />
            <span>Reabrir Mesa</span>
          </button>
        </div>
      )}

      {/* Dialogs */}
      {showAddProduct && (
        <AddProductDialog
          tableId={table.id}
          onClose={() => {
            setShowAddProduct(false)
            router.refresh()
          }}
        />
      )}

      {showDeleteDialog && (
        <DeleteConsumptionDialog
          consumptionId={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(null)
            router.refresh()
          }}
        />
      )}

      {showCloseDialog && (
        <CloseTableDialog
          tableId={table.id}
          total={total}
          onClose={() => {
            setShowCloseDialog(false)
            router.refresh()
          }}
        />
      )}

      {showReopenDialog && (
        <ReopenTableDialog
          tableId={table.id}
          tableNumber={table.number}
          onClose={() => {
            setShowReopenDialog(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

