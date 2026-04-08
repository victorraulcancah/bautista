import { Head } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOptions } from '@/hooks/useOptions';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import GradoFormModal from '../Grados/components/GradoFormModal';
import type { Grado, GradoFormData, Nivel } from '../Grados/hooks/useGrados';
import CursoFormModal from './components/CursoFormModal';
import type { Curso, CursoFormData, NivelOption } from './hooks/useCursos';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cursos', href: '/cursos' },
];

export default function CursosPage() {
    const niveles = useOptions<NivelOption>('/niveles');

    // Grados list (main view)
    const [grados, setGrados] = useState<Grado[]>([]);
    const [loadingGrados, setLoadingG] = useState(false);

    // Selected grade (drill-down view)
    const [selectedGrado, setSelectedGrado] = useState<Grado | null>(null);

    // Cursos for selected grade
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [loadingCursos, setLoadingC] = useState(false);

    // Search filters
    const [searchGrado, setSearchGrado] = useState('');
    const [searchCurso, setSearchCurso] = useState('');

    // Curso modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Curso | null>(null);
    const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

    // Grado edit modal
    const [gradoModalOpen, setGradoModalOpen] = useState(false);
    const [editingGrado, setEditingGrado] = useState<Grado | null>(null);
    const [gradoApiErrors, setGradoApiErrors] = useState<Record<string, string[]>>({});

    // Confirm delete modal (shared for grados and cursos)
    const [deleteModal, setDeleteModal] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => Promise<void>;
        processing: boolean;
    }>({ open: false, title: '', message: '', onConfirm: async () => { }, processing: false });

    // Load all grados on mount
    useEffect(() => {
        setLoadingG(true);
        api.get('/grados', { params: { per_page: 500 } })
            .then((res) => setGrados(res.data.data ?? []))
            .finally(() => setLoadingG(false));
    }, []);

    // Load cursos when a grade is selected
    const loadCursos = useCallback(async () => {
        if (!selectedGrado) {
return;
}

        setLoadingC(true);

        try {
            const res = await api.get('/cursos', {
                params: { grado_id: selectedGrado.grado_id, per_page: 500 },
            });
            setCursos(res.data.data ?? []);
        } finally {
            setLoadingC(false);
        }
    }, [selectedGrado]);

    useEffect(() => {
 loadCursos(); 
}, [loadCursos]);

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

    const handleSelectGrado = (g: Grado) => {
        setCursos([]);
        setSearchCurso('');
        setSelectedGrado(g);
    };

    const handleBack = () => {
        setSelectedGrado(null);
        setCursos([]);
        setSearchGrado('');
    };

    // ── Curso handlers ──
    const openCreate = () => {
 setEditing(null); setApiErrors({}); setModalOpen(true); 
};
    const openEdit = (c: Curso) => {
 setEditing(c); setApiErrors({}); setModalOpen(true); 
};
    const handleClose = () => {
 setModalOpen(false); setEditing(null); setApiErrors({}); 
};

    const handleSave = async (data: CursoFormData) => {
        try {
            if (editing) {
                await api.put(`/cursos/${editing.curso_id}`, data);
            } else {
                await api.post('/cursos', data);
            }

            await loadCursos();
        } catch (e: any) {
            setApiErrors(e?.response?.data?.errors ?? {});

            throw e;
        }
    };

    const confirmDeleteCurso = (c: Curso) => {
        setDeleteModal({
            open: true,
            title: 'Eliminar Curso',
            message: `¿Estás seguro de que deseas eliminar el curso "${c.nombre}"? Esta acción no se puede deshacer.`,
            processing: false,
            onConfirm: async () => {
                setDeleteModal((p) => ({ ...p, processing: true }));
                await api.delete(`/cursos/${c.curso_id}`);
                setDeleteModal((p) => ({ ...p, open: false, processing: false }));
                await loadCursos();
            },
        });
    };

    // ── Grado handlers ──
    const openEditGrado = (g: Grado) => {
 setEditingGrado(g); setGradoApiErrors({}); setGradoModalOpen(true); 
};

    const handleSaveGrado = async (data: GradoFormData) => {
        try {
            if (editingGrado) {
                const res = await api.put(`/grados/${editingGrado.grado_id}`, data);
                const updated: Grado = res.data.data ?? res.data;
                setGrados((prev) => prev.map((g) => g.grado_id === updated.grado_id ? updated : g));
            }
        } catch (e: any) {
            setGradoApiErrors(e?.response?.data?.errors ?? {});

            throw e;
        }
    };

    const confirmDeleteGrado = (g: Grado) => {
        setDeleteModal({
            open: true,
            title: 'Eliminar Grado',
            message: `¿Estás seguro de que deseas eliminar el grado "${g.nombre_grado}"? Esta acción no se puede deshacer.`,
            processing: false,
            onConfirm: async () => {
                setDeleteModal((p) => ({ ...p, processing: true }));
                await api.delete(`/grados/${g.grado_id}`);
                setGrados((prev) => prev.filter((x) => x.grado_id !== g.grado_id));
                setDeleteModal((p) => ({ ...p, open: false, processing: false }));
            },
        });
    };

    // Pre-fill modal when creating from drill-down
    const formDefaults: Partial<CursoFormData> | undefined = selectedGrado
        ? {
            grado_academico: selectedGrado.grado_id.toString(),
            nivel_academico_id: selectedGrado.nivel_id?.toString() ?? '',
        }
        : undefined;

    return (
        <>
            <Head title="Cursos" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 p-3 sm:p-6">

                    {/* ── VISTA PRINCIPAL: tabla de Grados ── */}
                    {!selectedGrado ? (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-orange-500 p-2">
                                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-black text-neutral-950">Cursos</h1>
                                        <p className="text-xs sm:text-sm text-neutral-500">
                                            {loadingGrados ? '…' : `${grados.length} grados registrados`}
                                        </p>
                                    </div>
                                </div>
                                <div className="relative w-full sm:w-auto">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <Input
                                        value={searchGrado}
                                        onChange={(e) => setSearchGrado(e.target.value)}
                                        placeholder="Buscar grado..."
                                        className="pl-9 w-full sm:w-56 h-9 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                                {loadingGrados ? (
                                    <p className="py-16 text-center text-xs sm:text-sm text-neutral-400">Cargando…</p>
                                ) : (
                                    <>
                                        {/* Vista móvil: Cards */}
                                        <div className="block sm:hidden space-y-3 p-4">
                                            {gradosFiltrados.map((g, idx) => (
                                                <div key={g.grado_id} className="border rounded-lg p-3 space-y-2 bg-white shadow-sm">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-medium text-neutral-400">#{idx + 1}</span>
                                                            </div>
                                                            <p className="text-sm font-bold text-neutral-900">{g.nombre_grado}</p>
                                                            <p className="text-xs text-neutral-500 mt-0.5">
                                                                {g.nivel?.nombre_nivel ?? '—'}
                                                            </p>
                                                            {g.abreviatura && (
                                                                <p className="text-xs text-neutral-400 mt-0.5">
                                                                    Abrev: {g.abreviatura}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex gap-1.5 pt-2 border-t justify-center">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-[#00a65a]"
                                                            onClick={() => handleSelectGrado(g)}
                                                            title="Ver cursos"
                                                        >
                                                            <BookOpen className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-amber-500"
                                                            onClick={() => openEditGrado(g)}
                                                            title="Editar"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-red-500"
                                                            onClick={() => confirmDeleteGrado(g)}
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {gradosFiltrados.length === 0 && (
                                                <p className="py-16 text-center text-xs text-neutral-400">
                                                    {searchGrado ? 'Sin resultados para la búsqueda.' : 'No hay grados registrados.'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Vista desktop: Tabla */}
                                        <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-[60vh]">
                                            <table className="w-full text-sm">
                                                <thead className="sticky top-0 z-10">
                                                    <tr className="bg-[#00a65a]">
                                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">#</th>
                                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Nivel Académico</th>
                                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Grado</th>
                                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Abreviatura</th>
                                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {gradosFiltrados.map((g, idx) => (
                                                        <tr key={g.grado_id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                                            <td className="px-4 py-3 text-center text-neutral-400">{idx + 1}</td>
                                                            <td className="px-4 py-3 text-center text-neutral-600">{g.nivel?.nombre_nivel ?? '—'}</td>
                                                            <td className="px-4 py-3 text-center font-medium">{g.nombre_grado}</td>
                                                            <td className="px-4 py-3 text-center text-neutral-500">{g.abreviatura ?? '—'}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <Button size="sm" variant="ghost"
                                                                        className="h-8 w-8 p-0 text-[#00a65a] hover:text-[#008d4c]"
                                                                        title="Ver cursos"
                                                                        onClick={() => handleSelectGrado(g)}
                                                                    >
                                                                        <BookOpen className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="ghost"
                                                                        className="h-8 w-8 p-0 text-amber-500 hover:text-amber-700"
                                                                        title="Editar grado"
                                                                        onClick={() => openEditGrado(g)}
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="ghost"
                                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                                        title="Eliminar grado"
                                                                        onClick={() => confirmDeleteGrado(g)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {gradosFiltrados.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="py-16 text-center text-sm text-neutral-400">
                                                                {searchGrado ? 'Sin resultados para la búsqueda.' : 'No hay grados registrados.'}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        /* ── VISTA DETALLE: cursos del grado seleccionado ── */
                        <>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm"
                                        className="gap-1 text-neutral-500 hover:text-neutral-800 h-8 px-2 sm:px-3"
                                        onClick={handleBack}
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="text-xs sm:text-sm">Volver</span>
                                    </Button>
                                    <div className="flex-1">
                                        <h1 className="text-lg sm:text-2xl font-black text-neutral-950">
                                            {selectedGrado.nombre_grado}
                                            <span className="ml-2 text-neutral-400 font-normal text-sm sm:text-lg">· Cursos</span>
                                        </h1>
                                        <p className="text-xs sm:text-sm text-neutral-500">
                                            {selectedGrado.nivel?.nombre_nivel ?? '—'}
                                            {' · '}
                                            <span className="font-semibold text-emerald-600">{cursos.length} cursos</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <div className="relative flex-1 sm:flex-initial">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <Input
                                            value={searchCurso}
                                            onChange={(e) => setSearchCurso(e.target.value)}
                                            placeholder="Buscar curso..."
                                            className="pl-9 w-full sm:w-56 h-9 text-sm"
                                        />
                                    </div>
                                    <Button onClick={openCreate} className="bg-[#00a65a] hover:bg-[#008d4c] text-white gap-2 h-9 text-sm">
                                        <Plus className="h-4 w-4" />
                                        <span className="hidden sm:inline">Agregar Curso</span>
                                        <span className="sm:hidden">Agregar</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                                {loadingCursos ? (
                                    <p className="py-16 text-center text-xs sm:text-sm text-neutral-400">Cargando…</p>
                                ) : (
                                    <>
                                        {/* Vista móvil: Cards */}
                                        <div className="block sm:hidden space-y-3 p-4">
                                            {cursosFiltrados.map((c, idx) => (
                                                <div key={c.curso_id} className="border rounded-lg p-3 space-y-2 bg-white shadow-sm">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-medium text-neutral-400">#{idx + 1}</span>
                                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.estado === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                    {c.estado === '1' ? 'Activo' : 'Inactivo'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-bold text-neutral-900">{c.nombre}</p>
                                                            {c.descripcion && (
                                                                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                                                                    {c.descripcion}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex gap-1.5 pt-2 border-t">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1 h-8 text-xs text-blue-500"
                                                            onClick={() => openEdit(c)}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5 mr-1" />
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-red-500"
                                                            onClick={() => confirmDeleteCurso(c)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {cursosFiltrados.length === 0 && (
                                                <p className="py-16 text-center text-xs text-neutral-400">
                                                    {searchCurso ? 'Sin resultados para la búsqueda.' : 'No hay cursos para este grado.'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Vista desktop: Tabla */}
                                        <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-[60vh]">
                                            <table className="w-full text-sm">
                                                <thead className="sticky top-0 z-10">
                                                    <tr className="bg-[#00a65a]">
                                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">#</th>
                                                        <th className="px-4 py-3 text-left   text-white text-xs font-semibold uppercase">Curso</th>
                                                        <th className="px-4 py-3 text-left   text-white text-xs font-semibold uppercase">Descripción</th>
                                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Estado</th>
                                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cursosFiltrados.map((c, idx) => (
                                                        <tr key={c.curso_id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                                            <td className="px-4 py-3 text-center text-neutral-400">{idx + 1}</td>
                                                            <td className="px-4 py-3 font-medium">{c.nombre}</td>
                                                            <td className="px-4 py-3 text-neutral-500">
                                                                {c.descripcion
                                                                    ? c.descripcion.length > 60
                                                                        ? c.descripcion.slice(0, 60) + '…'
                                                                        : c.descripcion
                                                                    : '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.estado === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                    {c.estado === '1' ? 'Activo' : 'Inactivo'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <Button size="sm" variant="ghost"
                                                                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                                                                        title="Editar" onClick={() => openEdit(c)}
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="ghost"
                                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                                        title="Eliminar" onClick={() => confirmDeleteCurso(c)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {cursosFiltrados.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="py-16 text-center text-sm text-neutral-400">
                                                                {searchCurso ? 'Sin resultados para la búsqueda.' : 'No hay cursos para este grado.'}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </AppLayout>

            <CursoFormModal
                open={modalOpen}
                onClose={handleClose}
                editing={editing}
                niveles={niveles}
                defaults={formDefaults}
                onSave={handleSave}
                apiErrors={apiErrors}
                clearErrors={() => setApiErrors({})}
            />

            <GradoFormModal
                open={gradoModalOpen}
                onClose={() => {
 setGradoModalOpen(false); setEditingGrado(null); setGradoApiErrors({}); 
}}
                editing={editingGrado}
                niveles={niveles as Nivel[]}
                onSave={handleSaveGrado}
                apiErrors={gradoApiErrors}
                clearErrors={() => setGradoApiErrors({})}
            />

            <ConfirmDeleteModal
                open={deleteModal.open}
                title={deleteModal.title}
                message={deleteModal.message}
                processing={deleteModal.processing}
                onClose={() => setDeleteModal((p) => ({ ...p, open: false }))}
                onConfirm={deleteModal.onConfirm}
            />
        </>
    );
}
