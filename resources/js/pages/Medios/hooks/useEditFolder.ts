import { useState } from 'react';
import api from '@/lib/api';
import type { Medio } from './useMedios';

export function useEditFolder(onSuccess: () => void) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [folderToEdit, setFolderToEdit] = useState<Medio | null>(null);
    const [editFolderName, setEditFolderName] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleEditFolder = (folder: Medio) => {
        setFolderToEdit(folder);
        setEditFolderName(folder.nombre);
        setShowEditModal(true);
    };

    const handleUpdateFolder = async () => {
        if (!folderToEdit || !editFolderName.trim()) return;

        setUpdating(true);
        try {
            await api.put(`/medios/carpeta/${folderToEdit.id_medio}`, {
                nombre: editFolderName,
            });
            onSuccess();
            setShowEditModal(false);
            setFolderToEdit(null);
            setEditFolderName('');
        } catch (error) {
            console.error('Error al actualizar carpeta:', error);
        } finally {
            setUpdating(false);
        }
    };

    return {
        showEditModal,
        setShowEditModal,
        folderToEdit,
        setFolderToEdit,
        editFolderName,
        setEditFolderName,
        updating,
        handleEditFolder,
        handleUpdateFolder,
    };
}
