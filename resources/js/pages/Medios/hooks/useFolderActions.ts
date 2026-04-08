import { useState } from 'react';
import api from '@/lib/api';

export function useFolderActions(currentFolder: number | null, onSuccess: () => void) {
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [creatingFolder, setCreatingFolder] = useState(false);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        setCreatingFolder(true);
        try {
            await api.post('/medios/carpeta', {
                nombre: newFolderName,
                carpeta_id: currentFolder,
            });
            onSuccess();
            setShowNewFolderModal(false);
            setNewFolderName('');
        } catch (error) {
            console.error('Error al crear carpeta:', error);
        } finally {
            setCreatingFolder(false);
        }
    };

    return {
        showNewFolderModal,
        setShowNewFolderModal,
        newFolderName,
        setNewFolderName,
        creatingFolder,
        handleCreateFolder,
    };
}
