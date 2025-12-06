// Utilidades para sincronización automática de datos

import { useEffect } from 'react'

export function useAutoSync(callback: () => Promise<void>, intervalMs: number = 30000) {
  useEffect(() => {
    const sync = async () => {
      try {
        await callback()
      } catch (error) {
        console.error('Error en sincronización automática:', error)
      }
    }

    // Sincronizar inmediatamente
    sync()

    // Sincronizar periódicamente
    const intervalId = setInterval(sync, intervalMs)

    return () => clearInterval(intervalId)
  }, [callback, intervalMs])
}

// Hook para React
export function useDataSync<T>(
  fetchFn: () => Promise<T>,
  setData: (data: T) => void,
  intervalMs: number = 30000
) {
  useEffect(() => {
    const sync = async () => {
      try {
        const data = await fetchFn()
        setData(data)
      } catch (error) {
        console.error('Error sincronizando datos:', error)
      }
    }

    sync()
    const intervalId = setInterval(sync, intervalMs)

    return () => clearInterval(intervalId)
  }, [fetchFn, setData, intervalMs])
}

