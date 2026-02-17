import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isActive: mysqlEnum("isActive", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Clientes del taller
export const clientes = mysqlTable("clientes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Foreign key to users table
  nombreCompleto: varchar("nombreCompleto", { length: 255 }).notNull(),
  telefono: varchar("telefono", { length: 20 }),
  direccion: text("direccion"),
  redesSociales: text("redesSociales"), // JSON string: {instagram: "", facebook: ""}
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Medidas de clientes
export const medidas = mysqlTable("medidas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Foreign key to users table
  clienteId: int("clienteId").notNull(),
  cuello: varchar("cuello", { length: 10 }),
  hombros: varchar("hombros", { length: 10 }),
  pecho: varchar("pecho", { length: 10 }),
  cintura: varchar("cintura", { length: 10 }),
  cadera: varchar("cadera", { length: 10 }),
  largoManga: varchar("largoManga", { length: 10 }),
  largoEspalda: varchar("largoEspalda", { length: 10 }),
  largoPantalon: varchar("largoPantalon", { length: 10 }),
  entrepierna: varchar("entrepierna", { length: 10 }),
  contornoBrazo: varchar("contornoBrazo", { length: 10 }),
  anchoPecho: varchar("anchoPecho", { length: 10 }),
  anchoEspalda: varchar("anchoEspalda", { length: 10 }),
  notas: text("notas"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Trabajos/Pedidos
export const trabajos = mysqlTable("trabajos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Foreign key to users table
  clienteId: int("clienteId").notNull(),
  tipo: mysqlEnum("tipo", ["arreglo", "confeccion", "personalizacion"]).notNull(),
  
  // Campos comunes
  descripcion: text("descripcion").notNull(),
  precioBase: varchar("precioBase", { length: 20 }).notNull(),
  abonoInicial: varchar("abonoInicial", { length: 20 }).default("0").notNull(),
  
  // Campos específicos para Arreglos
  tipoPrenda: varchar("tipoPrenda", { length: 100 }),
  nivelUrgencia: mysqlEnum("nivelUrgencia", ["baja", "media", "alta"]),
  
  // Campos específicos para Confección
  tipoTela: varchar("tipoTela", { length: 100 }),
  metrosRequeridos: varchar("metrosRequeridos", { length: 10 }),
  fechaPrueba: timestamp("fechaPrueba"),
  
  // Campos específicos para Personalización
  tipoPersonalizacion: varchar("tipoPersonalizacion", { length: 100 }), // bordado, aplicación, etc.
  
  // Estado del trabajo
  estado: mysqlEnum("estado", ["en_espera", "cortando", "cosiendo", "listo", "entregado"]).default("en_espera").notNull(),
  
  // Fechas
  fechaEntrega: timestamp("fechaEntrega"),
  fechaEntregado: timestamp("fechaEntregado"),
  
  // Notas de voz transcritas
  notasVoz: text("notasVoz"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Agregados de trabajos (lista dinámica)
export const agregados = mysqlTable("agregados", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Foreign key to users table
  trabajoId: int("trabajoId").notNull(),
  concepto: varchar("concepto", { length: 255 }).notNull(),
  precio: varchar("precio", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Imágenes adjuntas a trabajos
export const imagenes = mysqlTable("imagenes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Foreign key to users table
  trabajoId: int("trabajoId").notNull(),
  url: text("url").notNull(),
  tipo: varchar("tipo", { length: 50 }), // referencia, boceto, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Historial de cambios de estado
export const historialEstados = mysqlTable("historialEstados", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Foreign key to users table
  trabajoId: int("trabajoId").notNull(),
  estadoAnterior: varchar("estadoAnterior", { length: 50 }),
  estadoNuevo: varchar("estadoNuevo", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Export types
export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;
export type Medida = typeof medidas.$inferSelect;
export type InsertMedida = typeof medidas.$inferInsert;
export type Trabajo = typeof trabajos.$inferSelect;
export type InsertTrabajo = typeof trabajos.$inferInsert;
export type Agregado = typeof agregados.$inferSelect;
export type InsertAgregado = typeof agregados.$inferInsert;
export type Imagen = typeof imagenes.$inferSelect;
export type InsertImagen = typeof imagenes.$inferInsert;
export type HistorialEstado = typeof historialEstados.$inferSelect;
export type InsertHistorialEstado = typeof historialEstados.$inferInsert;
