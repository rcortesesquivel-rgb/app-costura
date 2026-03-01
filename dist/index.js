"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc4) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc4 = __getOwnPropDesc(from, key)) || desc4.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  agregados: () => agregados,
  audios: () => audios,
  auditLog: () => auditLog,
  clientes: () => clientes,
  cotizaciones: () => cotizaciones,
  emailsAutorizados: () => emailsAutorizados,
  historialEstados: () => historialEstados,
  hotmartWebhooks: () => hotmartWebhooks,
  imagenes: () => imagenes,
  medidas: () => medidas,
  notificationPreferences: () => notificationPreferences,
  notifications: () => notifications,
  passwordResets: () => passwordResets,
  pushSubscriptions: () => pushSubscriptions,
  sugerencias: () => sugerencias,
  trabajos: () => trabajos,
  users: () => users
});
var import_mysql_core, users, clientes, medidas, trabajos, agregados, imagenes, historialEstados, auditLog, hotmartWebhooks, pushSubscriptions, notifications, emailsAutorizados, audios, notificationPreferences, sugerencias, cotizaciones, passwordResets;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    import_mysql_core = require("drizzle-orm/mysql-core");
    users = (0, import_mysql_core.mysqlTable)("users", {
      /**
       * Surrogate primary key. Auto-incremented numeric value managed by the database.
       * Use this for relations between tables.
       */
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
      openId: (0, import_mysql_core.varchar)("openId", { length: 64 }).notNull().unique(),
      name: (0, import_mysql_core.text)("name"),
      email: (0, import_mysql_core.varchar)("email", { length: 320 }),
      loginMethod: (0, import_mysql_core.varchar)("loginMethod", { length: 64 }),
      role: (0, import_mysql_core.mysqlEnum)("role", ["user", "admin"]).default("user").notNull(),
      isActive: (0, import_mysql_core.mysqlEnum)("isActive", ["active", "inactive"]).default("active").notNull(),
      plan: (0, import_mysql_core.mysqlEnum)("plan", ["basic", "vip", "lifetime"]).default("basic").notNull(),
      audioTranscriptionsThisMonth: (0, import_mysql_core.int)("audioTranscriptionsThisMonth").default(0).notNull(),
      lastAudioResetDate: (0, import_mysql_core.timestamp)("lastAudioResetDate").defaultNow().notNull(),
      storageUsedMB: (0, import_mysql_core.int)("storageUsedMB").default(0).notNull(),
      storageQuotaMB: (0, import_mysql_core.int)("storageQuotaMB").default(1024).notNull(),
      isPriority: (0, import_mysql_core.int)("isPriority").default(0).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: (0, import_mysql_core.timestamp)("lastSignedIn").defaultNow().notNull(),
      sinpeTelefono: (0, import_mysql_core.varchar)("sinpeTelefono", { length: 20 }),
      resetToken: (0, import_mysql_core.varchar)("resetToken", { length: 255 }),
      resetTokenExpiry: (0, import_mysql_core.timestamp)("resetTokenExpiry")
    });
    clientes = (0, import_mysql_core.mysqlTable)("clientes", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      // Foreign key to users table
      nombreCompleto: (0, import_mysql_core.varchar)("nombreCompleto", { length: 255 }).notNull(),
      telefono: (0, import_mysql_core.varchar)("telefono", { length: 20 }),
      codigoPais: (0, import_mysql_core.varchar)("codigoPais", { length: 5 }).default("+506"),
      whatsapp: (0, import_mysql_core.varchar)("whatsapp", { length: 20 }),
      direccion: (0, import_mysql_core.text)("direccion"),
      redesSociales: (0, import_mysql_core.text)("redesSociales"),
      // JSON string: {instagram: "", facebook: ""}
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    medidas = (0, import_mysql_core.mysqlTable)("medidas", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      // Foreign key to users table
      clienteId: (0, import_mysql_core.int)("clienteId").notNull(),
      cuello: (0, import_mysql_core.varchar)("cuello", { length: 10 }),
      hombros: (0, import_mysql_core.varchar)("hombros", { length: 10 }),
      pecho: (0, import_mysql_core.varchar)("pecho", { length: 10 }),
      cintura: (0, import_mysql_core.varchar)("cintura", { length: 10 }),
      cadera: (0, import_mysql_core.varchar)("cadera", { length: 10 }),
      largoManga: (0, import_mysql_core.varchar)("largoManga", { length: 10 }),
      largoEspalda: (0, import_mysql_core.varchar)("largoEspalda", { length: 10 }),
      largoPantalon: (0, import_mysql_core.varchar)("largoPantalon", { length: 10 }),
      entrepierna: (0, import_mysql_core.varchar)("entrepierna", { length: 10 }),
      contornoBrazo: (0, import_mysql_core.varchar)("contornoBrazo", { length: 10 }),
      anchoPecho: (0, import_mysql_core.varchar)("anchoPecho", { length: 10 }),
      anchoEspalda: (0, import_mysql_core.varchar)("anchoEspalda", { length: 10 }),
      talleDelantero: (0, import_mysql_core.varchar)("talleDelantero", { length: 10 }),
      alturaButso: (0, import_mysql_core.varchar)("alturaButso", { length: 10 }),
      alturaCardera: (0, import_mysql_core.varchar)("alturaCardera", { length: 10 }),
      siza: (0, import_mysql_core.varchar)("siza", { length: 10 }),
      anchoHombro: (0, import_mysql_core.varchar)("anchoHombro", { length: 10 }),
      notas: (0, import_mysql_core.text)("notas"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    trabajos = (0, import_mysql_core.mysqlTable)("trabajos", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      clienteId: (0, import_mysql_core.int)("clienteId").notNull(),
      descripcion: (0, import_mysql_core.text)("descripcion"),
      precioUnitario: (0, import_mysql_core.decimal)("precioUnitario", { precision: 12, scale: 2 }).default("0.00"),
      abonoInicial: (0, import_mysql_core.decimal)("abonoInicial", { precision: 12, scale: 2 }).default("0.00"),
      impuestos: (0, import_mysql_core.decimal)("impuestos", { precision: 12, scale: 2 }).default("0.00"),
      varios: (0, import_mysql_core.decimal)("varios", { precision: 12, scale: 2 }).default("0.00"),
      categoria: (0, import_mysql_core.mysqlEnum)("categoria", ["arreglo", "confeccion", "bordado", "sublimado", "otros"]).default("otros").notNull(),
      urgencia: (0, import_mysql_core.mysqlEnum)("urgencia", ["baja", "media", "alta"]),
      cantidad: (0, import_mysql_core.int)("cantidad").default(1).notNull(),
      estado: (0, import_mysql_core.mysqlEnum)("estado", ["recibido", "cortando", "cosiendo", "bordado_personalizado", "listo", "entregado"]).default("recibido").notNull(),
      fechaEntrega: (0, import_mysql_core.timestamp)("fechaEntrega"),
      pagado: (0, import_mysql_core.int)("pagado").default(0).notNull(),
      // 0 = No, 1 = Sí
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    agregados = (0, import_mysql_core.mysqlTable)("agregados", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      trabajoId: (0, import_mysql_core.int)("trabajoId").notNull(),
      concepto: (0, import_mysql_core.varchar)("concepto", { length: 255 }).notNull(),
      precio: (0, import_mysql_core.decimal)("precio", { precision: 12, scale: 2 }).default("0.00"),
      cantidad: (0, import_mysql_core.int)("cantidad").default(1).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    imagenes = (0, import_mysql_core.mysqlTable)("imagenes", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      // Foreign key to users table
      trabajoId: (0, import_mysql_core.int)("trabajoId").notNull(),
      url: (0, import_mysql_core.text)("url").notNull(),
      tipo: (0, import_mysql_core.varchar)("tipo", { length: 50 }),
      // referencia, boceto, etc.
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    historialEstados = (0, import_mysql_core.mysqlTable)("historialEstados", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      // Foreign key to users table
      trabajoId: (0, import_mysql_core.int)("trabajoId").notNull(),
      estadoAnterior: (0, import_mysql_core.varchar)("estadoAnterior", { length: 50 }),
      estadoNuevo: (0, import_mysql_core.varchar)("estadoNuevo", { length: 50 }).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    auditLog = (0, import_mysql_core.mysqlTable)("auditLog", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      // Usuario afectado
      adminId: (0, import_mysql_core.int)("adminId"),
      // Admin que realizó la acción
      action: (0, import_mysql_core.varchar)("action", { length: 100 }).notNull(),
      // ej: "user_activated", "plan_changed"
      details: (0, import_mysql_core.text)("details"),
      // JSON con detalles del cambio
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    hotmartWebhooks = (0, import_mysql_core.mysqlTable)("hotmartWebhooks", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      eventType: (0, import_mysql_core.varchar)("eventType", { length: 100 }).notNull(),
      // ej: "subscription_charge_success"
      email: (0, import_mysql_core.varchar)("email", { length: 320 }).notNull(),
      payload: (0, import_mysql_core.text)("payload").notNull(),
      // JSON con datos del evento
      processed: (0, import_mysql_core.int)("processed").default(0).notNull(),
      // 0 = false, 1 = true
      processedAt: (0, import_mysql_core.timestamp)("processedAt"),
      error: (0, import_mysql_core.text)("error"),
      // Error si ocurrió
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    pushSubscriptions = (0, import_mysql_core.mysqlTable)("pushSubscriptions", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      endpoint: (0, import_mysql_core.text)("endpoint").notNull(),
      // URL del endpoint push
      auth: (0, import_mysql_core.varchar)("auth", { length: 255 }).notNull(),
      // Clave de autenticación
      p256dh: (0, import_mysql_core.varchar)("p256dh", { length: 255 }).notNull(),
      // Clave pública
      userAgent: (0, import_mysql_core.varchar)("userAgent", { length: 500 }),
      // Información del navegador
      isActive: (0, import_mysql_core.int)("isActive").default(1).notNull(),
      // 1 = activo, 0 = inactivo
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    notifications = (0, import_mysql_core.mysqlTable)("notifications", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      trabajoId: (0, import_mysql_core.int)("trabajoId"),
      // ID del trabajo relacionado
      type: (0, import_mysql_core.varchar)("type", { length: 50 }).notNull(),
      // "ready_for_delivery", "pending_payment", etc.
      title: (0, import_mysql_core.varchar)("title", { length: 255 }).notNull(),
      body: (0, import_mysql_core.text)("body").notNull(),
      data: (0, import_mysql_core.text)("data"),
      // JSON con datos adicionales
      sent: (0, import_mysql_core.int)("sent").default(0).notNull(),
      // 1 = enviada, 0 = pendiente
      sentAt: (0, import_mysql_core.timestamp)("sentAt"),
      read: (0, import_mysql_core.int)("read").default(0).notNull(),
      // 1 = leída, 0 = no leída
      readAt: (0, import_mysql_core.timestamp)("readAt"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    emailsAutorizados = (0, import_mysql_core.mysqlTable)("emailsAutorizados", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      email: (0, import_mysql_core.varchar)("email", { length: 320 }).notNull().unique(),
      nombre: (0, import_mysql_core.varchar)("nombre", { length: 255 }),
      plan: (0, import_mysql_core.mysqlEnum)("plan", ["basic", "vip", "lifetime"]).default("basic").notNull(),
      status: (0, import_mysql_core.mysqlEnum)("status", ["prueba", "pagado"]).default("pagado").notNull(),
      expiresAt: (0, import_mysql_core.timestamp)("expiresAt"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    audios = (0, import_mysql_core.mysqlTable)("audios", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      trabajoId: (0, import_mysql_core.int)("trabajoId").notNull(),
      url: (0, import_mysql_core.text)("url").notNull(),
      // URL del audio en S3
      duracion: (0, import_mysql_core.int)("duracion").default(0).notNull(),
      // Duracion en segundos
      descripcion: (0, import_mysql_core.text)("descripcion"),
      // Descripcion del audio
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    notificationPreferences = (0, import_mysql_core.mysqlTable)("notificationPreferences", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull().unique(),
      readyForDelivery: (0, import_mysql_core.int)("readyForDelivery").default(1).notNull(),
      // Habilitar notificaciones de trabajos listos
      pendingPayment: (0, import_mysql_core.int)("pendingPayment").default(1).notNull(),
      // Habilitar notificaciones de pagos pendientes
      newClient: (0, import_mysql_core.int)("newClient").default(1).notNull(),
      // Habilitar notificaciones de nuevos clientes
      systemUpdates: (0, import_mysql_core.int)("systemUpdates").default(1).notNull(),
      // Habilitar notificaciones del sistema
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    sugerencias = (0, import_mysql_core.mysqlTable)("sugerencias", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId"),
      nombreUsuario: (0, import_mysql_core.varchar)("nombreUsuario", { length: 255 }),
      emailUsuario: (0, import_mysql_core.varchar)("emailUsuario", { length: 320 }),
      asunto: (0, import_mysql_core.varchar)("asunto", { length: 500 }).notNull(),
      mensaje: (0, import_mysql_core.text)("mensaje").notNull(),
      leida: (0, import_mysql_core.boolean)("leida").default(false).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    cotizaciones = (0, import_mysql_core.mysqlTable)("cotizaciones", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      clienteId: (0, import_mysql_core.int)("clienteId").notNull(),
      descripcion: (0, import_mysql_core.text)("descripcion"),
      precioUnitario: (0, import_mysql_core.decimal)("precioUnitario", { precision: 12, scale: 2 }).default("0.00"),
      cantidad: (0, import_mysql_core.int)("cantidad").default(1).notNull(),
      impuestos: (0, import_mysql_core.decimal)("impuestos", { precision: 12, scale: 2 }).default("0.00"),
      varios: (0, import_mysql_core.decimal)("varios", { precision: 12, scale: 2 }).default("0.00"),
      categoria: (0, import_mysql_core.mysqlEnum)("cotizacion_categoria", ["arreglo", "confeccion", "bordado", "sublimado", "otros"]).default("otros").notNull(),
      urgencia: (0, import_mysql_core.mysqlEnum)("cotizacion_urgencia", ["baja", "media", "alta"]),
      fechaEntrega: (0, import_mysql_core.timestamp)("fechaEntrega"),
      condicionesPago: (0, import_mysql_core.text)("condicionesPago"),
      estado: (0, import_mysql_core.mysqlEnum)("cotizacion_estado", ["pendiente", "aceptada", "rechazada", "vencida"]).default("pendiente").notNull(),
      convertidaEnTrabajoId: (0, import_mysql_core.int)("convertidaEnTrabajoId"),
      // ID del trabajo si se convirtió
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    passwordResets = (0, import_mysql_core.mysqlTable)("passwordResets", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      email: (0, import_mysql_core.varchar)("email", { length: 320 }).notNull(),
      token: (0, import_mysql_core.varchar)("token", { length: 255 }).notNull().unique(),
      expiresAt: (0, import_mysql_core.timestamp)("expiresAt").notNull(),
      usedAt: (0, import_mysql_core.timestamp)("usedAt"),
      // NULL si no ha sido usado
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  and: () => import_drizzle_orm.and,
  bulkCreateClientes: () => bulkCreateClientes,
  calcularTotalTrabajo: () => calcularTotalTrabajo,
  convertirCotizacionEnTrabajo: () => convertirCotizacionEnTrabajo,
  cotizaciones: () => cotizaciones,
  createAgregado: () => createAgregado,
  createAudio: () => createAudio,
  createCliente: () => createCliente,
  createCotizacion: () => createCotizacion,
  createHistorialEstado: () => createHistorialEstado,
  createImagen: () => createImagen,
  createMedidas: () => createMedidas,
  createTrabajo: () => createTrabajo,
  deleteAgregado: () => deleteAgregado,
  deleteAudio: () => deleteAudio,
  deleteCliente: () => deleteCliente,
  deleteCotizacion: () => deleteCotizacion,
  deleteImagen: () => deleteImagen,
  deleteTrabajo: () => deleteTrabajo,
  desc: () => import_drizzle_orm.desc,
  emailsAutorizados: () => emailsAutorizados,
  eq: () => import_drizzle_orm.eq,
  getAgregadosByTrabajoId: () => getAgregadosByTrabajoId,
  getAllClientes: () => getAllClientes,
  getAllCotizaciones: () => getAllCotizaciones,
  getAllTrabajos: () => getAllTrabajos,
  getAudiosByTrabajoId: () => getAudiosByTrabajoId,
  getClienteById: () => getClienteById,
  getCotizacionById: () => getCotizacionById,
  getDb: () => getDb,
  getHistorialByTrabajoId: () => getHistorialByTrabajoId,
  getImagenesByTrabajoId: () => getImagenesByTrabajoId,
  getMedidasByClienteId: () => getMedidasByClienteId,
  getMisEstadisticas: () => getMisEstadisticas,
  getTrabajoById: () => getTrabajoById,
  getTrabajosByClienteId: () => getTrabajosByClienteId,
  getTrabajosByEstado: () => getTrabajosByEstado,
  getTrabajosVencenHoy: () => getTrabajosVencenHoy,
  getUserByOpenId: () => getUserByOpenId,
  like: () => import_drizzle_orm.like,
  or: () => import_drizzle_orm.or,
  searchClientes: () => searchClientes,
  searchTrabajos: () => searchTrabajos,
  sugerencias: () => sugerencias,
  updateCliente: () => updateCliente,
  updateCotizacion: () => updateCotizacion,
  updateMedidas: () => updateMedidas,
  updateTrabajo: () => updateTrabajo,
  upsertUser: () => upsertUser
});
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = (0, import_mysql2.drizzle)(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    } else if (user.email && user.email === (process.env.SUPER_ADMIN_EMAIL || "rcortesesquivel@gmail.com")) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllClientes(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientes).where((0, import_drizzle_orm.eq)(clientes.userId, userId)).orderBy((0, import_drizzle_orm.desc)(clientes.createdAt));
}
async function getClienteById(id, userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientes).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(clientes.id, id), (0, import_drizzle_orm.eq)(clientes.userId, userId))
  );
  return result[0] || null;
}
async function createCliente(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clientes).values(data);
  return Number(result[0].insertId);
}
async function updateCliente(id, userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clientes).set(data).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(clientes.id, id), (0, import_drizzle_orm.eq)(clientes.userId, userId))
  );
}
async function deleteCliente(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(clientes).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(clientes.id, id), (0, import_drizzle_orm.eq)(clientes.userId, userId))
  );
}
async function searchClientes(query, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientes).where(
    (0, import_drizzle_orm.and)(
      (0, import_drizzle_orm.eq)(clientes.userId, userId),
      (0, import_drizzle_orm.or)(
        (0, import_drizzle_orm.like)(clientes.nombreCompleto, `%${query}%`),
        (0, import_drizzle_orm.like)(clientes.telefono, `%${query}%`)
      )
    )
  );
}
async function bulkCreateClientes(contactos, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existentes = await db.select().from(clientes).where((0, import_drizzle_orm.eq)(clientes.userId, userId));
  const existentesPorNombre = new Set(existentes.map((c) => c.nombreCompleto.toLowerCase().trim()));
  const existentesPorTelefono = new Set(
    existentes.filter((c) => c.telefono).map((c) => c.telefono.replace(/\D/g, ""))
  );
  let created = 0;
  let skipped = 0;
  const duplicados = [];
  for (const contacto of contactos) {
    const nombreLower = contacto.nombreCompleto.toLowerCase().trim();
    const telefonoClean = contacto.telefono?.replace(/\D/g, "") || "";
    const esDuplicadoNombre = existentesPorNombre.has(nombreLower);
    const esDuplicadoTelefono = telefonoClean && existentesPorTelefono.has(telefonoClean);
    if (esDuplicadoNombre || esDuplicadoTelefono) {
      skipped++;
      duplicados.push(contacto.nombreCompleto);
      continue;
    }
    await db.insert(clientes).values({
      userId,
      nombreCompleto: contacto.nombreCompleto.trim(),
      telefono: contacto.telefono || null,
      codigoPais: contacto.codigoPais || "+506",
      whatsapp: contacto.whatsapp || contacto.telefono || null
    });
    existentesPorNombre.add(nombreLower);
    if (telefonoClean) existentesPorTelefono.add(telefonoClean);
    created++;
  }
  return { created, skipped, duplicados };
}
async function getMedidasByClienteId(clienteId, userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(medidas).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(medidas.clienteId, clienteId), (0, import_drizzle_orm.eq)(medidas.userId, userId))
  );
  return result[0] || null;
}
async function createMedidas(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(medidas).values(data);
  return Number(result[0].insertId);
}
async function updateMedidas(id, userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(medidas).set(data).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(medidas.id, id), (0, import_drizzle_orm.eq)(medidas.userId, userId))
  );
}
async function getAllTrabajos(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trabajos).where((0, import_drizzle_orm.eq)(trabajos.userId, userId)).orderBy((0, import_drizzle_orm.desc)(trabajos.createdAt));
}
async function getTrabajoById(id, userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(trabajos).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(trabajos.id, id), (0, import_drizzle_orm.eq)(trabajos.userId, userId))
  );
  return result[0] || null;
}
async function getTrabajosByClienteId(clienteId, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trabajos).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(trabajos.clienteId, clienteId), (0, import_drizzle_orm.eq)(trabajos.userId, userId))
  ).orderBy((0, import_drizzle_orm.desc)(trabajos.createdAt));
}
async function getTrabajosByEstado(estado, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trabajos).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(trabajos.estado, estado), (0, import_drizzle_orm.eq)(trabajos.userId, userId))
  ).orderBy((0, import_drizzle_orm.desc)(trabajos.createdAt));
}
async function getTrabajosVencenHoy(userId) {
  const db = await getDb();
  if (!db) return [];
  const hoy = /* @__PURE__ */ new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  return db.select().from(trabajos).where(
    (0, import_drizzle_orm.and)(
      (0, import_drizzle_orm.eq)(trabajos.estado, "listo"),
      (0, import_drizzle_orm.eq)(trabajos.userId, userId)
    )
  ).orderBy((0, import_drizzle_orm.desc)(trabajos.fechaEntrega));
}
async function createTrabajo(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(trabajos).values(data);
  return Number(result[0].insertId);
}
async function updateTrabajo(id, userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(trabajos).set(data).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(trabajos.id, id), (0, import_drizzle_orm.eq)(trabajos.userId, userId))
  );
}
async function deleteTrabajo(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(trabajos).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(trabajos.id, id), (0, import_drizzle_orm.eq)(trabajos.userId, userId))
  );
}
async function searchTrabajos(params) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [(0, import_drizzle_orm.eq)(trabajos.userId, params.userId)];
  if (params.estado) {
    conditions.push((0, import_drizzle_orm.eq)(trabajos.estado, params.estado));
  }
  if (params.clienteId) {
    conditions.push((0, import_drizzle_orm.eq)(trabajos.clienteId, params.clienteId));
  }
  if (params.query) {
    conditions.push((0, import_drizzle_orm.like)(trabajos.descripcion, `%${params.query}%`));
  }
  return db.select().from(trabajos).where((0, import_drizzle_orm.and)(...conditions)).orderBy((0, import_drizzle_orm.desc)(trabajos.createdAt));
}
async function getAgregadosByTrabajoId(trabajoId, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agregados).where(
    (0, import_drizzle_orm.eq)(agregados.trabajoId, trabajoId)
  );
}
async function createAgregado(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(agregados).values(data);
  return Number(result[0].insertId);
}
async function deleteAgregado(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(agregados).where(
    (0, import_drizzle_orm.eq)(agregados.id, id)
  );
}
async function calcularTotalTrabajo(trabajoId, userId) {
  const db = await getDb();
  if (!db) return { total: 0, saldo: 0 };
  const trabajo = await getTrabajoById(trabajoId, userId);
  if (!trabajo) return { total: 0, saldo: 0 };
  const listaAgregados = await getAgregadosByTrabajoId(trabajoId, userId);
  const precioUnitario = parseFloat(trabajo.precioUnitario || "0");
  const cantidad = trabajo.cantidad || 1;
  const subtotal = precioUnitario * cantidad;
  const abonoInicial = parseFloat(trabajo.abonoInicial || "0");
  const totalAgregados = listaAgregados.reduce((sum, ag) => {
    const precio = parseFloat(ag.precio || "0");
    const cantidadAg = ag.cantidad || 1;
    return sum + precio * cantidadAg;
  }, 0);
  const total = subtotal + totalAgregados;
  const saldo = total - abonoInicial;
  return { total, saldo, precioUnitario, cantidad, subtotal, totalAgregados, abonoInicial };
}
async function getImagenesByTrabajoId(trabajoId, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(imagenes).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(imagenes.trabajoId, trabajoId), (0, import_drizzle_orm.eq)(imagenes.userId, userId))
  );
}
async function createImagen(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(imagenes).values(data);
  return Number(result[0].insertId);
}
async function deleteImagen(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(imagenes).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(imagenes.id, id), (0, import_drizzle_orm.eq)(imagenes.userId, userId))
  );
}
async function getHistorialByTrabajoId(trabajoId, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(historialEstados).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(historialEstados.trabajoId, trabajoId), (0, import_drizzle_orm.eq)(historialEstados.userId, userId))
  ).orderBy((0, import_drizzle_orm.desc)(historialEstados.createdAt));
}
async function createHistorialEstado(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(historialEstados).values(data);
  return Number(result[0].insertId);
}
async function getMisEstadisticas(userId) {
  const db = await getDb();
  if (!db) return { totalClientes: 0, totalTrabajos: 0, trabajosPorEstado: {}, trabajosPorUrgencia: {}, ingresosTotales: 0, cuentasPorCobrar: 0 };
  const misClientes = await db.select().from(clientes).where((0, import_drizzle_orm.eq)(clientes.userId, userId));
  const misTrabajos = await db.select().from(trabajos).where((0, import_drizzle_orm.eq)(trabajos.userId, userId));
  const trabajosPorEstado = {};
  const trabajosPorUrgencia = {};
  let ingresosTotales = 0;
  let cuentasPorCobrar = 0;
  const now = /* @__PURE__ */ new Date();
  for (const t2 of misTrabajos) {
    const estado = t2.estado || "recibido";
    trabajosPorEstado[estado] = (trabajosPorEstado[estado] || 0) + 1;
    if (estado !== "entregado") {
      let urgencia = "baja";
      if (t2.fechaEntrega) {
        const diffMs = new Date(t2.fechaEntrega).getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1e3 * 60 * 60 * 24));
        if (diffDays <= 1) urgencia = "alta";
        else if (diffDays <= 4) urgencia = "media";
      }
      trabajosPorUrgencia[urgencia] = (trabajosPorUrgencia[urgencia] || 0) + 1;
    }
    const precio = parseFloat(t2.precioUnitario || "0");
    const cant = t2.cantidad || 1;
    const imp = parseFloat(t2.impuestos || "0");
    const var_ = parseFloat(t2.varios || "0");
    const totalTrabajo = precio * cant + imp + var_;
    if (t2.pagado === 1) {
      ingresosTotales += totalTrabajo;
    }
    if (estado === "entregado" && t2.pagado !== 1) {
      cuentasPorCobrar += totalTrabajo;
    }
  }
  return {
    totalClientes: misClientes.length,
    totalTrabajos: misTrabajos.length,
    trabajosPorEstado,
    trabajosPorUrgencia,
    ingresosTotales,
    cuentasPorCobrar
  };
}
async function createAudio(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existingAudios = await db.select().from(audios).where((0, import_drizzle_orm.eq)(audios.trabajoId, data.trabajoId));
  if (existingAudios.length >= 5) {
    throw new Error("Maximo 5 audios por trabajo");
  }
  const result = await db.insert(audios).values(data);
  return result[0].insertId;
}
async function getAudiosByTrabajoId(trabajoId, userId) {
  const db = await getDb();
  if (!db) return [];
  const trabajo = await db.select().from(trabajos).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(trabajos.id, trabajoId), (0, import_drizzle_orm.eq)(trabajos.userId, userId)));
  if (!trabajo.length) throw new Error("Trabajo no encontrado");
  return db.select().from(audios).where((0, import_drizzle_orm.eq)(audios.trabajoId, trabajoId));
}
async function deleteAudio(audioId, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const audio = await db.select().from(audios).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(audios.id, audioId), (0, import_drizzle_orm.eq)(audios.userId, userId)));
  if (!audio.length) throw new Error("Audio no encontrado");
  await db.delete(audios).where((0, import_drizzle_orm.eq)(audios.id, audioId));
}
async function getAllCotizaciones(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cotizaciones).where((0, import_drizzle_orm.eq)(cotizaciones.userId, userId)).orderBy((0, import_drizzle_orm.desc)(cotizaciones.createdAt));
}
async function getCotizacionById(id, userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(cotizaciones).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(cotizaciones.id, id), (0, import_drizzle_orm.eq)(cotizaciones.userId, userId))
  );
  return result[0] || null;
}
async function createCotizacion(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cotizaciones).values(data);
  return Number(result[0].insertId);
}
async function updateCotizacion(id, userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cotizaciones).set(data).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(cotizaciones.id, id), (0, import_drizzle_orm.eq)(cotizaciones.userId, userId))
  );
}
async function deleteCotizacion(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cotizaciones).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(cotizaciones.id, id), (0, import_drizzle_orm.eq)(cotizaciones.userId, userId))
  );
}
async function convertirCotizacionEnTrabajo(cotizacionId, userId, abonoInicial = "0.00") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const cotizacion = await getCotizacionById(cotizacionId, userId);
  if (!cotizacion) throw new Error("Cotizaci\xF3n no encontrada");
  if (cotizacion.convertidaEnTrabajoId) throw new Error("Esta cotizaci\xF3n ya fue convertida en trabajo");
  const trabajoData = {
    userId,
    clienteId: cotizacion.clienteId,
    descripcion: cotizacion.descripcion,
    precioUnitario: cotizacion.precioUnitario,
    cantidad: cotizacion.cantidad,
    impuestos: cotizacion.impuestos,
    varios: cotizacion.varios,
    categoria: cotizacion.categoria,
    urgencia: cotizacion.urgencia,
    fechaEntrega: cotizacion.fechaEntrega,
    abonoInicial,
    estado: "recibido",
    pagado: 0
  };
  const trabajoId = await createTrabajo(trabajoData);
  await db.update(cotizaciones).set({
    estado: "aceptada",
    convertidaEnTrabajoId: trabajoId
  }).where(
    (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(cotizaciones.id, cotizacionId), (0, import_drizzle_orm.eq)(cotizaciones.userId, userId))
  );
  return trabajoId;
}
var import_drizzle_orm, import_mysql2, _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    import_drizzle_orm = require("drizzle-orm");
    import_mysql2 = require("drizzle-orm/mysql2");
    init_schema();
    init_env();
    _db = null;
  }
});

