import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Mensaje } from './useMensajes';

export function useMensajeDetalle(mensajeId: number) {
    const [mensaje, setMensaje] = useState<Mensaje | null>(null);
    const [loading, setLoading] = useState(true);
    const [respuesta, setRespuesta] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadMessage();
    }, [mensajeId]);

    const loadMessage = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/mensajes-legacy/${mensajeId}`);
            setMensaje(res.data);
        } catch (error) {
            console.error('Error al cargar mensaje:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!respuesta.trim()) return;

        setSending(true);
        try {
            await api.post(`/mensajes-legacy/${mensajeId}/responder`, { respuesta });
            setRespuesta('');
            await loadMessage();
        } catch (error) {
            console.error('Error al enviar respuesta:', error);
        } finally {
            setSending(false);
        }
    };

    return {
        mensaje,
        loading,
        respuesta,
        setRespuesta,
        sending,
        handleReply,
    };
}
