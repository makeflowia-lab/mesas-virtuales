 'use client'

 import { useState } from 'react'
 import { PLANS } from '@/lib/plans'
 import { useRouter } from 'next/navigation'
 import { signIn } from 'next-auth/react'
 import toast from 'react-hot-toast'

 export default function RegisterPage() {
   const router = useRouter()
   const [form, setForm] = useState({ tenantName: '', subdomain: '', name: '', email: '', password: '' })
   const [planId, setPlanId] = useState('basic')
   const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
   const [loading, setLoading] = useState(false)

   const plansToShow = PLANS.filter(p => ['free','basic','pro'].includes(p.id))

   const handleRegister = async (e: any) => {
     e.preventDefault()
     setLoading(true)
     try {
       const res = await fetch('/api/auth/register', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ ...form }),
       })
       const data = await res.json()
       if (!res.ok) throw new Error(data.error || 'Error registrando')

       // Loguear al usuario inmediatamente usando credentials
       const sign = await signIn('credentials', { redirect: false, email: form.email, password: form.password })
       if (!sign || (sign as any).error) {
         throw new Error('No se pudo iniciar sesión automáticamente')
       }

       // Si eligió plan free, redirigir al dashboard
       if (planId === 'free') {
         router.push('/dashboard')
         return
       }

       // Crear sesión de checkout en el servidor
       const checkout = await fetch('/api/stripe/checkout', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ planId, billingCycle }),
       })
       const checkoutData = await checkout.json()
       if (!checkout.ok) throw new Error(checkoutData.error || 'Error creando sesión de pago')

       // Redirigir al checkout de Stripe
       if (checkoutData.url) {
         window.location.href = checkoutData.url
       }
     } catch (err: any) {
       toast.error(err.message || 'Error')
       setLoading(false)
     }
   }

   return (
     <div className="max-w-3xl mx-auto py-12 px-4">
       <h1 className="text-2xl font-bold mb-4">Crear cuenta y elegir plan</h1>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         {plansToShow.map(p => (
           <div key={p.id} className={`p-4 border rounded ${planId === p.id ? 'border-blue-500' : 'border-gray-200'}`}>
             <h3 className="text-lg font-semibold">{p.name}</h3>
             <p className="text-sm text-gray-600">{p.reports}</p>
             <p className="mt-2 text-xl font-bold">${billingCycle === 'annual' ? p.priceAnnual : p.priceMonthly}{p.priceMonthly === 0 ? '/mo' : billingCycle === 'annual' ? '/año' : '/mes'}</p>
             <ul className="text-sm mt-2">
               <li>Mesas: {p.mesasLimit ?? 'Ilimitadas'}</li>
               <li>Usuarios: {p.usersLimit ?? 'Ilimitados'}</li>
             </ul>
             <div className="mt-3">
               <button onClick={() => setPlanId(p.id)} className="px-3 py-1 bg-gray-100 rounded">Seleccionar</button>
             </div>
           </div>
         ))}
       </div>

       <div className="mb-4">
         <label className="mr-2">Ciclo de facturación:</label>
         <select value={billingCycle} onChange={e => setBillingCycle(e.target.value as any)} className="input">
           <option value="monthly">Mensual</option>
           <option value="annual">Anual</option>
         </select>
       </div>

       <form onSubmit={handleRegister} className="space-y-3">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           <input required placeholder="Nombre del negocio" value={form.tenantName} onChange={e => setForm({ ...form, tenantName: e.target.value })} className="input" />
           <input required placeholder="Subdominio (ej: mi-negocio)" value={form.subdomain} onChange={e => setForm({ ...form, subdomain: e.target.value })} className="input" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           <input required placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
           <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" />
         </div>
         <input required type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" />

         <div className="flex items-center space-x-3">
           <button disabled={loading} type="submit" className="btn btn-primary">{loading ? 'Creando cuenta...' : 'Crear cuenta y comprar'}</button>
         </div>
       </form>
     </div>
   )
 }
