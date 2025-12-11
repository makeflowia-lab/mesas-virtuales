'use client'

import { X, AlertCircle } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'warning' | 'danger' | 'info'
}

export function ConfirmDialog({
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning',
}: ConfirmDialogProps) {
  const getButtonColors = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700'
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700'
      default:
        return 'bg-botanero-primary hover:bg-botanero-warm'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light max-w-md w-full">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 p-3 rounded-full ${
            type === 'danger' ? 'bg-red-100' : type === 'info' ? 'bg-blue-100' : 'bg-botanero-secondary-light'
          }`}>
            <AlertCircle className={`${
              type === 'danger' ? 'text-red-600' : type === 'info' ? 'text-blue-600' : 'text-botanero-secondary'
            }`} size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-botanero-dark mb-2">{title}</h3>
            <p className="text-botanero-dark-light mb-6">{message}</p>
            <div className="flex space-x-3">
              <button
                onClick={onConfirm}
                className={`${getButtonColors()} text-white font-semibold py-2 px-6 rounded-lg transition-colors flex-1`}
              >
                {confirmText}
              </button>
              <button
                onClick={onCancel}
                className="bg-gray-200 hover:bg-gray-300 text-botanero-dark font-semibold py-2 px-6 rounded-lg transition-colors flex-1"
              >
                {cancelText}
              </button>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-botanero-primary-light rounded-lg text-botanero-dark"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}









