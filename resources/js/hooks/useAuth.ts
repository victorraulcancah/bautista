import { useCallback } from 'react';

export interface AuthToken {
    token: string;
    expiresAt?: string;
}

export const useAuth = () => {
    const getToken = useCallback((): string | null => {
        return localStorage.getItem('auth_token');
    }, []);

    const setToken = useCallback((token: string) => {
        localStorage.setItem('auth_token', token);
    }, []);

    const clearToken = useCallback(() => {
        localStorage.removeItem('auth_token');
    }, []);

    const isAuthenticated = useCallback((): boolean => {
        return !!getToken();
    }, [getToken]);

    return {
        getToken,
        setToken,
        clearToken,
        isAuthenticated,
    };
};
