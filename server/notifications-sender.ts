import * as notificationsDb from "./notifications-db";
import * as db from "./db";
import { eq } from "drizzle-orm";
import { trabajos } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Servicio para enviar notificaciones automáticas
 * Se ejecuta periódicamente para verificar trabajos y enviar notificaciones
 */

export async function checkAndSendNotifications() {
  try {
    console.log("[Notifications] Checking for pending notifications...");

    // Obtener notificaciones no enviadas
    const unsentNotifications = await notificationsDb.getUnsentNotifications();

    for (const notification of unsentNotifications) {
      try {
        // Obtener suscripciones del usuario
        const subscriptions = await notificationsDb.getPushSubscriptions(
          notification.userId
        );

        if (subscriptions.length === 0) {
          console.log(
            `[Notifications] No subscriptions for user ${notification.userId}`
          );
          // Marcar como enviada aunque no haya suscripciones
          await notificationsDb.markNotificationAsSent(notification.id);
          continue;
        }

        // Enviar a todas las suscripciones
        for (const subscription of subscriptions) {
          try {
            await sendPushNotification(
              subscription,
              notification.title,
              notification.body,
              notification.data ? JSON.parse(notification.data) : {}
            );
          } catch (error) {
            console.error(
              `[Notifications] Failed to send to subscription ${subscription.id}:`,
              error
            );
          }
        }

        // Marcar como enviada
        await notificationsDb.markNotificationAsSent(notification.id);
        console.log(
          `[Notifications] Sent notification ${notification.id} to ${subscriptions.length} devices`
        );
      } catch (error) {
        console.error(
          `[Notifications] Error processing notification ${notification.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("[Notifications] Error in checkAndSendNotifications:", error);
  }
}

export async function notifyWorkReadyForDelivery(
  userId: number,
  trabajoId: number,
  clienteName: string
) {
  try {
    // Verificar preferencias del usuario
    const prefs = await notificationsDb.getNotificationPreferences(userId);
    if (prefs && prefs.readyForDelivery === 0) {
      console.log(
        `[Notifications] User ${userId} has disabled ready for delivery notifications`
      );
      return;
    }

    // Crear notificación
    await notificationsDb.createNotification(
      userId,
      "ready_for_delivery",
      "Trabajo Listo para Entrega",
      `El trabajo para ${clienteName} está listo para ser entregado.`,
      { trabajoId, clienteName },
      trabajoId
    );

    console.log(
      `[Notifications] Created ready for delivery notification for user ${userId}`
    );
  } catch (error) {
    console.error("[Notifications] Error in notifyWorkReadyForDelivery:", error);
  }
}

export async function notifyPendingPayment(
  userId: number,
  trabajoId: number,
  clienteName: string,
  amount: number
) {
  try {
    // Verificar preferencias del usuario
    const prefs = await notificationsDb.getNotificationPreferences(userId);
    if (prefs && prefs.pendingPayment === 0) {
      console.log(
        `[Notifications] User ${userId} has disabled pending payment notifications`
      );
      return;
    }

    // Crear notificación
    await notificationsDb.createNotification(
      userId,
      "pending_payment",
      "Pago Pendiente",
      `${clienteName} tiene un pago pendiente de $${amount.toFixed(2)} por un trabajo.`,
      { trabajoId, clienteName, amount },
      trabajoId
    );

    console.log(
      `[Notifications] Created pending payment notification for user ${userId}`
    );
  } catch (error) {
    console.error("[Notifications] Error in notifyPendingPayment:", error);
  }
}

export async function notifyNewClient(
  userId: number,
  clienteName: string,
  clienteEmail: string
) {
  try {
    // Verificar preferencias del usuario
    const prefs = await notificationsDb.getNotificationPreferences(userId);
    if (prefs && prefs.newClient === 0) {
      console.log(
        `[Notifications] User ${userId} has disabled new client notifications`
      );
      return;
    }

    // Crear notificación
    await notificationsDb.createNotification(
      userId,
      "new_client",
      "Nuevo Cliente",
      `${clienteName} (${clienteEmail}) se ha registrado como nuevo cliente.`,
      { clienteName, clienteEmail }
    );

    console.log(
      `[Notifications] Created new client notification for user ${userId}`
    );
  } catch (error) {
    console.error("[Notifications] Error in notifyNewClient:", error);
  }
}

async function sendPushNotification(
  subscription: any,
  title: string,
  body: string,
  data: any
): Promise<void> {
  try {
    // Aquí se integraría con un servicio de push como Firebase Cloud Messaging
    // o Web Push Protocol. Por ahora, solo registramos que se envió.
    console.log(`[Notifications] Would send push to ${subscription.endpoint}`);

    // En producción, aquí iría el código para enviar la notificación
    // usando web-push o similar
  } catch (error) {
    console.error("[Notifications] Error sending push notification:", error);
    throw error;
  }
}

/**
 * Inicia el servicio de notificaciones automáticas
 * Se ejecuta cada 5 minutos
 */
export function startNotificationService() {
  console.log("[Notifications] Starting notification service...");

  // Ejecutar inmediatamente
  checkAndSendNotifications();

  // Ejecutar cada 5 minutos
  setInterval(checkAndSendNotifications, 5 * 60 * 1000);

  console.log("[Notifications] Notification service started");
}
