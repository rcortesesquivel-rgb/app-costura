/**
 * Service Worker para Taller de Costura PWA
 * Proporciona caché, sincronización en background y funcionalidad offline completa
 */

const CACHE_NAME = "taller-costura-v2";
const RUNTIME_CACHE = "taller-costura-runtime-v2";
const API_CACHE = "taller-costura-api-v2";
const IMAGE_CACHE = "taller-costura-images-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/images/icon.png",
  "/assets/images/splash-icon.png",
  "/assets/images/favicon.png",
  "/service-worker.js",
];

// ============ INSTALACIÓN ============

self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn("[Service Worker] Failed to cache some assets:", error);
        return Promise.resolve();
      });
    })
  );

  self.skipWaiting();
});

// ============ ACTIVACIÓN ============

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== RUNTIME_CACHE &&
            cacheName !== API_CACHE &&
            cacheName !== IMAGE_CACHE
          ) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// ============ FETCH ============

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No cachear peticiones a webhooks
  if (url.pathname.startsWith("/api/webhooks")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cachear peticiones a API tRPC con Network First
  if (url.pathname.startsWith("/api/trpc")) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // Cachear imágenes con estrategia Cache First
  if (request.destination === "image") {
    event.respondWith(cacheFirstImages(request));
    return;
  }

  // Estrategia: Cache first para GET, Network first para otros
  if (request.method === "GET") {
    event.respondWith(cacheFirst(request));
  } else {
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

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn("[Service Worker] Fetch failed:", error);

    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    if (request.mode === "navigate") {
      return caches.match("/index.html");
    }

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

    if (response.ok && request.method === "GET") {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn("[Service Worker] Network request failed:", error);

    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    return new Response("Offline - Network unavailable", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Network First con Caché: Para API tRPC
 * Intenta network, cachea respuestas, fallback a caché si falla
 */
async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn("[Service Worker] API request failed, trying cache:", error);

    const cached = await caches.match(request);
    if (cached) {
      console.log("[Service Worker] Returning cached API response");
      return cached;
    }

    return new Response(
      JSON.stringify({
        error: "offline",
        message: "Sin conexión - Usando datos en caché",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Cache First para Imágenes: Optimizado para almacenamiento
 */
async function cacheFirstImages(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn("[Service Worker] Image fetch failed:", error);

    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#e0e0e0" width="100" height="100"/></svg>',
      {
        headers: { "Content-Type": "image/svg+xml" },
      }
    );
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
    // Sincronizar datos pendientes con el servidor
  } catch (error) {
    console.error("[Service Worker] Sync failed:", error);
    throw error;
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
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }

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
    Promise.all([
      caches.delete(RUNTIME_CACHE),
      caches.delete(API_CACHE),
      caches.delete(IMAGE_CACHE),
    ]);
  }

  if (event.data && event.data.type === "CACHE_URLS") {
    const urls = event.data.urls || [];
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.addAll(urls).catch((error) => {
        console.warn("[Service Worker] Failed to cache URLs:", error);
      });
    });
  }
});

console.log("[Service Worker] Loaded and ready - Offline mode enabled");
