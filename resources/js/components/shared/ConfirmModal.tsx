import { AlertCircle } from 'lucide-react';
import TitleForm from '@/components/TitleForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
    open:       boolean;
    onClose:    () => void;
    onConfirm:  () => Promise<void> | void;
    title?:     string;
    message?:   string;
    processing?: boolean;
    confirmText?: string;
    variant?: 'default' | 'warning' | 'danger';
};

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title   = 'Confirmar acción',
    message = '¿Estás seguro de que deseas continuar con esta acción?',
    processing = false,
    confirmText = 'Confirmar',
    variant = 'default',
}: Props) {
    const variantStyles = {
        default: {
            icon: 'text-indigo-600',
            button: 'bg-indigo-600 hover:bg-indigo-700',
        },
        warning: {
            icon: 'text-amber-600',
            button: 'bg-amber-600 hover:bg-amber-700',
        },
        danger: {
            icon: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700',
        },
    };

    const styles = variantStyles[variant];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 ${styles.icon}`}>
                        <AlertCircle className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="sr-only">{message}</DialogDescription>
                </DialogHeader>

                <TitleForm className="mt-1">Confirmación requerida</TitleForm>

                <p className="text-sm text-neutral-600">{message}</p>

                <DialogFooter className="mt-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        disabled={processing}
                        className={`${styles.button} text-white`}
                        onClick={onConfirm}
                    >
                        {processing ? 'Procesando...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
