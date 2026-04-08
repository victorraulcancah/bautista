import { Head } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import NewMessageModal from './components/NewMessageModal';
import MessagesList from './components/MessagesList';
import { useMensajes } from './hooks/useMensajes';
import { useNewMessage } from './hooks/useNewMessage';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mensajería Interna', href: '/mensajeria' },
];

export default function MensajeriaIndex() {
    const {
        recibidos,
        enviados,
        loading,
        searchTerm,
        setSearchTerm,
        reloadMessages,
    } = useMensajes();

    const {
        isOpen,
        setIsOpen,
        destinatario,
        setDestinatario,
        contactos,
        setContactos,
        asunto,
        setAsunto,
        cuerpo,
        setCuerpo,
        sending,
        handleSearchContact,
        handleSend,
        resetForm,
    } = useNewMessage(reloadMessages);

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="p-10 text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest">
                    Abriendo Bandeja de Entrada...
                </div>
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
                                <MessageSquare className="w-8 h-8 mr-4 text-indigo-600" />{' '}
                                Comunicación Interna
                            </h1>
                            <p className="text-gray-500 font-medium italic">
                                Gestiona tus mensajes con alumnos, docentes y administrativos.
                            </p>
                        </div>

                        <NewMessageModal
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            destinatario={destinatario}
                            setDestinatario={setDestinatario}
                            contactos={contactos}
                            setContactos={setContactos}
                            asunto={asunto}
                            setAsunto={setAsunto}
                            cuerpo={cuerpo}
                            setCuerpo={setCuerpo}
                            sending={sending}
                            onSearchContact={handleSearchContact}
                            onSend={handleSend}
                            onClose={resetForm}
                        />
                    </div>

                    <MessagesList
                        recibidos={recibidos}
                        enviados={enviados}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
