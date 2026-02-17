/**
 * Servicio de notificaciones push para PWA
 * Maneja suscripción, envío y recepción de notificaciones
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.log("[Push] Notifications not supported");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export async function subscribeToPushNotifications(): Promise<boolean> {
  try {
    // Verificar soporte
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("[Push] Push notifications not supported");
      return false;
    }

    // Obtener permiso
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      console.log("[Push] Notification permission denied");
      return false;
    }

    // Obtener service worker
    const registration = await navigator.serviceWorker.ready;

    // Verificar si ya está suscrito
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log("[Push] Already subscribed");
      return true;
    }

    // Crear suscripción
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY || ""
      ),
    });

    console.log("[Push] Subscribed successfully");

    // Enviar suscripción al servidor
    await sendSubscriptionToServer(subscription);

    return true;
  } catch (error) {
    console.error("[Push] Subscription error:", error);
    return false;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    if (!("serviceWorker" in navigator)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return true;
    }

    // Notificar al servidor
    if (subscription.endpoint) {
      await fetch("/api/trpc/notifications.unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });
    }

    // Desuscribir
    await subscription.unsubscribe();
    console.log("[Push] Unsubscribed successfully");

    return true;
  } catch (error) {
    console.error("[Push] Unsubscription error:", error);
    return false;
  }
}

async function sendSubscriptionToServer(
  subscription: PushSubscription
): Promise<void> {
  // Obtener claves de forma segura
  const getKeyAsBase64 = (keyName: "auth" | "p256dh"): string => {
    try {
      const key = subscription.getKey(keyName);
      if (!key) return "";
      // @ts-ignore - ArrayBufferLike compatibility issue
      const arr = Array.from(new Uint8Array(key as any));
      let binary = "";
      for (let i = 0; i < arr.length; i++) {
        binary += String.fromCharCode(arr[i]);
      }
      return btoa(binary);
    } catch {
      return "";
    }
  };

  const response = await fetch("/api/trpc/notifications.subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        auth: getKeyAsBase64("auth"),
        p256dh: getKeyAsBase64("p256dh"),
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send subscription to server");
  }
}

function urlBase64ToUint8Array(base64String: string): any {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  // @ts-ignore - Uint8Array type compatibility
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if ("Notification" in window && Notification.permission === "granted") {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  }
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

export async function checkNotificationSupport(): Promise<boolean> {
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}
