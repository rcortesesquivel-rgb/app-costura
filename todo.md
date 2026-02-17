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
- [ ] Implementar validación de login para usuarios desactivados


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
