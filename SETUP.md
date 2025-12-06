# 🚀 Guía Rápida de Configuración

## Configuración Inicial (5 minutos)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://neondb_owner:npg_RKOUY5HGvJ3Q@ep-fancy-rice-a4xai2vp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-aqui-genera-con-openssl-rand-base64-32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Configurar base de datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Aplicar esquema a Neon
npx prisma db push

# Cargar datos iniciales (catálogo y usuarios)
npm run db:seed
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 5. Iniciar sesión

Usa las credenciales del seed:
- **Dueño**: `admin@buensabor.com` / `admin123`
- **Gerente**: `gerente@buensabor.com` / `gerente123`
- **Mesero**: `mesero@buensabor.com` / `mesero123`
- **PIN Gerente**: `1234`

## 🚀 Desplegar a Producción

### Opción 1: Despliegue Automático (Recomendado)

1. **Sube a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU-USUARIO/mesas-virtual.git
   git push -u origin main
   ```

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio
   - Agrega las variables de entorno (mismas que `.env.local`)
   - Deploy automático ✅

### Opción 2: Despliegue Manual

Consulta [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas.

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run start            # Servidor de producción

# Base de datos
npm run db:generate      # Generar cliente Prisma
npm run db:push          # Aplicar cambios a DB
npm run db:studio        # Interfaz visual de DB
npm run db:seed          # Cargar datos iniciales

# Conectar directamente a Neon
psql 'postgresql://neondb_owner:npg_RKOUY5HGvJ3Q@ep-fancy-rice-a4xai2vp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

## ✅ Checklist de Configuración

- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env.local` creado con todas las variables
- [ ] Cliente de Prisma generado (`npx prisma generate`)
- [ ] Esquema aplicado a Neon (`npx prisma db push`)
- [ ] Datos iniciales cargados (`npm run db:seed`)
- [ ] Aplicación corriendo en desarrollo (`npm run dev`)
- [ ] Login funcionando con credenciales de prueba

## 🐛 Problemas Comunes

### Error: "Cannot connect to database"
- Verifica que `DATABASE_URL` esté correcta en `.env.local`
- Asegúrate de que Neon esté activo

### Error: "NEXTAUTH_SECRET is missing"
- Genera un secret: `openssl rand -base64 32`
- Agrégalo a `.env.local`

### Error: "Prisma Client not generated"
- Ejecuta: `npx prisma generate`

## 📚 Documentación Adicional

- [README.md](./README.md) - Documentación completa
- [DEPLOY.md](./DEPLOY.md) - Guía de despliegue detallada

---

¡Listo para empezar! 🎉




