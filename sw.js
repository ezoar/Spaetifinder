/* We catch here all the static assets of our application, so we can serve 
them from the catch and get a really fast start-up time for application
and be sure that we can display something when we are offline.
*/

    // Static assets 

    const staticAssets = [
      './',
      './app.js',
      './styles.css',
      './fallback.json',
      './images/fetch-offline.jpg'
    ];


// Install-Event: Service Worker is discovered and gets installed

  self.addEventListener('install', async event => {
    const cache = await caches.open('spaetis-static');
    cache.addAll(staticAssets);
  });

  self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
  });

// Fetch Event: Service Worker intercepts any network request going out from our application to the net

self.addEventListener('fetch', event => {
  const request = event.request; // Define how we want to respond to an fetch event
  const url = new URL(request.url); 
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request)); // First respond with cache. If nothing is there, then...
  } else {
    event.respondWith(networkFirst(request)); // ...try it fetch it from the network
  }
});


async function cacheFirst(request) {
  const cachedResponse = await caches.match(request); // Check if we have a cache response by calling caches that match with the request
  return cachedResponse || fetch(request); // This will return the results of the cache response or "undefined" if there is nothing in the cache
}


async function networkFirst(request) {
  const dynamicCache = await caches.open('spaetis-dynamic');
  try {
    const networkResponse = await fetch(request); // Try to go to the Network and refresh map
    dynamicCache.put(request, networkResponse.clone()); // Put it in cache
    return networkResponse;
  } catch (err) { // if that fails...
    const cachedResponse = await dynamicCache.match(request); // Return what we have in the cache
    return cachedResponse || await caches.match('./fallback.json'); // Return to the main macthes or go to the main caches and match on "fallback.jason"

  }
}

