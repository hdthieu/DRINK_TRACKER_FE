import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Drink Tracker 🌸',
        short_name: 'Drink Tracker',
        description: 'Theo dõi caffeine và đường cá nhân của bạn.',
        start_url: '/',
        display: 'standalone',
        background_color: '#fff5e1',
        theme_color: '#6d4c41',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
