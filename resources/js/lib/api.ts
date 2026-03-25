import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        Accept:              'application/json',
        'X-Requested-With':  'XMLHttpRequest',
    },
});

// Interceptor para agregar token Bearer
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar errores 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
