// Custom Service Worker for Drink Tracker 🌸
const _self = self as any;

// --- Push Notification Handler ---
_self.addEventListener('push', (event: any) => {
    let data: any = {
        title: 'Drink Tracker 🌸',
        body: 'Princess ơi, chị có thông báo mới nè!',
        icon: 'https://cdn-icons-png.flaticon.com/512/3256/3256157.png'
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/3256/3256157.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3256/3256157.png',
        vibrate: [200, 100, 200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            { action: 'view', title: 'Xem ngay 🥂' },
            { action: 'close', title: 'Đóng' }
        ]
    };

    event.waitUntil(
        _self.registration.showNotification(data.title, options)
    );
});

_self.addEventListener('notificationclick', (event: any) => {
    event.notification.close();
    if (event.action === 'view') {
        event.waitUntil(
            _self.clients.openWindow('/')
        );
    }
});

export default null;
