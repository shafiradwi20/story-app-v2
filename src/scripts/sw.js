import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BASE_URL } from './config';
precacheAndRoute(self.__WB_MANIFEST);

// Runtime caching
// SPA fallback to index.html
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'))
);

registerRoute(
  ({ url }) => {
    return url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';
  },
  new CacheFirst({
    cacheName: 'google-fonts',
  }),
);
registerRoute(
  ({ url }) => {
    return url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome');
  },
  new CacheFirst({
    cacheName: 'fontawesome',
  }),
);
registerRoute(
  ({ url }) => {
    return url.origin === 'https://ui-avatars.com';
  },
  new CacheFirst({
    cacheName: 'avatars-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'story-app-api',
  }),
);
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'story-app-api-images',
  }),
);
registerRoute(
  ({ url }) => {
    return url.origin.includes('maptiler');
  },
  new CacheFirst({
    cacheName: 'maptiler-api',
  }),
);

self.addEventListener('push', (event) => {
    console.log('Service worker pushing...');
    async function chainPromise() {
        const data = await event.data.json();
        await self.registration.showNotification(data.title, {
          body: data.options.body,
        });
    }
    event.waitUntil(chainPromise());
  });

// Background sync for new stories
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-stories') {
    event.waitUntil(syncNewStories());
  }
});

async function syncNewStories() {
  const db = await openDB('my-database', 2);
  const tx = db.transaction('story-queue', 'readonly');
  const store = tx.objectStore('story-queue');
  const allStories = await store.getAll();

  for (const storyData of allStories) {
    try {
      // Send story to server
      const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
        method: 'POST',
        headers: {
          // No auth header here, consider adding if needed
          // 'Authorization': `Bearer ${accessToken}`, // Cannot access accessToken here
        },
        body: storyData,
      });
      if (!response.ok) {
        console.error('Background sync: failed to send story', response.statusText);
        continue;
      }
      // On success, remove story from queue
      const txDelete = db.transaction('story-queue', 'readwrite');
      const storeDelete = txDelete.objectStore('story-queue');
      const key = await storeDelete.getKey(storyData);
      if (key !== undefined) {
        await storeDelete.delete(key);
      }
      await txDelete.done;
    } catch (error) {
      console.error('Background sync: error sending story', error);
    }
  }
}

