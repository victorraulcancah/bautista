import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, User, CheckCheck, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import MessageThread from './components/MessageThread';
import ReplyForm from './components/ReplyForm';
import { useMensajeDetalle } from './hooks/useMensajeDetalle';
import type { BreadcrumbItem } from '@/types';

export default function MensajeriaVer({ mensajeId }: { mensajeId: number }) {
    const { mensaje, loading, respuesta, setRespuesta, sending, handleReply } =
        useMensajeDetalle(mensajeId);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mensajería', href: '/mensajeria' },
        { title: mensaje?.asunto || 'Ver Mensaje', href: '#' },
    ];

    if (loading) {
        return (
            <AppLayout breadcrumbs={[{ title: 'Mensajería', href: '/mensajeria' }]}>
                <div className="p-10 text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest text-lg">
                    Cifrando conversación...
                </div>
            </AppLayout>
        );
    }

    if (!mensaje) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="p-10 text-center text-gray-500">
                    Mensaje no encontrado
                </div>
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
                                <Button
                                    variant="ghost"
                                    className="h-12 w-12 rounded-2xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 p-0"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tighter line-clamp-1">
                                    {mensaje.asunto}
                                </h1>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={
                                            mensaje.leido ? 'text-emerald-500' : 'text-indigo-500'
                                        }
                                    >
                                        <CheckCheck className="w-4 h-4" />
                                    </span>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {mensaje.leido ? 'Leído' : 'Recibido'}
                                    </p>
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
                                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">
                                        De: {mensaje.remitente?.perfil?.primer_nombre}{' '}
                                        {mensaje.remitente?.perfil?.apellido_paterno}
                                    </p>
                                    <p className="text-gray-400 font-bold text-xs">
                                        {new Date(mensaje.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                className="h-10 w-10 p-0 rounded-xl text-gray-300"
                            >
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
                    <MessageThread
                        respuestas={mensaje.respuestas || []}
                        remitenteId={mensaje.remitente_id}
                    />

                    {/* Reply Form */}
                    <ReplyForm
                        respuesta={respuesta}
                        onRespuestaChange={setRespuesta}
                        onSubmit={handleReply}
                        sending={sending}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
