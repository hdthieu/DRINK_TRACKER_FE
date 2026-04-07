import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isLowStockEnabled, setIsLowStockEnabled] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
            // Fetch initial settings
            fetchSettings();
            if (Notification.permission === 'granted') {
                subscribe(true);
            }
        }
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/notifications/settings');
            setIsLowStockEnabled(res.data.isLowStockAlertEnabled);
        } catch (e) {
            console.error('Failed to fetch notification settings', e);
        }
    };

    const toggleLowStockAlerts = async () => {
        const newValue = !isLowStockEnabled;
        try {
            setIsLowStockEnabled(newValue);
            await api.post('/notifications/settings', { enabled: newValue });
            toast.success(newValue ? 'Đã bật báo động hết hàng! 🔔' : 'Đã tắt báo động hết hàng 🔕');
        } catch (e) {
            setIsLowStockEnabled(!newValue); // rollback
            toast.error('Không thể cập nhật cài đặt');
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribe = async (silent = false) => {
        if (!VAPID_PUBLIC_KEY) {
            if (!silent) toast.error('Chìa khóa bảo mật (VAPID) bị thiếu! Princess vui lòng kiểm tra Dashboard Vercel nhé 🔑');
            console.error('VAPID Public Key is missing!');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            let subscription = await registration.pushManager.getSubscription();

            // If we're already subscribed and it's a silent check, just exit quietly
            if (subscription && silent) {
                // We still send it to server just in case, but SILENTLY
                api.post('/notifications/subscribe', subscription).catch(() => { });
                return;
            }

            if (!subscription) {
                if (!silent) toast.info('Đang kết nối với điện thoại của Princess... ✨');
                const result = await Notification.requestPermission();
                setPermission(result);
                if (result !== 'granted') {
                    if (!silent) toast.error('Chị chưa cấp quyền hiện thông báo cho ứng dụng rồi ạ! 🌸');
                    return;
                }

                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });

                // Only show SUCCESS toast if we actually just created a NEW subscription
                if (!silent) toast.success('Kích hoạt báo động màn hình chờ thành công! 📲✨');
            } else {
                // If already exists, just refresh on server silently
                await api.post('/notifications/subscribe', subscription);
                if (!silent) toast.success('Đã cập nhật kết nối thông báo rạng rỡ! ✨');
            }

            console.log('Push subscription sync successful! ✨');
        } catch (error) {
            if (!silent) toast.error('Có lỗi xảy ra khi kết nối thông báo! Princess thử tải lại trang nhé 🥂');
            console.error('Failed to subscribe to push notifications:', error);
        }
    };

    const testNotification = async () => {
        try {
            await api.post('/notifications/test');
            toast.success('Híu vừa gửi tín hiệu thử nghiệm đến chị đó ạ! 🌸');
        } catch (error) {
            toast.error('Không thể gửi thông báo thử nghiệm');
        }
    };

    return { isSupported, permission, subscribe, testNotification, isLowStockEnabled, toggleLowStockAlerts };
}
