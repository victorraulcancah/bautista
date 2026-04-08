import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Send, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ResourcePage from '@/components/shared/ResourcePage';
import MessageThread from './components/MessageThread';
import UserAvatar from './components/UserAvatar';
import { useMensajeDetalle } from './hooks/useMensajeDetalle';
import type { BreadcrumbItem } from '@/types';

export default function MensajeriaVer({ mensajeId }: { mensajeId: number }) {
    const { mensaje, loading, respuesta, setRespuesta, sending, handleReply } =
        useMensajeDetalle(mensajeId);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Mensajería', href: '/mensajeria' },
        { title: mensaje?.asunto || 'Ver Mensaje', href: '#' },
    ];

    if (loading) {
        return (
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Cargando..."
                subtitle=""
                icon={Mail}
                iconColor="bg-indigo-600"
            >
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-400 font-bold">Cargando mensaje...</p>
                    </div>
                </div>
            </ResourcePage>
        );
    }

    if (!mensaje) {
        return (
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Mensaje no encontrado"
                subtitle=""
                icon={Mail}
                iconColor="bg-indigo-600"
            >
                <div className="p-20 text-center text-neutral-500">
                    El mensaje que buscas no existe o no tienes permiso para verlo.
                </div>
            </ResourcePage>
        );
    }

    return (
        <>
            <Head title={mensaje.asunto} />

            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle={mensaje.asunto}
                subtitle={`De: ${mensaje.remitente?.perfil?.primer_nombre} ${mensaje.remitente?.perfil?.apellido_paterno}`}
                icon={Mail}
                iconColor="bg-indigo-600"
                hideSearch
                hideButton
            >
                {/* Botón volver */}
                <div className="mb-6">
                    <Link href="/mensajeria">
                        <Button
                            variant="outline"
                            className="gap-2 border-neutral-200 hover:bg-neutral-50 font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver a Mensajería
                        </Button>
                    </Link>
                </div>

                {/* Mensaje principal */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-8 mb-6">
                    {/* Header del mensaje */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 pb-6 border-b border-neutral-100">
                        <UserAvatar
                            fotoPerfil={mensaje.remitente?.perfil?.foto_perfil}
                            nombre={`${mensaje.remitente?.perfil?.primer_nombre} ${mensaje.remitente?.perfil?.apellido_paterno}`}
                            size="lg"
                        />
                        <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-neutral-900">
                                        {mensaje.remitente?.perfil?.primer_nombre}{' '}
                                        {mensaje.remitente?.perfil?.apellido_paterno}
                                    </p>
                                    <p className="text-xs text-neutral-500 font-medium">
                                        Para: {mensaje.destinatario?.perfil?.primer_nombre}{' '}
                                        {mensaje.destinatario?.perfil?.apellido_paterno}
                                    </p>
                                </div>
                                <span className="text-xs text-neutral-400 font-medium">
                                    {new Date(mensaje.created_at).toLocaleString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Cuerpo del mensaje */}
                    <div className="prose prose-neutral max-w-none">
                        <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                            {mensaje.cuerpo}
                        </p>
                    </div>
                </div>

                {/* Hilo de respuestas */}
                {mensaje.respuestas && mensaje.respuestas.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
                            Conversación ({mensaje.respuestas.length})
                        </h3>
                        <MessageThread
                            respuestas={mensaje.respuestas}
                            remitenteId={mensaje.remitente_id}
                        />
                    </div>
                )}

                {/* Formulario de respuesta */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
                    <h3 className="text-sm font-bold text-neutral-900 mb-4">
                        Escribe tu respuesta
                    </h3>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Escribe tu respuesta aquí..."
                            value={respuesta}
                            onChange={(e) => setRespuesta(e.target.value)}
                            className="min-h-[120px] rounded-xl border-neutral-200 font-medium resize-none text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                    handleReply();
                                }
                            }}
                        />
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <p className="text-xs text-neutral-400 font-medium order-2 sm:order-1">
                                Presiona Ctrl + Enter para enviar rápidamente
                            </p>
                            <Button
                                onClick={handleReply}
                                disabled={sending || !respuesta.trim()}
                                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl w-full sm:w-auto order-1 sm:order-2"
                            >
                                {sending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Responder
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </ResourcePage>
        </>
    );
}
