var CACHE = "movetronome-v1";
var CORE = ["./", "./index.html", "./site.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable.svg"];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil((async function () {
    var c = await caches.open(CACHE);
    for (var i = 0; i < CORE.length; i++) {
      try { await c.add(new Request(new URL(CORE[i], self.location).href)); } catch (err) {}
    }
  })());
});

self.addEventListener("activate", function (e) {
  e.waitUntil((async function () {
    var keys = await caches.keys();
    await Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    if (self.registration && self.registration.update) {
      try { await self.registration.update(); } catch (err) {}
    }
  })());
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/assets/")) return;
  e.respondWith((async function () {
    try {
      var res = await fetch(req);
      if (res.ok) {
        try {
          var c = await caches.open(CACHE);
          await c.put(req, res.clone());
        } catch (err) {}
      }
      return res;
    } catch (err) {
      var c = await caches.open(CACHE);
      var hit = await c.match(req);
      if (hit) return hit;
      throw err;
    }
  })());
});