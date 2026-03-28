import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TitleForm from '@/components/TitleForm';

type Props = {
    open:       boolean;
    onClose:    () => void;
    onConfirm:  () => Promise<void> | void;
    title?:     string;
    message?:   string;
    processing?: boolean;
};

export default function ConfirmDeleteModal({
    open,
    onClose,
    onConfirm,
    title   = 'Eliminar registro',
    message = '¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.',
    processing = false,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="sr-only">{message}</DialogDescription>
                </DialogHeader>

                <TitleForm className="mt-1">Confirmar eliminación</TitleForm>

                <p className="text-sm text-neutral-600">{message}</p>

                <DialogFooter className="mt-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        disabled={processing}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={onConfirm}
                    >
                        {processing ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

