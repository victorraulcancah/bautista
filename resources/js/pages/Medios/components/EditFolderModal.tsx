import { FolderEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    open: boolean;
    onClose: () => void;
    folderName: string;
    onFolderNameChange: (name: string) => void;
    onConfirm: () => void;
    processing: boolean;
};

export default function EditFolderModal({
    open,
    onClose,
    folderName,
    onFolderNameChange,
    onConfirm,
    processing,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white border-neutral-200 rounded-3xl p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-neutral-100 bg-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
                            <FolderEdit className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-neutral-950 tracking-tight">
                                Editar Carpeta
                            </DialogTitle>
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">
                                Renombrar carpeta
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                            Nombre de la carpeta
                        </Label>
                        <Input
                            value={folderName}
                            onChange={(e) => onFolderNameChange(e.target.value)}
                            placeholder="Ej: Material de Estudio"
                            className="bg-white border-neutral-200 h-11 rounded-xl text-sm font-medium"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onConfirm();
                                }
                            }}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 h-11 rounded-xl border-neutral-200 font-bold text-sm"
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={processing || !folderName.trim()}
                            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2"
                        >
                            {processing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <FolderEdit className="h-4 w-4" />
                                    Actualizar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
