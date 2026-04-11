import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (value: string) => Promise<void> | void;
    title: string;
    message?: string;
    defaultValue?: string;
    placeholder?: string;
    processing?: boolean;
    confirmText?: string;
};

export default function PromptModal({
    open,
    onClose,
    onConfirm,
    title,
    message,
    defaultValue = '',
    placeholder = 'Escribe aquí...',
    processing = false,
    confirmText = 'Aceptar'
}: Props) {
    const [value, setValue] = useState(defaultValue);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setValue(defaultValue);
            setIsSubmitting(false);
        }
    }, [open, defaultValue]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        try {
            setIsSubmitting(true);
            await onConfirm(value);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 font-bold">{title}</DialogTitle>
                    {message && <DialogDescription className="text-sm text-neutral-600 mt-2">{message}</DialogDescription>}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <Input 
                        autoFocus
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        disabled={processing || isSubmitting}
                        className="rounded-xl h-11 border-gray-200 focus:ring-emerald-100 font-medium"
                    />
                </form>

                <DialogFooter className="mt-2">
                    <Button type="button" variant="outline" className="rounded-xl font-bold" onClick={onClose} disabled={processing || isSubmitting}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        disabled={processing || isSubmitting || !value.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold border-none"
                        onClick={handleSubmit}
                    >
                        {processing || isSubmitting ? 'Guardando...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
