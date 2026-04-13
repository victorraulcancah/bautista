import { Download, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FotocheckCardPreview from '../../Shared/components/FotocheckCardPreview';
import type { Matricula } from '../hooks/useMatricula';
import api from '@/lib/api';

interface Props {
    open: boolean;
    onClose: () => void;
    matricula: Matricula | null;
}

export default function FotocheckModal({ open, onClose, matricula }: Props) {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open) {
            setLoading(true);
            api.get('/configuracion-fotocheck')
                .then(res => setConfig(res.data))
                .catch(err => console.error("Error loading config:", err))
                .finally(() => setLoading(false));
        }
    }, [open]);

    if (!matricula) return null;

    const fotocheckUrl = `/estudiantes/${matricula.estu_id}/fotocheck`;

    const handleDownload = () => {
        window.open(fotocheckUrl, '_blank');
    };

    // Mapear datos al formato del preview global
    const getPreviewData = () => {
        const student = matricula.estudiante;
        const seccion = matricula.seccion;
        
        return {
            id: student?.user_id ?? matricula.estu_id,
            name: (student?.primer_nombre + ' ' + (student?.apellido_paterno ?? '')).trim(),
            rol_name: 'ALUMNO(A)',
            avatar: student?.perfil?.avatar ?? undefined, // Evitar null para TS
            details: {
                student_id: `EST-${matricula.estu_id.toString().padStart(6, '0')}`,
                dni: student?.doc_numero ?? undefined,
                grado: seccion?.grado?.nombre_grado ?? undefined,
                seccion: seccion?.nombre ?? undefined,
                tel: student?.perfil?.telefono ?? undefined,
            }
        };
    };

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-[#f8fafc] rounded-[2rem]">
                <DialogHeader className="px-8 py-6 bg-white border-b flex flex-row items-center justify-between space-y-0">
                    <div>
                        <DialogTitle className="text-xl font-black text-neutral-900 uppercase tracking-tight">
                            Fotocheck Institucional
                        </DialogTitle>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">Vista Previa Digital</p>
                    </div>
                </DialogHeader>

                <div className="flex flex-col items-center justify-start p-6 min-h-[580px] overflow-visible">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                            <Loader2 className="size-8 text-emerald-500 animate-spin" />
                            <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Generando Diseño...</p>
                        </div>
                    ) : (
                        <div className="mt-8 flex justify-center w-full">
                            <FotocheckCardPreview 
                                user={getPreviewData()} 
                                config={config} 
                                className="scale-[1.4] sm:scale-[1.5] transform origin-top"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="px-8 py-6 bg-white border-t flex flex-row items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 hidden sm:block">
                        <p className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em] mb-1">
                            Estudiante Seleccionado
                        </p>
                        <p className="text-sm text-neutral-900 truncate font-black uppercase">
                            {matricula.estudiante?.nombre_completo}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl font-bold text-neutral-400 hover:text-neutral-600 px-6"
                        >
                            Cerrar
                        </Button>
                        <Button 
                            onClick={handleDownload}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl px-8 h-12 shadow-lg shadow-emerald-200 transition-all active:scale-95 font-black uppercase text-[10px] tracking-widest"
                        >
                            <Download className="h-4 w-4" />
                            Imprimir PDF
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
