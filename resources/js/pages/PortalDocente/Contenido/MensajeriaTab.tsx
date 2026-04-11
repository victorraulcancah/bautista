import { useState, useEffect } from 'react';
import { Mail, Send, Reply, User, Search, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

export default function MensajeriaTab({ docenteCursoId }: { docenteCursoId: number }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadData();
    }, [docenteCursoId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [msgRes, stuRes] = await Promise.all([
                api.get(`/mensajes-legacy/recibidos`),
                api.get(`/docente/curso/${docenteCursoId}/alumnos`)
            ]);
            // Filtrar mensajes que podrían ser de este curso (difícil sin ID de curso en mensaje, pero podemos filtrar por remitente si es alumno)
            setMessages(msgRes.data);
            setStudents(stuRes.data);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!selectedStudent || !messageText.trim()) return;
        setSending(true);
        try {
            await api.post('/mensajes-legacy/enviar', {
                destinatario_id: selectedStudent.usuario_id || selectedStudent.id,
                asunto: `Consulta: Curso ID ${docenteCursoId}`,
                cuerpo: messageText
            });
            setMessageText('');
            setSelectedStudent(null);
            alert('Mensaje enviado correctamente');
            loadData();
        } catch (error) {
            alert('Error al enviar mensaje');
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className="p-20 text-center animate-pulse">
            <Loader2 className="mx-auto size-8 text-indigo-400 animate-spin mb-4" />
            <p className="font-black text-[10px] uppercase tracking-widest text-gray-400">Cargando Mensajería...</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Alumnos/Contactos */}
            <Card className="rounded-[2.5rem] border-none shadow-sm h-[600px] flex flex-col overflow-hidden bg-white">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-black text-gray-900 mb-4 uppercase text-xs tracking-widest">Estudiantes del Curso</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <Input placeholder="Buscar alumno..." className="pl-9 h-10 rounded-xl border-none bg-gray-50 text-xs font-bold" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {students.map(s => (
                        <div 
                            key={s.estu_id}
                            onClick={() => setSelectedStudent(s)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${selectedStudent?.estu_id === s.estu_id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-gray-50'}`}
                        >
                            <div className={`size-10 rounded-xl flex items-center justify-center font-black text-xs ${selectedStudent?.estu_id === s.estu_id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                                {s.perfil?.primer_nombre?.[0]}{s.perfil?.apellido_paterno?.[0]}
                            </div>
                            <div>
                                <p className="font-bold text-sm line-clamp-1">{s.perfil?.primer_nombre} {s.perfil?.apellido_paterno}</p>
                                <p className={`text-[9px] font-black uppercase tracking-widest ${selectedStudent?.estu_id === s.estu_id ? 'text-indigo-200' : 'text-gray-400'}`}>Estudiante</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Panel de Chat / Mensaje */}
            <div className="lg:col-span-2 space-y-6">
                {selectedStudent ? (
                    <Card className="rounded-[2.5rem] border-none shadow-sm h-[600px] flex flex-col overflow-hidden bg-white">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-indigo-50/10">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white">
                                    {selectedStudent.perfil?.primer_nombre?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 leading-none">{selectedStudent.perfil?.primer_nombre} {selectedStudent.perfil?.apellido_paterno}</h3>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Chat Directo</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#fcfdfe]">
                            <div className="flex flex-col items-center justify-center h-full opacity-20 grayscale">
                                <Mail size={64} className="mb-4 text-indigo-200" />
                                <p className="font-black text-xs uppercase tracking-widest">Inicia una conversación</p>
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-100 bg-white">
                            <div className="flex gap-3">
                                <textarea 
                                    className="flex-1 bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-indigo-100 transition-all resize-none h-14"
                                    placeholder={`Escribe un mensaje a ${selectedStudent.perfil?.primer_nombre}...`}
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                />
                                <Button 
                                    onClick={handleSend}
                                    disabled={sending || !messageText.trim()}
                                    className="size-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0"
                                >
                                    {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="rounded-[2.5rem] border-none shadow-sm h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white">
                        <div className="size-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Buzón de Mensajes</h3>
                        <p className="text-gray-500 font-bold max-w-xs mx-auto text-sm leading-relaxed">
                            Selecciona un estudiante de la lista para enviarle una notificación o responder sus consultas.
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
}
