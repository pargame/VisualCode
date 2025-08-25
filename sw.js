// Minimal no-op service worker stub installed by CI when no sw.js exists in the build output.
// This file ensures a /sw.js response so client-side unregister() logic can run and clear old caches.
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ self.clients.claim(); });
// Intentionally no fetch handlers - keep this worker lightweight and inert.
