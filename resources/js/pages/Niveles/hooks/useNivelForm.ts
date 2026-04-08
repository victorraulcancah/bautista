import { useEffect, useState } from 'react';
import type { Nivel, NivelFormData } from './useNiveles';
import { defaultForm } from './useNiveles';

type Props = {
    editing:     Nivel | null;
    open:        boolean;
    onSave:      (data: NivelFormData) => Promise<void>;
    onClose:     () => void;
    clearErrors: () => void;
};

export function useNivelForm({ editing, open, onSave, onClose, clearErrors }: Props) {
    const [form, setForm]       = useState<NivelFormData>(defaultForm);
    const [processing, setProc] = useState(false);

    useEffect(() => {
        clearErrors();
        setForm(editing
            ? {
                insti_id:      editing.insti_id.toString(),
                nombre_nivel:  editing.nombre_nivel,
                nivel_estatus: editing.nivel_estatus.toString(),
            }
            : defaultForm,
        );
    }, [editing, open]);

    const set = (key: keyof NivelFormData, value: string) =>
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
