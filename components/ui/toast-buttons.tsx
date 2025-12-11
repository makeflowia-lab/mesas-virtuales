"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

type ToastType = "success" | "error" | "info" | "warning"

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
  isVisible?: boolean
  className?: string
}

const toastIcons = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

const toastClasses = {
  success:
    "border-emerald-100 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950",
  error: "border-red-100 bg-red-50 dark:border-red-900 dark:bg-red-950",
  warning:
    "border-amber-100 bg-amber-50 dark:border-amber-900 dark:bg-amber-950",
  info: "border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950",
}

export function BasicToast({
  message,
  type = "info",
  duration = 3000,
  onClose,
  isVisible = true,
  className = "",
}: ToastProps) {
  const [visible, setVisible] = useState(isVisible)

  useEffect(() => {
    setVisible(isVisible)
  }, [isVisible])

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [visible, duration, onClose])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`fixed top-4 right-4 z-50 flex w-80 items-center gap-3 rounded-lg border p-4 shadow-lg ${toastClasses[type]} ${className}`}
          initial={{ opacity: 0, x: 50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{
            opacity: 0,
            x: 50,
            scale: 0.8,
            transition: { duration: 0.15 },
          }}
          transition={{ type: "spring", bounce: 0.25 }}
        >
          <div className="flex-shrink-0">{toastIcons[type]}</div>
          <p className="flex-1 text-sm text-neutral-800 dark:text-neutral-200">{message}</p>
          <button
            onClick={() => {
              setVisible(false)
              onClose?.()
            }}
            className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4 text-neutral-500" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function ToastDemo() {
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState<ToastType>("success")

  const handleShowToast = (type: ToastType) => {
    setToastType(type)
    setShowToast(true)
  }

  return (
    <div className="flex flex-col gap-4 p-4 items-center justify-center min-h-[200px] border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <p className="text-sm text-gray-500 mb-2">Prueba las notificaciones Toast:</p>
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => handleShowToast("success")}
          className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm text-white hover:bg-emerald-600 transition-colors shadow-sm"
        >
          Éxito
        </button>
        <button
          onClick={() => handleShowToast("error")}
          className="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 transition-colors shadow-sm"
        >
          Error
        </button>
        <button
          onClick={() => handleShowToast("warning")}
          className="rounded-md bg-amber-500 px-3 py-1.5 text-sm text-white hover:bg-amber-600 transition-colors shadow-sm"
        >
          Advertencia
        </button>
        <button
          onClick={() => handleShowToast("info")}
          className="rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 transition-colors shadow-sm"
        >
          Info
        </button>
      </div>

      <AnimatePresence>
        {showToast && (
          <BasicToast
            message={`Este es un mensaje de ejemplo tipo ${toastType}`}
            type={toastType}
            duration={3000}
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

