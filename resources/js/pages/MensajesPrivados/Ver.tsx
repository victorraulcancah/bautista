import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Send, User, MessageCircle, Clock, CheckCheck, MoreVertical, Paperclip } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

export default function MensajeriaVer({ mensajeId }: { mensajeId: number }) {
    const [mensaje, setMensaje] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [respuesta, setRespuesta] = useState("");
    const [sending, setSending] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mensajería', href: '/mensajeria' },
        { title: mensaje?.asunto || 'Ver Mensaje', href: '#' },
    ];

    useEffect(() => {
        loadMessage();
    }, [mensajeId]);

    const loadMessage = () => {
        api.get(`/mensajes-legacy/${mensajeId}`)
            .then(res => {
                setMensaje(res.data);
                setLoading(false);
            });
    };

    const handleReply = () => {
        if (!respuesta) {
return;
}

        setSending(true);
        api.post(`/mensajes-legacy/${mensajeId}/responder`, { respuesta })
            .then(() => {
                setRespuesta("");
                loadMessage();
            })
            .finally(() => setSending(false));
    };

    if (loading) {
return (
        <AppLayout breadcrumbs={[{ title: 'Mensajería', href: '/mensajeria' }]}>
            <div className="p-10 text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest text-lg">Cifrando conversación...</div>
        </AppLayout>
    );
}

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mensaje.asunto} />
            <div className="bg-[#FDFDFF] font-sans pb-20">

            <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-10">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Link href="/mensajeria">
                            <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 p-0">
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter line-clamp-1">{mensaje.asunto}</h1>
                            <div className="flex items-center space-x-2">
                                <span className={mensaje.leido ? 'text-emerald-500' : 'text-indigo-500'}>
                                    <CheckCheck className="w-4 h-4" />
                                </span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{mensaje.leido ? 'Leído' : 'Recibido'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Message */}
                <div className="bg-white rounded-[4rem] p-10 md:p-14 border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-full -mr-20 -mt-20 blur-3xl" />
                    
                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">De: {mensaje.remitente?.perfil?.primer_nombre} {mensaje.remitente?.perfil?.apellido_paterno}</p>
                                <p className="text-gray-400 font-bold text-xs">{new Date(mensaje.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-gray-300">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="prose prose-indigo max-w-none relative z-10">
                        <p className="text-lg text-gray-700 leading-relaxed font-medium">
                            {mensaje.cuerpo}
                        </p>
                    </div>
                </div>

                {/* Replies Thread */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center mb-10">— Conversación —</h4>
                    
                    {mensaje.respuestas.map((resp: any) => (
                        <div key={resp.id} className={`flex ${resp.user_id ==='me' /* logic should be real current user ID */ ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-8 rounded-[2.5rem] shadow-lg ${resp.autor?.id === mensaje.remitente_id ? 'bg-white border border-gray-50 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100'}`}>
                                <p className="text-sm font-medium leading-relaxed">{resp.respuesta}</p>
                                <div className={`flex items-center space-x-2 mt-4 text-[10px] font-black uppercase tracking-widest ${resp.autor?.id === mensaje.remitente_id ? 'text-gray-400' : 'text-indigo-200'}`}>
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(resp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply Form */}
                <div className="pt-10">
                    <div className="bg-gray-100/50 p-6 rounded-[3rem] border-2 border-dashed border-gray-200 focus-within:border-indigo-600 focus-within:bg-white transition-all space-y-4">
                        <Textarea 
                            placeholder="Escribe tu respuesta aquí..." 
                            value={respuesta}
                            onChange={e => setRespuesta(e.target.value)}
                            className="bg-transparent border-none focus-visible:ring-0 min-h-[120px] font-medium p-4 resize-none"
                        />
                        <div className="flex items-center justify-between pt-2">
                            <Button variant="ghost" className="rounded-xl h-12 w-12 text-gray-400 hover:text-indigo-600"><Paperclip className="w-5 h-5" /></Button>
                            <Button 
                                onClick={handleReply}
                                disabled={sending || !respuesta}
                                className="rounded-2xl h-14 px-10 bg-gray-900 hover:bg-black font-black uppercase tracking-widest text-xs transition-transform active:scale-95"
                            >
                                {sending ? 'Enviando...' : 'Responder'} <Send className="w-4 h-4 ml-3" />
                            </Button>
                        </div>
                    </div>
                </div>

                </div>
            </div>
        </AppLayout>
    );
}
