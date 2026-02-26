# Problema Crítico: APK no funciona - Aplicación es PWA

## Resumen del Problema

La aplicación **Taller de Costura** es una **Progressive Web App (PWA)**, no una aplicación nativa Android/iOS. El botón "Construir APK" en el panel de Manus genera un wrapper que **no funciona correctamente** porque:

1. El APK intenta abrir la PWA desde un dominio que no reconoce
2. Falla la autenticación de usuarios
3. No es la forma correcta de distribuir una PWA

## Contexto Técnico

- **Stack**: React Native + Expo (PWA mode)
- **Autenticación**: OAuth + JWT con validación de whitelist
- **Base de datos**: PostgreSQL con webhooks de Hotmart
- **Distribución**: URL web (no APK/Play Store)

## Problema Específico

Cuando se descarga el APK generado y se intenta iniciar sesión con credenciales válidas (ej: usuario admin), la app **rechaza el login** porque:

- El APK no tiene acceso a las cookies de sesión correctas
- El dominio del APK no coincide con el dominio de la API
- CORS y validación de origen fallan

## Solución Requerida

**Necesitamos el dominio de producción `.manus.space` definitivo** para:

1. Configurar correctamente la PWA
2. Que los usuarios accedan por URL web (no APK)
3. Que la autenticación funcione correctamente
4. Que Hotmart pueda validar usuarios

## Instrucciones para el Usuario

Mientras se resuelve:

1. **No usar el APK** - No funciona para PWA
2. **Usar el link provisional** que ya está blindado: `https://8081-iebb9vkzwauqmhtgvvf4k-5195f0be.us1.manus.computer`
3. **Esperar el dominio `.manus.space`** definitivo de soporte
4. Una vez disponible, compartir ese link con usuarios
5. Los usuarios pueden instalar la PWA desde el navegador (sin Play Store)

## Impacto

- ❌ APK no funciona (rechaza login)
- ⚠️ Link provisional funciona pero es temporal
- ⏳ Necesitamos dominio definitivo para producción

## Acción Solicitada a Soporte

1. Proporcionar el **dominio `.manus.space` definitivo** para esta aplicación
2. Confirmar que el Publish esté habilitado correctamente
3. Verificar que la PWA se despliega en ese dominio

**Prioridad**: CRÍTICA - Bloquea el lanzamiento de la aplicación

---

**Fecha de reporte**: 25 de Febrero de 2026  
**Proyecto**: Taller de Costura (PWA)  
**Usuario**: ryrnissi@gmail.com
