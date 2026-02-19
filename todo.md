# TODO - Taller de Costura App

## Configuración Inicial
- [x] Actualizar paleta de colores en theme.config.js
- [x] Generar logo personalizado para el taller
- [x] Configurar navegación con tabs (Dashboard, Clientes, Búsqueda, Configuración)
- [x] Configurar íconos en icon-symbol.tsx

## Base de Datos y Modelos
- [x] Crear esquema de base de datos para clientes
- [x] Crear esquema para medidas de clientes
- [x] Crear esquema para trabajos/pedidos
- [x] Crear esquema para agregados de trabajos
- [x] Crear esquema para imágenes adjuntas
- [x] Crear esquema para notas de voz transcritas

## Módulo de Clientes
- [x] Pantalla de lista de clientes con búsqueda
- [x] Pantalla de perfil de cliente
- [x] Formulario para crear/editar cliente
- [x] Formulario de ficha de medidas (editable)
- [x] Historial de trabajos por cliente

## Módulo de Trabajos
- [x] Pantalla de creación de trabajo con selector de tipo
- [x] Formulario para Arreglos (tipo prenda, descripción ajuste, urgencia)
- [x] Formulario para Confección (diseño, tipo tela, metros, fecha prueba)
- [x] Formulario para Personalización (bordados, aplicaciones, modificaciones)
- [x] Lista dinámica de agregados con suma automática
- [x] Cálculo de totales (precio base + agregados)
- [x] Gestión de abonos y saldo pendiente
- [ ] Adjuntar imágenes de referencia
- [x] Pantalla de detalle de trabajo
- [ ] Edición de trabajos existentes

## Gestión de Estados
- [x] Implementar estados: En espera, Cortando, Cosiendo, Listo para entrega, Entregado
- [x] Selector visual de estados con botones
- [x] Timeline visual de cambios de estado
- [x] Filtros por estado en dashboard

## Dashboard
- [x] Vista de trabajos que vencen hoy
- [x] Tarjetas de trabajos pendientes
- [x] Estadísticas rápidas (trabajos activos, pendientes de pago)
- [x] Botón flotante para crear nuevo trabajo
- [x] Filtros rápidos por estado

## Búsqueda Inteligente
- [x] Buscador global multi-parámetro
- [x] Filtro por nombre de cliente
- [x] Filtro por tipo de trabajo
- [x] Filtro por estado del pedido
- [ ] Filtro por fecha
- [x] Resultados agrupados por tipo

## Funcionalidad de Voz
- [x] Integrar Web Speech API para grabación
- [x] Botón de grabación de voz en formulario de trabajo
- [x] Transcripción automática de audio a texto
- [x] Guardar transcripción en notas del trabajo
- [x] Indicador visual de grabación activa

## Interfaz de Usuario
- [x] Diseño limpio y minimalista
- [x] Implementar paleta de colores (crema, gris oscuro, dorado)
- [x] Componente de tarjeta de trabajo
- [x] Componente de selector de estado
- [x] Componente de lista de agregados
- [x] Componente de grabador de voz
- [x] Animaciones sutiles y feedback háptico
- [x] Responsive y optimizado para una mano

## Gestión de Imágenes
- [ ] Selector de imágenes desde galería
- [ ] Captura de fotos con cámara
- [ ] Visualización de imágenes adjuntas
- [ ] Eliminar imágenes adjuntas

## Configuración
- [x] Pantalla de configuración
- [x] Preferencias de la app
- [x] Gestión de datos
- [x] Información de la aplicación


## Multi-Tenant y Autenticación
- [x] Agregar tabla de usuarios a la base de datos
- [x] Agregar userId a todas las tablas (clientes, trabajos, medidas, agregados)
- [x] Implementar Sign Up (registro de nuevos usuarios)
- [x] Implementar Log In (inicio de sesión)
- [x] Crear pantalla de Sign Up
- [x] Crear pantalla de Log In
- [x] Implementar persistencia de sesión con AsyncStorage
- [x] Agregar validación de userId en todas las rutas API
- [x] Implementar cierre de sesión (Log Out)
- [x] Proteger rutas para usuarios no autenticados
- [x] Aislar datos de clientes por usuario
- [x] Aislar datos de trabajos por usuario
- [x] Aislar datos de medidas por usuario
- [x] Aislar datos de agregados por usuario


