import { Head, Link } from '@inertiajs/react';
import { Mail, Send, Inbox, Search, Plus, MoreVertical, User, ChevronRight, MessageSquare, Trash2, Edit3, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mensajería Interna', href: '/mensajeria' },
];

export default function MensajeriaIndex() {
    const [recibidos, setRecibidos] = useState<any[]>([]);
    const [enviados, setEnviados] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isNewOpen, setIsNewOpen] = useState(false);

    // New Message State
    const [destinatario, setDestinatario] = useState<any>(null);
    const [contactos, setContactos] = useState<any[]>([]);
    const [asunto, setAsunto] = useState("");
    const [cuerpo, setCuerpo] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = () => {
        setLoading(true);
        Promise.all([
            api.get('/mensajes-legacy/recibidos'),
            api.get('/mensajes-legacy/enviados')
        ]).then(([rec, env]) => {
            setRecibidos(rec.data);
            setEnviados(env.data);
            setLoading(false);
        });
    };

    const handleSearchContact = (q: string) => {
        if (q.length < 2) {
return setContactos([]);
}

        api.get(`/mensajes-legacy/contactos?q=${q}`).then(res => setContactos(res.data));
    };

    const handleSend = () => {
        if (!destinatario || !asunto || !cuerpo) {
return alert("Completa todos los campos.");
}

        setSending(true);
        api.post('/mensajes-legacy/enviar', {
            destinatario_id: destinatario.id,
            asunto,
            cuerpo
        }).then(() => {
            setIsNewOpen(false);
            setAsunto("");
            setCuerpo("");
            setDestinatario(null);
            loadMessages();
        }).finally(() => setSending(false));
    };

    if (loading) {
return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-10 text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest">Abriendo Bandeja de Entrada...</div>
        </AppLayout>
    );
}

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mensajería Interna" />
            <div className="bg-[#FDFDFF] font-sans pb-20">
                <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center">
                            <MessageSquare className="w-8 h-8 mr-4 text-indigo-600" /> Comunicación Interna
                        </h1>
                        <p className="text-gray-500 font-medium italic">Gestiona tus mensajes con alumnos, docentes y administrativos.</p>
                    </div>

                    <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-widest">
                                <Plus className="w-4 h-4 mr-2" /> Redactar Mensaje
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[3rem] p-8 max-w-2xl border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-white/95 backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tighter">Nuevo Mensaje</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 mt-6">
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Para:</label>
                                    {destinatario ? (
                                        <div className="bg-indigo-50 p-4 rounded-2xl flex items-center justify-between border border-indigo-100">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                                    {destinatario.perfil?.primer_nombre?.[0]}
                                                </div>
                                                <span className="font-bold text-indigo-900">{destinatario.perfil?.primer_nombre} {destinatario.perfil?.apellido_paterno}</span>
                                            </div>
                                            <button onClick={() => setDestinatario(null)} className="text-indigo-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <Input 
                                                placeholder="Buscar por nombre..." 
                                                onChange={e => handleSearchContact(e.target.value)}
                                                className="h-14 rounded-2xl border-gray-100 font-bold focus:ring-indigo-100"
                                            />
                                            {contactos.length > 0 && (
                                                <div className="absolute z-50 w-full top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                                                    {contactos.map(c => (
                                                        <button 
                                                            key={c.id} 
                                                            onClick={() => {
 setDestinatario(c); setContactos([]); 
}}
                                                            className="w-full p-4 flex items-center hover:bg-indigo-50 transition-colors text-left"
                                                        >
                                                            <div className="w-8 h-8 bg-gray-100 rounded-full mr-3 flex items-center justify-center text-[10px] font-black text-gray-400">{c.perfil?.primer_nombre?.[0]}</div>
                                                            <div>
                                                                <p className="font-bold text-gray-800 text-sm">{c.perfil?.primer_nombre} {c.perfil?.apellido_paterno}</p>
                                                                <p className="text-[10px] text-gray-400 font-black uppercase">{c.id_rol === 1 ? 'Alumno' : 'Docente'}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asunto:</label>
                                    <Input 
                                        placeholder="Motivo del mensaje..." 
                                        value={asunto}
                                        onChange={e => setAsunto(e.target.value)}
                                        className="h-14 rounded-2xl border-gray-100 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contenido:</label>
                                    <Textarea 
                                        placeholder="Escribe aquí tu mensaje..." 
                                        value={cuerpo}
                                        onChange={e => setCuerpo(e.target.value)}
                                        className="min-h-[150px] rounded-3xl border-gray-100 font-medium p-6"
                                    />
                                </div>
                                <Button 
                                    onClick={handleSend} 
                                    disabled={sending}
                                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-100"
                                >
                                    {sending ? "Enviando..." : "Enviar Mensaje"} <Send className="w-4 h-4 ml-3" />
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden min-h-[500px]">
                    <Tabs defaultValue="recibidos" className="w-full">
                        <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between">
                            <TabsList className="bg-gray-100/50 p-1 rounded-2xl h-14">
                                <TabsTrigger value="recibidos" className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest">
                                    <Inbox className="w-4 h-4 mr-2" /> Recibidos
                                </TabsTrigger>
                                <TabsTrigger value="enviados" className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest">
                                    <Send className="w-4 h-4 mr-2" /> Enviados
                                </TabsTrigger>
                            </TabsList>

                            <div className="relative w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="Filtrar mensajes..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-11 h-12 rounded-2xl border-gray-100 border-2"
                                />
                            </div>
                        </div>

                        <TabsContent value="recibidos" className="m-0">
                            {recibidos.filter(m => m.asunto.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                <EmptyState text="No hay mensajes en tu bandeja de entrada." />
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {recibidos.map(m => <MessageRow key={m.id} message={m} type="inbox" />)}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="enviados" className="m-0">
                             {enviados.filter(m => m.asunto.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                <EmptyState text="Aún no has enviado ningún mensaje." />
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {enviados.map(m => <MessageRow key={m.id} message={m} type="sent" />)}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
                </div>
            </div>
        </AppLayout>
    );
}

function MessageRow({ message, type }: { message: any, type: 'inbox' | 'sent' }) {
    const contact = type === 'inbox' ? message.remitente : message.destinatario;
    
    return (
        <Link 
            href={`/mensajeria/ver/${message.id}`}
            className={`flex items-center p-8 hover:bg-indigo-50/50 transition-all group ${type === 'inbox' && !message.leido ? 'bg-indigo-50/30' : ''}`}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-6 border transition-colors ${type === 'inbox' && !message.leido ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-gray-400 border-gray-100 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                <User className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm tracking-tight ${type === 'inbox' && !message.leido ? 'font-black text-indigo-900' : 'font-bold text-gray-800'}`}>
                        {contact?.perfil?.primer_nombre} {contact?.perfil?.apellido_paterno}
                    </p>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {new Date(message.created_at).toLocaleDateString()}
                    </span>
                </div>
                <h4 className={`text-sm truncate ${type === 'inbox' && !message.leido ? 'font-black text-indigo-600' : 'font-medium text-gray-500'}`}>
                    {message.asunto}
                </h4>
                <p className="text-xs text-gray-400 truncate line-clamp-1 mt-1 font-medium italic">
                    {message.cuerpo}
                </p>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-indigo-300 transition-colors" />
        </Link>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                <Inbox className="w-10 h-10" />
            </div>
            <p className="text-gray-400 font-bold italic">{text}</p>
        </div>
    );
}
