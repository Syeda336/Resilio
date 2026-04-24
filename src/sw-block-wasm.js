// Service Worker to block WebAssembly files and clear cache
// Version 2.0 - Anti-WASM

const CACHE_VERSION = 'v2-no-wasm';
const BLOCKED_EXTENSIONS = ['.wasm', '.wasm.gz'];
const BLOCKED_PATTERNS = [
  /WebAssembly/i,
  /\.wasm$/i,
  /supabase.*\.wasm/i,
  /_bg\.wasm/i,
];

console.log('🛡️ Anti-WASM Service Worker v2.0 activated');

// Install event - clear old caches
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing - clearing old caches...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('🗑️ Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ Old caches cleared');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// Activate event - take control immediately
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated - taking control');
  event.waitUntil(self.clients.claim());
});

// Fetch event - block WASM files
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Check if this is a WebAssembly file
  const isWasmFile = BLOCKED_EXTENSIONS.some(ext => url.endsWith(ext)) ||
                     BLOCKED_PATTERNS.some(pattern => pattern.test(url));
  
  if (isWasmFile) {
    console.warn('🚫 BLOCKED WebAssembly request:', url);
    
    // Return a fake successful response to prevent errors
    event.respondWith(
      new Response('', {
        status: 200,
        statusText: 'OK (WASM Blocked)',
        headers: { 'Content-Type': 'application/wasm' }
      })
    );
    return;
  }
  
  // For all other requests, fetch normally but don't cache
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store' // Always fetch fresh
    }).catch((error) => {
      // If fetch fails, try cache as fallback
      console.warn('Fetch failed, trying cache:', error);
      return caches.match(event.request);
    })
  );
});

// Message event - manual cache clear
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🧹 Manual cache clear requested');
    
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('✅ Cache cleared via message');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

console.log('🛡️ Service Worker ready - WASM files will be blocked');
