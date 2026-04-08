import { useState } from 'react';
import api from '@/lib/api';

export function useDeleteActions(onSuccess: () => void) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: number; esCarpeta: boolean } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = (id: number, esCarpeta: boolean) => {
        setItemToDelete({ id, esCarpeta });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        setDeleting(true);
        try {
            await api.delete(`/medios/${itemToDelete.id}`);
            onSuccess();
            setShowDeleteModal(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Error al eliminar:', error);
        } finally {
            setDeleting(false);
        }
    };

    return {
        showDeleteModal,
        setShowDeleteModal,
        itemToDelete,
        setItemToDelete,
        deleting,
        handleDelete,
        confirmDelete,
    };
}