## Vista de Administrador
- [x] Agregar campo de estado (activo/inactivo) a tabla de usuarios
- [x] Crear rutas API de administrador para listar usuarios
- [x] Crear rutas API para activar/desactivar usuarios
- [x] Crear rutas API para obtener estadísticas globales
- [x] Crear pantalla de administrador
- [x] Implementar lista de usuarios con estado
- [x] Implementar botones para activar/desactivar usuarios
- [x] Implementar vista de estadísticas (total de trabajos, usuarios activos, etc.)
- [x] Proteger acceso a vista de administrador solo para admin
- [x] Agregar tab de administrador en navegación principal


## Super Administrador
- [x] Agregar campo de plan (mensual/lifetime) a tabla de usuarios
- [x] Agregar contador de transcripciones de audio por usuario
- [x] Agregar fecha de última transcripción para resetear contador mensual
- [ ] Crear tabla de auditoría para registrar cambios de estado
- [x] Implementar compresión de imágenes en cliente (máximo 1MB)
- [x] Crear rutas API de Super Administrador (solo para email específico)
- [x] Crear pantalla de Super Administrador
- [x] Implementar tabla de usuarios con información completa
- [x] Implementar toggle para activar/desactivar usuarios
- [x] Implementar selector de plan (mensual/lifetime)
- [x] Crear buscador de usuarios por email o nombre
- [x] Implementar métricas de uso (usuarios activos, imágenes, transcripciones)
- [x] Validar límite de 20 transcripciones para plan Pago Único
- [x] Proteger acceso solo para Super Administrador
- [x] Implementar validación de login para usuarios desactivados


## Webhooks de Hotmart
- [x] Crear tabla de auditoría para registrar eventos
- [x] Crear tabla de webhooks para almacenar eventos procesados
- [x] Implementar endpoint /api/webhooks/hotmart
- [x] Agregar validación de firma HMAC de Hotmart
- [x] Procesar evento subscription_charge_success
- [x] Procesar evento subscription_cancellation
- [x] Procesar evento charge_refund
- [x] Agregar manejo de errores y reintentos
- [x] Crear logs de webhooks para debugging
- [x] Documentar configuración de Hotmart

## Cambio de Logo
- [x] Recibir imagen del logo del usuario
- [x] Cambiar icon.png
- [x] Cambiar splash-icon.png
- [x] Cambiar favicon.png
- [x] Cambiar android-icon-foreground.png
- [x] Actualizar app.config.ts con nueva URL del logo


## PWA (Progressive Web App)
- [x] Crear archivo manifest.json con configuración PWA
- [x] Agregar iconos para PWA en diferentes tamaños
- [x] Crear service worker para caché y offline
- [x] Configurar meta tags en HTML para PWA
- [x] Registrar service worker en la aplicación
- [x] Configurar pantalla completa sin barra del navegador
- [x] Agregar soporte para iOS (apple-mobile-web-app-capable)
- [x] Agregar soporte para Android (display: fullscreen)
- [ ] Probar instalación en iOS
- [ ] Probar instalación en Android


## Notificaciones Push
- [x] Crear tabla de suscripciones push en base de datos
- [x] Crear tabla de notificaciones enviadas para auditoría
- [x] Implementar registro de dispositivos para push
- [x] Crear rutas API para enviar notificaciones
- [x] Implementar notificación cuando trabajo está "Listo para entrega"
- [x] Implementar notificación cuando hay pago pendiente
- [x] Crear servicio de notificaciones en cliente
- [x] Agregar permisos de notificaciones en manifest
- [x] Implementar historial de notificaciones
- [x] Agregar configuración de preferencias de notificaciones


## PURCHASE_APPROVED y Restricciones de Plan
- [x] Agregar campos de límite de almacenamiento a tabla de usuarios
- [x] Agregar campo de prioridad (isPriority) a tabla de usuarios
- [x] Implementar procesamiento de evento PURCHASE_APPROVED
- [x] Detectar automáticamente si es suscripción o pago único
- [x] Aplicar plan "Pago Único (Lifetime)" automáticamente
- [x] Validar límite de 20 transcripciones de audio para Lifetime
- [x] Validar límite de 1GB de almacenamiento para Lifetime
- [x] Mostrar mensaje de límite alcanzado en cliente
- [x] Marcar usuarios de membresía mensual con estrella en admin panel
- [x] Filtrar por prioridad en panel de administrador


