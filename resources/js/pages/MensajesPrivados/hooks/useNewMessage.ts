import { useState } from 'react';
import api from '@/lib/api';

export type Contacto = {
    id: number;
    id_rol: number;
    perfil?: {
        primer_nombre: string;
        apellido_paterno: string;
        foto_perfil?: string | null;
    };
};

export function useNewMessage(onSuccess: () => void) {
    const [isOpen, setIsOpen] = useState(false);
    const [destinatario, setDestinatario] = useState<Contacto | null>(null);
    const [contactos, setContactos] = useState<Contacto[]>([]);
    const [asunto, setAsunto] = useState('');
    const [cuerpo, setCuerpo] = useState('');
    const [sending, setSending] = useState(false);

    const handleSearchContact = async (q: string) => {
        if (q.length < 2) {
            setContactos([]);
            return;
        }

        try {
            const res = await api.get(`/mensajes-legacy/contactos?q=${q}`);
            setContactos(res.data);
        } catch (error) {
            console.error('Error al buscar contactos:', error);
        }
    };

    const handleSend = async () => {
        if (!destinatario || !asunto || !cuerpo) {
            alert('Completa todos los campos.');
            return;
        }

        setSending(true);
        try {
            await api.post('/mensajes-legacy/enviar', {
                destinatario_id: destinatario.id,
                asunto,
                cuerpo,
            });
            
            // Reset form
            setIsOpen(false);
            setAsunto('');
            setCuerpo('');
            setDestinatario(null);
            setContactos([]);
            
            onSuccess();
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        } finally {
            setSending(false);
        }
    };

    const resetForm = () => {
        setAsunto('');
        setCuerpo('');
        setDestinatario(null);
        setContactos([]);
    };

    return {
        isOpen,
        setIsOpen,
        destinatario,
        setDestinatario,
        contactos,
        setContactos,
        asunto,
        setAsunto,
        cuerpo,
        setCuerpo,
        sending,
        handleSearchContact,
        handleSend,
        resetForm,
    };
}