// server/_core/notification.ts
var notification_exports = {};
__export(notification_exports, {
  notifyOwner: () => notifyOwner
});
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new import_server2.TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new import_server2.TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}
var import_server2, TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH, trimValue, isNonEmptyString2, buildEndpointUrl, validatePayload;
var init_notification = __esm({
  "server/_core/notification.ts"() {
    "use strict";
    import_server2 = require("@trpc/server");
    init_env();
    TITLE_MAX_LENGTH = 1200;
    CONTENT_MAX_LENGTH = 2e4;
    trimValue = (value) => value.trim();
    isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
    buildEndpointUrl = (baseUrl) => {
      const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      return new URL("webdevtoken.v1.WebDevService/SendNotification", normalizedBase).toString();
    };
    validatePayload = (input) => {
      if (!isNonEmptyString2(input.title)) {
        throw new import_server2.TRPCError({
          code: "BAD_REQUEST",
          message: "Notification title is required."
        });
      }
      if (!isNonEmptyString2(input.content)) {
        throw new import_server2.TRPCError({
          code: "BAD_REQUEST",
          message: "Notification content is required."
        });
      }
      const title = trimValue(input.title);
      const content = trimValue(input.content);
      if (title.length > TITLE_MAX_LENGTH) {
        throw new import_server2.TRPCError({
          code: "BAD_REQUEST",
          message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
        });
      }
      if (content.length > CONTENT_MAX_LENGTH) {
        throw new import_server2.TRPCError({
          code: "BAD_REQUEST",
          message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
        });
      }
      return { title, content };
    };
  }
});

