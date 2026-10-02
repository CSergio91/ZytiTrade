// ZYTI Trade - High-Performance Asset Cache Service Worker (Zero-Egress & 0ms Load)
const CACHE_NAME = 'zyti-assets-v1';

// Recursos críticos a pre-cachear durante la instalación
const PRECACHE_ASSETS = [
  '/',
  '/favicon.ico',
  '/logo-zyti.png',
  '/og-image.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Excluir peticiones a Supabase, WebSockets, APIs de datos de mercado y no-GET
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/auth/') ||
    url.hostname.includes('supabase.co') ||
    url.protocol === 'ws:' ||
    url.protocol === 'wss:'
  ) {
    return;
  }

  // Interceptar imágenes estáticas y avatares con estrategia Cache-First (0ms)
  const isImage = 
    request.destination === 'image' ||
    /\.(png|jpg|jpeg|webp|svg|gif|ico)(\?.*)?$/i.test(url.pathname) ||
    url.hostname.includes('telegram.org') ||
    url.hostname.includes('googleusercontent.com');

  if (isImage) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            // Guardar en caché clonando la respuesta para futuras visitas
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (_) {
          // Si no hay red y no está en caché, retornar lo que haya
          return cached || new Response('', { status: 408 });
        }
      })
    );
  }
});
