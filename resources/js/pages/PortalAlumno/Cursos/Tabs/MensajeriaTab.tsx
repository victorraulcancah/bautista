import { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

interface Props {
    teacher: any;
    cursoId: number;
}

export default function MensajeriaTab({ teacher, cursoId }: Props) {
    const [docente, setDocente] = useState<any>(teacher ?? null);
    const [loadingDocente, setLoadingDocente] = useState(!teacher);
    const [mensajes, setMensajes] = useState<any[]>([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [texto, setTexto] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    // Cargar docente si no viene del padre
    useEffect(() => {
        if (teacher) { setDocente(teacher); setLoadingDocente(false); return; }
        api.get('/alumno/profesores')
            .then(res => {
                const profs = res.data ?? [];
                const found = profs.find((p: any) => p.docen_curso_id === cursoId) ?? profs[0] ?? null;
                setDocente(found);
            })
            .catch(() => setDocente(null))
            .finally(() => setLoadingDocente(false));
    }, [cursoId, teacher]);

    // Cargar historial cuando ya tenemos el docente
    useEffect(() => {
        if (docente?.user_id) cargarMensajes();
    }, [docente]);

    const cargarMensajes = async () => {
        setLoadingMsgs(true);
        try {
            const [recibidos, enviados] = await Promise.all([
                api.get('/mensajes-legacy/recibidos'),
                api.get('/mensajes-legacy/enviados'),
            ]);
            const docenteUserId = docente?.user_id;
            // Filtrar solo los mensajes con este docente
            const hilo = [
                ...(recibidos.data ?? []).filter((m: any) => m.remitente_id === docenteUserId),
                ...(enviados.data ?? []).filter((m: any) => m.destinatario_id === docenteUserId),
            ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            setMensajes(hilo);
        } finally {
            setLoadingMsgs(false);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    };

    const enviar = async () => {
        if (!texto.trim() || !docente?.user_id) return;
        setEnviando(true);
        setError('');
        try {
            await api.post('/mensajes-legacy/enviar', {
                destinatario_id: docente.user_id,
                asunto: `Consulta - Curso ${cursoId}`,
                cuerpo: texto,
            });
            setTexto('');
            await cargarMensajes();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'No se pudo enviar.');
        } finally {
            setEnviando(false);
        }
    };

    if (loadingDocente) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!docente) {
        return (
            <div className="text-center py-20 text-gray-400">
                <p className="font-semibold">No hay docente asignado a este curso</p>
            </div>
        );
    }

    const nombre = docente.perfil
        ? `${docente.perfil.primer_nombre ?? ''} ${docente.perfil.apellido_paterno ?? ''}`.trim()
        : (`${docente.nombres ?? ''} ${docente.apellidos ?? ''}`.trim() || 'Docente');

    return (
        <div className="max-w-2xl mx-auto flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden" style={{ height: '600px' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-indigo-600 text-white">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg">
                        {nombre.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-sm capitalize">{nombre}</p>
                        <p className="text-[10px] text-indigo-200 uppercase tracking-widest">Docente del curso</p>
                    </div>
                </div>
                <button onClick={cargarMensajes} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Actualizar">
                    <RefreshCw className={`size-4 ${loadingMsgs ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
                {loadingMsgs ? (
                    <div className="flex justify-center py-10">
                        <div className="w-6 h-6 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : mensajes.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p className="text-sm font-medium">No hay mensajes aún</p>
                        <p className="text-xs mt-1">Envía tu primera consulta al docente</p>
                    </div>
                ) : (
                    mensajes.map((m: any) => {
                        const esMio = m.remitente_id !== docente.user_id;
                        return (
                            <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                                    esMio
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                                }`}>
                                    <p className="leading-relaxed">{m.cuerpo}</p>
                                    <p className={`text-[10px] mt-1 ${esMio ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        {new Date(m.created_at).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
                {error && <p className="text-xs text-rose-500 font-bold mb-2 px-1">{error}</p>}
                <div className="flex gap-2 items-end">
                    <textarea
                        rows={2}
                        className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                        placeholder="Escribe tu consulta..."
                        value={texto}
                        onChange={e => setTexto(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
                    />
                    <button
                        onClick={enviar}
                        disabled={enviando || !texto.trim()}
                        className="size-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors shrink-0"
                    >
                        <Send className="size-4" />
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 px-1">Enter para enviar · Shift+Enter para nueva línea</p>
            </div>
        </div>
    );
}
