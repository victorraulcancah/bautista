import { Send, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) onClose();
            }}
        >
            <DialogContent className="max-w-2xl bg-white border-neutral-200 rounded-3xl p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-neutral-100 bg-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
                            <Send className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-neutral-950 tracking-tight">
                                Nuevo Mensaje
                            </DialogTitle>
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">
                                Enviar mensaje privado
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    {/* Destinatario */}
                    <div className="space-y-2 relative">
                        <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                            Para:
                        </Label>
                        {destinatario ? (
                            <div className="bg-indigo-50 p-4 rounded-xl flex items-center justify-between border border-indigo-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-neutral-900 text-sm">
                                            {destinatario.perfil?.primer_nombre}{' '}
                                            {destinatario.perfil?.apellido_paterno}
                                        </p>
                                        <p className="text-xs text-neutral-500 font-medium">
                                            {destinatario.id_rol === 1 ? 'Estudiante' : 'Docente'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDestinatario(null)}
                                    className="text-neutral-400 hover:text-rose-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Input
                                    placeholder="Buscar por nombre..."
                                    onChange={(e) => onSearchContact(e.target.value)}
                                    className="h-11 rounded-xl border-neutral-200 font-medium"
                                />
                                {contactos.length > 0 && (
                                    <div className="absolute z-50 w-full top-full mt-2 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100 max-h-60 overflow-y-auto">
                                        {contactos.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    setDestinatario(c);
                                                    setContactos([]);
                                                }}
                                                className="w-full p-3 flex items-center hover:bg-indigo-50 transition-colors text-left"
                                            >
                                                <div className="w-10 h-10 bg-neutral-100 rounded-xl mr-3 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-neutral-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-neutral-800 text-sm">
                                                        {c.perfil?.primer_nombre}{' '}
                                                        {c.perfil?.apellido_paterno}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 font-medium">
                                                        {c.id_rol === 1 ? 'Estudiante' : 'Docente'}
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
                        <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                            Asunto:
                        </Label>
                        <Input
                            placeholder="Motivo del mensaje..."
                            value={asunto}
                            onChange={(e) => setAsunto(e.target.value)}
                            className="h-11 rounded-xl border-neutral-200 font-medium"
                        />
                    </div>

                    {/* Cuerpo */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                            Mensaje:
                        </Label>
                        <Textarea
                            placeholder="Escribe aquí tu mensaje..."
                            value={cuerpo}
                            onChange={(e) => setCuerpo(e.target.value)}
                            className="min-h-[150px] rounded-xl border-neutral-200 font-medium resize-none"
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={() => {
                                setIsOpen(false);
                                onClose();
                            }}
                            variant="outline"
                            className="flex-1 h-11 rounded-xl border-neutral-200 font-bold text-sm"
                            disabled={sending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={onSend}
                            disabled={sending || !destinatario || !asunto || !cuerpo}
                            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2"
                        >
                            {sending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Enviar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
