// Version for cache
const CACHE_NAME = "gp-soldier-cache-v1";

// Files to Cache (STATIC ONLY — SAFE FOR PLAY STORE)
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./images/gplogo.jpg",
  "./images/banner.jpg",

  // Icon files if you have them
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH LOGIC
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // DO NOT CACHE VIDEO LINKS (IMPORTANT!)
  if (request.url.includes(".mp4") || request.url.includes("videos")) {
    return; // always fetch online
  }

  // Network → cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(() => caches.match(request))
  );
});
