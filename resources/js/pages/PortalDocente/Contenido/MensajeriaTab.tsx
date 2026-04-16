import { useState, useEffect, useRef } from 'react';
import { Mail, Send, Search, ArrowLeft, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function MensajeriaTab({ docenteCursoId }: { docenteCursoId: number }) {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [mensajes, setMensajes] = useState<any[]>([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [texto, setTexto] = useState('');
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');
    const [showChat, setShowChat] = useState(false); // móvil: alterna lista/chat
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.get(`/docente/curso/${docenteCursoId}/alumnos`)
            .then(res => setStudents(res.data.data || []))
            .catch(() => setStudents([]))
            .finally(() => setLoading(false));
    }, [docenteCursoId]);

    const cargarHilo = async (student: any) => {
        if (!student.user_id) return;
        setLoadingMsgs(true);
        try {
            const [recibidos, enviados] = await Promise.all([
                api.get('/mensajes-legacy/recibidos'),
                api.get('/mensajes-legacy/enviados'),
            ]);
            const uid = student.user_id;
            const hilo = [
                ...(recibidos.data ?? []).filter((m: any) => m.remitente_id === uid),
                ...(enviados.data ?? []).filter((m: any) => m.destinatario_id === uid),
            ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            setMensajes(hilo);
        } finally {
            setLoadingMsgs(false);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    };

    const selectStudent = (s: any) => {
        setSelectedStudent(s);
        setShowChat(true);
        cargarHilo(s);
    };

    const handleSend = async () => {
        if (!selectedStudent?.user_id || !texto.trim()) return;
        setSending(true);
        try {
            await api.post('/mensajes-legacy/enviar', {
                destinatario_id: selectedStudent.user_id,
                asunto: `Mensaje docente - Curso ${docenteCursoId}`,
                cuerpo: texto,
            });
            setTexto('');
            await cargarHilo(selectedStudent);
        } finally {
            setSending(false);
        }
    };

    const filtered = students.filter(s =>
        !search || s.nombre?.toLowerCase().includes(search.toLowerCase())
    );

    // ── Sidebar de alumnos ──────────────────────────────────────────────────
    const Sidebar = (
        <div className={`flex flex-col bg-white border-r border-gray-100 h-[600px]
            ${showChat ? 'hidden lg:flex' : 'flex'}
            w-full lg:w-72 shrink-0`}
        >
            <div className="p-4 border-b border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Estudiantes del Curso</p>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar alumno..."
                        className="pl-8 h-9 rounded-xl border-gray-100 bg-gray-50 text-xs font-bold"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-5 h-5 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">Sin resultados</p>
                ) : filtered.map(s => (
                    <button
                        key={s.estu_id}
                        onClick={() => selectStudent(s)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                            selectedStudent?.estu_id === s.estu_id
                                ? 'bg-emerald-600 text-white'
                                : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                        <div className={`size-9 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                            selectedStudent?.estu_id === s.estu_id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                            {s.nombre?.[0] ?? '?'}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-xs truncate capitalize">{s.nombre}</p>
                            <p className={`text-[9px] uppercase tracking-widest ${
                                selectedStudent?.estu_id === s.estu_id ? 'text-emerald-200' : 'text-gray-400'
                            }`}>
                                {s.user_id ? 'Con cuenta' : 'Sin cuenta'}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    // ── Panel de chat ───────────────────────────────────────────────────────
    const ChatPanel = (
        <div className={`flex flex-col flex-1 h-[600px] bg-white
            ${!showChat ? 'hidden lg:flex' : 'flex'}`}
        >
            {!selectedStudent ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                    <Mail className="size-12 opacity-20" />
                    <p className="text-sm font-semibold">Selecciona un estudiante</p>
                </div>
            ) : (
                <>
                    {/* Header chat */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-emerald-600 text-white">
                        <button
                            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10"
                            onClick={() => setShowChat(false)}
                        >
                            <ArrowLeft className="size-4" />
                        </button>
                        <div className="size-9 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
                            {selectedStudent.nombre?.[0] ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm capitalize truncate">{selectedStudent.nombre}</p>
                            <p className="text-[10px] text-emerald-200 uppercase tracking-widest">Chat directo</p>
                        </div>
                        <button onClick={() => cargarHilo(selectedStudent)} className="p-1.5 rounded-lg hover:bg-white/10">
                            <RefreshCw className={`size-4 ${loadingMsgs ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50">
                        {loadingMsgs ? (
                            <div className="flex justify-center py-10">
                                <div className="w-5 h-5 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : mensajes.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <p className="text-xs font-medium">Sin mensajes aún</p>
                            </div>
                        ) : mensajes.map((m: any) => {
                            const esMio = m.remitente_id !== selectedStudent.user_id;
                            return (
                                <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] px-3 py-2.5 rounded-2xl text-sm shadow-sm ${
                                        esMio
                                            ? 'bg-emerald-600 text-white rounded-br-sm'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                                    }`}>
                                        <p className="leading-relaxed text-sm">{m.cuerpo}</p>
                                        <p className={`text-[10px] mt-1 ${esMio ? 'text-emerald-200' : 'text-gray-400'}`}>
                                            {new Date(m.created_at).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="px-3 py-3 border-t border-gray-100 bg-white">
                        <div className="flex gap-2 items-end">
                            <textarea
                                rows={2}
                                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                                placeholder={selectedStudent.user_id ? `Mensaje a ${selectedStudent.nombre?.split(' ')[0]}...` : 'Este alumno no tiene cuenta'}
                                disabled={!selectedStudent.user_id}
                                value={texto}
                                onChange={e => setTexto(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={sending || !texto.trim() || !selectedStudent.user_id}
                                className="size-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors shrink-0"
                            >
                                <Send className="size-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="flex border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {Sidebar}
            {ChatPanel}
        </div>
    );
}
