import axios, { InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Định nghĩa kiểu mở rộng cho AxiosRequestConfig để chứa thuộc tính _retry
interface AdaptRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('coffee_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as AdaptRequestConfig;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get('coffee_refresh_token');
                if (!refreshToken) throw new Error('No refresh token available');

                const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
                    refreshToken,
                });

                if (res.status === 201 || res.status === 200) {
                    const { access_token, refresh_token } = res.data.data || res.data;

                    Cookies.set('coffee_token', access_token, { expires: 1 });
                    if (refresh_token) {
                        Cookies.set('coffee_refresh_token', refresh_token, { expires: 7 });
                    }

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    }
                    return api(originalRequest);
                }
            } catch (refreshError) {
                Cookies.remove('coffee_token');
                Cookies.remove('coffee_refresh_token');
                Cookies.remove('coffee_user');

                // Kiểm tra xem có đang ở trình duyệt không trước khi chuyển hướng
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
