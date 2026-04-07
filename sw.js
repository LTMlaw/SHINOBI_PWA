self.addEventListener('push', event => {
  const data = event.data.json();
  
  // Python側から送られてくる data.data に host が入っている前提
  const options = {
    body: data.body,
    icon: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/lock/materialicons/48dp/1x/baseline_lock_white_48dp.png',
    badge: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/lock/materialicons/48dp/1x/baseline_lock_white_48dp.png',
    actions: data.actions,
    data: data.data, // ここに key と host が入っている必要がある
    tag: 'shinobi-unlock', // 同じ通知が重ならないようにタグを指定
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const authData = notification.data; // ここから key と host を取る
  const action = event.action;

  notification.close();

  // actionが空（通知自体をタップ）の場合は、とりあえず unlock 扱いにしたくないならここで弾く
  if (!action || action === 'deny') return;

  if (action === 'unlock') {
    // 修正: localStorageではなく、通知データからhostを取得する
    const host = authData.host; 
    if (!host) {
      console.error("Host information missing in notification data");
      return;
    }

    // URL組み立てロジックの修正 (HTML側と合わせる)
    const isTunnel = host.includes('lhr.');
    const protocol = isTunnel ? 'https://' : 'http://';
    const targetUrl = `${protocol}${host}/api/auth`;

    event.waitUntil(
      fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: authData.key,
          action: 'unlock'
        })
      }).catch(err => console.error("Fetch failed in SW:", err))
    );
  }
});
