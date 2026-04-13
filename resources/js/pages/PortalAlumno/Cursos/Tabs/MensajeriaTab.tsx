import { useState } from 'react';
import { MessageSquare, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';

interface MensajeriaTabProps {
    teacher: any;
    cursoId: number;
}

export default function MensajeriaTab({ teacher, cursoId }: MensajeriaTabProps) {
    const [mensaje, setMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);

    const enviarMensaje = async () => {
        if (!mensaje.trim()) return;
        setEnviando(true);
        try {
            await api.post('/mensajes-legacy/enviar', {
                receptor_id: teacher.user?.id,
                asunto: `Consulta de Alumno - Curso ID: ${cursoId}`,
                mensaje: mensaje
            });
            alert('Mensaje enviado con éxito');
            setMensaje('');
        } catch (error) {
            alert('No se pudo enviar el mensaje');
        } finally {
            setEnviando(false);
        }
    };

    if (!teacher) {
        return <div className="p-20 text-center font-bold text-gray-400">Cargando información del docente...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="rounded-[3rem] p-10 border-none shadow-xl bg-white overflow-hidden relative">
                <div className="flex items-center gap-6 mb-8">
                    <div className="size-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl">
                        {teacher.perfil?.primer_nombre?.[0] || 'D'}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 leading-tight">
                            {teacher.perfil?.primer_nombre} {teacher.perfil?.apellido_paterno}
                        </h3>
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1">Docente del curso</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Escribe tu consulta</label>
                    <textarea 
                        className="w-full min-h-[150px] p-6 rounded-[2rem] border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-100 transition-all outline-none font-bold text-gray-700 resize-none"
                        placeholder="Hola profesor, tengo una duda sobre..."
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                    />
                    <Button 
                        onClick={enviarMensaje}
                        disabled={enviando || !mensaje.trim()}
                        className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-lg font-black gap-3 shadow-lg shadow-indigo-100"
                    >
                        <MessageSquare size={20} />
                        {enviando ? 'Enviando...' : 'Enviar Mensaje'}
                    </Button>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between text-gray-400">
                    <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold">Respuesta estimada: 24h</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span className="text-[10px] font-bold">Privado: Solo tú y el profesor</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
