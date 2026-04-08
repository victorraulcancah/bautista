import { Head } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import ResourcePage from '@/components/shared/ResourcePage';
import NewMessageModal from './components/NewMessageModal';
import MessagesList from './components/MessagesList';
import { useMensajes } from './hooks/useMensajes';
import { useNewMessage } from './hooks/useNewMessage';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mensajería', href: '/mensajeria' },
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

    const totalMensajes = recibidos.length + enviados.length;
    const noLeidos = recibidos.filter((m) => !m.leido).length;

    return (
        <>
            <Head title="Mensajería" />

            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Mensajería"
                subtitle={`${totalMensajes} mensajes${noLeidos > 0 ? ` • ${noLeidos} sin leer` : ''}`}
                icon={Mail}
                iconColor="bg-indigo-600"
                search={searchTerm}
                onSearch={setSearchTerm}
                btnLabel="Nuevo Mensaje"
                onNew={() => setIsOpen(true)}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-400 font-bold">Cargando mensajes...</p>
                        </div>
                    </div>
                ) : (
                    <MessagesList
                        recibidos={recibidos}
                        enviados={enviados}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />
                )}
            </ResourcePage>

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
        </>
    );
}
