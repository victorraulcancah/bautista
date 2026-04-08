import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
    open: boolean;
    onClose: () => void;
    estudianteId: number | null;
    estudianteNombre: string;
}

export default function FotocheckModal({ open, onClose, estudianteId, estudianteNombre }: Props) {
    if (!estudianteId) {
return null;
}

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
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl bg-white rounded-[2rem]">
                <DialogHeader className="px-6 py-4 bg-white border-b flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-sm font-bold text-neutral-900">
                        Fotocheck del Alumno
                    </DialogTitle>
                </DialogHeader>

                <div className="bg-white flex items-center justify-center p-0 overflow-hidden min-h-[660px]">
                    <div className="w-full aspect-[153/243] relative bg-white">
                        {/* Iframe to show the PDF */}
                        <iframe 
                            src={`${fotocheckUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                            className="absolute inset-0 w-full h-full border-none pointer-events-none scale-[1.1] origin-top"
                            title="Fotocheck Preview"
                        />
                    </div>
                </div>

                <DialogFooter className="px-6 py-5 bg-white border-t flex flex-row items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 hidden sm:block">
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                            Información
                        </p>
                        <p className="text-xs text-neutral-600 truncate mt-0.5 font-medium">
                            {estudianteNombre}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button 
                            onClick={handleDownload}
                            className="bg-[#00a65a] hover:bg-[#008d4c] text-white gap-2 rounded-full px-8 py-6 shadow-lg shadow-emerald-100/50 transition-all active:scale-95"
                        >
                            <Download className="h-5 w-5" />
                            <span className="text-base font-semibold">Descargar Carnet</span>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
