import { useState } from 'react';
import api from '../../resources/js/lib/api';
import type { Grado, GradoFormData } from '../../resources/js/pages/Grados/hooks/useGrados';
import type { Curso, CursoFormData } from './useCursos';

type DeleteModalState = {
    open:       boolean;
    title:      string;
    message:    string;
    processing: boolean;
    onConfirm:  () => Promise<void>;
};

const defaultDeleteModal: DeleteModalState = {
    open:       false,
    title:      '',
    message:    '',
    processing: false,
    onConfirm:  async () => {},
};

type Props = {
    editing:      Curso | null;
    selectedGrado: Grado | null;
    modoNivelDirecto: boolean;
    reloadCursos: () => Promise<void>;
    setGrados:    React.Dispatch<React.SetStateAction<Grado[]>>;
    setEditing:   (c: Curso | null) => void;
    setModalCrearOpen: (v: boolean) => void;
    setApiErrors: (e: Record<string, string[]>) => void;
};

export function useCursoActions({
    editing,
    selectedGrado,
    modoNivelDirecto,
    reloadCursos,
    setGrados,
    setEditing,
    setModalCrearOpen,
    setApiErrors,
}: Props) {
    const [deleteModal, setDeleteModal] = useState<DeleteModalState>(defaultDeleteModal);

    // ── Curso CRUD ──────────────────────────────────────────────────────────────

    const openCreateCurso = () => {
        setEditing(null);
        setApiErrors({});
        setModalCrearOpen(true);
    };

    const openEditCurso = (c: Curso) => {
        setEditing(c);
        setApiErrors({});
        setModalCrearOpen(true);
    };

    const handleSaveCurso = async (data: CursoFormData) => {
        try {
            if (data.logo instanceof File) {
                const fd = new FormData();
                fd.append('nombre',             data.nombre);
                fd.append('descripcion',        data.descripcion);
                fd.append('nivel_academico_id', data.nivel_academico_id);
                fd.append('grado_academico',    data.grado_academico);
                fd.append('estado',             data.estado);
                fd.append('logo',               data.logo);

                if (editing) {
                    fd.append('_method', 'PUT');
                    await api.post(`/cursos/${editing.curso_id}`, fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                } else {
                    await api.post('/cursos', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                }
            } else {
                const { logo: _logo, ...payload } = data;
                if (editing) {
                    await api.put(`/cursos/${editing.curso_id}`, payload);
                } else {
                    await api.post('/cursos', payload);
                }
            }
            await reloadCursos();
        } catch (e: any) {
            setApiErrors(e?.response?.data?.errors ?? {});
            throw e;
        }
    };

    const confirmDeleteCurso = (c: Curso & { grac_id?: number }) => {
        const isAsignacion = selectedGrado && !modoNivelDirecto;
        setDeleteModal({
            open:       true,
            processing: false,
            title:      isAsignacion ? 'Desasignar Curso' : 'Eliminar Curso',
            message:    isAsignacion
                ? `¿Estás seguro de que deseas desasignar el curso "${c.nombre}" de este grado?`
                : `¿Estás seguro de que deseas eliminar el curso "${c.nombre}"? Esta acción no se puede deshacer.`,
            onConfirm: async () => {
                setDeleteModal(p => ({ ...p, processing: true }));
                if (isAsignacion && c.grac_id) {
                    await api.delete(`/grados/${selectedGrado.grado_id}/cursos/${c.grac_id}`);
                } else {
                    await api.delete(`/cursos/${c.curso_id}`);
                }
                setDeleteModal(p => ({ ...p, open: false, processing: false }));
                await reloadCursos();
            },
        });
    };

    // ── Grado CRUD ──────────────────────────────────────────────────────────────

    const handleSaveGrado = async (
        editingGrado: Grado | null,
        data: GradoFormData,
    ) => {
        if (!editingGrado) return;
        const res = await api.put(`/grados/${editingGrado.grado_id}`, data);
        const updated: Grado = res.data.data ?? res.data;
        setGrados(prev => prev.map(g => g.grado_id === updated.grado_id ? updated : g));
    };

    const confirmDeleteGrado = (g: Grado) => {
        setDeleteModal({
            open:       true,
            processing: false,
            title:      'Eliminar Grado',
            message:    `¿Estás seguro de que deseas eliminar el grado "${g.nombre_grado}"? Esta acción no se puede deshacer.`,
            onConfirm: async () => {
                setDeleteModal(p => ({ ...p, processing: true }));
                await api.delete(`/grados/${g.grado_id}`);
                setGrados(prev => prev.filter(x => x.grado_id !== g.grado_id));
                setDeleteModal(p => ({ ...p, open: false, processing: false }));
            },
        });
    };

    const closeDeleteModal = () => setDeleteModal(p => ({ ...p, open: false }));

    return {
        deleteModal,
        closeDeleteModal,
        openCreateCurso,
        openEditCurso,
        handleSaveCurso,
        confirmDeleteCurso,
        handleSaveGrado,
        confirmDeleteGrado,
    };
}