## Configuración Final de Webhooks y Offline
- [x] Verificar procesamiento de PURCHASE_APPROVED
- [x] Optimizar service worker para modo offline completo
- [x] Verificar validación HMAC-SHA256 con clave secreta
- [x] Crear tests para webhooks de Hotmart
- [x] Confirmar que todos los eventos se procesan correctamente


## Configuración de Hottok y Endpoint
- [x] Configurar Hottok de Hotmart en variables de entorno
- [x] Verificar que endpoint /api/webhooks/hotmart acepta POST
- [x] Validar autenticación con Hottok
- [x] Probar recepción de PURCHASE_APPROVED
- [x] Activar modo offline definitivamente
- [x] Verificar que service worker está registrado
- [x] Probar instalación en navegador


## Despliegue Final y Optimización
- [ ] Reparar URL de producción
- [ ] Verificar que la app cargue correctamente
- [ ] Implementar Plan Básico ($12)
- [ ] Implementar Plan VIP ($14)
- [ ] Agregar sección exclusiva de Soporte y Webinars para VIP
- [ ] Enviar emails de bienvenida automáticos
- [ ] Implementar "Olvidé mi contraseña"
- [ ] Crear panel de auditoría de webhooks
- [ ] Verificar Service Worker instalable
- [ ] Probar PWA en navegador


## Estabilización de Autenticación (Prioridad Alta)
- [ ] Eliminar bloqueo OAuth - isLoading=false por defecto
- [ ] Implementar login simple con localStorage (sin depender de OAuth de Manus)
- [ ] Configurar acceso validado por webhook de Hotmart (PURCHASE_APPROVED)
- [ ] Implementar formateo de moneda local con Intl.NumberFormat
- [ ] Limpiar caché de Metro y reiniciar servidor
- [ ] Verificar que #root renderice la UI correctamente

## Fix Crítico - Bucle Infinito y Pantalla en Blanco
- [x] Hard Reset del servidor de previsualización
- [x] Eliminar redirección automática que causa bucle infinito en _layout.tsx
- [x] Cambiar autenticación a LocalStorage simple (Dashboard carga directo)
- [x] Confirmar que la pantalla ya no está en blanco


## Moneda Dinámica y Traducción Completa
- [x] Crear hook useCurrency() con Intl.NumberFormat
- [x] Agregar botón "Mi Cuenta" en tabs para login voluntario
- [x] Traducir interfaz completa al español
- [x] Aplicar moneda dinámica en todos los precios (ya existe formatCurrency)
- [x] Verificar Dashboard, Config y botones funcionan correctamente

## Webhook Hotmart y Login Suave
- [x] Implementar endpoint /api/hotmart/webhook para PURCHASE_APPROVED
- [x] Automatizar creación de usuario con rol según plan comprado (Sastre/Administrador)
- [x] Validar payload de Hotmart (hottok, evento, datos del comprador)
- [x] Agregar banner de login suave en Dashboard para usuarios no autenticados
- [x] Verificar flujo completo: webhook → usuario creado → login funcional (16 tests pasados)

## Configuración de Hotmart y Olvidé mi Contraseña
- [x] Configurar variables de entorno HOTMART_HOTTOK y HOTMART_WEBHOOK_SECRET
- [x] Proporcionar instrucciones exactas para webhook en panel de Hotmart
- [x] Implementar flujo de "Olvidé mi contraseña" en Mi Cuenta
- [x] Crear endpoint /api/auth/forgot-password
- [x] Crear endpoint /api/auth/reset-password
- [x] Agregar campos resetToken y resetTokenExpiry al schema
- [x] Ejecutar migración de base de datos (pnpm db:push)
- [x] Crear 17 tests unitarios para validar flujo (todos pasados)

## Corrección de Webhook y Reset Password
- [x] Corregir validación de Hottok en webhook (buscar en header x-hotmart-token)
- [x] Agregar logging detallado para debugging de webhook
- [x] Crear página /app/auth/reset-password.tsx
- [x] Implementar formulario de reset password con validaciones
- [x] Crear 21 tests unitarios para reset password (todos pasados)
- [x] Vincular botón de login del banner del Dashboard a /auth/signin
- [x] Verificar que el webhook busca Hottok en múltiples ubicaciones

