import { useState } from 'react';
import api from '@/lib/api';

interface LoginCredentials {
    username: string;
    password: string;
}

interface LoginResponse {
    success: boolean;
    data?: any;
}

export function useLogin() {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
        setLoading(true);
        setErrors({});

        try {
            const response = await api.post('/auth/login', {
                ...credentials,
                device_name: 'web',
            });

            const token = response.data.token;
            
            // Guardar token en localStorage
            localStorage.setItem('auth_token', token);
            
            // Guardar token en cookie para que el middleware lo encuentre
            document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

            return { success: true, data: response.data };
        } catch (error: any) {
            const errorData = error.response?.data;
            
            if (errorData?.errors) {
                setErrors(errorData.errors);
            } else if (errorData?.message) {
                setErrors({ general: errorData.message });
            } else {
                setErrors({ general: 'Error al iniciar sesión' });
            }

            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, errors };
}
