// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBhEbLhtuwvNNt8yRF9U7yraaDU05fJwC0",
  authDomain: "wedo-e7cec.firebaseapp.com",
  projectId: "wedo-e7cec",
  storageBucket: "wedo-e7cec.firebasestorage.app",
  messagingSenderId: "497751206647",
  appId: "1:497751206647:web:14c57861c5c81c8e9881f2"
});

const messaging = firebase.messaging();

// Handle background push messages (data-only payload)
messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);
  const data = payload.data || {};
  const title = data.title || '📬 משימות הבית';
  const body = data.body || 'יש לך עדכון חדש';

  self.registration.showNotification(title, {
    body: body,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%236366F1"/><text x="50" y="68" font-size="55" text-anchor="middle" fill="white">🏠</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%236366F1"/><text x="50" y="68" font-size="55" text-anchor="middle" fill="white">🏠</text></svg>',
    dir: 'rtl',
    lang: 'he',
    tag: data.taskId || data.type || 'general',
    data: data,
    requireInteraction: false,
    vibrate: [100, 50, 100]
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};

  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes('household') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow('./index.html');
    })
  );
});
