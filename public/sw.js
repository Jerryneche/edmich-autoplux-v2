// public/sw.js
const CACHE_NAME = "autoplux-v2";
const urlsToCache = [
  "/",
  "/business",
  "/shop",
  "/impact",
  "/about",
  "/contact",
  "/offline.html",
  "/manifest.json",
  "/logo 192.png",
  "/logo 512.png",
];

// Install
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate & clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;

      return fetch(e.request).catch(() => {
        if (e.request.mode === "navigate") {
          return caches.match("/offline.html");
        }
      });
    })
  );
});

// ==========================================
// PUSH NOTIFICATIONS
// ==========================================

// Handle incoming push notifications
self.addEventListener("push", (event) => {
  let data = {
    title: "EDMICH AutoPlux",
    body: "You have a new notification",
    icon: "/logo 192.png",
    badge: "/logo 192.png",
    url: "/notifications",
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || payload.message || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        url: payload.url || payload.link || payload.data?.link || data.url,
        ...payload,
      };
    }
  } catch (e) {
    // If JSON parsing fails, try text
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    tag: data.tag || "edmich-notification",
    renotify: true,
    requireInteraction: false,
    data: {
      url: data.url,
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "Open",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/notifications";

  if (event.action === "dismiss") {
    return;
  }

  // Open the app or focus existing window
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        // Otherwise open new window
        return clients.openWindow(url);
      })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  // Analytics or cleanup could go here
  console.log("[SW] Notification closed:", event.notification.tag);
});
