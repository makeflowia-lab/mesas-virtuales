'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Download, FileText } from 'lucide-react'
import ExcelJS from 'exceljs'

export default function ReportesPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    waiterId: '',
    category: '',
    tableId: '',
  })

  const handleExport = async () => {
    if (!session) return

    setLoading(true)

    try {
      // Obtener datos de reportes
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.waiterId) params.append('waiterId', filters.waiterId)
      if (filters.category) params.append('category', filters.category)
      if (filters.tableId) params.append('tableId', filters.tableId)

      const res = await fetch(`/api/reportes?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al generar reporte')
      }

      // Crear workbook de Excel
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Reporte de Consumos')

      // Encabezados
      worksheet.columns = [
        { header: 'Fecha', key: 'date', width: 20 },
        { header: 'Mesa', key: 'table', width: 10 },
        { header: 'Responsable', key: 'responsible', width: 25 },
        { header: 'Mesero', key: 'waiter', width: 20 },
        { header: 'Producto', key: 'product', width: 30 },
        { header: 'Categoría', key: 'category', width: 15 },
        { header: 'Cantidad', key: 'quantity', width: 10 },
        { header: 'Precio Unitario', key: 'price', width: 15 },
        { header: 'Subtotal', key: 'subtotal', width: 15 },
        { header: 'Total Mesa', key: 'tableTotal', width: 15 },
        { header: 'Tiempo Abierta', key: 'timeOpen', width: 15 },
      ]

      // Agregar datos
      data.reportData.forEach((row: any) => {
        worksheet.addRow({
          date: new Date(row.date).toLocaleString('es-MX'),
          table: row.tableNumber,
          responsible: row.responsibleName,
          waiter: row.waiterName || 'N/A',
          product: row.productName,
          category: row.category,
          quantity: row.quantity,
          price: `$${row.price.toFixed(2)}`,
          subtotal: `$${(row.price * row.quantity).toFixed(2)}`,
          tableTotal: `$${row.tableTotal.toFixed(2)}`,
          timeOpen: row.timeOpen,
        })
      })

      // Agregar resumen
      worksheet.addRow({})
      worksheet.addRow({ date: 'RESUMEN', table: '', responsible: '', waiter: '', product: '', category: '', quantity: '', price: '', subtotal: '', tableTotal: '', timeOpen: '' })
      
      if (data.summary) {
        worksheet.addRow({ date: 'Total General', tableTotal: `$${data.summary.total.toFixed(2)}` })
        worksheet.addRow({ date: 'Total Mesas', tableTotal: data.summary.totalTables })
        worksheet.addRow({ date: 'Promedio por Mesa', tableTotal: `$${data.summary.averagePerTable.toFixed(2)}` })
      }

      // Estilos
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6B35' },
      }

      // Generar buffer
      const buffer = await workbook.xlsx.writeBuffer()

      // Descargar
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte-${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)

      toast.success('Reporte exportado exitosamente')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-botanero-primary">Reportes</h1>
        <p className="text-botanero-dark mt-2">Exporta información de consumos y ventas</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-secondary-light">
        <h2 className="text-xl font-bold mb-4 text-botanero-dark">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Categoría
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input"
            >
              <option value="">Todas</option>
              <option value="BOTANA">Botana</option>
              <option value="CERVEZA">Cerveza</option>
              <option value="BEBIDA">Bebida</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleExport}
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Download size={20} />
            <span>{loading ? 'Generando...' : 'Exportar a Excel'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-secondary-light">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="text-botanero-primary" size={24} />
          <h2 className="text-xl font-bold text-botanero-dark">Información del Reporte</h2>
        </div>
        <div className="space-y-2 text-botanero-dark-light">
          <p>• Fechas y horas de apertura/cierre de mesas</p>
          <p>• Responsable de cada mesa</p>
          <p>• Total consumido por mesa</p>
          <p>• Tiempo que permaneció abierta cada mesa</p>
          <p>• Productos más vendidos</p>
          <p>• Consumo por categoría</p>
          <p>• Consumo por mesero</p>
          <p>• Totales diarios, semanales y mensuales</p>
          <p>• Historial de correcciones de gerente</p>
        </div>
      </div>
      </div>
    </div>
  )
}

