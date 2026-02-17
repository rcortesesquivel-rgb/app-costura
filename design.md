# Diseño de Interfaz - Aplicación Taller de Costura

## Orientación y Uso
- **Orientación**: Móvil vertical (9:16)
- **Uso**: Una mano
- **Estilo**: iOS HIG - Aplicación nativa iOS

## Paleta de Colores
- **Primario**: Crema suave (#F5F1E8)
- **Secundario**: Gris oscuro (#2C2C2E)
- **Acento**: Dorado elegante (#D4AF37)
- **Superficie**: Blanco hueso (#FAFAF8)
- **Texto**: Gris carbón (#1C1C1E)
- **Texto secundario**: Gris medio (#8E8E93)
- **Bordes**: Gris claro (#E5E5EA)

## Lista de Pantallas

### 1. Dashboard (Home)
**Contenido principal**:
- Resumen de trabajos que vencen hoy
- Tarjetas de trabajos pendientes con estado visual
- Acceso rápido a crear nuevo trabajo
- Estadísticas rápidas (trabajos activos, pendientes de pago)

**Funcionalidad**:
- Botón flotante para crear nuevo trabajo
- Filtros rápidos por estado
- Navegación a detalles de trabajo

### 2. Lista de Clientes
**Contenido principal**:
- Lista scrolleable de clientes con avatar/inicial
- Nombre, teléfono y último trabajo
- Buscador en la parte superior

**Funcionalidad**:
- Búsqueda por nombre o teléfono
- Tap para ver perfil completo
- Botón para agregar nuevo cliente

### 3. Perfil de Cliente
**Contenido principal**:
- Información personal (nombre, teléfono, dirección, redes sociales)
- Ficha de medidas completa (editable)
- Historial de trabajos del cliente

**Funcionalidad**:
- Editar información y medidas
- Ver trabajos anteriores
- Crear nuevo trabajo para este cliente

### 4. Crear/Editar Trabajo
**Contenido principal**:
- Selector de tipo de trabajo (Arreglos, Confección, Personalización)
- Campos dinámicos según tipo seleccionado
- Lista de agregados con precios
- Cálculo automático de totales
- Selector de estado
- Botón para adjuntar imágenes
- Botón de grabación de voz

**Funcionalidad**:
- Formulario adaptativo según categoría
- Agregar/eliminar items de agregados
- Grabar notas de voz que se transcriben a texto
- Adjuntar fotos de referencia
- Guardar borrador o finalizar

### 5. Detalle de Trabajo
**Contenido principal**:
- Información del cliente
- Tipo y descripción del trabajo
- Desglose de precios (base + agregados)
- Estado actual con timeline visual
- Imágenes adjuntas
- Notas transcritas

**Funcionalidad**:
- Cambiar estado del trabajo
- Editar detalles
- Registrar abonos
- Marcar como entregado

### 6. Búsqueda Global
**Contenido principal**:
- Barra de búsqueda prominente
- Filtros: nombre cliente, tipo trabajo, estado, fecha
- Resultados agrupados por tipo

**Funcionalidad**:
- Búsqueda en tiempo real
- Filtros combinables
- Navegación directa a resultados

### 7. Configuración
**Contenido principal**:
- Preferencias de la app
- Gestión de datos
- Información de la aplicación

## Flujos de Usuario Principales

### Flujo 1: Crear Nuevo Trabajo
1. Usuario toca botón flotante en Dashboard
2. Selecciona cliente existente o crea nuevo
3. Elige tipo de trabajo (Arreglos/Confección/Personalización)
4. Completa campos específicos del tipo
5. Agrega items a lista de agregados
6. Graba nota de voz con detalles (opcional)
7. Adjunta fotos de referencia (opcional)
8. Define precio base y abono inicial
9. Guarda trabajo → Regresa a Dashboard

### Flujo 2: Seguimiento de Trabajo
1. Usuario ve trabajo en Dashboard
2. Toca para ver detalle completo
3. Cambia estado con botones de acción rápida
4. Registra abono si es necesario
5. Marca como entregado cuando finaliza

### Flujo 3: Gestión de Cliente
1. Usuario accede a Lista de Clientes
2. Busca o selecciona cliente
3. Ve perfil con medidas e historial
4. Edita medidas si es necesario
5. Crea nuevo trabajo desde perfil

### Flujo 4: Búsqueda Inteligente
1. Usuario accede a pestaña de búsqueda
2. Ingresa término o aplica filtros
3. Ve resultados agrupados
4. Selecciona resultado → Navega a detalle

## Componentes Clave

### Tarjeta de Trabajo
- Nombre del cliente
- Tipo de trabajo con ícono
- Estado con badge colorido
- Fecha de entrega
- Saldo pendiente (si aplica)

### Selector de Estado
- Botones horizontales con íconos
- Estados: En espera, Cortando, Cosiendo, Listo, Entregado
- Colores diferenciados por estado

### Lista de Agregados
- Items con descripción y precio
- Botón + para agregar nuevo
- Swipe para eliminar
- Total calculado automáticamente

### Grabador de Voz
- Botón de micrófono prominente
- Indicador visual de grabación
- Transcripción automática a texto
- Editable después de transcribir

## Consideraciones de Diseño

- **Navegación**: Tab bar inferior con 4 pestañas principales (Dashboard, Clientes, Búsqueda, Configuración)
- **Tipografía**: SF Pro (sistema iOS) - Regular para cuerpo, Semibold para títulos
- **Espaciado**: Generoso (16-24px) para facilitar toque con una mano
- **Feedback**: Haptics en acciones importantes, animaciones sutiles
- **Accesibilidad**: Tamaños de fuente escalables, contraste adecuado
