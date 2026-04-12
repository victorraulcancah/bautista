import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import type { Grado } from '../../Grados/hooks/useGrados';
import type { Curso, CursoFormData, NivelOption } from './useCursos';

export function useCursosPage() {
    // URL params
    const [nivelIdFromUrl, setNivelIdFromUrl] = useState<string | null>(null);
    const [nivelNombre, setNivelNombre] = useState<string>('');
    const [modoNivelDirecto, setModoNivelDirecto] = useState(false);

    // Grados
    const [grados, setGrados] = useState<Grado[]>([]);
    const [loadingGrados, setLoadingG] = useState(false);
    const [selectedGrado, setSelectedGrado] = useState<Grado | null>(null);

    // Cursos
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [loadingCursos, setLoadingC] = useState(false);

    // Search
    const [searchGrado, setSearchGrado] = useState('');
    const [searchCurso, setSearchCurso] = useState('');

    // Leer nivel_id de la URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const nivel = params.get('nivel_id');
        setNivelIdFromUrl(nivel);
    }, []);

    // Cargar grados del nivel para el modal
    useEffect(() => {
        if (nivelIdFromUrl) {
            api.get('/grados', { params: { nivel_id: nivelIdFromUrl, per_page: 500 } })
                .then((res) => setGrados(res.data.data ?? []));
        }
    }, [nivelIdFromUrl]);

    // Load grados o cursos según el modo
    useEffect(() => {
        if (nivelIdFromUrl) {
            // Modo nivel directo: cargar cursos
            setModoNivelDirecto(true);
            setLoadingC(true);
            api.get('/cursos', {
                params: {
                    nivel_academico_id: nivelIdFromUrl,
                    per_page: 500
                }
            })
                .then((res) => setCursos(res.data.data ?? []))
                .finally(() => setLoadingC(false));
        } else {
            // Modo normal: cargar grados
            setModoNivelDirecto(false);
            setLoadingG(true);
            api.get('/grados', { params: { per_page: 500 } })
                .then((res) => setGrados(res.data.data ?? []))
                .finally(() => setLoadingG(false));
        }
    }, [nivelIdFromUrl, nivelNombre]);

    // Load cursos cuando se selecciona un grado
    const loadCursos = useCallback(async () => {
        if (!selectedGrado) return;

        setLoadingC(true);
        try {
            // Cargar cursos ASIGNADOS al grado (desde grados_cursos)
            const res = await api.get(`/grados/${selectedGrado.grado_id}/cursos`);
            setCursos(res.data ?? []);
        } finally {
            setLoadingC(false);
        }
    }, [selectedGrado]);

    useEffect(() => {
        loadCursos();
    }, [loadCursos]);

    // Recargar cursos según el modo
    const reloadCursos = useCallback(async () => {
        if (modoNivelDirecto) {
            const res = await api.get('/cursos', {
                params: { nivel_academico_id: nivelIdFromUrl, per_page: 500 },
            });
            setCursos(res.data.data ?? []);
        } else {
            await loadCursos();
        }
    }, [modoNivelDirecto, nivelIdFromUrl, loadCursos]);

    // Handlers
    const handleSelectGrado = (g: Grado) => {
        setCursos([]);
        setSearchCurso('');
        setSelectedGrado(g);
    };

    const handleBack = () => {
        if (modoNivelDirecto) {
            window.location.href = '/niveles';
        } else {
            setSelectedGrado(null);
            setCursos([]);
            setSearchGrado('');
        }
    };

    // Filtered lists
    const gradosFiltrados = useMemo(() => {
        const q = searchGrado.toLowerCase();
        return grados.filter((g) =>
            !q ||
            g.nombre_grado.toLowerCase().includes(q) ||
            (g.nivel?.nombre_nivel ?? '').toLowerCase().includes(q) ||
            (g.abreviatura ?? '').toLowerCase().includes(q),
        );
    }, [grados, searchGrado]);

    const cursosFiltrados = useMemo(() => {
        const q = searchCurso.toLowerCase();
        return cursos.filter((c) =>
            !q ||
            c.nombre.toLowerCase().includes(q) ||
            (c.descripcion ?? '').toLowerCase().includes(q),
        );
    }, [cursos, searchCurso]);

    // Breadcrumbs dinámicos
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
        const base = [{ title: 'Dashboard', href: '/dashboard' }];

        if (nivelIdFromUrl && nivelNombre) {
            base.push({ title: 'Niveles', href: '/niveles' });
            base.push({ title: nivelNombre, href: `/cursos?nivel_id=${nivelIdFromUrl}` });
        } else {
            base.push({ title: 'Cursos', href: '/cursos' });
        }

        return base;
    }, [nivelIdFromUrl, nivelNombre]);

    // Form defaults
    const formDefaults: Partial<CursoFormData> | undefined = modoNivelDirecto
        ? {
            grado_academico: '',
            nivel_academico_id: nivelIdFromUrl ?? '',
        }
        : selectedGrado
        ? {
            grado_academico: selectedGrado.grado_id > 0 ? selectedGrado.grado_id.toString() : '',
            nivel_academico_id: selectedGrado.nivel_id?.toString() ?? '',
        }
        : undefined;

    return {
        // State
        nivelIdFromUrl,
        nivelNombre,
        setNivelNombre,
        modoNivelDirecto,
        grados,
        loadingGrados,
        selectedGrado,
        cursos,
        loadingCursos,
        searchGrado,
        setSearchGrado,
        searchCurso,
        setSearchCurso,
        gradosFiltrados,
        cursosFiltrados,
        breadcrumbs,
        formDefaults,
        // Handlers
        handleSelectGrado,
        handleBack,
        reloadCursos,
        setGrados,
    };
}
