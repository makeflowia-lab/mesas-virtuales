# Guía de Solución de Problemas - Autenticación

## Problema: "Credenciales incorrectas" al intentar iniciar sesión

Si tienes problemas para iniciar sesión, sigue estos pasos:

### 1. Verificar el usuario en la base de datos

Usa el script de diagnóstico para verificar el estado del usuario:

```bash
npx tsx scripts/check-user.ts tu-email@ejemplo.com
```

Este script te mostrará:
- Si el usuario existe
- Si está activo
- Si la contraseña está hasheada correctamente
- Pruebas con contraseñas comunes

### 2. Verificar usando el endpoint de diagnóstico

Puedes hacer una petición POST al endpoint de diagnóstico:

```bash
curl -X POST http://localhost:3000/api/admin/diagnose-user \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@ejemplo.com"}'
```

O desde el navegador usando la consola del desarrollador:

```javascript
fetch('/api/admin/diagnose-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'tu-email@ejemplo.com' })
})
.then(r => r.json())
.then(console.log)
```

### 3. Resetear la contraseña

Si necesitas resetear la contraseña de un usuario, usa el endpoint de reset:

```bash
curl -X POST http://localhost:3000/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu-email@ejemplo.com",
    "newPassword": "nuevaPassword123",
    "adminKey": "reset-key-change-in-production"
  }'
```

**IMPORTANTE**: En producción, cambia el `adminKey` en las variables de entorno:
- Agrega `ADMIN_RESET_KEY=tu-clave-secreta-muy-segura` a tus variables de entorno

### 4. Problemas comunes y soluciones

#### Usuario inactivo
Si el usuario está inactivo (`active: false`), actívalo:

```sql
UPDATE users SET active = true WHERE email = 'tu-email@ejemplo.com';
```

#### Contraseña no hasheada
Si la contraseña no está hasheada correctamente, resetea la contraseña usando el endpoint de reset.

#### Usuario no existe
Si el usuario no existe, créalo usando el endpoint de registro o el seed:

```bash
npm run db:seed
```

Esto creará usuarios de ejemplo:
- Dueño: `admin@buensabor.com` / `admin123`
- Gerente: `gerente@buensabor.com` / `gerente123`
- Mesero: `mesero@buensabor.com` / `mesero123`

### 5. Verificar en producción (Vercel)

Para verificar en producción, reemplaza `localhost:3000` con tu URL de Vercel:

```bash
curl -X POST https://tu-app.vercel.app/api/admin/diagnose-user \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@ejemplo.com"}'
```

## Notas de Seguridad

⚠️ **IMPORTANTE**: Los endpoints de administración (`/api/admin/*`) están diseñados para desarrollo y depuración. En producción:

1. Agrega autenticación adecuada
2. Cambia el `ADMIN_RESET_KEY` a una clave segura
3. Considera deshabilitar estos endpoints en producción o protegerlos con autenticación de administrador

