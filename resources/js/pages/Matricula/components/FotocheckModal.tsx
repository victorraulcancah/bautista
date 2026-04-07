import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, X } from 'lucide-react';

interface Props {
    open: boolean;
    onClose: () => void;
    estudianteId: number | null;
    estudianteNombre: string;
}

export default function FotocheckModal({ open, onClose, estudianteId, estudianteNombre }: Props) {
    if (!estudianteId) return null;

    const fotocheckUrl = `/estudiantes/${estudianteId}/fotocheck`;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fotocheckUrl;
        link.download = `fotocheck_${estudianteNombre.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-[280px] p-0 overflow-hidden border-none shadow-2xl bg-white rounded-[2rem]">
                <DialogHeader className="px-6 py-4 bg-white border-b flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-sm font-bold text-neutral-900">
                        Fotocheck del Alumno
                    </DialogTitle>
                </DialogHeader>

                <div className="bg-neutral-50 flex items-center justify-center p-0 overflow-hidden">
                    <div className="w-full aspect-[153/243] bg-white shadow-inner overflow-hidden">
                        {/* Iframe to show the PDF */}
                        <iframe 
                            src={`${fotocheckUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full border-none pointer-events-none scale-[1.01]"
                            title="Fotocheck Preview"
                        />
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-white border-t flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <p className="text-xs text-neutral-500 font-medium">
                            Vista previa del carnet oficial.
                        </p>
                        <p className="text-[10px] text-neutral-400">
                            Alumno: {estudianteNombre}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onClose} className="rounded-full px-4">
                            Cerrar
                        </Button>
                        <Button 
                            onClick={handleDownload}
                            className="bg-[#00a65a] hover:bg-[#008d4c] text-white gap-2 rounded-full px-6 shadow-lg shadow-emerald-100"
                        >
                            <Download className="h-4 w-4" />
                            Descargar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
