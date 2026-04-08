import { Plus, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { Contacto } from '../hooks/useNewMessage';

type Props = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    destinatario: Contacto | null;
    setDestinatario: (contacto: Contacto | null) => void;
    contactos: Contacto[];
    setContactos: (contactos: Contacto[]) => void;
    asunto: string;
    setAsunto: (asunto: string) => void;
    cuerpo: string;
    setCuerpo: (cuerpo: string) => void;
    sending: boolean;
    onSearchContact: (q: string) => void;
    onSend: () => void;
    onClose: () => void;
};

export default function NewMessageModal({
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
    onSearchContact,
    onSend,
    onClose,
}: Props) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) onClose();
        }}>
            <DialogTrigger asChild>
                <Button className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-widest">
                    <Plus className="w-4 h-4 mr-2" /> Redactar Mensaje
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[3rem] p-8 max-w-2xl border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-white/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tighter">
                        Nuevo Mensaje
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-6">
                    {/* Destinatario */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Para:
                        </label>
                        {destinatario ? (
                            <div className="bg-indigo-50 p-4 rounded-2xl flex items-center justify-between border border-indigo-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                        {destinatario.perfil?.primer_nombre?.[0]}
                                    </div>
                                    <span className="font-bold text-indigo-900">
                                        {destinatario.perfil?.primer_nombre}{' '}
                                        {destinatario.perfil?.apellido_paterno}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setDestinatario(null)}
                                    className="text-indigo-400 hover:text-rose-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Input
                                    placeholder="Buscar por nombre..."
                                    onChange={(e) => onSearchContact(e.target.value)}
                                    className="h-14 rounded-2xl border-gray-100 font-bold focus:ring-indigo-100"
                                />
                                {contactos.length > 0 && (
                                    <div className="absolute z-50 w-full top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                                        {contactos.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    setDestinatario(c);
                                                    setContactos([]);
                                                }}
                                                className="w-full p-4 flex items-center hover:bg-indigo-50 transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 bg-gray-100 rounded-full mr-3 flex items-center justify-center text-[10px] font-black text-gray-400">
                                                    {c.perfil?.primer_nombre?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">
                                                        {c.perfil?.primer_nombre}{' '}
                                                        {c.perfil?.apellido_paterno}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase">
                                                        {c.id_rol === 1 ? 'Alumno' : 'Docente'}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Asunto */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Asunto:
                        </label>
                        <Input
                            placeholder="Motivo del mensaje..."
                            value={asunto}
                            onChange={(e) => setAsunto(e.target.value)}
                            className="h-14 rounded-2xl border-gray-100 font-bold"
                        />
                    </div>

                    {/* Cuerpo */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Contenido:
                        </label>
                        <Textarea
                            placeholder="Escribe aquí tu mensaje..."
                            value={cuerpo}
                            onChange={(e) => setCuerpo(e.target.value)}
                            className="min-h-[150px] rounded-3xl border-gray-100 font-medium p-6"
                        />
                    </div>

                    {/* Botón enviar */}
                    <Button
                        onClick={onSend}
                        disabled={sending}
                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-100"
                    >
                        {sending ? 'Enviando...' : 'Enviar Mensaje'}{' '}
                        <Send className="w-4 h-4 ml-3" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
