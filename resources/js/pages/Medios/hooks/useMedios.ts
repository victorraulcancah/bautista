import { useState, useEffect } from 'react';
import api from '@/lib/api';

export type Medio = {
    id_medio: number;
    nombre: string;
    tipo: string;
    ruta: string;
    es_carpeta: boolean;
    carpeta_id: number | null;
    created_at: string;
};

export type BreadcrumbPath = {
    id: number;
    nombre: string;
};

export function useMedios() {
    const [medios, setMedios] = useState<Medio[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentFolder, setCurrentFolder] = useState<number | null>(null);
    const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbPath[]>([]);

    useEffect(() => {
        loadMedios();
        if (currentFolder) {
            loadBreadcrumb();
        } else {
            setBreadcrumbPath([]);
        }
    }, [currentFolder]);

    const loadMedios = async () => {
        try {
            const params = currentFolder ? { carpeta_id: currentFolder } : {};
            const res = await api.get('/medios', { params });
            setMedios(res.data);
        } catch (error) {
            console.error('Error al cargar medios:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBreadcrumb = async () => {
        if (!currentFolder) return;
        
        try {
            const res = await api.get(`/medios/${currentFolder}/breadcrumb`);
            setBreadcrumbPath(res.data);
        } catch (error) {
            console.error('Error al cargar breadcrumb:', error);
        }
    };

    const navigateToFolder = (folderId: number | null) => {
        setCurrentFolder(folderId);
    };

    const filteredMedios = medios.filter(m => 
        m.nombre.toLowerCase().includes(search.toLowerCase())
    );

    return {
        medios: filteredMedios,
        loading,
        search,
        setSearch,
        currentFolder,
        breadcrumbPath,
        navigateToFolder,
        reloadMedios: loadMedios,
    };
}
