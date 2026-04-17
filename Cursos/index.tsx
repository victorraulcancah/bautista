import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ConfirmDeleteModal from '../resources/js/components/shared/ConfirmDeleteModal';
import { useOptions } from '../resources/js/hooks/useOptions';
import AppLayout from '../resources/js/layouts/app-layout';
import GradoFormModal from '../resources/js/pages/Grados/components/GradoFormModal';
import type { Grado, GradoFormData, Nivel } from '../resources/js/pages/Grados/hooks/useGrados';
import AsignarCursoModal from './components/AsignarCursoModal';
import CursoFormModal from './components/CursoFormModal';
import CursosTable from './components/CursosTable';
import GradosTable from './components/GradosTable';
import { useCursoActions } from './hooks/useCursoActions';
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

    // ── Modal state ─────────────────────────────────────────────────────────────
    const [modalCrearOpen,  setModalCrearOpen]  = useState(false);
    const [editing,         setEditing]         = useState<Curso | null>(null);
    const [apiErrors,       setApiErrors]       = useState<Record<string, string[]>>({});
    const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
    const [gradoModalOpen,  setGradoModalOpen]  = useState(false);
    const [editingGrado,    setEditingGrado]    = useState<Grado | null>(null);
    const [gradoApiErrors,  setGradoApiErrors]  = useState<Record<string, string[]>>({});

    // ── Actions ─────────────────────────────────────────────────────────────────
    const {
        deleteModal,
        closeDeleteModal,
        openCreateCurso,
        openEditCurso,
        handleSaveCurso,
        confirmDeleteCurso,
        handleSaveGrado,
        confirmDeleteGrado,
    } = useCursoActions({
        editing,
        selectedGrado,
        modoNivelDirecto,
        reloadCursos,
        setGrados,
        setEditing,
        setModalCrearOpen,
        setApiErrors,
    });

    // Resolver nombre del nivel desde la URL
    useEffect(() => {
        if (nivelIdFromUrl && niveles.length > 0) {
            const nivel = niveles.find((n: NivelOption) => n.nivel_id.toString() === nivelIdFromUrl);
            setNivelNombre(nivel?.nombre_nivel ?? '');
        }
    }, [nivelIdFromUrl, niveles, setNivelNombre]);

    // ── Grado handlers ───────────────────────────────────────────────────────────
    const openEditGrado = (g: Grado) => {
        setEditingGrado(g);
        setGradoApiErrors({});
        setGradoModalOpen(true);
    };

    const handleSaveGradoWrapper = async (data: GradoFormData) => {
        try {
            await handleSaveGrado(editingGrado, data);
        } catch (e: any) {
            setGradoApiErrors(e?.response?.data?.errors ?? {});
            throw e;
        }
    };

    const closeGradoModal = () => {
        setGradoModalOpen(false);
        setEditingGrado(null);
        setGradoApiErrors({});
    };

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <>
            <Head title="Cursos" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 p-3 sm:p-6">
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

                    {(selectedGrado || modoNivelDirecto) && (
                        <CursosTable
                            cursos={cursosFiltrados}
                            loading={loadingCursos}
                            search={searchCurso}
                            onSearchChange={setSearchCurso}
                            onBack={handleBack}
                            onCreate={modoNivelDirecto ? openCreateCurso : () => setModalAsignarOpen(true)}
                            onEdit={modoNivelDirecto ? openEditCurso : () => {}}
                            onDelete={confirmDeleteCurso}
                            title={modoNivelDirecto ? `Cursos ${nivelNombre}` : selectedGrado?.nombre_grado ?? ''}
                            subtitle={modoNivelDirecto ? nivelNombre : selectedGrado?.nivel?.nombre_nivel ?? '—'}
                            modoNivelDirecto={modoNivelDirecto}
                        />
                    )}
                </div>
            </AppLayout>

            {/* Modal crear / editar curso */}
            <CursoFormModal
                open={modalCrearOpen}
                onClose={() => { setModalCrearOpen(false); setEditing(null); }}
                editing={editing}
                niveles={niveles}
                grados={grados}
                defaults={formDefaults}
                onSave={handleSaveCurso}
                apiErrors={apiErrors}
                clearErrors={() => setApiErrors({})}
            />

            {/* Modal asignar curso a grado */}
            {selectedGrado && (
                <AsignarCursoModal
                    open={modalAsignarOpen}
                    onClose={() => setModalAsignarOpen(false)}
                    gradoId={selectedGrado.grado_id}
                    nivelNombre={selectedGrado.nivel?.nombre_nivel ?? ''}
                    onSuccess={reloadCursos}
                />
            )}

            {/* Modal editar grado */}
            <GradoFormModal
                open={gradoModalOpen}
                onClose={closeGradoModal}
                editing={editingGrado}
                niveles={niveles as Nivel[]}
                onSave={handleSaveGradoWrapper}
                apiErrors={gradoApiErrors}
                clearErrors={() => setGradoApiErrors({})}
            />

            {/* Modal confirmar eliminación */}
            <ConfirmDeleteModal
                open={deleteModal.open}
                title={deleteModal.title}
                message={deleteModal.message}
                processing={deleteModal.processing}
                onClose={closeDeleteModal}
                onConfirm={deleteModal.onConfirm}
            />
        </>
    );
}
