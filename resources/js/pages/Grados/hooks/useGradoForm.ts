import { useEffect, useState } from 'react';
import type { Grado, GradoFormData } from './useGrados';
import { defaultForm } from './useGrados';

type Props = {
    editing:     Grado | null;
    open:        boolean;
    onSave:      (data: GradoFormData) => Promise<void>;
    onClose:     () => void;
    clearErrors: () => void;
};

export function useGradoForm({ editing, open, onSave, onClose, clearErrors }: Props) {
    const [form, setForm]       = useState<GradoFormData>(defaultForm);
    const [processing, setProc] = useState(false);

    useEffect(() => {
        clearErrors();
        setForm(editing
            ? {
                nivel_id:     editing.nivel_id.toString(),
                nombre_grado: editing.nombre_grado,
                abreviatura:  editing.abreviatura ?? '',
            }
            : defaultForm,
        );
    }, [editing, open]);

    const set = (key: keyof GradoFormData, value: string) =>
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