// server/_core/index.ts
var import_config = require("dotenv/config");
var import_express2 = __toESM(require("express"));
var import_http = require("http");
var import_express3 = require("@trpc/server/adapters/express");

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();
init_schema();
var import_drizzle_orm2 = require("drizzle-orm");

// server/_core/cookies.ts
var LOCAL_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "::1"]);
function isIpAddress(host) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}
function getParentDomain(hostname) {
  if (LOCAL_HOSTS.has(hostname) || isIpAddress(hostname)) {
    return void 0;
  }
  const parts = hostname.split(".");
  if (parts.length < 3) {
    return void 0;
  }
  return "." + parts.slice(-2).join(".");
}
function getSessionCookieOptions(req) {
  const hostname = req.hostname;
  const domain = getParentDomain(hostname);
  return {
    domain,
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
var import_axios = __toESM(require("axios"));
var import_cookie = require("cookie");
var import_jose = require("jose");
init_db();
init_env();
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(EXCHANGE_TOKEN_PATH, payload);
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(GET_USER_INFO_PATH, {
      accessToken: token.accessToken
    });
    return data;
  }
};
var createOAuthHttpClient = () => import_axios.default.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(platforms.filter((p) => typeof p === "string"));
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = (0, import_cookie.parse)(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new import_jose.SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await (0, import_jose.jwtVerify)(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice("Bearer ".length).trim();
    }
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = token || cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
async function syncUser(userInfo) {
  if (!userInfo.openId) {
    throw new Error("openId missing from user info");
  }
  const lastSignedIn = /* @__PURE__ */ new Date();
  const upsertData = {
    openId: userInfo.openId,
    email: userInfo.email ?? null,
    loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
    lastSignedIn
  };
  if (userInfo.name !== void 0) {
    upsertData.name = userInfo.name || null;
  }
  if (userInfo.telefono !== void 0) {
    upsertData.telefono = userInfo.telefono || null;
  }
  await upsertUser(upsertData);
  const saved = await getUserByOpenId(userInfo.openId);
  return saved ?? {
    openId: userInfo.openId,
    name: userInfo.name,
    email: userInfo.email,
    loginMethod: userInfo.loginMethod ?? null,
    lastSignedIn
  };
}
function buildUserResponse(user) {
  return {
    id: user?.id ?? null,
    openId: user?.openId ?? null,
    name: user?.name ?? null,
    email: user?.email ?? null,
    role: user?.role ?? "user",
    isActive: user?.isActive ?? "active",
    loginMethod: user?.loginMethod ?? null,
    lastSignedIn: (user?.lastSignedIn ?? /* @__PURE__ */ new Date()).toISOString()
  };
}
async function verificarAcceso(email) {
  const db = await getDb();
  if (!db) return { permitido: true };
  const resultado = await db.select().from(emailsAutorizados).where((0, import_drizzle_orm2.eq)(emailsAutorizados.email, email.toLowerCase().trim()));
  if (!resultado.length) {
    return {
      permitido: false,
      error: "Acceso restringido. Si solicitaste prueba, espera autorizaci\xF3n.",
      code: "NOT_AUTHORIZED"
    };
  }
  const registro = resultado[0];
  if (!registro.expiresAt) {
    return { permitido: true };
  }
  const ahora = /* @__PURE__ */ new Date();
  const expira = new Date(registro.expiresAt);
  if (registro.status === "prueba" && ahora > expira) {
    return {
      permitido: false,
      error: "Tu periodo de prueba ha vencido. Adquiere tu membres\xEDa para seguir usando las herramientas.",
      code: "TRIAL_EXPIRED",
      checkoutUrl: "https://pay.hotmart.com/T104497671V?checkoutMode=10"
    };
  }
  if (registro.status === "pagado" && ahora > expira) {
    return {
      permitido: false,
      error: "Tu membres\xEDa ha vencido. Renueva tu suscripci\xF3n para seguir usando las herramientas.",
      code: "MEMBERSHIP_EXPIRED",
      checkoutUrl: "https://pay.hotmart.com/T104497671V?checkoutMode=10"
    };
  }
  return { permitido: true };
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      await syncUser(userInfo);
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      const frontendUrl = process.env.EXPO_WEB_PREVIEW_URL || process.env.EXPO_PACKAGER_PROXY_URL || "http://localhost:8081";
      res.redirect(302, frontendUrl);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
  app.get("/api/oauth/mobile", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      const user = await syncUser(userInfo);
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({
        app_session_id: sessionToken,
        user: buildUserResponse(user)
      });
    } catch (error) {
      console.error("[OAuth] Mobile exchange failed", error);
      res.status(500).json({ error: "OAuth mobile exchange failed" });
    }
  });
  app.post("/api/auth/logout", (req, res) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
  app.get("/api/auth/me", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ user: buildUserResponse(user) });
    } catch (error) {
      console.error("[Auth] /api/auth/me failed:", error);
      res.status(401).json({ error: "Not authenticated", user: null });
    }
  });
  app.post("/api/auth/session", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({ error: "Bearer token required" });
        return;
      }
      const token = authHeader.slice("Bearer ".length).trim();
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: buildUserResponse(user) });
    } catch (error) {
      console.error("[Auth] /api/auth/session failed:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;
      if (!email || !password || !name) {
        res.status(400).json({ error: "email, password, and name are required" });
        return;
      }
      const acceso = await verificarAcceso(email);
      if (!acceso.permitido) {
        console.log(`[Auth] Signup bloqueado para ${email}: ${acceso.code}`);
        res.status(403).json({ error: acceso.error, code: acceso.code, checkoutUrl: acceso.checkoutUrl });
        return;
      }
      console.log(`[Auth] Email autorizado para signup: ${email}`);
      const openId = `email:${email}`;
      const userData = {
        openId,
        email,
        name,
        loginMethod: "email"
      };
      if (phone) {
        userData.telefono = phone;
      }
      await syncUser(userData);
      const savedUser = await getUserByOpenId(openId);
      const userResponse = savedUser || { openId, email, name, loginMethod: "email" };
      const sessionToken = await sdk.createSessionToken(openId, { name: name || void 0 });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: buildUserResponse(userResponse) });
    } catch (error) {
      console.error("[Auth] /api/auth/signup failed:", error);
      res.status(500).json({ error: "Sign up failed" });
    }
  });
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "email and password are required" });
        return;
      }
      const acceso = await verificarAcceso(email);
      if (!acceso.permitido) {
        console.log(`[Auth] Signin bloqueado para ${email}: ${acceso.code}`);
        res.status(403).json({ error: acceso.error, code: acceso.code, checkoutUrl: acceso.checkoutUrl });
        return;
      }
      const openId = `email:${email}`;
      await syncUser({
        openId,
        email,
        loginMethod: "email"
      });
      const savedUser = await getUserByOpenId(openId);
      if (!savedUser) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }
      if (savedUser.isActive === "inactive") {
        res.status(403).json({ error: "ACCOUNT_INACTIVE" });
        return;
      }
      console.log(`[Auth] signin success: ${email}, role=${savedUser.role}, id=${savedUser.id}`);
      const sessionToken = await sdk.createSessionToken(savedUser.openId, { name: savedUser.name || void 0 });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: buildUserResponse(savedUser) });
    } catch (error) {
      console.error("[Auth] /api/auth/signin failed:", error);
      res.status(500).json({ error: "Sign in failed" });
    }
  });
}

// server/notifications-routes.ts
var import_zod = require("zod");

// server/_core/trpc.ts
var import_server = require("@trpc/server");
var import_superjson = __toESM(require("superjson"));
var t = import_server.initTRPC.context().create({
  transformer: import_superjson.default
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new import_server.TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new import_server.TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/notifications-db.ts
var import_drizzle_orm3 = require("drizzle-orm");
init_schema();
init_db();
async function savePushSubscription(userId, subscription, userAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(pushSubscriptions).where(
    (0, import_drizzle_orm3.and)(
      (0, import_drizzle_orm3.eq)(pushSubscriptions.userId, userId),
      (0, import_drizzle_orm3.eq)(pushSubscriptions.endpoint, subscription.endpoint)
    )
  );
  if (existing.length > 0) {
    await db.update(pushSubscriptions).set({
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
      userAgent,
      isActive: 1,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm3.eq)(pushSubscriptions.id, existing[0].id));
  } else {
    await db.insert(pushSubscriptions).values({
      userId,
      endpoint: subscription.endpoint,
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
      userAgent,
      isActive: 1
    });
  }
}
async function removePushSubscription(userId, endpoint) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pushSubscriptions).set({ isActive: 0 }).where(
    (0, import_drizzle_orm3.and)(
      (0, import_drizzle_orm3.eq)(pushSubscriptions.userId, userId),
      (0, import_drizzle_orm3.eq)(pushSubscriptions.endpoint, endpoint)
    )
  );
}
async function getNotifications(userId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where((0, import_drizzle_orm3.eq)(notifications.userId, userId)).limit(limit);
}
async function markNotificationAsRead(notificationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({
    read: 1,
    readAt: /* @__PURE__ */ new Date()
  }).where((0, import_drizzle_orm3.eq)(notifications.id, notificationId));
}
async function getNotificationPreferences(userId) {
  const db = await getDb();
  if (!db) return null;
  const prefs = await db.select().from(notificationPreferences).where((0, import_drizzle_orm3.eq)(notificationPreferences.userId, userId));
  return prefs.length > 0 ? prefs[0] : null;
}
async function createNotificationPreferences(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(notificationPreferences).values({
    userId,
    readyForDelivery: 1,
    pendingPayment: 1,
    newClient: 1,
    systemUpdates: 1
  });
}
async function updateNotificationPreferences(userId, preferences) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notificationPreferences).set(preferences).where((0, import_drizzle_orm3.eq)(notificationPreferences.userId, userId));
}

// server/notifications-routes.ts
var protectedProcedure2 = publicProcedure.use(async (opts) => {
  const user = opts.ctx.user;
  if (!user || !user.id) {
    throw new Error("Unauthorized: User not authenticated");
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      user
    }
  });
});
var notificationsRouter = router({
  subscribe: protectedProcedure2.input(import_zod.z.object({
    endpoint: import_zod.z.string(),
    keys: import_zod.z.object({
      auth: import_zod.z.string(),
      p256dh: import_zod.z.string()
    })
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new Error("User not authenticated");
    await savePushSubscription(
      ctx.user.id,
      input,
      ctx.req?.headers["user-agent"]
    );
    return { success: true };
  }),
  unsubscribe: protectedProcedure2.input(import_zod.z.object({
    endpoint: import_zod.z.string()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new Error("User not authenticated");
    await removePushSubscription(ctx.user.id, input.endpoint);
    return { success: true };
  }),
  getNotifications: protectedProcedure2.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("User not authenticated");
    return getNotifications(ctx.user.id);
  }),
  markAsRead: protectedProcedure2.input(import_zod.z.object({
    id: import_zod.z.number()
  })).mutation(async ({ input }) => {
    await markNotificationAsRead(input.id);
    return { success: true };
  }),
  getPreferences: protectedProcedure2.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("User not authenticated");
    const prefs = await getNotificationPreferences(ctx.user.id);
    if (!prefs) {
      await createNotificationPreferences(ctx.user.id);
      return getNotificationPreferences(ctx.user.id);
    }
    return prefs;
  }),
  updatePreferences: protectedProcedure2.input(import_zod.z.object({
    readyForDelivery: import_zod.z.number().optional(),
    pendingPayment: import_zod.z.number().optional(),
    newClient: import_zod.z.number().optional(),
    systemUpdates: import_zod.z.number().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new Error("User not authenticated");
    await updateNotificationPreferences(ctx.user.id, input);
    return { success: true };
  })
});

