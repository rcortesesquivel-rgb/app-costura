# Independencia de Manus: Análisis Completo

## Resumen Ejecutivo

Con Railway + Vercel, **serías 95% independiente de Manus**. Solo quedarían 2-3 integraciones opcionales que podrías reemplazar fácilmente.

---

## Desglose: Qué Depende de Manus vs. Qué No

### ✅ COMPLETAMENTE INDEPENDIENTE (No depende de Manus)

| Componente | Ubicación | Proveedor | Costo |
|-----------|-----------|-----------|-------|
| **Frontend PWA** | Vercel | Vercel | Gratis (hasta 100GB) |
| **Backend API** | Railway | Railway | $5/mes (Hobby) |
| **Base de Datos** | Railway MySQL | Railway | Incluido en plan |
| **Autenticación JWT** | Backend propio | Tu código | Gratis |
| **Almacenamiento de archivos** | S3 compatible | Railway o AWS | Según uso |
| **Dominio personalizado** | Tu dominio | Tu registrador | $10-15/año |

### ⚠️ PARCIALMENTE DEPENDIENTE (Fácil de reemplazar)

| Componente | Uso Actual | Alternativa | Esfuerzo |
|-----------|-----------|------------|----------|
| **OAuth Manus** | Login social | Auth0, Firebase, Supabase | Bajo (1-2 horas) |
| **LLM/IA** | Notas de voz, generación | OpenAI, Anthropic, Groq | Bajo (agregar API key) |
| **Notificaciones Push** | Alertas | Firebase Cloud Messaging | Bajo (1 hora) |
| **Webhooks Hotmart** | Pagos | Webhook propio en Railway | Bajo (ya está en código) |

### ❌ COMPLETAMENTE DEPENDIENTE (Difícil de reemplazar)

Actualmente: **NADA**

---

## Paso a Paso: Migración Completa a Railway

### Fase 1: Preparación (30 minutos)

```bash
# 1. Crear base de datos MySQL en Railway
# (Desde dashboard: Add → MySQL)

# 2. Obtener DATABASE_URL
# Railway genera automáticamente: mysql://user:pass@host:port/db

# 3. Configurar variables en Railway dashboard:
DATABASE_URL=mysql://...
JWT_SECRET=tu_secreto_super_seguro_aqui
NODE_ENV=production
PORT=3000
```

### Fase 2: Ejecutar Migraciones (10 minutos)

**Opción A: Desde Railway CLI (si funciona el token)**
```bash
export RAILWAY_TOKEN=tu_token
railway run pnpm db:push
```

**Opción B: Desde tu máquina local (RECOMENDADO)**
```bash
# 1. Obtén DATABASE_URL de Railway dashboard
export DATABASE_URL="mysql://user:pass@host:port/db"

# 2. Ejecuta las migraciones
pnpm db:push

# 3. Verifica que las tablas se crearon
mysql -h host -u user -p -D db -e "SHOW TABLES;"
```

**Opción C: Desde Railway Web Terminal**
```bash
# Railway tiene terminal web en el dashboard
# Ejecuta: pnpm db:push
```

### Fase 3: Desplegar Backend (5 minutos)

1. Railway detecta `Dockerfile` automáticamente
2. Construye la imagen
3. Despliega y asigna URL pública

### Fase 4: Actualizar Frontend (15 minutos)

En `lib/trpc.ts`:
```typescript
// Cambiar de:
const apiUrl = 'http://localhost:3000/api/trpc';

// A:
const apiUrl = process.env.VITE_API_URL || 'https://tu-backend.up.railway.app/api/trpc';
```

Redeploy en Vercel (automático si usas GitHub).

---

## Dependencias de Manus Actuales (en tu código)

### 1. **OAuth (server/_core/oauth.ts)**
```typescript
// Manus OAuth
const oAuthServerUrl = process.env.OAUTH_SERVER_URL || 'https://api.manus.im';
```

**¿Es crítico?** NO
**Alternativa:** Auth0, Firebase, Supabase
**Tiempo de cambio:** 1-2 horas

