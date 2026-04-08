self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/lock/materialicons/48dp/1x/baseline_lock_white_48dp.png',
    badge: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/lock/materialicons/48dp/1x/baseline_lock_white_48dp.png',
    actions: data.actions,
    data: data.data // 秘密鍵などを保持
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  const action = event.action;
  const notification = event.notification;
  const authData = notification.data;

  notification.close();

  if (action === 'unlock' || action === 'deny') {
    // PCのサーバーへ結果を送信
    const host = localStorage.getItem('shinobi_pc_host');
    if (!host) return;

    const protocol = host.includes('ngrok') || host.includes('lhr.life') ? 'https://' : 'http://';
    const targetUrl = `${protocol}${host}${host.includes(':') ? '' : ':8080'}/api/auth`;

    event.waitUntil(
      fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: authData.key,
          action: action
        })
      }).catch(error => {
        console.error('Service Worker auth error:', error);
      })
    );
  }
});
