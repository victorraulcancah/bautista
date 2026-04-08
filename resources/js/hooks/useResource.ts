import { useCallback, useEffect, useState } from 'react';
import type { Paginated } from '@/components/shared/ResourceTable';
import api from '@/lib/api';

type ApiErrors = Record<string, string[]>;

export type ResourceState<T> = {
    rows:       Paginated<T> | null;
    loading:    boolean;
    search:     string;
    page:       number;
    setSearch:  (v: string) => void;
    setPage:    (v: number) => void;
    reload:     () => void;
    create:     (data: unknown) => Promise<void>;
    update:     (id: number, data: unknown) => Promise<void>;
    remove:     (id: number) => Promise<void>;
    apiErrors:  ApiErrors;
    clearErrors:() => void;
    success:    string | null;
    clearSuccess:() => void;
};

export function useResource<T>(endpoint: string, initialParams: Record<string, any> = {}): ResourceState<T> {
    const [rows, setRows]         = useState<Paginated<T> | null>(null);
    const [loading, setLoading]   = useState(false);
    const [search, setSearch]     = useState('');
    const [page, setPage]         = useState(1);
    const [apiErrors, setErrors]  = useState<ApiErrors>({});
    const [success, setSuccess]   = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);

        try {
            const { data } = await api.get(endpoint, { 
                params: { ...initialParams, search, page } 
            });
            setRows(data);
        } finally {
            setLoading(false);
        }
    }, [endpoint, search, page, JSON.stringify(initialParams)]);

    useEffect(() => {
 fetch(); 
}, [fetch]);

    const create = async (payload: unknown) => {
        setErrors({});
        await api.post(endpoint, payload);
        setSuccess('Registro guardado correctamente.');
        await fetch();
    };

    const update = async (id: number, payload: unknown) => {
        setErrors({});
        await api.put(`${endpoint}/${id}`, payload);
        setSuccess('Registro actualizado correctamente.');
        await fetch();
    };

    const remove = async (id: number) => {
        await api.delete(`${endpoint}/${id}`);
        setSuccess('Registro eliminado correctamente.');
        await fetch();
    };

    // Capture 422 validation errors automatically
    const wrap = <A extends unknown[]>(fn: (...a: A) => Promise<void>) =>
        async (...args: A) => {
            try {
                await fn(...args);
            } catch (err: unknown) {
                const e = err as { response?: { status?: number; data?: { errors?: ApiErrors } } };

                if (e.response?.status === 422 && e.response.data?.errors) {
                    setErrors(e.response.data.errors);
                }

                throw err;
            }
        };

    return {
        rows, loading, search, page,
        setSearch: (v) => {
 setSearch(v); setPage(1); 
},
        setPage,
        reload: fetch,
        create:  wrap(create),
        update:  wrap(update),
        remove,
        apiErrors,
        clearErrors: () => setErrors({}),
        success,
        clearSuccess: () => setSuccess(null),
    };
}