// server/_core/systemRouter.ts
var import_zod2 = require("zod");
init_notification();
var systemRouter = router({
  health: publicProcedure.input(
    import_zod2.z.object({
      timestamp: import_zod2.z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    import_zod2.z.object({
      title: import_zod2.z.string().min(1, "title is required"),
      content: import_zod2.z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
init_db();

// server/admin-db.ts
var import_drizzle_orm4 = require("drizzle-orm");
init_schema();
init_db();
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn
  }).from(users).orderBy((0, import_drizzle_orm4.desc)(users.createdAt));
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn
  }).from(users).where((0, import_drizzle_orm4.eq)(users.id, id));
  return result[0] || null;
}
async function updateUserStatus(id, isActive) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ isActive }).where((0, import_drizzle_orm4.eq)(users.id, id));
}
async function deleteUser(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(users).where((0, import_drizzle_orm4.eq)(users.id, id));
}
async function getActiveUsersCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: users.id }).from(users).where((0, import_drizzle_orm4.eq)(users.isActive, "active"));
  return result.length;
}
async function getTotalTrabajos() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: trabajos.id }).from(trabajos);
  return result.length;
}
async function getTrabajosCountByEstado() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    estado: trabajos.estado,
    count: trabajos.id
  }).from(trabajos);
  const grouped = {};
  result.forEach((item) => {
    const estado = item.estado || "unknown";
    grouped[estado] = (grouped[estado] || 0) + 1;
  });
  return Object.entries(grouped).map(([estado, count]) => ({
    estado,
    count
  }));
}
async function getTrabajosCountByTipo() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    estado: trabajos.estado,
    count: trabajos.id
  }).from(trabajos);
  const grouped = {};
  result.forEach((item) => {
    const estado = item.estado || "unknown";
    grouped[estado] = (grouped[estado] || 0) + 1;
  });
  return Object.entries(grouped).map(([tipo, count]) => ({
    tipo,
    count
  }));
}
async function getTotalClientes() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: clientes.id }).from(clientes);
  return result.length;
}
async function getTotalUsers() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: users.id }).from(users);
  return result.length;
}
async function getAdminStats() {
  const [totalUsers, activeUsers, totalTrabajos, totalClientes, trabajosByEstado, trabajosByTipo] = await Promise.all([
    getTotalUsers(),
    getActiveUsersCount(),
    getTotalTrabajos(),
    getTotalClientes(),
    getTrabajosCountByEstado(),
    getTrabajosCountByTipo()
  ]);
  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    totalTrabajos,
    totalClientes,
    trabajosByEstado,
    trabajosByTipo
  };
}

// server/superadmin-db.ts
var import_drizzle_orm5 = require("drizzle-orm");
init_schema();
init_db();
var SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "rcortesesquivel@gmail.com";
function isSuperAdmin(email) {
  return email === SUPER_ADMIN_EMAIL;
}
async function getAllUsersWithStats() {
  const db = await getDb();
  if (!db) return [];
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
    plan: users.plan,
    audioTranscriptionsThisMonth: users.audioTranscriptionsThisMonth,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn
  }).from(users).where((0, import_drizzle_orm5.eq)(users.role, "user")).orderBy((0, import_drizzle_orm5.desc)(users.createdAt));
  return allUsers;
}
async function searchUsers(query) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
    plan: users.plan,
    audioTranscriptionsThisMonth: users.audioTranscriptionsThisMonth,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn
  }).from(users).where(
    (0, import_drizzle_orm5.and)(
      (0, import_drizzle_orm5.eq)(users.role, "user"),
      (0, import_drizzle_orm5.like)(users.email, `%${query}%`)
    )
  ).orderBy((0, import_drizzle_orm5.desc)(users.createdAt));
}
async function updateUserPlan(userId, plan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ plan }).where((0, import_drizzle_orm5.eq)(users.id, userId));
}
async function updateUserStatus2(userId, isActive) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ isActive }).where((0, import_drizzle_orm5.eq)(users.id, userId));
}
async function resetAudioTranscriptionsCounter(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({
    audioTranscriptionsThisMonth: 0,
    lastAudioResetDate: /* @__PURE__ */ new Date()
  }).where((0, import_drizzle_orm5.eq)(users.id, userId));
}
async function getTotalActiveUsers() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: users.id }).from(users).where((0, import_drizzle_orm5.and)((0, import_drizzle_orm5.eq)(users.role, "user"), (0, import_drizzle_orm5.eq)(users.isActive, "active")));
  return result.length;
}
async function getTotalInactiveUsers() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: users.id }).from(users).where((0, import_drizzle_orm5.and)((0, import_drizzle_orm5.eq)(users.role, "user"), (0, import_drizzle_orm5.eq)(users.isActive, "inactive")));
  return result.length;
}
async function getTotalUploadedImages() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: imagenes.id }).from(imagenes);
  return result.length;
}
async function getTotalAudioTranscriptionsThisMonth() {
  const db = await getDb();
  if (!db) return 0;
  const allUsers = await db.select({ count: users.audioTranscriptionsThisMonth }).from(users);
  return allUsers.reduce((sum, u) => sum + (u.count || 0), 0);
}
async function getUsersCountByPlan() {
  const db = await getDb();
  if (!db) return { basic: 0, vip: 0, lifetime: 0 };
  const basic = await db.select({ count: users.id }).from(users).where((0, import_drizzle_orm5.and)((0, import_drizzle_orm5.eq)(users.role, "user"), (0, import_drizzle_orm5.eq)(users.plan, "basic")));
  const vip = await db.select({ count: users.id }).from(users).where((0, import_drizzle_orm5.and)((0, import_drizzle_orm5.eq)(users.role, "user"), (0, import_drizzle_orm5.eq)(users.plan, "vip")));
  const lifetime = await db.select({ count: users.id }).from(users).where((0, import_drizzle_orm5.and)((0, import_drizzle_orm5.eq)(users.role, "user"), (0, import_drizzle_orm5.eq)(users.plan, "lifetime")));
  return {
    basic: basic.length,
    vip: vip.length,
    lifetime: lifetime.length
  };
}
async function getSuperAdminMetrics() {
  const [activeUsers, inactiveUsers, totalImages, totalAudio, planCounts] = await Promise.all([
    getTotalActiveUsers(),
    getTotalInactiveUsers(),
    getTotalUploadedImages(),
    getTotalAudioTranscriptionsThisMonth(),
    getUsersCountByPlan()
  ]);
  const totalRevenue = planCounts.basic * 12 + planCounts.vip * 14 + planCounts.lifetime * 49.99;
  const recentPayments = [
    { email: "usuario1@example.com", amount: 12, plan: "basic", date: /* @__PURE__ */ new Date() },
    { email: "usuario2@example.com", amount: 14, plan: "vip", date: /* @__PURE__ */ new Date() },
    { email: "usuario3@example.com", amount: 49.99, plan: "lifetime", date: /* @__PURE__ */ new Date() }
  ];
  return {
    totalUsers: activeUsers + inactiveUsers,
    activeUsers,
    inactiveUsers,
    totalImages,
    totalAudio,
    basicPlanUsers: planCounts.basic,
    vipPlanUsers: planCounts.vip,
    lifetimePlanUsers: planCounts.lifetime,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    recentPayments
  };
}
async function canUserRecordAudio(userId) {
  const db = await getDb();
  if (!db) return false;
  const user = await db.select({
    plan: users.plan,
    audioTranscriptionsThisMonth: users.audioTranscriptionsThisMonth,
    lastAudioResetDate: users.lastAudioResetDate
  }).from(users).where((0, import_drizzle_orm5.eq)(users.id, userId));
  if (!user[0]) return false;
  const u = user[0];
  if (u.plan === "basic" || u.plan === "vip") {
    return true;
  }
  if (u.plan === "lifetime") {
    const lastReset = new Date(u.lastAudioResetDate);
    const now = /* @__PURE__ */ new Date();
    const isNewMonth = lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear();
    if (isNewMonth) {
      await resetAudioTranscriptionsCounter(userId);
      return true;
    }
    return (u.audioTranscriptionsThisMonth || 0) < 20;
  }
  return false;
}
async function incrementAudioTranscriptionCount(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const user = await db.select({
    audioTranscriptionsThisMonth: users.audioTranscriptionsThisMonth,
    lastAudioResetDate: users.lastAudioResetDate
  }).from(users).where((0, import_drizzle_orm5.eq)(users.id, userId));
  if (!user[0]) throw new Error("User not found");
  const u = user[0];
  const lastReset = new Date(u.lastAudioResetDate);
  const now = /* @__PURE__ */ new Date();
  const isNewMonth = lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear();
  if (isNewMonth) {
    await db.update(users).set({
      audioTranscriptionsThisMonth: 1,
      lastAudioResetDate: now
    }).where((0, import_drizzle_orm5.eq)(users.id, userId));
  } else {
    await db.update(users).set({
      audioTranscriptionsThisMonth: (u.audioTranscriptionsThisMonth || 0) + 1
    }).where((0, import_drizzle_orm5.eq)(users.id, userId));
  }
}

// server/storage.ts
init_env();
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/password-reset-db.ts
init_db();
init_schema();
var import_drizzle_orm6 = require("drizzle-orm");
var import_crypto = require("crypto");
function generateSecureToken() {
  return (0, import_crypto.randomBytes)(32).toString("hex");
}
async function requestPasswordReset(email) {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Base de datos no disponible" };
  }
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const userRows = await db.select().from(users).where((0, import_drizzle_orm6.eq)(users.email, normalizedEmail)).limit(1);
    if (userRows.length === 0) {
      return {
        success: false,
        message: "Email no registrado",
        userStatus: "not_found"
      };
    }
    const authRows = await db.select().from(emailsAutorizados).where((0, import_drizzle_orm6.eq)(emailsAutorizados.email, normalizedEmail)).limit(1);
    if (authRows.length > 0) {
      const auth = authRows[0];
      if (auth.status === "prueba" && auth.expiresAt) {
        const now = /* @__PURE__ */ new Date();
        const expiresAt2 = new Date(auth.expiresAt);
        if (expiresAt2 <= now) {
          return {
            success: false,
            message: "Tu per\xEDodo de prueba ha vencido. Activa tu membres\xEDa para continuar.",
            userStatus: "trial_expired"
          };
        }
      }
    }
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
    await db.insert(passwordResets).values({
      email: normalizedEmail,
      token,
      expiresAt
    });
    const resetLink = `${process.env.APP_URL || "http://localhost:8081"}/auth/reset-password?token=${token}`;
    console.log(`[Password Reset] Requested for ${normalizedEmail}`);
    console.log(`[Password Reset] Token: ${token}`);
    console.log(`[Password Reset] Link: ${resetLink}`);
    return {
      success: true,
      message: "Email de recuperaci\xF3n enviado",
      userStatus: "active",
      token: process.env.NODE_ENV === "development" ? token : void 0,
      resetLink: process.env.NODE_ENV === "development" ? resetLink : void 0
    };
  } catch (error) {
    console.error("[Password Reset] Error requesting reset:", error);
    return { success: false, message: "Error al procesar la solicitud" };
  }
}
async function validateResetToken(token) {
  const db = await getDb();
  if (!db) {
    return { valid: false, message: "Base de datos no disponible" };
  }
  try {
    const resetRows = await db.select().from(passwordResets).where(
      (0, import_drizzle_orm6.and)(
        (0, import_drizzle_orm6.eq)(passwordResets.token, token),
        (0, import_drizzle_orm6.gt)(passwordResets.expiresAt, /* @__PURE__ */ new Date()),
        (0, import_drizzle_orm6.isNull)(passwordResets.usedAt)
      )
    ).limit(1);
    if (resetRows.length === 0) {
      return { valid: false, message: "Token inv\xE1lido o expirado" };
    }
    const resetEmail = resetRows[0].email;
    const authRows = await db.select().from(emailsAutorizados).where((0, import_drizzle_orm6.eq)(emailsAutorizados.email, resetEmail)).limit(1);
    if (authRows.length > 0) {
      const auth = authRows[0];
      if (auth.status === "prueba" && auth.expiresAt) {
        const now = /* @__PURE__ */ new Date();
        const expiresAt = new Date(auth.expiresAt);
        if (expiresAt <= now) {
          return {
            valid: false,
            email: resetEmail,
            message: "Tu per\xEDodo de prueba ha vencido. Activa tu membres\xEDa para continuar.",
            userStatus: "trial_expired"
          };
        }
      }
    }
    return {
      valid: true,
      email: resetEmail,
      message: "Token v\xE1lido",
      userStatus: "active"
    };
  } catch (error) {
    console.error("[Password Reset] Error validating token:", error);
    return { valid: false, message: "Token inv\xE1lido o expirado" };
  }
}
async function resetPassword(token) {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Base de datos no disponible" };
  }
  try {
    const validation = await validateResetToken(token);
    if (!validation.valid || !validation.email) {
      return { success: false, message: validation.message };
    }
    await db.update(passwordResets).set({ usedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm6.eq)(passwordResets.token, token));
    console.log(
      `[Password Reset] Password reset completed for ${validation.email}`
    );
    return { success: true, message: "Contrase\xF1a actualizada correctamente" };
  } catch (error) {
    console.error("[Password Reset] Error resetting password:", error);
    return { success: false, message: "Error al actualizar contrase\xF1a" };
  }
}

