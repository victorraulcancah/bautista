import { useState, useRef } from 'react';
import api from '@/lib/api';

export function useFileUpload(currentFolder: number | null, onSuccess: () => void) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('archivo', file);
        if (currentFolder) {
            formData.append('carpeta_id', String(currentFolder));
        }

        try {
            await api.post('/medios/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onSuccess();
            // Limpiar el input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error al subir archivo:', error);
        } finally {
            setUploading(false);
        }
    };

    return {
        uploading,
        fileInputRef,
        handleUploadClick,
        handleUpload,
    };
}
