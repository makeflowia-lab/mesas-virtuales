'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Table, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  ShoppingCart
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mesas', href: '/dashboard/mesas', icon: Table },
  { name: 'Productos', href: '/dashboard/productos', icon: Package },
  { name: 'Catálogo', href: '/dashboard/catalogo', icon: ShoppingCart, roles: ['DUENO', 'GERENTE'] },
  { name: 'Reportes', href: '/dashboard/reportes', icon: FileText },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tenant, setTenant] = useState<{ name: string; logo: string | null } | null>(null)

  useEffect(() => {
    const loadTenant = async () => {
      try {
        const res = await fetch('/api/tenant')
        if (res.ok) {
          const data = await res.json()
          setTenant({ name: data.name, logo: data.logo })
        }
      } catch (error) {
        console.error('Error cargando tenant:', error)
      }
    }
    
    if (session) {
      loadTenant()
    }

    // Escuchar eventos de actualización del tenant
    const handleTenantUpdate = () => {
      loadTenant()
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('tenantUpdated', handleTenantUpdate)
      return () => {
        window.removeEventListener('tenantUpdated', handleTenantUpdate)
      }
    }
  }, [session])

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-botanero-dark/90 backdrop-blur-md border-b border-botanero-primary/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-white p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link href="/dashboard" className="flex items-center space-x-2">
                {tenant?.logo ? (
                  <img 
                    src={tenant.logo} 
                    alt={tenant.name} 
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.style.display = 'none'
                      const fallback = img.parentElement?.querySelector('.logo-fallback') as HTMLElement
                      if (fallback) fallback.style.display = 'block'
                    }}
                  />
                ) : null}
                <span className="text-2xl logo-fallback" style={{ display: tenant?.logo ? 'none' : 'block' }}>🍺</span>
                <span className="text-xl font-bold text-botanero-accent">
                  {tenant?.name || 'Mesas Virtuales'}
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm">
                <p className="text-white/80">{session?.user?.name}</p>
                <p className="text-xs text-botanero-accent">{session?.user?.role}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/landing' })}
                className="btn-secondary flex items-center space-x-2"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 bg-botanero-dark/50 backdrop-blur-md border-r border-botanero-primary/30 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              // Verificar permisos de rol si están definidos
              if (item.roles && !item.roles.includes(session?.user?.role || '')) {
                return null
              }
              
              // Dashboard solo activo cuando es exactamente /dashboard
              // Otras rutas activas cuando coinciden exactamente o empiezan con su href
              const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-botanero-primary text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Sidebar Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-botanero-dark/95 backdrop-blur-md">
            <div className="p-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-white"
              >
                <X size={24} />
              </button>
              <nav className="mt-12 space-y-2">
                {navigation.map((item) => {
                  // Verificar permisos de rol si están definidos
                  if (item.roles && !item.roles.includes(session?.user?.role || '')) {
                    return null
                  }
                  
                  // Dashboard solo activo cuando es exactamente /dashboard
                  // Otras rutas activas cuando coinciden exactamente o empiezan con su href
                  const isActive = item.href === '/dashboard' 
                    ? pathname === '/dashboard'
                    : pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                        isActive
                          ? 'bg-botanero-primary text-white'
                          : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 p-4 lg:p-8 transition-colors duration-300 min-h-[calc(100vh-4rem)] ${
          pathname === '/dashboard/configuracion' 
            ? 'bg-botanero-primary-light' 
            : pathname === '/dashboard/catalogo'
            ? 'bg-botanero-primary-light'
            : pathname === '/dashboard/productos'
            ? 'bg-white'
            : pathname === '/dashboard/reportes'
            ? 'bg-botanero-secondary-light'
            : pathname.startsWith('/dashboard/mesas')
            ? 'bg-botanero-primary-light'
            : 'bg-gradient-to-br from-botanero-dark via-botanero-dark-light to-botanero-dark'
        }`}>
          {children}
        </main>
      </div>
    </div>
  )
}

