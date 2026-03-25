import { useEffect, useState } from 'react';
import type { Seccion, SeccionFormData } from './useSecciones';
import { defaultForm } from './useSecciones';

type Props = {
    editing:     Seccion | null;
    open:        boolean;
    onSave:      (data: SeccionFormData) => Promise<void>;
    onClose:     () => void;
    clearErrors: () => void;
};

export function useSeccionForm({ editing, open, onSave, onClose, clearErrors }: Props) {
    const [form, setForm]       = useState<SeccionFormData>(defaultForm);
    const [processing, setProc] = useState(false);

    useEffect(() => {
        clearErrors();
        setForm(editing
            ? {
                id_grado:    editing.id_grado.toString(),
                nombre:      editing.nombre,
                abreviatura: editing.abreviatura ?? '',
                cnt_alumnos: editing.cnt_alumnos.toString(),
                horario:     editing.horario ?? '',
            }
            : defaultForm,
        );
    }, [editing, open]);

    const set = (key: keyof SeccionFormData, value: string) =>
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
