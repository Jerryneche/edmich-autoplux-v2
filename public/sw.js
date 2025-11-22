// public/sw.js
const CACHE_NAME = "autoplux-v1";
const urlsToCache = [
  "/",
  "/business",
  "/shop",
  "/impact",
  "/about",
  "/contact",
  "/offline.html", // ← create this file!
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
