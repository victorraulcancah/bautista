import { router } from '@inertiajs/react';
import axios from 'axios';

export function setupInertiaTokenPlugin() {
    // Sincronizar el token de localStorage con los headers de axios (que usa Inertia internamente)
    const token = localStorage.getItem('auth_token');

    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Manejar errores de autenticación en navegaciones de Inertia
    router.on('error', (event) => {
        const errors = event.detail.errors;

        if (errors && typeof errors === 'object') {
            const errorValues = Object.values(errors).flat();

            if (errorValues.some((e: any) => e?.includes('No autenticado') || e?.includes('Unauthorized'))) {
                localStorage.removeItem('auth_token');
                delete axios.defaults.headers.common['Authorization'];
                window.location.href = '/login';
            }
        }
    });
}

// Función para actualizar el token en axios después del login
export function setAuthToken(token: string) {
    localStorage.setItem('auth_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Función para limpiar el token al hacer logout
export function clearAuthToken() {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
}
