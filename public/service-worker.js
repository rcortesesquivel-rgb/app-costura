/**
 * Service Worker para Taller de Costura PWA
 * Proporciona caché, sincronización en background y funcionalidad offline
 */

const CACHE_NAME = "taller-costura-v1";
const RUNTIME_CACHE = "taller-costura-runtime";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/images/icon.png",
  "/assets/images/splash-icon.png",
  "/assets/images/favicon.png",
];

// ============ INSTALACIÓN ============

self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn("[Service Worker] Failed to cache some assets:", error);
        // No fallar la instalación si algunos assets no se pueden cachear
        return Promise.resolve();
      });
    })
  );

  // Activar inmediatamente sin esperar a que se cierre la pestaña anterior
  self.skipWaiting();
});

// ============ ACTIVACIÓN ============

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar cachés antiguas
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Tomar control de todos los clientes
  self.clients.claim();
});

// ============ FETCH ============

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No cachear peticiones a API tRPC
  if (url.pathname.startsWith("/api/trpc")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // No cachear peticiones a webhooks
  if (url.pathname.startsWith("/api/webhooks")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Estrategia: Cache first, fallback to network
  if (request.method === "GET") {
    event.respondWith(cacheFirst(request));
  } else {
    // Para POST, PUT, DELETE: Network first
    event.respondWith(networkFirst(request));
  }
});

// ============ ESTRATEGIAS DE CACHÉ ============

/**
 * Cache First: Intenta usar caché primero, si falla usa network
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    // Cachear respuestas exitosas
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn("[Service Worker] Fetch failed:", error);

    // Retornar respuesta en caché si existe
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Retornar página offline si es una navegación
    if (request.mode === "navigate") {
      return caches.match("/index.html");
    }

    // Retornar error genérico
    return new Response("Offline - Resource not available", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Network First: Intenta network primero, fallback a caché
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // Cachear respuestas exitosas
    if (response.ok && request.method === "GET") {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn("[Service Worker] Network request failed:", error);

    // Intentar usar caché
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Retornar error offline
    return new Response("Offline - Network unavailable", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// ============ SINCRONIZACIÓN EN BACKGROUND ============

self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag);

  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    console.log("[Service Worker] Syncing data...");
    // Aquí se pueden sincronizar datos pendientes con el servidor
    // Por ejemplo, trabajos pendientes de enviar, etc.
  } catch (error) {
    console.error("[Service Worker] Sync failed:", error);
    throw error; // Reintentar sincronización
  }
}

// ============ PUSH NOTIFICATIONS ============

self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push notification received");

  const data = event.data?.json() || {};
  const options = {
    body: data.body || "Nueva notificación",
    icon: "/assets/images/icon.png",
    badge: "/assets/images/icon.png",
    tag: data.tag || "default",
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Taller de Costura", options)
  );
});

// ============ CLICK EN NOTIFICACIONES ============

self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked");

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Buscar si ya hay una ventana abierta
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }

      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============ MENSAJE DESDE CLIENTE ============

self.addEventListener("message", (event) => {
  console.log("[Service Worker] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches.delete(RUNTIME_CACHE);
  }
});

console.log("[Service Worker] Loaded and ready");
