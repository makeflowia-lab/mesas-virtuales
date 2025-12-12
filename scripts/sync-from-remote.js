#!/usr/bin/env node
/*
  scripts/sync-from-remote.js
  Usage:
    REMOTE_DATABASE_URL="postgresql://..." node scripts/sync-from-remote.js

  This script will read tenants, tenantSettings and products from the remote
  PostgreSQL database and upsert them into the local database using Prisma.
  It is safe (uses upsert) and won't delete local data.

  You must have your local environment configured (LOCAL DATABASE_URL in .env.local)
  and the project dependencies installed.
*/

const { PrismaClient } = require('@prisma/client')
const { Client } = require('pg')

async function main() {
  const remoteUrl = process.env.REMOTE_DATABASE_URL
  if (!remoteUrl) {
    console.error('ERROR: REMOTE_DATABASE_URL is required. Example:');
    console.error('  REMOTE_DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/sync-from-remote.js')
    process.exit(1)
  }

  console.log('Connecting to remote DB...')
  const pg = new Client({ connectionString: remoteUrl })
  await pg.connect()

  // Local prisma client uses your local DATABASE_URL from env/.env.local
  const prisma = new PrismaClient()

  try {
    // Fetch tenants from remote
    console.log('Fetching tenants from remote...')
    const tenantsRes = await pg.query('SELECT id, name, subdomain, domain, logo, subscription_plan AS "subscriptionPlan", subscription_status AS "subscriptionStatus" FROM "Tenant"')
    const tenants = tenantsRes.rows

    console.log(`Found ${tenants.length} tenants on remote.`)

    for (const t of tenants) {
      console.log(`Upserting tenant ${t.subdomain} (${t.id})`)
      await prisma.tenant.upsert({
        where: { subdomain: t.subdomain },
        update: {
          name: t.name,
          domain: t.domain,
          logo: t.logo,
          subscriptionPlan: t.subscriptionPlan || 'free',
          subscriptionStatus: t.subscriptionStatus || 'inactive',
        },
        create: {
          id: t.id,
          name: t.name,
          subdomain: t.subdomain,
          domain: t.domain,
          logo: t.logo,
          subscriptionPlan: t.subscriptionPlan || 'free',
          subscriptionStatus: t.subscriptionStatus || 'inactive',
        }
      })

      // Fetch tenant settings from remote
      const settingsRes = await pg.query('SELECT * FROM "TenantSettings" WHERE tenant_id = $1', [t.id])
      const settings = settingsRes.rows[0]
      if (settings) {
        await prisma.tenantSettings.upsert({
          where: { tenantId: t.id },
          update: {
            managerPin: settings.manager_pin || undefined,
            enableTips: settings.enable_tips,
            whatsappMessage: settings.whatsapp_message,
            notes: settings.notes,
          },
          create: {
            tenantId: t.id,
            managerPin: settings.manager_pin || undefined,
            enableTips: settings.enable_tips,
            whatsappMessage: settings.whatsapp_message,
            notes: settings.notes,
          }
        })
      }

      // Fetch products for tenant
      const productsRes = await pg.query('SELECT id, name, description, price, category, available FROM "Product" WHERE tenant_id = $1', [t.id])
      const products = productsRes.rows
      console.log(`  ${products.length} products found for tenant ${t.subdomain}`)

      for (const p of products) {
        // Upsert by id
        await prisma.product.upsert({
          where: { id: p.id },
          update: {
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            available: p.available,
            tenantId: t.id,
          },
          create: {
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            available: p.available,
            tenantId: t.id,
          }
        })
      }
    }

    console.log('Sync complete. Disconnecting...')
  } catch (err) {
    console.error('Error during sync:', err)
  } finally {
    await pg.end()
    await prisma.$disconnect()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
