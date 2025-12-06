'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Save, Lock, Palette, MessageSquare, Package } from 'lucide-react'
import { GestionProductos } from './GestionProductos'

interface Tenant {
  id: string
  name: string
  subdomain: string
  domain: string | null
  logo: string | null
  primaryColor: string
  secondaryColor: string
}

interface Settings {
  id: string
  managerPin: string
  whatsappMessage: string
  enableTips: boolean
  notes: string | null
}

export function ConfiguracionClient({
  tenant,
  settings,
}: {
  tenant: Tenant
  settings: Settings
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tenantData, setTenantData] = useState({
    name: tenant.name,
    subdomain: tenant.subdomain,
    domain: tenant.domain || '',
    logo: tenant.logo || '',
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
  })
  const [settingsData, setSettingsData] = useState({
    managerPin: '',
    newManagerPin: '',
    confirmPin: '',
    whatsappMessage: settings.whatsappMessage,
    enableTips: settings.enableTips,
    notes: settings.notes || '',
  })

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantData),
      })

      if (!res.ok) {
        throw new Error('Error al guardar configuración')
      }

      toast.success('Configuración guardada')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (settingsData.newManagerPin) {
        if (settingsData.newManagerPin !== settingsData.confirmPin) {
          throw new Error('Los PINs no coinciden')
        }
        if (settingsData.newManagerPin.length < 4) {
          throw new Error('El PIN debe tener al menos 4 dígitos')
        }
      }

      const res = await fetch('/api/tenant/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsappMessage: settingsData.whatsappMessage,
          enableTips: settingsData.enableTips,
          notes: settingsData.notes,
          newPin: settingsData.newManagerPin || undefined,
          currentPin: settingsData.managerPin || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar configuración')
      }

      toast.success('Configuración guardada')
      setSettingsData({
        ...settingsData,
        managerPin: '',
        newManagerPin: '',
        confirmPin: '',
      })
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-botanero-primary">Configuración</h1>
        <p className="text-botanero-dark-light mt-2">Personaliza tu negocio</p>
      </div>

      {/* Configuración del Tenant */}
      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light">
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="text-botanero-primary" size={24} />
          <h2 className="text-xl font-bold text-botanero-dark">Marca y Apariencia</h2>
        </div>

        <form onSubmit={handleSaveTenant} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Nombre del Negocio *
            </label>
            <input
              type="text"
              value={tenantData.name}
              onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Subdominio *
            </label>
            <input
              type="text"
              value={tenantData.subdomain}
              onChange={(e) => setTenantData({ ...tenantData, subdomain: e.target.value })}
              className="input"
              required
            />
            <p className="text-xs text-botanero-dark-light mt-1">
              Tu URL será: {tenantData.subdomain}.mesasvirtual.com
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Dominio Personalizado (Opcional)
            </label>
            <input
              type="text"
              value={tenantData.domain}
              onChange={(e) => setTenantData({ ...tenantData, domain: e.target.value })}
              className="input"
              placeholder="ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              URL del Logo
            </label>
            <input
              type="url"
              value={tenantData.logo}
              onChange={(e) => setTenantData({ ...tenantData, logo: e.target.value })}
              className="input"
              placeholder="https://ejemplo.com/logo.png"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-botanero-dark">
                Color Primario
              </label>
              <input
                type="color"
                value={tenantData.primaryColor}
                onChange={(e) => setTenantData({ ...tenantData, primaryColor: e.target.value })}
                className="w-full h-10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-botanero-dark">
                Color Secundario
              </label>
              <input
                type="color"
                value={tenantData.secondaryColor}
                onChange={(e) => setTenantData({ ...tenantData, secondaryColor: e.target.value })}
                className="w-full h-10 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </form>
      </div>

      {/* Configuración de Seguridad */}
      <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-botanero-primary-light">
        <div className="flex items-center space-x-2 mb-4">
          <Lock className="text-botanero-primary" size={24} />
          <h2 className="text-xl font-bold text-botanero-dark">Seguridad</h2>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              PIN Actual (para cambiar PIN)
            </label>
            <input
              type="password"
              value={settingsData.managerPin}
              onChange={(e) => setSettingsData({ ...settingsData, managerPin: e.target.value })}
              className="input"
              placeholder="Ingresa tu PIN actual"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Nuevo PIN de Gerente
            </label>
            <input
              type="password"
              value={settingsData.newManagerPin}
              onChange={(e) => setSettingsData({ ...settingsData, newManagerPin: e.target.value })}
              className="input"
              placeholder="Deja vacío para mantener el actual"
            />
          </div>

          {settingsData.newManagerPin && (
            <div>
              <label className="block text-sm font-medium mb-2 text-botanero-dark">
                Confirmar Nuevo PIN
              </label>
              <input
                type="password"
                value={settingsData.confirmPin}
                onChange={(e) => setSettingsData({ ...settingsData, confirmPin: e.target.value })}
                className="input"
                placeholder="Confirma el nuevo PIN"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableTips"
              checked={settingsData.enableTips}
              onChange={(e) => setSettingsData({ ...settingsData, enableTips: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="enableTips" className="text-sm text-botanero-dark">
              Habilitar propinas en tickets
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center space-x-2 text-botanero-dark">
              <MessageSquare size={16} />
              <span>Mensaje de WhatsApp</span>
            </label>
            <textarea
              value={settingsData.whatsappMessage}
              onChange={(e) => setSettingsData({ ...settingsData, whatsappMessage: e.target.value })}
              className="input"
              rows={3}
              placeholder="Mensaje que se enviará con el ticket"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-botanero-dark">
              Notas del Negocio (aparecen en tickets)
            </label>
            <textarea
              value={settingsData.notes}
              onChange={(e) => setSettingsData({ ...settingsData, notes: e.target.value })}
              className="input"
              rows={3}
              placeholder="Mensaje personalizado para los clientes"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{loading ? 'Guardando...' : 'Guardar Configuración'}</span>
          </button>
        </form>
      </div>

      {/* Gestión de Productos */}
      <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="text-botanero-accent" size={24} />
          <h2 className="text-xl font-bold text-black">Gestión de Productos</h2>
        </div>
        <GestionProductos />
      </div>
    </div>
  )
}

