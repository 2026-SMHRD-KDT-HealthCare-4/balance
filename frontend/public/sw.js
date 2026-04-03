// public/sw.js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => console.log('서비스 워커 활성화됨!'));

// 알림 클릭 시 스트레칭 페이지로 이동
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('/stretch') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('/stretch');
    })
  );
});