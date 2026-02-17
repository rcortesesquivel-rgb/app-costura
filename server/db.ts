import { eq, desc, like, or, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  clientes, 
  medidas, 
  trabajos, 
  agregados, 
  imagenes,
  historialEstados,
  InsertCliente,
  InsertMedida,
  InsertTrabajo,
  InsertAgregado,
  InsertImagen,
  InsertHistorialEstado
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ CLIENTES ============

export async function getAllClientes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(clientes).where(eq(clientes.userId, userId)).orderBy(desc(clientes.createdAt));
}

export async function getClienteById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(clientes).where(
    and(eq(clientes.id, id), eq(clientes.userId, userId))
  );
  return result[0] || null;
}

export async function createCliente(data: InsertCliente) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(clientes).values(data);
  return Number(result[0].insertId);
}

export async function updateCliente(id: number, userId: number, data: Partial<InsertCliente>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(clientes).set(data).where(
    and(eq(clientes.id, id), eq(clientes.userId, userId))
  );
}

export async function deleteCliente(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(clientes).where(
    and(eq(clientes.id, id), eq(clientes.userId, userId))
  );
}

export async function searchClientes(query: string, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(clientes).where(
    and(
      eq(clientes.userId, userId),
      or(
        like(clientes.nombreCompleto, `%${query}%`),
        like(clientes.telefono, `%${query}%`)
      )
    )
  );
}

// ============ MEDIDAS ============

export async function getMedidasByClienteId(clienteId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(medidas).where(
    and(eq(medidas.clienteId, clienteId), eq(medidas.userId, userId))
  );
  return result[0] || null;
}

export async function createMedidas(data: InsertMedida) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(medidas).values(data);
  return Number(result[0].insertId);
}

export async function updateMedidas(id: number, userId: number, data: Partial<InsertMedida>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(medidas).set(data).where(
    and(eq(medidas.id, id), eq(medidas.userId, userId))
  );
}

// ============ TRABAJOS ============

export async function getAllTrabajos(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(trabajos).where(eq(trabajos.userId, userId)).orderBy(desc(trabajos.createdAt));
}

export async function getTrabajoById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(trabajos).where(
    and(eq(trabajos.id, id), eq(trabajos.userId, userId))
  );
  return result[0] || null;
}

export async function getTrabajosByClienteId(clienteId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(trabajos).where(
    and(eq(trabajos.clienteId, clienteId), eq(trabajos.userId, userId))
  ).orderBy(desc(trabajos.createdAt));
}

export async function getTrabajosByEstado(estado: string, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(trabajos).where(
    and(eq(trabajos.estado, estado as any), eq(trabajos.userId, userId))
  ).orderBy(desc(trabajos.createdAt));
}

export async function getTrabajosVencenHoy(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  
  return db.select().from(trabajos).where(
    and(
      eq(trabajos.estado, "listo"),
      eq(trabajos.userId, userId)
    )
  ).orderBy(desc(trabajos.fechaEntrega));
}

export async function createTrabajo(data: InsertTrabajo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(trabajos).values(data);
  return Number(result[0].insertId);
}

export async function updateTrabajo(id: number, userId: number, data: Partial<InsertTrabajo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(trabajos).set(data).where(
    and(eq(trabajos.id, id), eq(trabajos.userId, userId))
  );
}

export async function deleteTrabajo(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(trabajos).where(
    and(eq(trabajos.id, id), eq(trabajos.userId, userId))
  );
}

export async function searchTrabajos(params: {
  query?: string;
  tipo?: string;
  estado?: string;
  clienteId?: number;
  userId: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(trabajos.userId, params.userId)];
  
  if (params.tipo) {
    conditions.push(eq(trabajos.tipo, params.tipo as any));
  }
  
  if (params.estado) {
    conditions.push(eq(trabajos.estado, params.estado as any));
  }
  
  if (params.clienteId) {
    conditions.push(eq(trabajos.clienteId, params.clienteId));
  }
  
  if (params.query) {
    conditions.push(like(trabajos.descripcion, `%${params.query}%`));
  }
  
  return db.select().from(trabajos).where(and(...conditions)).orderBy(desc(trabajos.createdAt));
}

// ============ AGREGADOS ============

export async function getAgregadosByTrabajoId(trabajoId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(agregados).where(
    and(eq(agregados.trabajoId, trabajoId), eq(agregados.userId, userId))
  );
}

export async function createAgregado(data: InsertAgregado) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(agregados).values(data);
  return Number(result[0].insertId);
}

export async function deleteAgregado(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(agregados).where(
    and(eq(agregados.id, id), eq(agregados.userId, userId))
  );
}

export async function calcularTotalTrabajo(trabajoId: number, userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, saldo: 0 };
  
  const trabajo = await getTrabajoById(trabajoId, userId);
  if (!trabajo) return { total: 0, saldo: 0 };
  
  const listaAgregados = await getAgregadosByTrabajoId(trabajoId, userId);
  
  const precioBase = parseFloat(trabajo.precioBase || "0");
  const abonoInicial = parseFloat(trabajo.abonoInicial || "0");
  const totalAgregados = listaAgregados.reduce((sum, ag) => sum + parseFloat(ag.precio || "0"), 0);
  
  const total = precioBase + totalAgregados;
  const saldo = total - abonoInicial;
  
  return { total, saldo, precioBase, totalAgregados, abonoInicial };
}

// ============ IMÁGENES ============

export async function getImagenesByTrabajoId(trabajoId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(imagenes).where(
    and(eq(imagenes.trabajoId, trabajoId), eq(imagenes.userId, userId))
  );
}

export async function createImagen(data: InsertImagen) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(imagenes).values(data);
  return Number(result[0].insertId);
}

export async function deleteImagen(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(imagenes).where(
    and(eq(imagenes.id, id), eq(imagenes.userId, userId))
  );
}

// ============ HISTORIAL DE ESTADOS ============

export async function getHistorialByTrabajoId(trabajoId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(historialEstados).where(
    and(eq(historialEstados.trabajoId, trabajoId), eq(historialEstados.userId, userId))
  ).orderBy(desc(historialEstados.createdAt));
}

export async function createHistorialEstado(data: InsertHistorialEstado) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(historialEstados).values(data);
  return Number(result[0].insertId);
}
