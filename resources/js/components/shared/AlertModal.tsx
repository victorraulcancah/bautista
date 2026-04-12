import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

type Props = {
    open: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    variant?: AlertVariant;
    confirmText?: string;
};

export default function AlertModal({
    open,
    onClose,
    title,
    message,
    variant = 'info',
    confirmText = 'Aceptar',
}: Props) {
    const variantConfig = {
        success: {
            icon: CheckCircle,
            iconColor: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
            defaultTitle: 'Éxito',
        },
        error: {
            icon: XCircle,
            iconColor: 'text-red-600',
            bgColor: 'bg-red-50',
            buttonColor: 'bg-red-600 hover:bg-red-700',
            defaultTitle: 'Error',
        },
        warning: {
            icon: AlertCircle,
            iconColor: 'text-amber-600',
            bgColor: 'bg-amber-50',
            buttonColor: 'bg-amber-600 hover:bg-amber-700',
            defaultTitle: 'Advertencia',
        },
        info: {
            icon: Info,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            buttonColor: 'bg-blue-600 hover:bg-blue-700',
            defaultTitle: 'Información',
        },
    };

    const config = variantConfig[variant];
    const Icon = config.icon;
    const displayTitle = title || config.defaultTitle;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md rounded-[2rem] border-none shadow-xl">
                <DialogHeader>
                    <div className="flex flex-col items-center text-center space-y-4 pt-4">
                        <div className={`size-16 rounded-2xl ${config.bgColor} flex items-center justify-center`}>
                            <Icon className={`size-8 ${config.iconColor}`} />
                        </div>
                        <DialogTitle className="text-xl font-black text-gray-900">
                            {displayTitle}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="sr-only">{message}</DialogDescription>
                </DialogHeader>

                <div className="text-center px-4 pb-2">
                    <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
                </div>

                <DialogFooter className="flex justify-center pt-2 pb-4">
                    <Button
                        type="button"
                        onClick={onClose}
                        className={`${config.buttonColor} text-white rounded-2xl h-12 px-8 font-bold text-[10px] uppercase tracking-widest shadow-lg`}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
