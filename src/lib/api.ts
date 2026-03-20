const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiRequest(path: string, options: RequestInit = {}) {
    let token = localStorage.getItem('coffee_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    let res = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (res.status === 401) {
        const refreshToken = localStorage.getItem('coffee_refresh_token');
        if (refreshToken) {
            const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                localStorage.setItem('coffee_token', data.data.access_token);
                localStorage.setItem('coffee_refresh_token', data.data.refresh_token);
                return apiRequest(path, options);
            } else {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
    }

    return res;
}