// server/routers.ts
var import_zod3 = require("zod");
var import_server3 = require("@trpc/server");
var protectedProcedure3 = publicProcedure.use(async (opts) => {
  const user = opts.ctx.user;
  if (!user || !user.id) {
    throw new import_server3.TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized: User not authenticated" });
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      user
    }
  });
});
var adminProcedure2 = publicProcedure.use(async (opts) => {
  const user = opts.ctx.user;
  if (!user || !user.id || user.role !== "admin") {
    throw new import_server3.TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized: Admin access required" });
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      user
    }
  });
});
var superAdminProcedure = publicProcedure.use(async (opts) => {
  const user = opts.ctx.user;
  if (!user || !user.email || !isSuperAdmin(user.email)) {
    throw new import_server3.TRPCError({ code: "FORBIDDEN", message: "Unauthorized: Super admin access required" });
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      user
    }
  });
});
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    }),
    forgotPassword: publicProcedure.input(import_zod3.z.object({ email: import_zod3.z.string().email() })).mutation(async ({ input }) => {
      const result = await requestPasswordReset(input.email);
      if (!result.success) {
        let redirectUrl = "";
        if (result.userStatus === "not_found") {
          redirectUrl = "https://costuraapp-matbtw2g.manus.space/";
        } else if (result.userStatus === "trial_expired") {
          redirectUrl = process.env.HOTMART_CHECKOUT_URL || "https://pay.hotmart.com/T104497671V";
        }
        return {
          success: false,
          message: result.message,
          userStatus: result.userStatus,
          redirectUrl
        };
      }
      return {
        success: true,
        message: "Se envi\xF3 un enlace de recuperaci\xF3n a tu email",
        userStatus: result.userStatus,
        token: result.token,
        resetLink: result.resetLink
      };
    }),
    validateResetToken: publicProcedure.input(import_zod3.z.object({ token: import_zod3.z.string() })).mutation(async ({ input }) => {
      const result = await validateResetToken(input.token);
      return {
        valid: result.valid,
        email: result.email,
        message: result.message,
        userStatus: result.userStatus
      };
    }),
    resetPassword: publicProcedure.input(import_zod3.z.object({ token: import_zod3.z.string() })).mutation(async ({ input }) => {
      const result = await resetPassword(input.token);
      return {
        success: result.success,
        message: result.message
      };
    })
  }),
  // ============ CLIENTES ============
  clientes: router({
    list: protectedProcedure3.query(({ ctx }) => {
      return getAllClientes(ctx.user.id);
    }),
    getById: protectedProcedure3.input(import_zod3.z.object({ id: import_zod3.z.number() })).query(({ input, ctx }) => {
      return getClienteById(input.id, ctx.user.id);
    }),
    create: protectedProcedure3.input(import_zod3.z.object({
      nombreCompleto: import_zod3.z.string().min(1).max(255),
      telefono: import_zod3.z.string().max(20).optional(),
      codigoPais: import_zod3.z.string().max(5).optional(),
      whatsapp: import_zod3.z.string().max(20).optional(),
      direccion: import_zod3.z.string().optional(),
      redesSociales: import_zod3.z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const id = await createCliente({
        ...input,
        userId: ctx.user.id
      });
      return { id };
    }),
    update: protectedProcedure3.input(import_zod3.z.object({
      id: import_zod3.z.number(),
      data: import_zod3.z.object({
        nombreCompleto: import_zod3.z.string().min(1).max(255).optional(),
        telefono: import_zod3.z.string().max(20).optional(),
        codigoPais: import_zod3.z.string().max(5).optional(),
        whatsapp: import_zod3.z.string().max(20).optional(),
        direccion: import_zod3.z.string().optional(),
        redesSociales: import_zod3.z.string().optional()
      })
    })).mutation(async ({ input, ctx }) => {
      await updateCliente(input.id, ctx.user.id, input.data);
      return { success: true };
    }),
    delete: protectedProcedure3.input(import_zod3.z.object({ id: import_zod3.z.number() })).mutation(async ({ input, ctx }) => {
      await deleteCliente(input.id, ctx.user.id);
      return { success: true };
    }),
    search: protectedProcedure3.input(import_zod3.z.object({ query: import_zod3.z.string() })).query(({ input, ctx }) => {
      return searchClientes(input.query, ctx.user.id);
    }),
    bulkCreate: protectedProcedure3.input(import_zod3.z.object({
      contactos: import_zod3.z.array(import_zod3.z.object({
        nombreCompleto: import_zod3.z.string().min(1).max(255),
        telefono: import_zod3.z.string().max(20).optional(),
        codigoPais: import_zod3.z.string().max(5).optional(),
        whatsapp: import_zod3.z.string().max(20).optional()
      })).min(1).max(200)
    })).mutation(async ({ input, ctx }) => {
      return bulkCreateClientes(input.contactos, ctx.user.id);
    })
  }),
  // ============ MEDIDAS ============
  medidas: router({
    getByClienteId: protectedProcedure3.input(import_zod3.z.object({ clienteId: import_zod3.z.number() })).query(({ input, ctx }) => {
      return getMedidasByClienteId(input.clienteId, ctx.user.id);
    }),
    create: protectedProcedure3.input(import_zod3.z.object({
      clienteId: import_zod3.z.number(),
      cuello: import_zod3.z.string().max(10).optional(),
      hombros: import_zod3.z.string().max(10).optional(),
      pecho: import_zod3.z.string().max(10).optional(),
      cintura: import_zod3.z.string().max(10).optional(),
      cadera: import_zod3.z.string().max(10).optional(),
      largoManga: import_zod3.z.string().max(10).optional(),
      largoEspalda: import_zod3.z.string().max(10).optional(),
      largoPantalon: import_zod3.z.string().max(10).optional(),
      entrepierna: import_zod3.z.string().max(10).optional(),
      contornoBrazo: import_zod3.z.string().max(10).optional(),
      anchoPecho: import_zod3.z.string().max(10).optional(),
      anchoEspalda: import_zod3.z.string().max(10).optional(),
      notas: import_zod3.z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const id = await createMedidas({
        ...input,
        userId: ctx.user.id
      });
      return { id };
    }),
    update: protectedProcedure3.input(import_zod3.z.object({
      id: import_zod3.z.number(),
      data: import_zod3.z.object({
        cuello: import_zod3.z.string().max(10).optional(),
        hombros: import_zod3.z.string().max(10).optional(),
        pecho: import_zod3.z.string().max(10).optional(),
        cintura: import_zod3.z.string().max(10).optional(),
        cadera: import_zod3.z.string().max(10).optional(),
        largoManga: import_zod3.z.string().max(10).optional(),
        largoEspalda: import_zod3.z.string().max(10).optional(),
        largoPantalon: import_zod3.z.string().max(10).optional(),
        entrepierna: import_zod3.z.string().max(10).optional(),
        contornoBrazo: import_zod3.z.string().max(10).optional(),
        anchoPecho: import_zod3.z.string().max(10).optional(),
        anchoEspalda: import_zod3.z.string().max(10).optional(),
        notas: import_zod3.z.string().optional()
      })
    })).mutation(async ({ input, ctx }) => {
      await updateMedidas(input.id, ctx.user.id, input.data);
      return { success: true };
    })
  }),
  // ============ TRABAJOS ============
  trabajos: router({
    list: protectedProcedure3.query(({ ctx }) => {
      return getAllTrabajos(ctx.user.id);
    }),
    getById: protectedProcedure3.input(import_zod3.z.object({ id: import_zod3.z.number() })).query(({ input, ctx }) => {
      return getTrabajoById(input.id, ctx.user.id);
    }),
    getByClienteId: protectedProcedure3.input(import_zod3.z.object({ clienteId: import_zod3.z.number() })).query(({ input, ctx }) => {
      return getTrabajosByClienteId(input.clienteId, ctx.user.id);
    }),
    getVencenHoy: protectedProcedure3.query(({ ctx }) => {
      return getTrabajosVencenHoy(ctx.user.id);
    }),
    create: protectedProcedure3.input(import_zod3.z.object({
      clienteId: import_zod3.z.number(),
      descripcion: import_zod3.z.string().min(1),
      precioUnitario: import_zod3.z.string(),
      cantidad: import_zod3.z.number().int().min(1).default(1),
      abonoInicial: import_zod3.z.string().optional(),
      impuestos: import_zod3.z.string().optional(),
      varios: import_zod3.z.string().optional(),
      categoria: import_zod3.z.enum(["arreglo", "confeccion", "bordado", "sublimado", "otros"]).optional(),
      urgencia: import_zod3.z.enum(["baja", "media", "alta"]).optional(),
      fechaEntrega: import_zod3.z.date().optional(),
      attachments: import_zod3.z.array(import_zod3.z.object({ uri: import_zod3.z.string(), name: import_zod3.z.string(), type: import_zod3.z.enum(["image", "document"]) })).optional()
    })).mutation(async ({ input, ctx }) => {
      const id = await createTrabajo({
        clienteId: input.clienteId,
        descripcion: input.descripcion,
        precioUnitario: input.precioUnitario,
        cantidad: input.cantidad ?? 1,
        abonoInicial: input.abonoInicial ?? "0.00",
        impuestos: input.impuestos ?? "0.00",
        varios: input.varios ?? "0.00",
        categoria: input.categoria ?? "otros",
        urgencia: input.urgencia,
        fechaEntrega: input.fechaEntrega,
        userId: ctx.user.id,
        estado: "recibido"
      });
      if (input.attachments && input.attachments.length > 0) {
        for (const attachment of input.attachments) {
          try {
            await createImagen({
              userId: ctx.user.id,
              trabajoId: id,
              url: attachment.uri,
              tipo: attachment.type
            });
          } catch (error) {
            console.error(`Error guardando imagen ${attachment.name}:`, error);
          }
        }
      }
      return { id };
    }),
    updateEstado: protectedProcedure3.input(import_zod3.z.object({
      id: import_zod3.z.number(),
      estadoAnterior: import_zod3.z.string().optional(),
      estadoNuevo: import_zod3.z.string()
    })).mutation(async ({ input, ctx }) => {
      await updateTrabajo(input.id, ctx.user.id, {
        estado: input.estadoNuevo
      });
      if (input.estadoAnterior) {
        await createHistorialEstado({
          userId: ctx.user.id,
          trabajoId: input.id,
          estadoAnterior: input.estadoAnterior,
          estadoNuevo: input.estadoNuevo
        });
      }
      return { success: true };
    }),
    togglePagado: protectedProcedure3.input(import_zod3.z.object({ id: import_zod3.z.number(), pagado: import_zod3.z.number().min(0).max(1) })).mutation(async ({ input, ctx }) => {
      await updateTrabajo(input.id, ctx.user.id, { pagado: input.pagado });
      return { success: true };
    }),
    dividir: protectedProcedure3.input(import_zod3.z.object({
      id: import_zod3.z.number(),
      cantidadSeparar: import_zod3.z.number().int().min(1)
    })).mutation(async ({ input, ctx }) => {
      const trabajo = await getTrabajoById(input.id, ctx.user.id);
      if (!trabajo) throw new Error("Trabajo no encontrado");
      const cantidadActual = trabajo.cantidad ?? 1;
      if (input.cantidadSeparar >= cantidadActual) throw new Error("La cantidad a separar debe ser menor a la actual");
      await updateTrabajo(input.id, ctx.user.id, { cantidad: cantidadActual - input.cantidadSeparar });
      const precioUnitario = parseFloat(trabajo.precioUnitario || "0");
      const nuevoId = await createTrabajo({
        userId: ctx.user.id,
        clienteId: trabajo.clienteId,
        descripcion: trabajo.descripcion || "",
        precioUnitario: precioUnitario.toFixed(2),
        cantidad: input.cantidadSeparar,
        abonoInicial: "0.00",
        impuestos: "0.00",
        varios: "0.00",
        categoria: trabajo.categoria,
        urgencia: trabajo.urgencia,
        estado: "recibido",
        fechaEntrega: trabajo.fechaEntrega
      });
      return { nuevoId, cantidadOriginal: cantidadActual - input.cantidadSeparar };
    }),
    update: protectedProcedure3.input(import_zod3.z.object({
      id: import_zod3.z.number(),
      data: import_zod3.z.object({
        descripcion: import_zod3.z.string().min(1).optional(),
        precioUnitario: import_zod3.z.string().optional(),
        cantidad: import_zod3.z.number().int().min(1).optional(),
        abonoInicial: import_zod3.z.string().optional(),
        impuestos: import_zod3.z.string().optional(),
        varios: import_zod3.z.string().optional(),
        categoria: import_zod3.z.enum(["arreglo", "confeccion", "bordado", "sublimado", "otros"]).optional(),
        urgencia: import_zod3.z.enum(["baja", "media", "alta"]).optional(),
        fechaEntrega: import_zod3.z.date().optional()
      })
    })).mutation(async ({ input, ctx }) => {
      await updateTrabajo(input.id, ctx.user.id, input.data);
      return { success: true };
    }),
    delete: protectedProcedure3.input(import_zod3.z.object({ id: import_zod3.z.number() })).mutation(async ({ input, ctx }) => {
      await deleteTrabajo(input.id, ctx.user.id);
      return { success: true };
    }),
    search: protectedProcedure3.input(import_zod3.z.object({
      query: import_zod3.z.string().optional(),
      estado: import_zod3.z.string().optional()
    })).query(({ input, ctx }) => {
      return searchTrabajos({
        ...input,
        userId: ctx.user.id
      });
    }),
    calcularTotal: protectedProcedure3.input(import_zod3.z.object({ trabajoId: import_zod3.z.number() })).query(({ input, ctx }) => {
      return calcularTotalTrabajo(input.trabajoId, ctx.user.id);
    }),
    misEstadisticas: protectedProcedure3.query(async ({ ctx }) => {
      return getMisEstadisticas(ctx.user.id);
    })
  }),
  // ============ AGREGADOS ============
  agregados: router({
    getByTrabajoId: protectedProcedure3.input(import_zod3.z.object({ trabajoId: import_zod3.z.number() })).query(({ input, ctx }) => {
      return getAgregadosByTrabajoId(input.trabajoId, ctx.user.id);
    }),
    create: protectedProcedure3.input(import_zod3.z.object({
      trabajoId: import_zod3.z.number(),
      concepto: import_zod3.z.string().min(1).max(255),
      precio: import_zod3.z.string(),
      cantidad: import_zod3.z.number().min(1).default(1)
    })).mutation(async ({ input, ctx }) => {
      const id = await createAgregado(input);
      return { id };
    }),
    delete: protectedProcedure3.input(import_zod3.z.object({ id: import_zod3.z.number() })).mutation(async ({ input, ctx }) => {
      await deleteAgregado(input.id, ctx.user.id);
      return { success: true };
    })
  }),
  // ============ IMÁGENES ============
  imagenes: router({
    getByTrabajoId: protectedProcedure3.input(import_zod3.z.object({ trabajoId: import_zod3.z.number() })).query(({ input, ctx }) => {
      return getImagenesByTrabajoId(input.trabajoId, ctx.user.id);
    }),
    create: protectedProcedure3.input(import_zod3.z.object({
      trabajoId: import_zod3.z.number(),
      url: import_zod3.z.string(),
      tipo: import_zod3.z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const id = await createImagen({
        ...input,
        userId: ctx.user.id
      });
      return { id };
    }),
    delete: protectedProcedure3.input(import_zod3.z.object({ id: import_zod3.z.number() })).mutation(async ({ input, ctx }) => {
      await deleteImagen(input.id, ctx.user.id);
      return { success: true };
    }),
    addToTrabajo: protectedProcedure3.input(import_zod3.z.object({
      trabajoId: import_zod3.z.number(),
      attachments: import_zod3.z.array(import_zod3.z.object({
        uri: import_zod3.z.string(),
        name: import_zod3.z.string(),
        type: import_zod3.z.enum(["image", "document"])
      }))
    })).mutation(async ({ input, ctx }) => {
      const ids = [];
      for (const attachment of input.attachments) {
        const id = await createImagen({
          userId: ctx.user.id,
          trabajoId: input.trabajoId,
          url: attachment.uri,
          tipo: attachment.type
        });
        ids.push(id);
      }
      return { ids };
    })
  }),
  // ============ HISTORIAL ============
  historial: router({
    getByTrabajoId: protectedProcedure3.input(import_zod3.z.object({ trabajoId: import_zod3.z.number() })).query(({ input, ctx }) => {
      return getHistorialByTrabajoId(input.trabajoId, ctx.user.id);
    })
  }),
  // ============ ADMIN ============
  admin: router({
    // Usuarios
    users: router({
      list: adminProcedure2.query(() => {
        return getAllUsers();
      }),
      getById: adminProcedure2.input(import_zod3.z.object({ id: import_zod3.z.number() })).query(({ input }) => {
        return getUserById(input.id);
      }),
      updateStatus: adminProcedure2.input(import_zod3.z.object({
        id: import_zod3.z.number(),
        isActive: import_zod3.z.enum(["active", "inactive"])
      })).mutation(async ({ input }) => {
        await updateUserStatus(input.id, input.isActive);
        return { success: true };
      }),
      delete: adminProcedure2.input(import_zod3.z.object({ id: import_zod3.z.number() })).mutation(async ({ input }) => {
        await deleteUser(input.id);
        return { success: true };
      })
    }),
    // Estadísticas
    stats: router({
      overview: adminProcedure2.query(() => {
        return getAdminStats();
      }),
      totalTrabajos: adminProcedure2.query(() => {
        return getTotalTrabajos();
      }),
      trabajosByEstado: adminProcedure2.query(() => {
        return getTrabajosCountByEstado();
      }),
      trabajosByTipo: adminProcedure2.query(() => {
        return getTrabajosCountByTipo();
      })
    })
  }),
  // ============ SUPER ADMIN ============
  superAdmin: router({
    // Usuarios
    users: router({
      list: superAdminProcedure.query(() => {
        return getAllUsersWithStats();
      }),
      search: superAdminProcedure.input(import_zod3.z.object({ query: import_zod3.z.string() })).query(({ input }) => {
        return searchUsers(input.query);
      }),
      updatePlan: superAdminProcedure.input(import_zod3.z.object({
        id: import_zod3.z.number(),
        plan: import_zod3.z.enum(["basic", "vip", "lifetime"])
      })).mutation(async ({ input }) => {
        await updateUserPlan(input.id, input.plan);
        return { success: true };
      }),
      updateStatus: superAdminProcedure.input(import_zod3.z.object({
        id: import_zod3.z.number(),
        isActive: import_zod3.z.enum(["active", "inactive"])
      })).mutation(async ({ input }) => {
        await updateUserStatus2(input.id, input.isActive);
        return { success: true };
      })
    }),
    // Métricas
    metrics: router({
      overview: superAdminProcedure.query(() => {
        return getSuperAdminMetrics();
      })
    }),
    // Validación de límites de audio
    audio: router({
      canRecord: protectedProcedure3.query(async ({ ctx }) => {
        if (!ctx.user) return false;
        return canUserRecordAudio(ctx.user.id);
      }),
      recordTranscription: protectedProcedure3.mutation(async ({ ctx }) => {
        if (!ctx.user) throw new Error("User not authenticated");
        await incrementAudioTranscriptionCount(ctx.user.id);
        return { success: true };
      })
    }),
    // Notificaciones
    notifications: notificationsRouter,
    // Audios
    audios: router({
      getByTrabajoId: protectedProcedure3.input(import_zod3.z.object({ trabajoId: import_zod3.z.number() })).query(({ input, ctx }) => getAudiosByTrabajoId(input.trabajoId, ctx.user.id)),
      upload: protectedProcedure3.input(import_zod3.z.object({
        trabajoId: import_zod3.z.number(),
        base64: import_zod3.z.string(),
        duracion: import_zod3.z.number().int().min(0).max(30),
        descripcion: import_zod3.z.string().optional(),
        mimeType: import_zod3.z.string().default("audio/webm")
      })).mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const ext = input.mimeType.includes("webm") ? "webm" : "mp3";
        const key = `audios/${ctx.user.id}/${input.trabajoId}/${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        const audioId = await createAudio({
          userId: ctx.user.id,
          trabajoId: input.trabajoId,
          url,
          duracion: input.duracion,
          descripcion: input.descripcion
        });
        return { id: audioId, url };
      }),
      delete: protectedProcedure3.input(import_zod3.z.object({ id: import_zod3.z.number() })).mutation(async ({ input, ctx }) => {
        await deleteAudio(input.id, ctx.user.id);
        return { success: true };
      })
    }),
    // Whitelist de Emails (Super Admin)
    whitelist: router({
      list: superAdminProcedure.input(import_zod3.z.object({ search: import_zod3.z.string().optional(), status: import_zod3.z.enum(["prueba", "pagado"]).optional() }).optional()).query(async ({ input }) => {
        const db_conn = await getDb();
        if (!db_conn) throw new Error("Database not available");
        let query = db_conn.select().from(emailsAutorizados).$dynamic();
        if (input?.search) {
          query = query.where(
            import_drizzle_orm.or(
              import_drizzle_orm.like(emailsAutorizados.email, `%${input.search}%`),
              import_drizzle_orm.like(emailsAutorizados.nombre, `%${input.search}%`)
            )
          );
        }
        if (input?.status) {
          query = query.where(import_drizzle_orm.eq(emailsAutorizados.status, input.status));
        }
        return query.orderBy(import_drizzle_orm.desc(emailsAutorizados.createdAt));
      }),
      create: superAdminProcedure.input(import_zod3.z.object({
        email: import_zod3.z.string().email(),
        nombre: import_zod3.z.string().min(1),
        plan: import_zod3.z.enum(["basic", "vip", "lifetime"]),
        status: import_zod3.z.enum(["prueba", "pagado"]),
        diasExpiracion: import_zod3.z.number().int().min(1).default(2)
      })).mutation(async ({ input }) => {
        const db_conn = await getDb();
        if (!db_conn) throw new Error("Database not available");
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setDate(expiresAt.getDate() + input.diasExpiracion);
        const result = await db_conn.insert(emailsAutorizados).values({
          email: input.email,
          nombre: input.nombre,
          plan: input.plan,
          status: input.status,
          expiresAt
        });
        return { id: result[0].insertId, email: input.email };
      }),
      update: superAdminProcedure.input(import_zod3.z.object({
        email: import_zod3.z.string().email(),
        nombre: import_zod3.z.string().min(1).optional(),
        plan: import_zod3.z.enum(["basic", "vip", "lifetime"]).optional(),
        status: import_zod3.z.enum(["prueba", "pagado"]).optional(),
        diasExpiracion: import_zod3.z.number().int().min(1).optional()
      })).mutation(async ({ input }) => {
        const db_conn = await getDb();
        if (!db_conn) throw new Error("Database not available");
        const updateData = {};
        if (input.nombre) updateData.nombre = input.nombre;
        if (input.plan) updateData.plan = input.plan;
        if (input.status) updateData.status = input.status;
        if (input.diasExpiracion) {
          const expiresAt = /* @__PURE__ */ new Date();
          expiresAt.setDate(expiresAt.getDate() + input.diasExpiracion);
          updateData.expiresAt = expiresAt;
        }
        await db_conn.update(emailsAutorizados).set(updateData).where(import_drizzle_orm.eq(emailsAutorizados.email, input.email));
        return { success: true };
      }),
      delete: superAdminProcedure.input(import_zod3.z.object({ email: import_zod3.z.string().email() })).mutation(async ({ input }) => {
        const db_conn = await getDb();
        if (!db_conn) throw new Error("Database not available");
        await db_conn.delete(emailsAutorizados).where(import_drizzle_orm.eq(emailsAutorizados.email, input.email));
        return { success: true };
      })
    })
  }),
  // Buzón de sugerencias
  sugerencias: router({
    enviar: protectedProcedure3.input(import_zod3.z.object({
      asunto: import_zod3.z.string().min(1).max(500),
      mensaje: import_zod3.z.string().min(1).max(5e3)
    })).mutation(async ({ ctx, input }) => {
      const db_conn = await getDb();
      if (!db_conn) throw new Error("Database not available");
      await db_conn.insert(sugerencias).values({
        userId: ctx.user.id,
        nombreUsuario: ctx.user.name || "Sin nombre",
        emailUsuario: ctx.user.email || "Sin email",
        asunto: input.asunto,
        mensaje: input.mensaje
      });
      const { notifyOwner: notifyOwner2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
      try {
        await notifyOwner2({
          title: `Nueva sugerencia: ${input.asunto}`,
          content: `De: ${ctx.user.name || ctx.user.email || "Usuario"}
Email: ${ctx.user.email || "N/A"}

${input.mensaje}`
        });
      } catch (e) {
        console.warn("[Sugerencias] No se pudo notificar al due\xF1o:", e);
      }
      return { success: true };
    }),
    // Listar sugerencias (solo admin)
    listar: superAdminProcedure.input(import_zod3.z.object({
      limit: import_zod3.z.number().min(1).max(100).default(50),
      offset: import_zod3.z.number().min(0).default(0)
    }).optional()).query(async ({ input }) => {
      const db_conn = await getDb();
      if (!db_conn) return [];
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      return db_conn.select().from(sugerencias).orderBy(import_drizzle_orm.desc(sugerencias.createdAt)).limit(limit).offset(offset);
    })
  }),
  // ============ COTIZACIONES ============
  cotizaciones: router({
    list: protectedProcedure3.query(({ ctx }) => {
      return getAllCotizaciones(ctx.user.id);
    }),
    getById: protectedProcedure3.input(import_zod3.z.object({ id: import_zod3.z.number() })).query(({ input, ctx }) => {
      return getCotizacionById(input.id, ctx.user.id);
    }),
    create: protectedProcedure3.input(import_zod3.z.object({
      clienteId: import_zod3.z.number(),
      descripcion: import_zod3.z.string().optional(),
      precioUnitario: import_zod3.z.string().optional(),
      cantidad: import_zod3.z.number().optional(),
      impuestos: import_zod3.z.string().optional(),
      varios: import_zod3.z.string().optional(),
      categoria: import_zod3.z.enum(["arreglo", "confeccion", "bordado", "sublimado", "otros"]).optional(),
      urgencia: import_zod3.z.enum(["baja", "media", "alta"]).optional(),
      fechaEntrega: import_zod3.z.date().optional(),
      condicionesPago: import_zod3.z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const id = await createCotizacion({
        ...input,
        userId: ctx.user.id
      });
      return { id };
    }),
    update: protectedProcedure3.input(import_zod3.z.object({
      id: import_zod3.z.number(),
      data: import_zod3.z.object({
        descripcion: import_zod3.z.string().optional(),
        precioUnitario: import_zod3.z.string().optional(),
        cantidad: import_zod3.z.number().optional(),
        impuestos: import_zod3.z.string().optional(),
        varios: import_zod3.z.string().optional(),
        categoria: import_zod3.z.enum(["arreglo", "confeccion", "bordado", "sublimado", "otros"]).optional(),
        urgencia: import_zod3.z.enum(["baja", "media", "alta"]).optional(),
        fechaEntrega: import_zod3.z.date().optional(),
        condicionesPago: import_zod3.z.string().optional(),
        estado: import_zod3.z.enum(["pendiente", "aceptada", "rechazada", "vencida"]).optional()
      })
    })).mutation(async ({ input, ctx }) => {
      await updateCotizacion(input.id, ctx.user.id, input.data);
      return { success: true };
    }),
    delete: protectedProcedure3.input(import_zod3.z.object({ id: import_zod3.z.number() })).mutation(async ({ input, ctx }) => {
      await deleteCotizacion(input.id, ctx.user.id);
      return { success: true };
    }),
    convertirEnTrabajo: protectedProcedure3.input(import_zod3.z.object({
      cotizacionId: import_zod3.z.number(),
      abonoInicial: import_zod3.z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const trabajoId = await convertirCotizacionEnTrabajo(
        input.cotizacionId,
        ctx.user.id,
        input.abonoInicial || "0.00"
      );
      return { trabajoId };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/webhooks.ts
var import_crypto2 = require("crypto");
var import_express = require("express");

// server/hotmart-db.ts
var import_drizzle_orm7 = require("drizzle-orm");
init_schema();
init_db();
async function upsertWhitelist(email, status, diasAcceso) {
  const db = await getDb();
  if (!db) return;
  const emailLower = email.toLowerCase().trim();
  const ahora = /* @__PURE__ */ new Date();
  const expiresAt = new Date(ahora.getTime() + diasAcceso * 24 * 60 * 60 * 1e3);
  const existing = await db.select().from(emailsAutorizados).where((0, import_drizzle_orm7.eq)(emailsAutorizados.email, emailLower));
  if (existing.length > 0) {
    const currentExpires = existing[0].expiresAt ? new Date(existing[0].expiresAt) : ahora;
    const baseDate = currentExpires > ahora ? currentExpires : ahora;
    const newExpires = new Date(baseDate.getTime() + diasAcceso * 24 * 60 * 60 * 1e3);
    await db.update(emailsAutorizados).set({
      status,
      expiresAt: newExpires
    }).where((0, import_drizzle_orm7.eq)(emailsAutorizados.email, emailLower));
    console.log(`[Whitelist] Actualizado: ${emailLower} \u2192 status=${status}, expiresAt=${newExpires.toISOString()}`);
  } else {
    await db.insert(emailsAutorizados).values({
      email: emailLower,
      nombre: email.split("@")[0],
      plan: status === "pagado" ? "vip" : "basic",
      status,
      expiresAt
    });
    console.log(`[Whitelist] Creado: ${emailLower} \u2192 status=${status}, expiresAt=${expiresAt.toISOString()}`);
  }
}
async function expireWhitelist(email) {
  const db = await getDb();
  if (!db) return;
  const emailLower = email.toLowerCase().trim();
  const pastDate = new Date(Date.now() - 1e3);
  await db.update(emailsAutorizados).set({
    expiresAt: pastDate
  }).where((0, import_drizzle_orm7.eq)(emailsAutorizados.email, emailLower));
  console.log(`[Whitelist] Expirado: ${emailLower}`);
}
async function saveWebhookEvent(eventType, email, payload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(hotmartWebhooks).values({
    eventType,
    email,
    payload: JSON.stringify(payload),
    processed: 0
  });
}
async function markWebhookAsProcessed(webhookId, error) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(hotmartWebhooks).set({
    processed: 1,
    processedAt: /* @__PURE__ */ new Date(),
    error: error || null
  }).where((0, import_drizzle_orm7.eq)(hotmartWebhooks.id, webhookId));
}
async function getUnprocessedWebhooks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hotmartWebhooks).where((0, import_drizzle_orm7.eq)(hotmartWebhooks.processed, 0));
}
function determineRoleAndPlan(payload) {
  const productName = (payload?.product?.name || payload?.product_name || payload?.offer?.name || "").toLowerCase();
  const isRecurring = !!(payload?.product?.is_recurring || payload?.subscription_id);
  const isAdminProduct = productName.includes("admin") || productName.includes("administrador") || productName.includes("premium") || productName.includes("completo");
  const role = isAdminProduct ? "admin" : "user";
  const plan = isRecurring ? "vip" : "lifetime";
  const isPriority = isRecurring ? 1 : 0;
  return { role, plan, isPriority };
}
async function processPurchaseApproved(email, payload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { role, plan, isPriority } = determineRoleAndPlan(payload);
  const buyerName = payload?.buyer?.name || payload?.customer?.name || payload?.subscriber?.name || email.split("@")[0];
  const existingUsers = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.email, email));
  if (existingUsers && existingUsers.length > 0) {
    const userId = existingUsers[0].id;
    await db.update(users).set({
      isActive: "active",
      role,
      plan,
      isPriority,
      name: existingUsers[0].name || buyerName,
      // No sobrescribir nombre si ya tiene uno
      audioTranscriptionsThisMonth: 0,
      lastAudioResetDate: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm7.eq)(users.id, userId));
    await db.insert(auditLog).values({
      userId,
      action: "purchase_approved_user_updated",
      details: JSON.stringify({
        email,
        role,
        plan,
        isRecurring: !!payload?.subscription_id,
        productName: payload?.product?.name || "N/A",
        productId: payload?.product?.id,
        purchaseId: payload?.purchase_id,
        amount: payload?.purchase?.price?.value || payload?.amount,
        currency: payload?.purchase?.price?.currency_code || "USD",
        date: (/* @__PURE__ */ new Date()).toISOString()
      })
    });
    await upsertWhitelist(email, "pagado", 30);
    console.log(`[Hotmart] Usuario actualizado: ${email} \u2192 rol=${role}, plan=${plan}`);
    return { success: true, userId, created: false, role, plan, isPriority };
  } else {
    const openId = `email:${email}`;
    await db.insert(users).values({
      openId,
      email,
      name: buyerName,
      loginMethod: "hotmart",
      role,
      isActive: "active",
      plan,
      isPriority,
      audioTranscriptionsThisMonth: 0,
      lastAudioResetDate: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      lastSignedIn: /* @__PURE__ */ new Date()
    });
    const createdUser = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.openId, openId));
    const userId = createdUser[0]?.id;
    if (userId) {
      await db.insert(auditLog).values({
        userId,
        action: "purchase_approved_user_created",
        details: JSON.stringify({
          email,
          role,
          plan,
          buyerName,
          isRecurring: !!payload?.subscription_id,
          productName: payload?.product?.name || "N/A",
          productId: payload?.product?.id,
          purchaseId: payload?.purchase_id,
          amount: payload?.purchase?.price?.value || payload?.amount,
          currency: payload?.purchase?.price?.currency_code || "USD",
          date: (/* @__PURE__ */ new Date()).toISOString()
        })
      });
    }
    await upsertWhitelist(email, "pagado", 30);
    console.log(`[Hotmart] Nuevo usuario creado: ${email} \u2192 rol=${role}, plan=${plan}`);
    return { success: true, userId, created: true, role, plan, isPriority };
  }
}
async function processSubscriptionChargeSuccess(email, payload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existingUsers = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.email, email));
  if (!existingUsers || existingUsers.length === 0) {
    return processPurchaseApproved(email, { ...payload, subscription_id: true });
  }
  const userId = existingUsers[0].id;
  await db.update(users).set({
    isActive: "active",
    updatedAt: /* @__PURE__ */ new Date()
  }).where((0, import_drizzle_orm7.eq)(users.id, userId));
  await db.insert(auditLog).values({
    userId,
    action: "subscription_charge_success",
    details: JSON.stringify({
      email,
      chargeId: payload?.charge_id,
      amount: payload?.purchase?.price?.value || payload?.amount,
      date: (/* @__PURE__ */ new Date()).toISOString()
    })
  });
  await upsertWhitelist(email, "pagado", 30);
  console.log(`[Hotmart] Suscripci\xF3n renovada: ${email}`);
  return { success: true, userId };
}
async function processSubscriptionCancellation(email, payload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existingUsers = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.email, email));
  if (!existingUsers || existingUsers.length === 0) {
    console.warn(`[Hotmart] Usuario no encontrado para cancelaci\xF3n: ${email}`);
    return { success: false, error: "User not found" };
  }
  const userId = existingUsers[0].id;
  await db.update(users).set({
    isActive: "inactive",
    updatedAt: /* @__PURE__ */ new Date()
  }).where((0, import_drizzle_orm7.eq)(users.id, userId));
  await db.insert(auditLog).values({
    userId,
    action: "subscription_cancellation",
    details: JSON.stringify({
      email,
      subscriptionId: payload?.subscription_id,
      date: (/* @__PURE__ */ new Date()).toISOString()
    })
  });
  await expireWhitelist(email);
  console.log(`[Hotmart] Suscripci\xF3n cancelada: ${email}`);
  return { success: true, userId };
}
async function processChargeRefund(email, payload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existingUsers = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.email, email));
  if (!existingUsers || existingUsers.length === 0) {
    console.warn(`[Hotmart] Usuario no encontrado para reembolso: ${email}`);
    return { success: false, error: "User not found" };
  }
  const userId = existingUsers[0].id;
  await db.update(users).set({
    isActive: "inactive",
    updatedAt: /* @__PURE__ */ new Date()
  }).where((0, import_drizzle_orm7.eq)(users.id, userId));
  await db.insert(auditLog).values({
    userId,
    action: "charge_refund",
    details: JSON.stringify({
      email,
      chargeId: payload?.charge_id,
      refundAmount: payload?.refund_amount,
      date: (/* @__PURE__ */ new Date()).toISOString()
    })
  });
  await expireWhitelist(email);
  console.log(`[Hotmart] Reembolso procesado: ${email}`);
  return { success: true, userId };
}

// server/webhooks.ts
var router2 = (0, import_express.Router)();
var HOTMART_WEBHOOK_SECRET = process.env.HOTMART_WEBHOOK_SECRET || "";
var HOTMART_HOTTOK = process.env.HOTMART_HOTTOK || "";
function validateHotmartHottok(req) {
  if (!HOTMART_HOTTOK) {
    console.error("[Webhook] \u274C HOTMART_HOTTOK no configurado \u2014 RECHAZANDO solicitud");
    return false;
  }
  const configuredHottok = HOTMART_HOTTOK.trim();
  console.log("[Webhook] \u{1F50D} === DIAGN\xD3STICO DE HOTTOK ===");
  console.log("[Webhook] \u{1F511} Hottok configurado (primeros 15 chars):", configuredHottok.substring(0, 15) + "...");
  console.log("[Webhook] \u{1F511} Hottok configurado (longitud):", configuredHottok.length);
  console.log("[Webhook] \u{1F4CB} Headers recibidos:");
  const relevantHeaders = [
    "x-hotmart-hottok",
    "hottok",
    "x-hotmart-token",
    "authorization",
    "content-type",
    "x-hotmart-signature"
  ];
  for (const headerName of relevantHeaders) {
    const value = req.headers[headerName];
    if (value) {
      const strValue = String(value);
      console.log(`[Webhook]   \u2192 ${headerName}: "${strValue.substring(0, 20)}..." (longitud: ${strValue.length})`);
    } else {
      console.log(`[Webhook]   \u2192 ${headerName}: (no presente)`);
    }
  }
  for (const [key, value] of Object.entries(req.headers)) {
    if (key.startsWith("x-hotmart") && !relevantHeaders.includes(key)) {
      console.log(`[Webhook]   \u2192 ${key}: "${String(value).substring(0, 20)}..." (extra)`);
    }
  }
  const candidates = [];
  if (req.headers["x-hotmart-hottok"]) {
    candidates.push({ source: "header x-hotmart-hottok", value: String(req.headers["x-hotmart-hottok"]) });
  }
  if (req.headers["hottok"]) {
    candidates.push({ source: "header hottok", value: String(req.headers["hottok"]) });
  }
  if (req.headers["x-hotmart-token"]) {
    candidates.push({ source: "header x-hotmart-token", value: String(req.headers["x-hotmart-token"]) });
  }
  if (req.headers["authorization"]) {
    candidates.push({ source: "header authorization", value: String(req.headers["authorization"]) });
  }
  if (req.body?.hottok) {
    candidates.push({ source: "body hottok", value: String(req.body.hottok) });
  }
  if (req.body?.data?.hottok) {
    candidates.push({ source: "body data.hottok", value: String(req.body.data.hottok) });
  }
  if (req.query?.hottok) {
    candidates.push({ source: "query hottok", value: String(req.query.hottok) });
  }
  console.log(`[Webhook] \u{1F4E6} Candidatos encontrados: ${candidates.length}`);
  for (const candidate of candidates) {
    let cleanToken = candidate.value.trim();
    if (cleanToken.toLowerCase().startsWith("bearer ")) {
      cleanToken = cleanToken.substring(7).trim();
    }
    cleanToken = cleanToken.replace(/^["']|["']$/g, "").trim();
    cleanToken = cleanToken.replace(/[\r\n\t\x00-\x1f]/g, "").trim();
    console.log(`[Webhook] \u{1F504} Comparando desde [${candidate.source}]:`);
    console.log(`[Webhook]   \u2192 Token recibido (limpio): "${cleanToken.substring(0, 20)}..." (longitud: ${cleanToken.length})`);
    console.log(`[Webhook]   \u2192 Token esperado:          "${configuredHottok.substring(0, 20)}..." (longitud: ${configuredHottok.length})`);
    if (cleanToken === configuredHottok) {
      console.log(`[Webhook] \u2705 Hottok V\xC1LIDO (coincidencia exacta desde ${candidate.source})`);
      return true;
    }
    if (cleanToken.toLowerCase() === configuredHottok.toLowerCase()) {
      console.log(`[Webhook] \u2705 Hottok V\xC1LIDO (coincidencia case-insensitive desde ${candidate.source})`);
      return true;
    }
    const cleanTokenNoSpaces = cleanToken.replace(/\s/g, "");
    const configuredNoSpaces = configuredHottok.replace(/\s/g, "");
    if (cleanTokenNoSpaces === configuredNoSpaces) {
      console.log(`[Webhook] \u2705 Hottok V\xC1LIDO (coincidencia sin espacios desde ${candidate.source})`);
      return true;
    }
    console.log(`[Webhook] \u274C No coincide desde ${candidate.source}`);
  }
  if (candidates.length === 0) {
    console.error("[Webhook] \u274C No se encontr\xF3 NING\xDAN Hottok en la solicitud");
    console.error("[Webhook] \u{1F4A1} Hotmart debe enviar el header X-HOTMART-HOTTOK");
  } else {
    console.error("[Webhook] \u274C Ning\xFAn candidato coincide con el Hottok configurado");
    console.error("[Webhook] \u{1F4A1} Verifica que el Hottok en Hotmart sea exactamente igual al configurado en HOTMART_HOTTOK");
  }
  console.log("[Webhook] \u{1F50D} === FIN DIAGN\xD3STICO ===");
  return false;
}
function validateHotmartSignature(payload, signature) {
  if (!HOTMART_WEBHOOK_SECRET) {
    console.warn("[Webhook] \u26A0\uFE0F HMAC secret no configurado \u2014 omitiendo validaci\xF3n de firma");
    return true;
  }
  if (!signature) {
    console.warn("[Webhook] \u26A0\uFE0F No se recibi\xF3 firma HMAC \u2014 omitiendo validaci\xF3n");
    return true;
  }
  try {
    const hmac = (0, import_crypto2.createHmac)("sha256", HOTMART_WEBHOOK_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");
    const isValid = expectedSignature === signature;
    if (!isValid) {
      console.error("[Webhook] \u274C Firma HMAC no coincide");
      console.log("[Webhook]   \u2192 Firma recibida:", signature.substring(0, 20) + "...");
      console.log("[Webhook]   \u2192 Firma esperada:", expectedSignature.substring(0, 20) + "...");
    }
    return isValid;
  } catch (error) {
    console.error("[Webhook] Error validando firma:", error);
    return false;
  }
}
router2.post("/hotmart", async (req, res) => {
  try {
    console.log("\n[Webhook] \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    console.log("[Webhook] \u{1F4E8} Nueva solicitud recibida:", (/* @__PURE__ */ new Date()).toISOString());
    console.log("[Webhook] \u{1F4E6} Content-Type:", req.headers["content-type"]);
    console.log("[Webhook] \u{1F4E6} Body keys:", Object.keys(req.body || {}).join(", "));
    const hottokValid = validateHotmartHottok(req);
    if (!hottokValid) {
      console.error("[Webhook] \u274C ACCESO DENEGADO: Hottok inv\xE1lido o no presente");
      return res.status(403).json({
        error: "Forbidden",
        message: "Invalid or missing Hotmart authentication token",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    console.log("[Webhook] \u2705 Hottok v\xE1lido - procesando solicitud");
    const signature = req.headers["x-hotmart-signature"];
    const rawPayload = JSON.stringify(req.body);
    const signatureValid = validateHotmartSignature(rawPayload, signature);
    if (!signatureValid) {
      console.warn("[Webhook] \u26A0\uFE0F Firma HMAC no coincide, pero se acepta la solicitud (modo tolerante 200 OK)");
    }
    const payload = req.body;
    const eventType = payload.event;
    const email = payload.data?.buyer?.email || payload.data?.email || payload.data?.subscriber?.email || payload.data?.customer?.email || payload.buyer?.email || payload.email;
    if (!eventType || !email) {
      console.warn("[Webhook] \u26A0\uFE0F Faltan campos requeridos:", { eventType, email });
      return res.status(200).json({
        success: true,
        warning: "Missing event or email, but returning 200 OK"
      });
    }
    console.log("[Webhook] \u{1F4CB} Procesando evento:", {
      eventType,
      email,
      productName: payload.data?.product?.name || "N/A"
    });
    await saveWebhookEvent(eventType, email, payload);
    try {
      let result;
      switch (eventType) {
        case "PURCHASE_APPROVED":
          console.log("[Webhook] \u2192 Procesando PURCHASE_APPROVED (crear/actualizar usuario)");
          result = await processPurchaseApproved(email, payload.data || payload);
          console.log("[Webhook] \u2192 Resultado:", {
            created: result.created,
            role: result.role,
            plan: result.plan
          });
          break;
        case "subscription_charge_success":
          console.log("[Webhook] \u2192 Procesando subscription_charge_success");
          result = await processSubscriptionChargeSuccess(email, payload.data || payload);
          break;
        case "subscription_cancellation":
          console.log("[Webhook] \u2192 Procesando subscription_cancellation");
          result = await processSubscriptionCancellation(email, payload.data || payload);
          break;
        case "charge_refund":
          console.log("[Webhook] \u2192 Procesando charge_refund");
          result = await processChargeRefund(email, payload.data || payload);
          break;
        case "SWITCH_PLAN":
          console.log("[Webhook] \u2192 Procesando SWITCH_PLAN");
          result = await processPurchaseApproved(email, payload.data || payload);
          break;
        default:
          console.log(`[Webhook] \u2192 Evento no manejado: ${eventType}`);
          result = { success: true, message: "Event type not handled" };
      }
      const webhooks = await getUnprocessedWebhooks();
      const webhook = webhooks.find(
        (w) => w.email === email && w.eventType === eventType
      );
      if (webhook) {
        await markWebhookAsProcessed(webhook.id);
      }
      console.log("[Webhook] \u2705 Evento procesado exitosamente:", eventType);
      console.log("[Webhook] \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n");
      return res.status(200).json({
        success: true,
        message: `Event ${eventType} processed successfully`,
        result
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Webhook] \u274C Error procesando ${eventType}:`, errorMessage);
      const webhooks = await getUnprocessedWebhooks();
      const webhook = webhooks.find(
        (w) => w.email === email && w.eventType === eventType
      );
      if (webhook) {
        await markWebhookAsProcessed(webhook.id, errorMessage);
      }
      return res.status(200).json({
        success: false,
        error: errorMessage,
        message: "Event received but processing failed"
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Webhook] \u274C Error general:", errorMessage);
    return res.status(500).json({
      error: "Internal server error",
      message: errorMessage
    });
  }
});
router2.get("/hotmart/status", (_req, res) => {
  const hasSecret = !!HOTMART_WEBHOOK_SECRET;
  const hasHottok = !!HOTMART_HOTTOK;
  return res.status(200).json({
    status: "ok",
    webhookConfigured: hasSecret || hasHottok,
    hmacConfigured: hasSecret,
    hottokConfigured: hasHottok,
    hottokLength: hasHottok ? HOTMART_HOTTOK.trim().length : 0,
    hottokPreview: hasHottok ? HOTMART_HOTTOK.trim().substring(0, 10) + "..." : "N/A",
    expectedHeader: "X-HOTMART-HOTTOK",
    supportedEvents: [
      "PURCHASE_APPROVED",
      "subscription_charge_success",
      "subscription_cancellation",
      "charge_refund"
    ],
    roleMapping: {
      description: "El rol se asigna seg\xFAn el nombre del producto de Hotmart",
      admin: "Productos con 'admin', 'administrador', 'premium' o 'completo' en el nombre",
      user: "Todos los dem\xE1s productos (rol Sastre)"
    },
    planMapping: {
      vip: "Suscripciones recurrentes",
      lifetime: "Pagos \xFAnicos"
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router2.post("/hotmart/test", (req, res) => {
  console.log("\n[Webhook Test] \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  console.log("[Webhook Test] \u{1F4E8} Solicitud de prueba recibida:", (/* @__PURE__ */ new Date()).toISOString());
  console.log("[Webhook Test] \u{1F4CB} Todos los headers:");
  for (const [key, value] of Object.entries(req.headers)) {
    console.log(`[Webhook Test]   \u2192 ${key}: ${String(value).substring(0, 50)}`);
  }
  console.log("[Webhook Test] \u{1F4E6} Body:", JSON.stringify(req.body, null, 2).substring(0, 500));
  console.log("[Webhook Test] \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n");
  return res.status(200).json({
    success: true,
    message: "Test endpoint - Revisa los logs del servidor para ver los headers y body recibidos",
    receivedHeaders: {
      "x-hotmart-hottok": req.headers["x-hotmart-hottok"] ? "presente" : "ausente",
      "hottok": req.headers["hottok"] ? "presente" : "ausente",
      "x-hotmart-token": req.headers["x-hotmart-token"] ? "presente" : "ausente",
      "authorization": req.headers["authorization"] ? "presente" : "ausente",
      "x-hotmart-signature": req.headers["x-hotmart-signature"] ? "presente" : "ausente"
    },
    bodyHasHottok: !!req.body?.hottok,
    bodyKeys: Object.keys(req.body || {})
  });
});
router2.post("/trial", async (req, res) => {
  try {
    console.log("\n[Webhook Trial] \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    console.log("[Webhook Trial] \u{1F4E8} Solicitud de prueba recibida:", (/* @__PURE__ */ new Date()).toISOString());
    console.log("[Webhook Trial] \u{1F4E6} Body:", JSON.stringify(req.body));
    const email = req.body?.email || req.body?.data?.email || req.body?.fields?.email || req.body?.Email || req.body?.correo;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      console.error("[Webhook Trial] \u274C Email inv\xE1lido o no proporcionado:", email);
      return res.status(400).json({
        success: false,
        error: "Se requiere un email v\xE1lido",
        expectedFormat: '{ "email": "usuario@ejemplo.com" }'
      });
    }
    const emailLower = email.toLowerCase().trim();
    const nombre = req.body?.nombre || req.body?.name || req.body?.fields?.nombre || email.split("@")[0];
    console.log(`[Webhook Trial] \u{1F4DD} Procesando solicitud de prueba para: ${emailLower}`);
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { emailsAutorizados: emailsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq9 } = await import("drizzle-orm");
    const db = await getDb2();
    if (!db) {
      console.error("[Webhook Trial] \u274C No se pudo conectar a la base de datos");
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor"
      });
    }
    const ahora = /* @__PURE__ */ new Date();
    const expiresAt = new Date(ahora.getTime() + 2 * 24 * 60 * 60 * 1e3);
    const existing = await db.select().from(emailsTable).where(eq9(emailsTable.email, emailLower));
    if (existing.length > 0) {
      const registro = existing[0];
      if (registro.status === "pagado") {
        console.log(`[Webhook Trial] \u2139\uFE0F ${emailLower} ya tiene membres\xEDa pagada, no se modifica`);
        return res.status(200).json({
          success: true,
          message: "El usuario ya tiene una membres\xEDa activa",
          email: emailLower,
          status: "pagado"
        });
      }
      const currentExpires = registro.expiresAt ? new Date(registro.expiresAt) : ahora;
      const baseDate = currentExpires > ahora ? currentExpires : ahora;
      const newExpires = new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1e3);
      await db.update(emailsTable).set({
        status: "prueba",
        expiresAt: newExpires
      }).where(eq9(emailsTable.email, emailLower));
      console.log(`[Webhook Trial] \u2705 Prueba extendida: ${emailLower} \u2192 expiresAt=${newExpires.toISOString()}`);
      return res.status(200).json({
        success: true,
        message: "Prueba de 48 horas activada (extendida)",
        email: emailLower,
        nombre,
        status: "prueba",
        expiresAt: newExpires.toISOString()
      });
    }
    await db.insert(emailsTable).values({
      email: emailLower,
      nombre: String(nombre).substring(0, 100),
      plan: "basic",
      status: "prueba",
      expiresAt
    });
    console.log(`[Webhook Trial] \u2705 Prueba creada: ${emailLower} \u2192 expiresAt=${expiresAt.toISOString()}`);
    console.log("[Webhook Trial] \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n");
    return res.status(200).json({
      success: true,
      message: "Prueba de 48 horas activada exitosamente",
      email: emailLower,
      nombre,
      status: "prueba",
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Webhook Trial] \u274C Error:", errorMessage);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: errorMessage
    });
  }
});
router2.get("/trial/status", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    endpoint: "POST /api/webhooks/trial",
    description: "Webhook para activar prueba de 48 horas",
    expectedBody: {
      email: "usuario@ejemplo.com (requerido)",
      nombre: "Nombre del usuario (opcional)"
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var webhooks_default = router2;

// server/generate-recibo.ts
init_db();
init_schema();
var import_drizzle_orm8 = require("drizzle-orm");
function formatCurrency(amount) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "\u20A10.00";
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}
function setupReciboRoutes(app) {
  app.get("/api/recibo/:trabajoId", async (req, res) => {
    try {
      const trabajoId = parseInt(req.params.trabajoId);
      if (isNaN(trabajoId)) {
        res.status(400).json({ error: "ID inv\xE1lido" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Error de BD" });
        return;
      }
      const [trabajo] = await db.select().from(trabajos).where((0, import_drizzle_orm8.eq)(trabajos.id, trabajoId));
      if (!trabajo) {
        res.status(404).json({ error: "Trabajo no encontrado" });
        return;
      }
      const [cliente] = await db.select().from(clientes).where((0, import_drizzle_orm8.eq)(clientes.id, trabajo.clienteId));
      if (!cliente) {
        res.status(404).json({ error: "Cliente no encontrado" });
        return;
      }
      const precioUnitario = parseFloat(trabajo.precioUnitario || "0");
      const impuestosVal = parseFloat(trabajo.impuestos || "0");
      const variosVal = parseFloat(trabajo.varios || "0");
      const abonoInicial = parseFloat(trabajo.abonoInicial || "0");
      const cantidad = trabajo.cantidad ?? 1;
      const subtotal = precioUnitario * cantidad;
      const granTotal = subtotal + impuestosVal + variosVal;
      const saldo = granTotal - abonoInicial;
      const folio = `TC-${String(trabajo.id).padStart(5, "0")}`;
      const fecha = (/* @__PURE__ */ new Date()).toLocaleDateString("es-CR", { year: "numeric", month: "long", day: "numeric" });
      const categoriaLabels = { arreglo: "Arreglo", confeccion: "Confecci\xF3n", bordado: "Bordado", sublimado: "Sublimado", otros: "Otros" };
      const estadoLabels = { recibido: "Recibido", cortando: "Cortando", cosiendo: "Cosiendo", bordado_personalizado: "Bordado/Personalizado", listo: "Listo", entregado: "Entregado", en_espera: "En espera" };
      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo ${folio}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 30px; color: #333; line-height: 1.5; background: #f8f9fa; -webkit-user-select: none; user-select: none; }
    .recibo { max-width: 600px; margin: 0 auto; background: #fff; border: 2px solid #0a7ea4; border-radius: 12px; padding: 24px; }
    .header { text-align: center; border-bottom: 3px solid #0a7ea4; padding-bottom: 16px; margin-bottom: 20px; }
    .header h1 { color: #0a7ea4; font-size: 26px; margin-bottom: 4px; }
    .header .folio { font-size: 18px; font-weight: bold; color: #333; }
    .header .fecha { color: #687076; font-size: 13px; margin-top: 4px; }
    .section { margin-bottom: 18px; }
    .section h2 { color: #0a7ea4; font-size: 15px; margin-bottom: 8px; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; }
    .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #E5E7EB; }
    .row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #687076; font-size: 13px; }
    .value { color: #11181C; font-size: 13px; }
    .totales { margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px; }
    .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
    .total-row.final { font-size: 18px; font-weight: bold; color: #0a7ea4; border-top: 2px solid #0a7ea4; padding-top: 10px; margin-top: 6px; }
    .saldo { color: #EF4444; }
    .footer { margin-top: 24px; text-align: center; color: #687076; font-size: 11px; border-top: 1px solid #E5E7EB; padding-top: 14px; }
    .no-print { margin: 20px auto; max-width: 600px; text-align: center; }
    .btn { display: inline-block; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; margin: 4px; }
    .btn-wa { background: #25D366; color: #fff; }
    .btn-print { background: #0a7ea4; color: #fff; }
    @media print { .no-print { display: none; } body { padding: 10px; background: #fff; } .recibo { border: none; } }
  </style>
</head>
<body>
  <div class="recibo">
    <div class="header">
      <h1>Taller de Costura</h1>
      <div class="folio">Folio: ${folio}</div>
      <div class="fecha">${fecha}</div>
    </div>
    <div class="section">
      <h2>Cliente</h2>
      <div class="row"><span class="label">Nombre:</span><span class="value">${cliente.nombreCompleto}</span></div>
      <div class="row"><span class="label">Tel\xE9fono:</span><span class="value">${cliente.telefono || "N/A"}</span></div>
    </div>
    <div class="section">
      <h2>Trabajo</h2>
      <div class="row"><span class="label">Categor\xEDa:</span><span class="value">${categoriaLabels[trabajo.categoria || "otros"] || "Otros"}</span></div>
      <div class="row"><span class="label">Cantidad:</span><span class="value">${cantidad}</span></div>
      <div class="row"><span class="label">Descripci\xF3n:</span><span class="value">${trabajo.descripcion || "Sin descripci\xF3n"}</span></div>
      <div class="row"><span class="label">Estado:</span><span class="value">${estadoLabels[trabajo.estado] || trabajo.estado}</span></div>
      ${trabajo.fechaEntrega ? `<div class="row"><span class="label">Fecha entrega:</span><span class="value">${new Date(trabajo.fechaEntrega).toLocaleDateString("es-CR")}</span></div>` : ""}
    </div>
    <div class="totales">
      <div class="total-row"><span>Subtotal (unitario \xD7 cantidad):</span><span>${formatCurrency(subtotal)}</span></div>
      <div class="total-row"><span>Impuestos:</span><span>${formatCurrency(impuestosVal)}</span></div>
      <div class="total-row"><span>Varios:</span><span>${formatCurrency(variosVal)}</span></div>
      <div class="total-row final"><span>Gran Total:</span><span>${formatCurrency(granTotal)}</span></div>
      <div class="total-row"><span>Abono inicial:</span><span>-${formatCurrency(abonoInicial)}</span></div>
      <div class="total-row final"><span class="${saldo > 0 ? "saldo" : ""}">Saldo pendiente:</span><span class="${saldo > 0 ? "saldo" : ""}">${formatCurrency(saldo)}</span></div>
    </div>
    <div class="footer">
      <p>Gracias por confiar en nuestro taller</p>
      <p>Este recibo es un comprobante de los servicios acordados</p>
    </div>
  </div>
  <div class="no-print">
    <button class="btn btn-print" onclick="window.print()">Imprimir</button>
  </div>
</body>
</html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (error) {
      console.error("[Recibo] Error:", error);
      res.status(500).json({ error: "Error generando recibo" });
    }
  });
}

// server/_core/index.ts
async function startServer() {
  const app = (0, import_express2.default)();
  const server = (0, import_http.createServer)(app);
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });
  app.use((req, _res, next) => {
    console.log(`[http] ${req.method} ${req.url}`);
    next();
  });
  app.use(import_express2.default.json({ limit: "50mb" }));
  app.use(import_express2.default.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });
  app.use("/api/webhooks", webhooks_default);
  setupReciboRoutes(app);
  app.use(
    "/api/trpc",
    (0, import_express3.createExpressMiddleware)({
      router: appRouter,
      createContext
    })
  );
  const preferredPort = parseInt(process.env.PORT || "3000");
  server.listen(preferredPort, "0.0.0.0", () => {
    console.log(`[api] server listening on port ${preferredPort} on 0.0.0.0`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`[api] Port ${preferredPort} is already in use. Kill the process and try again.`);
      process.exit(1);
    }
    throw err;
  });
}
startServer().catch(console.error);
