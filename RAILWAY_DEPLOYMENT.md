# Despliegue del Backend en Railway

Este documento describe cómo desplegar el backend de Taller de Costura en Railway.

## Archivos de Configuración

- **Dockerfile**: Define cómo construir la imagen Docker del backend
- **railway.json**: Configuración específica de Railway para el despliegue
- **.dockerignore**: Archivos a excluir de la imagen Docker

## Pasos para Desplegar

### 1. Conectar Repositorio a Railway

1. Ve a https://railway.app/dashboard
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub"
4. Autoriza Railway para acceder a tu repositorio
5. Selecciona el repositorio `taller-costura-app`
6. Selecciona la rama `main` (o la que uses)

### 2. Configurar Variables de Entorno

Una vez que Railway detecte el Dockerfile, necesitarás configurar estas variables de entorno en el dashboard de Railway:

#### Variables Requeridas:

```
DATABASE_URL=mysql://usuario:contraseña@host:puerto/base_datos
JWT_SECRET=tu_secreto_jwt_seguro
VITE_APP_ID=tu_app_id
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=tu_owner_id
NODE_ENV=production
PORT=3000
```

#### Variables Opcionales (para integraciones):

```
BUILT_IN_FORGE_API_URL=url_del_forge_api
BUILT_IN_FORGE_API_KEY=tu_api_key
```

### 3. Agregar Base de Datos MySQL

Railway puede proporcionar MySQL automáticamente:

1. En el dashboard del proyecto, haz clic en "Add"
2. Selecciona "MySQL"
3. Railway generará automáticamente la variable `DATABASE_URL`

**Nota:** Si usas MySQL externo, proporciona manualmente `DATABASE_URL`.

### 4. Desplegar

Una vez configuradas las variables de entorno:

1. Railway detectará automáticamente el `Dockerfile`
2. Construirá la imagen Docker
3. Desplegará el backend
4. Asignará un dominio público automáticamente

### 5. Obtener la URL del Backend

Después del despliegue exitoso:

1. Ve a tu proyecto en Railway
2. Selecciona el servicio del backend
3. Copia la URL pública (ej: `https://backend-production.up.railway.app`)

## Configuración del Frontend

Una vez que tengas la URL del backend desplegada en Railway, actualiza el frontend para usar esta URL:

1. En el archivo `lib/trpc.ts`, actualiza la URL base del API
2. Redeploy el frontend en Vercel

Ejemplo:
```typescript
const apiUrl = process.env.VITE_API_URL || 'https://tu-backend.up.railway.app/api/trpc';
```

## Monitoreo

En el dashboard de Railway puedes:

- Ver logs en tiempo real
- Monitorear uso de recursos
- Configurar alertas
- Ver historial de despliegues

## Solución de Problemas

### El despliegue falla

1. Revisa los logs en Railway
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que la base de datos esté accesible

### Error de conexión a base de datos

1. Verifica que `DATABASE_URL` sea correcto
2. Asegúrate de que la base de datos esté ejecutándose
3. Verifica los permisos de la base de datos

### El servidor no responde

1. Verifica que el puerto 3000 esté configurado correctamente
2. Revisa los logs para errores de aplicación
3. Asegúrate de que todas las dependencias estén instaladas

## Rollback

Si necesitas volver a una versión anterior:

1. En Railway, ve al historial de despliegues
2. Selecciona la versión anterior
3. Haz clic en "Redeploy"

## Costos

Railway ofrece:
- Crédito gratuito inicial ($5/mes)
- Plan Hobby ($5/mes)
- Escalado automático según uso

Monitorea tu uso en el dashboard para evitar sorpresas.
