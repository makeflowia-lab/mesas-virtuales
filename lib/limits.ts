import { PLANS } from './plans'
import { prisma } from './prisma'

// Obtiene el plan del tenant
export async function getTenantPlan(tenantId: string) {
  // Aquí deberías obtener el plan real del tenant desde la base de datos
  // Ejemplo: await prisma.tenant.findUnique({ where: { id: tenantId } })
  // Supongamos que el campo se llama subscriptionPlan
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) return PLANS[0] // Free por defecto
  return PLANS.find(p => p.id === tenant.subscriptionPlan) || PLANS[0]
}

// Valida si el tenant puede crear una nueva mesa
export async function canCreateTable(tenantId: string) {
  const plan = await getTenantPlan(tenantId)
  if (!plan.mesasLimit) return true // ilimitado
  const mesasActivas = await prisma.table.count({
    where: {
      tenantId,
      status: 'ABIERTA',
    },
  })
  return mesasActivas < plan.mesasLimit
}

// Valida si el tenant puede crear un nuevo usuario
export async function canCreateUser(tenantId: string) {
  const plan = await getTenantPlan(tenantId)
  if (!plan.usersLimit) return true // ilimitado
  const usuarios = await prisma.user.count({
    where: {
      tenantId,
      active: true,
    },
  })
  return usuarios < plan.usersLimit
}
