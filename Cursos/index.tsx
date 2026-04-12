import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { useOptions } from '@/hooks/useOptions';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import GradoFormModal from '../Grados/components/GradoFormModal';
import type { Grado, GradoFormData, Nivel } from '../Grados/hooks/useGrados';
import AsignarCursoModal from './components/AsignarCursoModal';
import CursoFormModal from './components/CursoFormModal';
import CursosTable from './components/CursosTable';
import GradosTable from './components/GradosTable';
import type { Curso, CursoFormData, NivelOption } from './hooks/useCursos';
import { useCursosPage } from './hooks/useCursosPage';

export default function CursosPage() {
    const niveles = useOptions<NivelOption>('/niveles');
    const {
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
        handleSelectGrado,
        handleBack,
        reloadCursos,
        setGrados,
    } = useCursosPage();

    // Modal para CREAR cursos (desde nivel)
    const [modalCrearOpen, setModalCrearOpen] = useState(false);
    const [editing, setEditing] = useState<Curso | null>(null);
    const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

    // Modal para ASIGNAR cursos (desde grado)
    const [modalAsignarOpen, setModalAsignarOpen] = useState(false);

    // Grado edit modal
    const [gradoModalOpen, setGradoModalOpen] = useState(false);
    const [editingGrado, setEditingGrado] = useState<Grado | null>(null);
    const [gradoApiErrors, setGradoApiErrors] = useState<Record<string, string[]>>({});

    // Confirm delete modal
    const [deleteModal, setDeleteModal] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => Promise<void>;
        processing: boolean;
    }>({ open: false, title: '', message: '', onConfirm: async () => {}, processing: false });

    // Obtener el nombre del nivel
    useEffect(() => {
        if (nivelIdFromUrl && niveles.length > 0) {
            const nivel = niveles.find((n) => n.nivel_id.toString() === nivelIdFromUrl);
            setNivelNombre(nivel?.nombre_nivel ?? '');
        }
    }, [nivelIdFromUrl, niveles, setNivelNombre]);

    // ── Handlers para CREAR cursos (modo nivel directo) ──
    const openCreateCurso = () => {
        setEditing(null);
        setApiErrors({});
        setModalCrearOpen(true);
    };

    const handleSaveCrearCurso = async (data: CursoFormData) => {
        try {
            // Si hay un archivo, usar FormData
            if (data.logo instanceof File) {
                const formData = new FormData();
                formData.append('nombre', data.nombre);
                formData.append('descripcion', data.descripcion);
                formData.append('nivel_academico_id', data.nivel_academico_id);
                formData.append('grado_academico', data.grado_academico);
                formData.append('estado', data.estado);
                formData.append('logo', data.logo);

                if (editing) {
                    formData.append('_method', 'PUT');
                    await api.post(`/cursos/${editing.curso_id}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                } else {
                    await api.post('/cursos', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                }
            } else {
                // Sin archivo, enviar JSON sin el campo logo
                const { logo, ...dataWithoutLogo } = data;

                if (editing) {
                    await api.put(`/cursos/${editing.curso_id}`, dataWithoutLogo);
                } else {
                    await api.post('/cursos', dataWithoutLogo);
                }
            }

            await reloadCursos();
        } catch (e: any) {
            setApiErrors(e?.response?.data?.errors ?? {});
            throw e;
        }
    };

    // ── Handlers para ASIGNAR cursos (modo grado seleccionado) ──
    const openAsignarCurso = () => {
        setModalAsignarOpen(true);
    };

    const confirmDeleteCurso = (c: Curso & { grac_id?: number }) => {
        // En modo nivel directo, eliminar el curso
        // En modo grado, desasignar el curso
        const isAsignacion = selectedGrado && !modoNivelDirecto;

        setDeleteModal({
            open: true,
            title: isAsignacion ? 'Desasignar Curso' : 'Eliminar Curso',
            message: isAsignacion
                ? `¿Estás seguro de que deseas desasignar el curso "${c.nombre}" de este grado?`
                : `¿Estás seguro de que deseas eliminar el curso "${c.nombre}"? Esta acción no se puede deshacer.`,
            processing: false,
            onConfirm: async () => {
                setDeleteModal((p) => ({ ...p, processing: true }));

                if (isAsignacion && c.grac_id) {
                    // Desasignar curso del grado
                    await api.delete(`/grados/${selectedGrado.grado_id}/cursos/${c.grac_id}`);
                } else {
                    // Eliminar curso completamente
                    await api.delete(`/cursos/${c.curso_id}`);
                }

                setDeleteModal((p) => ({ ...p, open: false, processing: false }));
                await reloadCursos();
            },
        });
    };

    // ── Grado handlers ──
    const openEditGrado = (g: Grado) => {
        setEditingGrado(g);
        setGradoApiErrors({});
        setGradoModalOpen(true);
    };

    const handleSaveGrado = async (data: GradoFormData) => {
        try {
            if (editingGrado) {
                const res = await api.put(`/grados/${editingGrado.grado_id}`, data);
                const updated: Grado = res.data.data ?? res.data;
                setGrados((prev) => prev.map((g) => (g.grado_id === updated.grado_id ? updated : g)));
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

    return (
        <>
            <Head title="Cursos" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 p-3 sm:p-6">
                    {/* Vista de Grados */}
                    {!selectedGrado && !modoNivelDirecto && (
                        <GradosTable
                            grados={gradosFiltrados}
                            loading={loadingGrados}
                            search={searchGrado}
                            onSearchChange={setSearchGrado}
                            onSelectGrado={handleSelectGrado}
                            onEditGrado={openEditGrado}
                            onDeleteGrado={confirmDeleteGrado}
                        />
                    )}

                    {/* Vista de Cursos */}
                    {(selectedGrado || modoNivelDirecto) && (
                        <CursosTable
                            cursos={cursosFiltrados}
                            loading={loadingCursos}
                            search={searchCurso}
                            onSearchChange={setSearchCurso}
                            onBack={handleBack}
                            onCreate={modoNivelDirecto ? openCreateCurso : openAsignarCurso}
                            onEdit={() => {}} // No se edita en modo asignación
                            onDelete={confirmDeleteCurso}
                            title={modoNivelDirecto ? `Cursos ${nivelNombre}` : selectedGrado?.nombre_grado ?? ''}
                            subtitle={modoNivelDirecto ? nivelNombre : selectedGrado?.nivel?.nombre_nivel ?? '—'}
                            modoNivelDirecto={modoNivelDirecto}
                        />
                    )}
                </div>
            </AppLayout>

            {/* Modal para CREAR cursos (modo nivel directo) */}
            <CursoFormModal
                open={modalCrearOpen}
                onClose={() => setModalCrearOpen(false)}
                editing={editing}
                niveles={niveles}
                grados={grados}
                defaults={formDefaults}
                onSave={handleSaveCrearCurso}
                apiErrors={apiErrors}
                clearErrors={() => setApiErrors({})}
            />

            {/* Modal para ASIGNAR cursos (modo grado seleccionado) */}
            {selectedGrado && (
                <AsignarCursoModal
                    open={modalAsignarOpen}
                    onClose={() => setModalAsignarOpen(false)}
                    gradoId={selectedGrado.grado_id}
                    nivelNombre={selectedGrado.nivel?.nombre_nivel ?? ''}
                    onSuccess={reloadCursos}
                />
            )}

            <GradoFormModal
                open={gradoModalOpen}
                onClose={() => {
                    setGradoModalOpen(false);
                    setEditingGrado(null);
                    setGradoApiErrors({});
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
