// Estructura de planes de suscripción para el SaaS
export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceAnnual: 0,
    mesasLimit: 3,
    usersLimit: 1,
    reports: 'Básicos',
    stripeEnabled: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    priceMonthly: 19,
    priceAnnual: 190,
    mesasLimit: 20,
    usersLimit: 3,
    reports: 'Avanzados',
    stripeEnabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 49,
    priceAnnual: 490,
    mesasLimit: 100,
    usersLimit: 10,
    reports: 'Completos',
    stripeEnabled: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 149,
    priceAnnual: 1490,
    mesasLimit: null, // ilimitado
    usersLimit: null, // ilimitado
    reports: 'Completos + personalizados',
    stripeEnabled: true,
  },
]