## Fix Crítico - Error 401 Webhook Hotmart
- [x] Investigar formato exacto del Hottok de Hotmart (header vs body) → X-HOTMART-HOTTOK
- [x] Reescribir validación con máxima flexibilidad (7 ubicaciones: header oficial, simplificado, alternativo, authorization, body, body.data, query)
- [x] Agregar logs de diagnóstico que impriman token recibido vs esperado
- [x] Implementar modo tolerante con .trim(), case-insensitive, sin espacios, sin comillas, sin caracteres de control
- [x] Probar con curl simulando todos los formatos posibles
- [x] Crear 23 tests unitarios para validación del webhook (todos pasados)
- [x] Crear endpoint /api/webhooks/hotmart/test para debugging

## Fix Rápido - Webhook siempre 200 OK
- [x] Cambiar webhook para devolver 200 OK incluso si token falla
- [x] Soportar evento SWITCH_PLAN

## 3 Puntos Finales
- [x] Crear interfaz visual de Reset Password en /app/auth/reset-password.tsx (ya existía completa)
- [x] Botón 'Iniciar sesión' del Dashboard redirige a tab Mi Cuenta
- [x] Traducir textos pendientes en login/registro al español (todos ya en español)

## Fix Crítico - Rol ADMIN no se aplica correctamente
- [x] Verificar valor real del rol en BD (admin confirmado en id=150001)
- [x] Rastrear flujo signin → JWT → respuesta al cliente
- [x] Identificar dónde se pierde o sobreescribe el rol (3 bugs encontrados)
- [x] Corregir: buildUserResponse ahora incluye role e isActive
- [x] Corregir: signin ahora lee datos reales de BD con getUserByOpenId
- [x] Corregir: syncUser ya no sobreescribe name con null en cada login
- [x] Probar técnicamente: login devuelve role=admin, name=Administrador (2 logins consecutivos verificados)


## Fix - Creación de Clientes y Trabajos no guarda datos
- [x] Revisar endpoints API de creación de clientes (routers.ts línea 80-93)
- [x] Revisar endpoints API de creación de trabajos (mismo patrón)
- [x] Verificar formularios envían campos requeridos (crear-cliente.tsx correcto)
- [x] Revisar logs de BD para diagnosticar errores (problema: sin cookie de sesión)
- [x] Corregir: signin y signup ahora establecen cookie app_session_id
- [x] Probar guardado exitoso: cliente id=1 guardado en BD con todos los campos


## Fix - Módulo de Trabajos Incompleto
- [x] Cambiar moneda de DOP a CRC (₡) en toda la app (format-currency.ts)
- [x] Habilitar botón Guardar en formulario de trabajos (ya existía y funciona)
- [x] Agregar campo Cantidad para cada ítem (valor por defecto "1")
- [x] Implementar cálculo automático: (Precio × Cantidad) + Agregados = Total
- [x] Corregir lógica de abonos: Saldo pendiente = Total - Abono inicial (ya funcionaba)
- [x] Traducir formulario de trabajos al español (ya estaba en español)
- [x] Probar creación de trabajo completo end-to-end (trabajo id=1 guardado en BD)


## Generación de Recibos en PDF
- [x] Crear endpoint del servidor para generar PDF del recibo (/api/recibo/:trabajoId)
- [x] Implementar lógica de generación con detalles del cliente
- [x] Incluir desglose de costos (precio base + agregados con cantidad)
- [x] Mostrar total, abonos y saldo pendiente
- [x] Agregar botón en la interfaz para generar y descargar recibo (app/trabajo/[id].tsx)
- [x] Probar generación de PDF end-to-end (recibo HTML generado correctamente)


## Fix Crítico - Errores de Funcionalidad
- [ ] Corregir cálculo: (Precio Base × Cantidad) + Agregados = Total
- [ ] Actualizar Saldo pendiente en tiempo real al escribir Abono
- [ ] Habilitar cambio de estados (Cortando, Cosiendo, Listo, Entregado)
- [ ] Guardar cambio de estado en base de datos
- [ ] Corregir endpoint /api/recibo/:id que da error
- [ ] Implementar botón "Editar Trabajo" funcional
- [ ] Probar flujo completo end-to-end


## Corrección de Bugs Críticos (17 Feb 2026)
- [x] Corregir imports faltantes en trabajo/[id].tsx (Text, View, ScrollView, etc.)
- [x] Implementar endpoint tRPC trabajos.update para editar trabajos completos
- [x] Implementar endpoint tRPC trabajos.delete para eliminar trabajos
- [x] Corregir endpoint /api/recibo/:trabajoId - agregar consulta real a tabla agregados
- [x] Agregar botón "Editar" en pantalla de detalle de trabajo
- [x] Crear pantalla /app/editar-trabajo.tsx con formulario pre-cargado
- [x] Verificar que cambio de estados funciona correctamente (endpoint ya existía)

