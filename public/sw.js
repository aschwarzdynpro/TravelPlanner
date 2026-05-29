/* TravelPlanner service worker — minimal offline shell.
 *
 * Principles (security first):
 * - NEVER cache Supabase, auth or API traffic. Those always go to the network,
 *   so offline can't surface stale/foreign authenticated data or bypass auth.
 * - Static build assets (/_next/static, icons, fonts) are cache-first — they
 *   are content-hashed and safe to keep.
 * - Page navigations are network-first; if the network fails we show a static
 *   "offline" fallback, never a cached authenticated page.
 */

const VERSION = "tp-v1";
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = "/offline.html";

// Pre-cache the offline fallback so it's available without network.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.add(OFFLINE_URL)),
  );
  self.skipWaiting();
});

// Drop caches from previous versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isNeverCache(url) {
  // Supabase (db/auth/realtime/storage), our own API and auth routes.
  return (
    url.hostname.endsWith(".supabase.co") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/")
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(?:png|svg|ico|webp|jpg|jpeg|gif|woff2?)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only handle same-origin GETs; let everything cross-origin pass through.
  if (url.origin !== self.location.origin) return;

  // Auth/API/Supabase: always network, no caching, no offline fallback.
  if (isNeverCache(url)) return;

  // Static, content-hashed assets: cache-first.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      }),
    );
    return;
  }

  // Page navigations: network-first, fall back to the offline page (never a
  // cached authenticated document).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.open(STATIC_CACHE).then((cache) =>
          cache.match(OFFLINE_URL).then((r) => r ?? Response.error()),
        ),
      ),
    );
  }
});
