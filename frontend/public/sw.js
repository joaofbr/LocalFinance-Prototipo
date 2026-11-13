const OFFLINE_CACHE = 'poupi-offline-v2'
const OFFLINE_URL = '/offline.html'

async function cacheOfflinePage() {
  const response = await fetch(OFFLINE_URL, { cache: 'reload' })
  if (!response.ok) throw new Error('offline page unavailable')
  const body = await response.text()
  const cache = await caches.open(OFFLINE_CACHE)
  await cache.put(
    OFFLINE_URL,
    new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheOfflinePage())
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== OFFLINE_CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)))
})
