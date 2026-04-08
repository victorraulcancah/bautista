import { useState, useEffect } from 'react';
import api from '@/lib/api';

export type Mensaje = {
    id: number;
    asunto: string;
    cuerpo: string;
    leido: boolean;
    created_at: string;
    remitente_id: number;
    destinatario_id: number;
    remitente?: {
        id: number;
        perfil?: {
            primer_nombre: string;
            apellido_paterno: string;
        };
    };
    destinatario?: {
        id: number;
        perfil?: {
            primer_nombre: string;
            apellido_paterno: string;
        };
    };
    respuestas?: any[];
};

export function useMensajes() {
    const [recibidos, setRecibidos] = useState<Mensaje[]>([]);
    const [enviados, setEnviados] = useState<Mensaje[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const [rec, env] = await Promise.all([
                api.get('/mensajes-legacy/recibidos'),
                api.get('/mensajes-legacy/enviados'),
            ]);
            setRecibidos(rec.data);
            setEnviados(env.data);
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecibidos = recibidos.filter((m) =>
        m.asunto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEnviados = enviados.filter((m) =>
        m.asunto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        recibidos: filteredRecibidos,
        enviados: filteredEnviados,
        loading,
        searchTerm,
        setSearchTerm,
        reloadMessages: loadMessages,
    };
}
