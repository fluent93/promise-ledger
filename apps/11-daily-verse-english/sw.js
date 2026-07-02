const CACHE_NAME = "daily-verse-english:v17";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=0.17",
  "./src/app.js?v=0.17",
  "./manifest.json",
  "./icons/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => caches.match("./index.html"));
    }),
  );
});


self.addEventListener("push", (event) => {
  const payload = event.data?.json() || {};
  const title = payload.title || "오늘의 말씀";
  const body = payload.body || "말씀영어에서 오늘의 말씀을 확인해보세요.";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "./icons/icon.svg",
      badge: "./icons/icon.svg",
      data: { url: payload.url || "./" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "./", self.registration.scope).href;
  event.waitUntil(clients.openWindow(url));
});
