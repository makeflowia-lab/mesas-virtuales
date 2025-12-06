# 🚀 Guía de Despliegue - Mesas Virtuales

## Stack Tecnológico
- **Frontend/Backend**: Next.js 14+ en Vercel
- **Base de Datos**: Neon PostgreSQL (Serverless)
- **Control de Versiones**: GitHub
- **CI/CD**: GitHub Actions + Vercel

## 📋 Pre-requisitos

1. Cuenta en [GitHub](https://github.com)
2. Cuenta en [Vercel](https://vercel.com)
3. Cuenta en [Neon](https://neon.tech) con base de datos creada

## 🔧 Paso 1: Configurar Base de Datos Neon

### 1.1 Obtener Connection String

Tu connection string de Neon es:
```
postgresql://neondb_owner:npg_RKOUY5HGvJ3Q@ep-fancy-rice-a4xai2vp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 1.2 Inicializar Base de Datos

En tu máquina local:

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Aplicar esquema a la base de datos
npx prisma db push

# Cargar datos iniciales (catálogo y usuarios de prueba)
npm run db:seed
```

### 1.3 Verificar Base de Datos

```bash
# Abrir Prisma Studio para ver los datos
npx prisma studio
```

## 📦 Paso 2: Configurar GitHub

### 2.1 Crear Repositorio

1. Ve a [GitHub](https://github.com/new)
2. Crea un nuevo repositorio llamado `mesas-virtual`
3. **NO** inicialices con README (ya tenemos uno)

### 2.2 Subir Código

```bash
# Inicializar git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit: SaaS Mesas Virtuales"

# Agregar remote
git remote add origin https://github.com/TU-USUARIO/mesas-virtual.git

# Subir código
git push -u origin main
```

### 2.3 Configurar Secrets en GitHub

Ve a tu repositorio → Settings → Secrets and variables → Actions

Agrega los siguientes secrets:

- `DATABASE_URL`: Tu connection string de Neon
- `NEXTAUTH_SECRET`: Genera uno con `openssl rand -base64 32`
- `NEXTAUTH_URL`: `https://tu-proyecto.vercel.app` (lo actualizarás después)
- `NEXT_PUBLIC_APP_URL`: `https://tu-proyecto.vercel.app` (lo actualizarás después)

## 🚀 Paso 3: Desplegar en Vercel

### 3.1 Conectar Repositorio

1. Ve a [Vercel](https://vercel.com)
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es Next.js

### 3.2 Configurar Variables de Entorno

En la configuración del proyecto en Vercel, agrega:

```
DATABASE_URL=postgresql://neondb_owner:npg_RKOUY5HGvJ3Q@ep-fancy-rice-a4xai2vp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_SECRET=tu-secret-generado-con-openssl
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

**Importante**: 
- Genera `NEXTAUTH_SECRET` con: `openssl rand -base64 32`
- Reemplaza `tu-proyecto.vercel.app` con tu dominio real de Vercel

### 3.3 Configurar Build Settings

Vercel debería detectar automáticamente:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install` (automático)

### 3.4 Desplegar

1. Click en "Deploy"
2. Espera a que termine el build
3. Una vez desplegado, actualiza `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL` con tu dominio real
4. Haz un nuevo deploy para aplicar los cambios

## 🗄️ Paso 4: Configurar Base de Datos en Producción

### 4.1 Ejecutar Migraciones

Después del primer deploy, ejecuta las migraciones:

```bash
# Opción 1: Desde tu máquina local (conectado a la DB de producción)
DATABASE_URL="tu-connection-string-de-neon" npx prisma db push

# Opción 2: Usar Vercel CLI
vercel env pull .env.local
npx prisma db push
```

### 4.2 Cargar Datos Iniciales

```bash
# Ejecutar seed en producción
DATABASE_URL="tu-connection-string-de-neon" npm run db:seed
```

## 🌐 Paso 5: Configurar Dominio Personalizado (Opcional)

### 5.1 En Vercel

1. Ve a tu proyecto → Settings → Domains
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar DNS

### 5.2 Para Multitenancy con Subdominios

1. Agrega un dominio wildcard: `*.tu-dominio.com`
2. En tu proveedor DNS, agrega:
   - Tipo: CNAME
   - Nombre: `*`
   - Valor: `cname.vercel-dns.com`

## ✅ Paso 6: Verificar Despliegue

1. Visita tu dominio de Vercel
2. Deberías ver la página de login
3. Usa las credenciales del seed:
   - **Dueño**: `admin@buensabor.com` / `admin123`
   - **Gerente**: `gerente@buensabor.com` / `gerente123`
   - **Mesero**: `mesero@buensabor.com` / `mesero123`
   - **PIN Gerente**: `1234`

## 🔄 Comandos Útiles

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Generar cliente Prisma
npm run db:generate

# Aplicar cambios a DB
npm run db:push

# Ver base de datos
npm run db:studio

# Cargar datos iniciales
npm run db:seed
```

### Producción

```bash
# Build local
npm run build

# Ejecutar producción local
npm start

# Ver logs en Vercel
vercel logs

# Conectar a base de datos de producción
psql 'postgresql://neondb_owner:npg_RKOUY5HGvJ3Q@ep-fancy-rice-a4xai2vp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

## 🔒 Seguridad

### Variables de Entorno

- ✅ **NUNCA** commitees el archivo `.env` o `.env.local`
- ✅ Usa Vercel Environment Variables para producción
- ✅ Usa GitHub Secrets para CI/CD

### Base de Datos

- ✅ Neon usa SSL por defecto (`sslmode=require`)
- ✅ Usa connection pooling para mejor performance
- ✅ Haz backups regulares desde el panel de Neon

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que Neon permita conexiones desde Vercel (debería estar habilitado por defecto)
- Verifica que el connection string incluya `sslmode=require`

### Error: "NEXTAUTH_SECRET is missing"
- Genera un nuevo secret: `openssl rand -base64 32`
- Agrégalo a las variables de entorno en Vercel
- Haz un nuevo deploy

### Error: "Prisma Client not generated"
- Ejecuta `npx prisma generate` localmente
- Verifica que `DATABASE_URL` esté configurada
- En Vercel, el build debería ejecutar `prisma generate` automáticamente

### Tickets PNG no se generan
- Verifica que `canvas` esté instalado (debería estar en `package.json`)
- En producción, considera usar Vercel Blob Storage para guardar los PNGs
- Verifica los logs de Vercel para ver errores específicos

## 📝 Notas Importantes

1. **Primer Deploy**: Después del primer deploy, ejecuta `npm run db:seed` para cargar datos iniciales
2. **Variables de Entorno**: Actualiza `NEXTAUTH_URL` después del primer deploy con tu dominio real
3. **Base de Datos**: Neon es serverless y se escala automáticamente
4. **Multitenancy**: Para usar subdominios, configura un dominio wildcard en Vercel

## 🎉 ¡Listo!

Tu SaaS de Mesas Virtuales debería estar funcionando en:
- 🌐 Frontend: `https://tu-proyecto.vercel.app`
- 🗄️ Base de Datos: Neon PostgreSQL (Serverless)
- 🔄 CI/CD: GitHub Actions + Vercel

Para soporte adicional, consulta:
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Neon](https://neon.tech/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
