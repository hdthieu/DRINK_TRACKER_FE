import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
            if (Notification.permission === 'granted') {
                subscribe();
            }
        }
    }, []);

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

    const subscribe = async () => {
        if (!VAPID_PUBLIC_KEY) {
            console.error('VAPID Public Key is missing! Check your .env setup.');
            return;
        }
        try {
            const registration = await navigator.serviceWorker.ready;

            // Check if there's already a subscription
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // Request permission if not granted
                const result = await Notification.requestPermission();
                setPermission(result);
                if (result !== 'granted') return;

                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });
            }

            // Send subscription to server
            await api.post('/notifications/subscribe', subscription);
            console.log('Push subscription successful! ✨');
        } catch (error) {
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

    return { isSupported, permission, subscribe, testNotification };
}
