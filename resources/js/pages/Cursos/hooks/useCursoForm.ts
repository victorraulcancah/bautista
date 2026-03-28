import { useEffect, useState } from 'react';
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

    useEffect(() => {
        clearErrors();
        setForm(editing
            ? {
                nombre:             editing.nombre,
                descripcion:        editing.descripcion ?? '',
                nivel_academico_id: editing.nivel_academico_id?.toString() ?? '',
                grado_academico:    editing.grado_academico?.toString() ?? '',
                estado:             editing.estado,
            }
            : { ...defaultForm, ...defaults },
        );
    }, [editing, open]);

    const set = (key: keyof CursoFormData, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

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

    return { form, set, processing, handleSubmit };
}
