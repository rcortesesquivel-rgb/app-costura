import { eq, desc, like, and } from "drizzle-orm";
import { users, imagenes } from "../drizzle/schema";
import { getDb } from "./db";

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "rcortesesquivel@gmail.com";

// ============ VALIDACIÓN ============

export function isSuperAdmin(email: string | null | undefined): boolean {
  return email === SUPER_ADMIN_EMAIL;
}

// ============ USUARIOS ============

export async function getAllUsersWithStats() {
  const db = await getDb();
  if (!db) return [];

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      plan: users.plan,
      audioTranscriptionsThisMonth: users.audioTranscriptionsThisMonth,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .where(eq(users.role, "user"))
    .orderBy(desc(users.createdAt));

  return allUsers;
}

export async function searchUsers(query: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      plan: users.plan,
      audioTranscriptionsThisMonth: users.audioTranscriptionsThisMonth,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .where(
      and(
        eq(users.role, "user"),
        like(users.email, `%${query}%`)
      )
    )
    .orderBy(desc(users.createdAt));
}

export async function updateUserPlan(userId: number, plan: "basic" | "vip" | "lifetime") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ plan }).where(eq(users.id, userId));
}

export async function updateUserStatus(userId: number, isActive: "active" | "inactive") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ isActive }).where(eq(users.id, userId));
}

export async function resetAudioTranscriptionsCounter(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      audioTranscriptionsThisMonth: 0,
      lastAudioResetDate: new Date(),
    })
    .where(eq(users.id, userId));
}

// ============ MÉTRICAS ============

export async function getTotalActiveUsers() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: users.id })
    .from(users)
    .where(and(eq(users.role, "user"), eq(users.isActive, "active")));

  return result.length;
}

export async function getTotalInactiveUsers() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: users.id })
    .from(users)
    .where(and(eq(users.role, "user"), eq(users.isActive, "inactive")));

  return result.length;
}

export async function getTotalUploadedImages() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: imagenes.id }).from(imagenes);
  return result.length;
}

export async function getTotalAudioTranscriptionsThisMonth() {
  const db = await getDb();
  if (!db) return 0;

  const allUsers = await db.select({ count: users.audioTranscriptionsThisMonth }).from(users);
  return allUsers.reduce((sum, u) => sum + (u.count || 0), 0);
}

export async function getUsersCountByPlan() {
  const db = await getDb();
  if (!db) return { basic: 0, vip: 0, lifetime: 0 };

  const basic = await db
    .select({ count: users.id })
    .from(users)
    .where(and(eq(users.role, "user"), eq(users.plan, "basic")));

  const vip = await db
    .select({ count: users.id })
    .from(users)
    .where(and(eq(users.role, "user"), eq(users.plan, "vip")));

  const lifetime = await db
    .select({ count: users.id })
    .from(users)
    .where(and(eq(users.role, "user"), eq(users.plan, "lifetime")));

  return {
    basic: basic.length,
    vip: vip.length,
    lifetime: lifetime.length,
  };
}

export async function getSuperAdminMetrics() {
  const [activeUsers, inactiveUsers, totalImages, totalAudio, planCounts] = await Promise.all([
    getTotalActiveUsers(),
    getTotalInactiveUsers(),
    getTotalUploadedImages(),
    getTotalAudioTranscriptionsThisMonth(),
    getUsersCountByPlan(),
  ]);

  const totalRevenue = (planCounts.basic * 12) + (planCounts.vip * 14) + (planCounts.lifetime * 49.99);
  const recentPayments = [
    { email: "usuario1@example.com", amount: 12, plan: "basic", date: new Date() },
    { email: "usuario2@example.com", amount: 14, plan: "vip", date: new Date() },
    { email: "usuario3@example.com", amount: 49.99, plan: "lifetime", date: new Date() },
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
    recentPayments,
  };
}

// ============ VALIDACIÓN DE LÍMITES ============

export async function canUserRecordAudio(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const user = await db
    .select({
      plan: users.plan,
      audioTranscriptionsThisMonth: users.audioTranscriptionsThisMonth,
      lastAudioResetDate: users.lastAudioResetDate,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user[0]) return false;

  const u = user[0];

  // Usuarios con plan basic y vip no tienen límite
  if (u.plan === "basic" || u.plan === "vip") {
    return true;
  }

  // Usuarios con plan lifetime tienen límite de 20 transcripciones
  if (u.plan === "lifetime") {
    // Verificar si es un nuevo mes
    const lastReset = new Date(u.lastAudioResetDate);
    const now = new Date();
    const isNewMonth =
      lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear();

    if (isNewMonth) {
      // Resetear contador
      await resetAudioTranscriptionsCounter(userId);
      return true;
    }

    // Verificar si ha alcanzado el límite
    return (u.audioTranscriptionsThisMonth || 0) < 20;
  }

  return false;
}

export async function incrementAudioTranscriptionCount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await db
    .select({
      audioTranscriptionsThisMonth: users.audioTranscriptionsThisMonth,
      lastAudioResetDate: users.lastAudioResetDate,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user[0]) throw new Error("User not found");

  const u = user[0];

  // Verificar si es un nuevo mes
  const lastReset = new Date(u.lastAudioResetDate);
  const now = new Date();
  const isNewMonth =
    lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear();

  if (isNewMonth) {
    // Resetear y establecer a 1
    await db
      .update(users)
      .set({
        audioTranscriptionsThisMonth: 1,
        lastAudioResetDate: now,
      })
      .where(eq(users.id, userId));
  } else {
    // Incrementar
    await db
      .update(users)
      .set({
        audioTranscriptionsThisMonth: (u.audioTranscriptionsThisMonth || 0) + 1,
      })
      .where(eq(users.id, userId));
  }
}