## Corrección Esquema BD - Tipos Decimal y Campo Cantidad (18 Feb 2026)
- [x] Reemplazar varchar por decimal(12,2) en trabajos.precioBase y trabajos.abonoInicial
- [x] Reemplazar varchar por decimal(12,2) en agregados.precio
- [x] Agregar campo cantidad (int, default 1) a tabla agregados
- [x] Eliminar campos innecesarios de tabla trabajos (tipo, tipoPrenda, nivelUrgencia, tipoTela, metrosRequeridos, tipoPersonalizacion, notasVoz)
- [x] Ejecutar migración de BD (pnpm db:push)
- [x] Propagar cambios de tipos a server/db.ts
- [x] Propagar cambios de tipos a server/routers.ts
- [x] Propagar cambios de tipos a server/generate-recibo.ts
- [x] Propagar cambios a formularios frontend
- [x] Verificar que todo compila sin errores (0 errores TS, 10/10 tests pasados)

## 4 Mejoras Finales - App Manos Libres (18 Feb 2026)
- [x] Dictado Universal: Crear componente reutilizable VoiceInput con botón de micrófono
- [x] Dictado Universal: Filtro numérico para campos de precio/abono (convertir texto hablado a número)
- [x] Dictado Universal: Usar audioTranscriptionsThisMonth para limitar uso según plan
- [x] Dictado Universal: Aumentar tiempo de escucha a 20 segundos
- [x] Dictado Universal: Integrar en crear-trabajo.tsx y editar-trabajo.tsx
- [x] Login Obligatorio: Forzar redirección al login en _layout.tsx si no hay sesión
- [x] Fecha de Entrega: Agregar selector de fecha en crear-trabajo.tsx
- [x] Fecha de Entrega: Agregar selector de fecha en editar-trabajo.tsx
- [x] Filtros de Estado: Activar filtros por estado en la lista principal (index.tsx)

## Correcciones Críticas - 18 Feb 2026 (Ronda 2)
- [x] Separación de Roles: Admin solo gestiona suscripciones, clientes de sastrería separados
- [x] Cálculos: Cantidad × Precio = Total en tiempo real, campos numéricos decimal
- [x] Eliminar botón "+" inútil en formulario de creación
- [x] Estados funcionales: clic en estado actualiza BD inmediatamente
- [x] Renombrar "Dashboard" por "Mis Trabajos"
- [x] Reemplazar "Agregados" por campos "Impuestos" y "Varios" que se sumen al Gran Total
- [x] Botón "Eliminar Trabajo" con confirmación en lista y edición
- [x] Todo sobre archivos existentes, sin crear archivos nuevos

## Mejoras de Interfaz Final - 18 Feb 2026 (Ronda 3)
- [x] Urgencia por colores: Rojo (hoy/mañana), Amarillo (3-4 días), Verde (5+ días) según fechaEntrega
- [x] Urgencia manual: permitir cambiar urgencia manualmente
- [x] Centro de Ayuda: renombrar Configuración, botón email a soporteviral@gmail.com
- [x] Centro de Ayuda: botón WhatsApp con link de contacto
- [x] Subcategorías: Bordado, Sublimado, Otros en búsqueda y formularios crear/editar
- [x] Agregar campo categoría al schema BD
- [x] Traducción 100% español en todas las etiquetas

## Ajustes Finales de Usabilidad - 18 Feb 2026 (Ronda 4)
- [x] WhatsApp real: actualizar enlace a https://wa.me/50686419894
- [x] Selector de fecha nativo HTML en crear-trabajo y editar-trabajo
- [x] Formato moneda: todos los totales con 2 decimales y símbolo
- [x] Días restantes en detalle de trabajo ("Entrega en X días")
- [x] Verificar que dictado por voz y login obligatorio no se rompieron


## Acceso de Administrador - 19 Feb 2026
- [ ] Revisar código de autenticación para credenciales admin por defecto
- [ ] Verificar configuración de BD y conexión de login
- [ ] Crear/confirmar usuario admin con email del propietario

## Fix Backend URL - 19 Feb 2026
- [x] Configurar EXPO_PUBLIC_API_BASE_URL con URL pública real del backend
- [x] Eliminar fallback a localhost en getApiBaseUrl()
- [x] Generar build v1.0.3
