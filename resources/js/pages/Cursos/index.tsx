import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { useOptions } from '@/hooks/useOptions';
import ResourceTable, { Column } from '@/components/shared/ResourceTable';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import CursoFormModal from './components/CursoFormModal';
import GradoFormModal from '../Grados/components/GradoFormModal';
import type { Curso, CursoFormData, NivelOption } from './hooks/useCursos';
import type { Grado, GradoFormData, Nivel } from '../Grados/hooks/useGrados';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cursos',    href: '/cursos' },
];

export default function CursosPage() {
    const niveles = useOptions<NivelOption>('/niveles');

    // Grados list (main view)
    const [grados, setGrados]           = useState<Grado[]>([]);
    const [loadingGrados, setLoadingG]  = useState(false);

    // Selected grade (drill-down view)
    const [selectedGrado, setSelectedGrado] = useState<Grado | null>(null);

    // Cursos for selected grade
    const [cursos, setCursos]           = useState<Curso[]>([]);
    const [loadingCursos, setLoadingC]  = useState(false);

    // Search filters
    const [searchGrado, setSearchGrado] = useState('');
    const [searchCurso, setSearchCurso] = useState('');

    // Curso modal
    const [modalOpen, setModalOpen]     = useState(false);
    const [editing, setEditing]         = useState<Curso | null>(null);
    const [apiErrors, setApiErrors]     = useState<Record<string, string[]>>({});

    // Grado edit modal
    const [gradoModalOpen, setGradoModalOpen] = useState(false);
    const [editingGrado, setEditingGrado]     = useState<Grado | null>(null);
    const [gradoApiErrors, setGradoApiErrors] = useState<Record<string, string[]>>({});

    // Confirm delete modal (shared for grados and cursos)
    const [deleteModal, setDeleteModal] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => Promise<void>;
        processing: boolean;
    }>({ open: false, title: '', message: '', onConfirm: async () => {}, processing: false });

    // Load all grados on mount
    useEffect(() => {
        setLoadingG(true);
        api.get('/grados', { params: { per_page: 500 } })
            .then((res) => setGrados(res.data.data ?? []))
            .finally(() => setLoadingG(false));
    }, []);

    // Load cursos when a grade is selected
    const loadCursos = useCallback(async () => {
        if (!selectedGrado) return;
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

    useEffect(() => { loadCursos(); }, [loadCursos]);

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
    const openCreate = () => { setEditing(null); setApiErrors({}); setModalOpen(true); };
    const openEdit   = (c: Curso) => { setEditing(c); setApiErrors({}); setModalOpen(true); };
    const handleClose = () => { setModalOpen(false); setEditing(null); setApiErrors({}); };

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
    const openEditGrado = (g: Grado) => { setEditingGrado(g); setGradoApiErrors({}); setGradoModalOpen(true); };

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
            grado_academico:    selectedGrado.grado_id.toString(),
            nivel_academico_id: selectedGrado.nivel_id?.toString() ?? '',
        }
        : undefined;

    return (
        <>
            <Head title="Cursos" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 p-4 sm:p-6">

                    {/* ── VISTA PRINCIPAL: tabla de Grados ── */}
                    {!selectedGrado ? (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-orange-500 p-2 shrink-0">
                                        <BookOpen className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-black text-neutral-950">Cursos</h1>
                                        <p className="text-sm text-neutral-500">
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
                                        className="pl-9 w-full sm:w-64"
                                    />
                                </div>
                            </div>

                            <ResourceTable
                                rows={{
                                    data:         gradosFiltrados,
                                    current_page: 1,
                                    last_page:    1,
                                    per_page:     gradosFiltrados.length,
                                    total:        gradosFiltrados.length,
                                    from:         1,
                                    to:           gradosFiltrados.length,
                                }}
                                getKey={(g) => g.grado_id}
                                onEdit={openEditGrado}
                                onDelete={confirmDeleteGrado}
                                onPageChange={() => {}}
                                extraActions={(g) => (
                                    <Button size="icon" variant="ghost"
                                        className="size-7 text-[#00a65a] hover:bg-emerald-50"
                                        title="Ver cursos"
                                        onClick={() => handleSelectGrado(g)}
                                    >
                                        <BookOpen className="size-3.5" />
                                    </Button>
                                )}
                                columns={[
                                    { label: 'Nivel Académico', render: (g) => g.nivel?.nombre_nivel ?? '—' },
                                    { label: 'Grado',           className: 'font-bold', render: (g) => g.nombre_grado },
                                    { label: 'Abreviatura',     render: (g) => g.abreviatura ?? '—' },
                                ]}
                            />
                        </>
                    ) : (
                        /* ── VISTA DETALLE: cursos del grado seleccionado ── */
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="sm"
                                        className="gap-1 text-neutral-500 hover:text-neutral-800 shrink-0"
                                        onClick={handleBack}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span className="hidden sm:inline">Volver</span>
                                    </Button>
                                    <div className="min-w-0">
                                        <h1 className="text-lg sm:text-2xl font-black text-neutral-950 truncate">
                                            {selectedGrado.nombre_grado}
                                            <span className="hidden sm:inline ml-2 text-neutral-400 font-normal text-lg">· Cursos</span>
                                        </h1>
                                        <p className="text-xs sm:text-sm text-neutral-500 truncate">
                                            {selectedGrado.nivel?.nombre_nivel ?? '—'}
                                            <span className="mx-1">·</span>
                                            <span className="font-semibold text-emerald-600">{cursos.length} cursos</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <div className="relative w-full sm:w-auto">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <Input
                                            value={searchCurso}
                                            onChange={(e) => setSearchCurso(e.target.value)}
                                            placeholder="Buscar curso..."
                                            className="pl-9 w-full sm:w-56"
                                        />
                                    </div>
                                    <Button onClick={openCreate} className="bg-[#00a65a] hover:bg-[#008d4c] text-white gap-2 w-full sm:w-auto">
                                        <Plus className="h-4 w-4" />
                                        Agregar Curso
                                    </Button>
                                </div>
                            </div>

                            <ResourceTable
                                rows={{
                                    data:         cursosFiltrados,
                                    current_page: 1,
                                    last_page:    1,
                                    per_page:     cursosFiltrados.length,
                                    total:        cursosFiltrados.length,
                                    from:         1,
                                    to:           cursosFiltrados.length,
                                }}
                                getKey={(c) => c.curso_id}
                                onEdit={openEdit}
                                onDelete={confirmDeleteCurso}
                                onPageChange={() => {}}
                                columns={[
                                    { label: 'Curso',       className: 'font-bold', render: (c) => c.nombre },
                                    { label: 'Descripción', render: (c) => (
                                        <span className="text-gray-500 line-clamp-2 md:line-clamp-none">
                                            {c.descripcion || '—'}
                                        </span>
                                    )},
                                    { label: 'Estado',      className: 'text-center', render: (c) => (
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.estado === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {c.estado === '1' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    )},
                                ]}
                            />
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
                onClose={() => { setGradoModalOpen(false); setEditingGrado(null); setGradoApiErrors({}); }}
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
