import { eq, and } from "drizzle-orm";
import {
  pushSubscriptions,
  notifications,
  notificationPreferences,
  users,
} from "../drizzle/schema";
import { getDb } from "./db";

// ============ SUSCRIPCIONES PUSH ============

export async function savePushSubscription(
  userId: number,
  subscription: PushSubscriptionJSON,
  userAgent?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar si ya existe
  const existing = await db
    .select()
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, subscription.endpoint)
      )
    );

  if (existing.length > 0) {
    // Actualizar si ya existe
    await db
      .update(pushSubscriptions)
      .set({
        auth: subscription.keys.auth,
        p256dh: subscription.keys.p256dh,
        userAgent,
        isActive: 1,
        updatedAt: new Date(),
      })
      .where(eq(pushSubscriptions.id, existing[0].id));
  } else {
    // Crear nueva suscripción
    await db.insert(pushSubscriptions).values({
      userId,
      endpoint: subscription.endpoint,
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
      userAgent,
      isActive: 1,
    });
  }
}

export async function getPushSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.isActive, 1)
      )
    );
}

export async function removePushSubscription(
  userId: number,
  endpoint: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(pushSubscriptions)
    .set({ isActive: 0 })
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    );
}

// ============ NOTIFICACIONES ============

export async function createNotification(
  userId: number,
  type: string,
  title: string,
  body: string,
  data?: any,
  trabajoId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values({
    userId,
    trabajoId,
    type,
    title,
    body,
    data: data ? JSON.stringify(data) : null,
    sent: 0,
  });

  return result;
}

export async function getNotifications(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .limit(limit);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({
      read: 1,
      readAt: new Date(),
    })
    .where(eq(notifications.id, notificationId));
}

export async function markNotificationAsSent(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({
      sent: 1,
      sentAt: new Date(),
    })
    .where(eq(notifications.id, notificationId));
}

export async function getUnsentNotifications() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.sent, 0));
}

// ============ PREFERENCIAS DE NOTIFICACIONES ============

export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const prefs = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));

  return prefs.length > 0 ? prefs[0] : null;
}

export async function createNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(notificationPreferences).values({
    userId,
    readyForDelivery: 1,
    pendingPayment: 1,
    newClient: 1,
    systemUpdates: 1,
  });
}

export async function updateNotificationPreferences(
  userId: number,
  preferences: {
    readyForDelivery?: number;
    pendingPayment?: number;
    newClient?: number;
    systemUpdates?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notificationPreferences)
    .set(preferences)
    .where(eq(notificationPreferences.userId, userId));
}

// ============ TIPOS ============

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}
