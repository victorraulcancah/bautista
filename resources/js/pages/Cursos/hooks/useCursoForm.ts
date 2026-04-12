import { useEffect, useState, useCallback } from 'react';
import type { Curso, CursoFormData } from './useCursos';
import { defaultForm } from './useCursos';

type Props = {
    editing:     Curso | null;
    open:        boolean;
    defaults?:   Partial<CursoFormData>;
    onSave:      (data: CursoFormData) => Promise<void>;
    onClose:     () => void;
    clearErrors: () => void;
};

export function useCursoForm({ editing, open, defaults, onSave, onClose, clearErrors }: Props) {
    const [form, setForm]       = useState<CursoFormData>(defaultForm);
    const [processing, setProc] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        clearErrors();
        setForm(editing
            ? {
                nombre:             editing.nombre,
                descripcion:        editing.descripcion ?? '',
                nivel_academico_id: editing.nivel_academico_id?.toString() ?? '',
                grado_academico:    editing.grado_academico?.toString() ?? '',
                estado:             editing.estado,
                logo:               null, // El archivo nuevo se maneja aparte
            }
            : { ...defaultForm, ...defaults },
        );
        setPreview(editing?.logo ?? null);
    }, [editing, open]);

    const set = (key: keyof CursoFormData, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setForm(prev => ({ ...prev, logo: file }));
            setPreview(URL.createObjectURL(file));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProc(true);

        try {
            await onSave(form);
            onClose();
        } catch {
            // apiErrors manejados por useResource
        } finally {
            setProc(false);
        }
    };

    return { form, set, processing, handleSubmit, preview, handleFileChange };
}
