import { eq, desc } from "drizzle-orm";
import { users, trabajos, clientes } from "../drizzle/schema";
import { getDb } from "./db";

// ============ USUARIOS ============

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .where(eq(users.id, id));

  return result[0] || null;
}

export async function updateUserStatus(id: number, isActive: "active" | "inactive") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ isActive }).where(eq(users.id, id));
}

export async function getActiveUsersCount() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: users.id })
    .from(users)
    .where(eq(users.isActive, "active"));

  return result.length;
}

// ============ ESTADÍSTICAS ============

export async function getTotalTrabajos() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: trabajos.id }).from(trabajos);
  return result.length;
}

export async function getTrabajosCountByEstado() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      estado: trabajos.estado,
      count: trabajos.id,
    })
    .from(trabajos);

  // Agrupar manualmente
  const grouped: Record<string, number> = {};
  result.forEach((item) => {
    const estado = item.estado || "unknown";
    grouped[estado] = (grouped[estado] || 0) + 1;
  });

  return Object.entries(grouped).map(([estado, count]) => ({
    estado,
    count,
  }));
}

export async function getTrabajosCountByTipo() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      tipo: trabajos.tipo,
      count: trabajos.id,
    })
    .from(trabajos);

  // Agrupar manualmente
  const grouped: Record<string, number> = {};
  result.forEach((item) => {
    const tipo = item.tipo || "unknown";
    grouped[tipo] = (grouped[tipo] || 0) + 1;
  });

  return Object.entries(grouped).map(([tipo, count]) => ({
    tipo,
    count,
  }));
}

export async function getTotalClientes() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: clientes.id }).from(clientes);
  return result.length;
}

export async function getTotalUsers() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: users.id }).from(users);
  return result.length;
}

export async function getAdminStats() {
  const [totalUsers, activeUsers, totalTrabajos, totalClientes, trabajosByEstado, trabajosByTipo] =
    await Promise.all([
      getTotalUsers(),
      getActiveUsersCount(),
      getTotalTrabajos(),
      getTotalClientes(),
      getTrabajosCountByEstado(),
      getTrabajosCountByTipo(),
    ]);

  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    totalTrabajos,
    totalClientes,
    trabajosByEstado,
    trabajosByTipo,
  };
}
