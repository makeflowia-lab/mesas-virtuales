# 🍺 Mesas Virtuales - SaaS para Botaneros

Sistema SaaS multitenant para gestión de mesas virtuales en botaneros mexicanos.

## 🚀 Características

- ✅ Sistema multitenant con marca blanca
- ✅ Gestión completa de mesas y consumos
- ✅ Catálogo de productos personalizable
- ✅ Generación de tickets en PNG
- ✅ Reportes exportables a Excel
- ✅ Sistema de roles (Dueño, Gerente, Mesero)
- ✅ Eliminación de consumos con PIN de gerente
- ✅ Interfaz mobile-friendly con tema botanero
- ✅ Compartir tickets por WhatsApp

## 🛠️ Stack Tecnológico

- **Frontend/Backend**: Next.js 14+ (App Router), React, TypeScript
- **Base de Datos**: Neon PostgreSQL (Serverless)
- **Autenticación**: NextAuth.js
- **ORM**: Prisma
- **Estilos**: Tailwind CSS
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions

## 📦 Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU-USUARIO/mesas-virtual.git
cd mesas-virtual
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
DATABASE_URL="postgresql://neondb_owner:npg_RKOUY5HGvJ3Q@ep-fancy-rice-a4xai2vp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-con-openssl-rand-base64-32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Configurar base de datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Aplicar esquema a la base de datos
npx prisma db push

# Cargar datos iniciales (catálogo y usuarios de prueba)
npm run db:seed
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔐 Credenciales por Defecto

Después de ejecutar el seed:

- **Dueño**: `admin@buensabor.com` / `admin123`
- **Gerente**: `gerente@buensabor.com` / `gerente123`
- **Mesero**: `mesero@buensabor.com` / `mesero123`
- **PIN de Gerente**: `1234`

## 🗄️ Base de Datos

### Comandos Prisma

```bash
# Generar cliente
npm run db:generate

# Aplicar cambios
npm run db:push

# Crear migración
npm run db:migrate

# Abrir Prisma Studio (interfaz visual)
npm run db:studio

# Cargar datos iniciales
npm run db:seed
```

### Conectar directamente a Neon

```bash
psql 'postgresql://neondb_owner:npg_RKOUY5HGvJ3Q@ep-fancy-rice-a4xai2vp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

## 📱 Uso

### Crear un Tenant (Negocio)

1. Crear un tenant en la base de datos manualmente o mediante script
2. Crear usuario dueño asociado al tenant
3. El catálogo inicial se carga automáticamente al ejecutar el seed

### Roles

- **DUEÑO**: Acceso completo, puede eliminar productos y configurar todo
- **GERENTE**: Puede eliminar consumos con PIN, gestionar mesas y productos
- **MESERO**: Solo puede agregar productos y gestionar mesas

### Flujo de Trabajo

1. Crear mesa con responsable
2. Agregar productos consumidos
3. Actualizar cantidades según necesidad
4. Cerrar mesa y generar ticket PNG
5. Compartir ticket por WhatsApp

## 🚀 Despliegue

Consulta [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas de despliegue en Vercel.

### Resumen rápido:

1. **GitHub**: Sube el código a un repositorio
2. **Vercel**: Conecta el repositorio y configura variables de entorno
3. **Neon**: Ya está configurada la base de datos
4. **Deploy**: Vercel desplegará automáticamente

## 🔒 Seguridad

- Autenticación con NextAuth.js
- Aislamiento de datos por tenant
- PIN de gerente para eliminaciones
- Validación de permisos por rol
- Variables de entorno para secretos

## 📊 Reportes

Los reportes se exportan en formato Excel e incluyen:
- Fechas y horas de mesas
- Responsables y meseros
- Totales por mesa
- Productos más vendidos
- Consumo por categoría
- Historial de correcciones

## 🎨 Personalización

Cada tenant puede personalizar:
- Logo del negocio
- Colores primario y secundario
- Mensaje de WhatsApp
- Notas en tickets
- Catálogo completo de productos

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar linter

# Base de datos
npm run db:generate  # Generar cliente de Prisma
npm run db:push      # Aplicar cambios a la DB
npm run db:migrate   # Crear migración
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Cargar datos iniciales
```

## 🐛 Troubleshooting

### Error de conexión a la base de datos
- Verifica que `DATABASE_URL` esté correctamente configurada en `.env.local`
- Asegúrate de que Neon permita conexiones desde tu IP

### Error de autenticación
- Verifica que `NEXTAUTH_SECRET` esté configurado
- Asegúrate de que `NEXTAUTH_URL` coincida con tu dominio

### Tickets PNG no se generan
- Verifica que `canvas` esté instalado correctamente
- En producción, considera usar Vercel Blob Storage para guardar imágenes

## 📞 Soporte

Para problemas o preguntas:
- Consulta [DEPLOY.md](./DEPLOY.md) para problemas de despliegue
- Revisa los logs en Vercel: `vercel logs`
- Documentación: [Next.js](https://nextjs.org/docs) | [Prisma](https://www.prisma.io/docs) | [Vercel](https://vercel.com/docs) | [Neon](https://neon.tech/docs)

## 📄 Licencia

Este proyecto es privado y confidencial.

---

Desarrollado con ❤️ para botaneros mexicanos 🇲🇽
