const CACHE = "periodica-v1";
const ASSETS = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match("./index.html")))
  );
});

// Background periodic sync (Chrome Android)
self.addEventListener("periodicsync", e => {
  if (e.tag === "elemento-diario") {
    e.waitUntil(sendDailyElement());
  }
});

async function sendDailyElement() {
  const ELEMENTS = ["Hidrógeno","Helio","Litio","Berilio","Boro","Carbono","Nitrógeno","Oxígeno","Flúor","Neón"];
  const symbols =  ["H","He","Li","Be","B","C","N","O","F","Ne"];
  const day = Math.floor(Date.now() / 86400000);
  const idx = day % 118;
  await self.registration.showNotification(`⚗️ Elemento del día`, {
    body: `Hoy: elemento Nº${idx + 1}. Abre la app para descubrirlo.`,
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-72.png",
    tag: "elemento-diario",
    actions: [{ action: "abrir", title: "Ver elemento" }],
  });
}

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow("./"));
});
