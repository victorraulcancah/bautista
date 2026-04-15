import { useState } from 'react';
import { useResource } from '@/hooks/useResource';
import type { Actividad } from '../types';

export function useExamenesPage(cursoId?: number) {
    const endpoint = cursoId ? `/actividades?curso_id=${cursoId}` : '/actividades';
    const res = useResource<Actividad>(endpoint);

    const [modalOpen, setModalOpen]   = useState(false);
    const [editing, setEditing]       = useState<Actividad | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selected, setSelected]     = useState<Actividad | null>(null);

    const openCreate = () => { setEditing(null); setModalOpen(true); };
    const openEdit   = (a: Actividad) => { setEditing(a); setModalOpen(true); };
    const openDrawer = (a: Actividad) => { setSelected(a); setDrawerOpen(true); };
    const closeModal  = () => setModalOpen(false);
    const closeDrawer = () => setDrawerOpen(false);

    const handleSave = async (data: any) => {
        if (editing) {
            await res.update(editing.actividad_id, data);
        } else {
            await res.create(data);
        }
    };

    return {
        res,
        modalOpen, editing, openCreate, openEdit, closeModal, handleSave,
        drawerOpen, selected, openDrawer, closeDrawer,
    };
}