### 2. **LLM/IA (server/_core/llm.ts)**
```typescript
// Manus LLM para transcripción de voz
import { invokeLLM } from "./server/_core/llm";
```

**¿Es crítico?** NO (es opcional)
**Alternativa:** OpenAI API, Groq, Anthropic
**Tiempo de cambio:** 30 minutos

### 3. **Notificaciones (server/_core/notification.ts)**
```typescript
// Notificaciones push de Manus
```

**¿Es crítico?** NO (es opcional)
**Alternativa:** Firebase Cloud Messaging, OneSignal
**Tiempo de cambio:** 1 hora

### 4. **SDK Manus (server/_core/sdk.ts)**
```typescript
// SDK general de Manus
import { sdk } from "./server/_core/sdk";
```

**¿Es crítico?** PARCIALMENTE (usado en OAuth)
**Alternativa:** Reemplazar con Auth0 o similar
**Tiempo de cambio:** 2 horas

---

## Arquitectura Final (100% Independiente)

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO (Browser/PWA)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  Vercel (PWA)    │      │  Railway Backend │
│ taller-de-costura│      │ (Node.js + tRPC) │
│ -app.vercel.app  │      │ backend.railway  │
└────────┬─────────┘      └────────┬─────────┘
         │                         │
         │                         ▼
         │                 ┌──────────────────┐
         │                 │  Railway MySQL   │
         │                 │   (Base Datos)   │
         │                 └──────────────────┘
         │
         └─────────────────────────────────────────────────────
                    (Sin dependencia de Manus)
```

---

## Checklist: Qué Hacer Antes de Desconectarte de Manus

- [ ] **Crear base de datos MySQL en Railway**
- [ ] **Ejecutar `pnpm db:push` para migrar esquema**
- [ ] **Desplegar backend en Railway**
- [ ] **Obtener URL pública del backend Railway**
- [ ] **Actualizar `VITE_API_URL` en frontend**
- [ ] **Redeploy frontend en Vercel**
- [ ] **Probar login, crear cliente, crear trabajo**
- [ ] **Verificar que todo funciona sin Manus**

### Opcional (para mejor experiencia):

- [ ] **Reemplazar OAuth Manus con Auth0 o Firebase**
- [ ] **Configurar OpenAI API para transcripción de voz**
- [ ] **Agregar Firebase Cloud Messaging para notificaciones**

---

## Costos Mensuales Estimados

| Servicio | Plan | Costo |
|----------|------|-------|
| **Vercel** | Hobby (gratis) | $0 |
| **Railway** | Hobby | $5 |
| **MySQL Railway** | Incluido | $0 |
| **Dominio** | .app | ~$1.25/mes |
| **OpenAI (opcional)** | Pay-as-you-go | $0-20 |
| **Auth0 (opcional)** | Free tier | $0 |
| **TOTAL** | | **$6-25/mes** |

---

## Migración Paso a Paso (Guía Rápida)

### 1. Crear MySQL en Railway (2 min)
```
Railway Dashboard → New Project → Add → MySQL
```

### 2. Copiar DATABASE_URL (1 min)
```
Railway Dashboard → MySQL → Variables → DATABASE_URL
```

### 3. Ejecutar migraciones (5 min)
```bash
export DATABASE_URL="mysql://..."
pnpm db:push
```

### 4. Desplegar backend (5 min)
```
Railway Dashboard → Connect GitHub → Select repo → Deploy
```

### 5. Actualizar frontend (5 min)
```
Edit lib/trpc.ts → Update API URL → Commit → Vercel auto-redeploy
```

### 6. Probar (10 min)
```
https://taller-de-costura-app.vercel.app → Login → Crear cliente → Verificar
```

---

## Conclusión

**Con Railway, serías 95% independiente de Manus en 30 minutos.**

Las únicas dependencias restantes (OAuth, LLM, Notificaciones) son:
- Opcionales (no críticas para funcionalidad básica)
- Fáciles de reemplazar (1-2 horas cada una)
- Tienen alternativas gratuitas

**Recomendación:** Procede con Railway ahora. Luego, si lo necesitas, reemplaza OAuth y LLM en una segunda fase.
