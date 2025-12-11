# Solución de Problemas - Login

Si tienes problemas de "Credenciales incorrectas" en el entorno local o Vercel:

## 1. Verificar Usuario
Ejecuta el script de diagnóstico para ver si el usuario existe y su estado:
```bash
npx tsx scripts/check-user.ts tu-email@ejemplo.com
```

## 2. Resetear Contraseña (Emergencia)
Si no puedes acceder, usa este endpoint temporal para resetear la contraseña:

**Petición:**
`POST /api/admin/reset-password`

**Body (JSON):**
```json
{
  "email": "tu-email@ejemplo.com",
  "newPassword": "nuevaPassword123",
  "adminKey": "reset123"
}
```

**Ejemplo curl:**
```bash
curl -X POST http://localhost:3000/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@buensabor.com","newPassword":"admin123","adminKey":"reset123"}'
```

## 3. Cargar Datos Iniciales (Seed)
Si la base de datos está vacía, carga los datos de prueba:
```bash
npx prisma db seed
```
Usuarios creados:
- admin@buensabor.com / admin123
