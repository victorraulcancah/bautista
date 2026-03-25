import { useEffect, useState } from 'react';
import type { Estudiante, EstudianteFormData } from './useEstudiantes';
import { defaultForm } from './useEstudiantes';

type Props = {
    editing:     Estudiante | null;
    open:        boolean;
    onSave:      (data: EstudianteFormData) => Promise<void>;
    onClose:     () => void;
    clearErrors: () => void;
};

export function useEstudianteForm({ editing, open, onSave, onClose, clearErrors }: Props) {
    const [form, setForm]       = useState<EstudianteFormData>(defaultForm);
    const [processing, setProc] = useState(false);

    useEffect(() => {
        clearErrors();
        if (editing) {
            setForm({
                username:            editing.user?.username           ?? '',
                email:               editing.user?.email              ?? '',
                primer_nombre:       editing.perfil?.primer_nombre    ?? '',
                segundo_nombre:      editing.perfil?.segundo_nombre   ?? '',
                apellido_paterno:    editing.perfil?.apellido_paterno ?? '',
                apellido_materno:    editing.perfil?.apellido_materno ?? '',
                genero:              editing.perfil?.genero           ?? '',
                fecha_nacimiento:    editing.perfil?.fecha_nacimiento ?? '',
                direccion:           editing.perfil?.direccion        ?? '',
                telefono:            editing.perfil?.telefono         ?? '',
                colegio:             editing.colegio                  ?? '',
                neurodivergencia:    editing.neurodivergencia         ?? '',
                terapia_ocupacional: editing.terapia_ocupacional      ?? '',
                edad:                editing.edad?.toString()         ?? '',
                talla:               editing.talla                    ?? '',
                peso:                editing.peso?.toString()         ?? '',
                seguro:              editing.seguro                   ?? '',
                mensualidad:         editing.mensualidad?.toString()  ?? '',
                fecha_ingreso:       editing.fecha_ingreso            ?? '',
                estado:              editing.estado,
            });
        } else {
            setForm(defaultForm);
        }
    }, [editing, open]);

    const set = (key: keyof EstudianteFormData, value: string) =>
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
