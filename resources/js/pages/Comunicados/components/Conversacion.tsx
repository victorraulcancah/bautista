import { ArrowLeft, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const fmtDate = (iso: string) => {
    const d = new Date(iso);

    return d.toLocaleDateString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};


type Respuesta = {
    id:         number;
    respuesta:  string;
    created_at: string;
    autor: { id: number; nombre: string; foto?: string | null };
};

type MensajeDetalle = {
    id:          number;
    asunto:      string;
    cuerpo:      string;
    leido:       boolean;
    created_at:  string;
    remitente:   { id: number; nombre: string; foto?: string | null } | null;
    destinatario:{ id: number; nombre: string; foto?: string | null } | null;
    grupo:       { id: number; nombre: string; foto?: string | null } | null;
    respuestas:  Respuesta[];
};

type Props = {
    mensajeId: number;
    userId:    number;
    onBack:    () => void;
};

export default function Conversacion({ mensajeId, userId, onBack }: Props) {
    const [mensaje, setMensaje]     = useState<MensajeDetalle | null>(null);
    const [loading, setLoading]     = useState(true);
    const [respuesta, setRespuesta] = useState('');
    const [sending, setSending]     = useState(false);
    const bottomRef                 = useRef<HTMLDivElement>(null);

    const load = async () => {
        setLoading(true);

        try {
            const { data } = await api.get(`/mensajes/${mensajeId}`);
            setMensaje(data.data ?? data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
 load(); 
}, [mensajeId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensaje?.respuestas]);

    const enviarRespuesta = async () => {
        if (!respuesta.trim()) {
return;
}

        setSending(true);

        try {
            const { data } = await api.post(`/mensajes/${mensajeId}/responder`, { respuesta });
            setMensaje((prev) => prev ? {
                ...prev,
                respuestas: [...prev.respuestas, data],
            } : prev);
            setRespuesta('');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center text-sm text-gray-400">Cargando...</div>;
    }

    if (!mensaje) {
return null;
}

    const otro = mensaje.remitente?.id === userId ? mensaje.destinatario : mensaje.remitente;
    const destinoNombre = mensaje.grupo?.nombre ?? otro?.nombre ?? '—';
    const destinoFoto = mensaje.grupo?.foto ?? otro?.foto ?? null;

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 bg-white">
                <button onClick={onBack} className="rounded p-1 hover:bg-gray-100">
                    <ArrowLeft className="size-5 text-gray-500" />
                </button>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex items-center justify-center text-gray-500 font-bold">
                        {destinoFoto ? (
                            <img src={destinoFoto} alt={destinoNombre} className="w-full h-full object-cover" />
                        ) : (
                            destinoNombre.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-bold text-gray-900">{destinoNombre}</p>
                        <p className="text-xs text-gray-500 truncate">{mensaje.asunto}</p>
                    </div>
                </div>
            </div>

            {/* Chat */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#E5DDD5]">
                {mensaje.respuestas.map((r) => {
                    const esMio = r.autor.id === userId;

                    return (
                        <div key={r.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                            {!esMio && (
                                <div className="flex-shrink-0 mr-2 mt-auto mb-1">
                                    {r.autor.foto ? (
                                        <img src={r.autor.foto} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                                            {r.autor.nombre?.charAt(0) ?? '?'}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${esMio ? 'bg-[#dcf8c6] text-gray-900 rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm'}`}>
                                {!esMio && (
                                    <p className="mb-1 text-xs font-bold text-[#075e54]">{r.autor.nombre}</p>
                                )}
                                <div
                                    className="prose prose-sm max-w-none whitespace-pre-wrap break-words"
                                    dangerouslySetInnerHTML={{ __html: r.respuesta }}
                                />
                                <p className="mt-1 text-right text-[10px] text-gray-500 font-medium">{fmtDate(r.created_at)}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input de respuesta */}
            <div className="border-t border-gray-100 px-4 py-3">
                <div className="flex items-end gap-2">
                    <textarea
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault(); enviarRespuesta(); 
}
                        }}
                        rows={2}
                        placeholder="Escribe un mensaje... (Enter para enviar)"
                        className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                    />
                    <Button
                        type="button"
                        disabled={sending || !respuesta.trim()}
                        onClick={enviarRespuesta}
                        className="bg-[#00a65a] hover:bg-[#008d4c] text-white shrink-0"
                    >
                        <Send className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
