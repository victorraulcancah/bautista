import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import http from '@/services/http';
import type { Docente } from '../hooks/useDocentes';
import { nombreCompleto } from '../hooks/useDocentes';

type Horario = {
    horario_id:   number;
    turno:        string;
    hora_ingreso: string;
    hora_salida:  string;
};

const TURNO_LABEL: Record<string, string> = { M: 'Mañana', T: 'Tarde', N: 'Noche' };

type Props = {
    open:    boolean;
    onClose: () => void;
    docente: Docente | null;
};

export default function HorarioModal({ open, onClose, docente }: Props) {
    const [horarios, setHorarios] = useState<Horario[]>([]);
    const [loading,  setLoading]  = useState(false);

    useEffect(() => {
        if (!open || !docente) return;
        setLoading(true);
        http.get(`/docentes/${docente.docente_id}/horario`)
            .then(res => setHorarios(res.data))
            .finally(() => setLoading(false));
    }, [open, docente]);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="size-4 text-[#00a65a]" />
                        Horario — {docente ? nombreCompleto(docente) : ''}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>
                ) : horarios.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-400">No hay horarios registrados para docentes.</p>
                ) : (
                    <table className="w-full text-sm rounded-lg overflow-hidden border">
                        <thead>
                            <tr className="bg-[#00a65a] text-white">
                                <th className="px-4 py-2 text-left">Turno</th>
                                <th className="px-4 py-2 text-left">Ingreso</th>
                                <th className="px-4 py-2 text-left">Salida</th>
                            </tr>
                        </thead>
                        <tbody>
                            {horarios.map(h => (
                                <tr key={h.horario_id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-2">
                                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
                                            {TURNO_LABEL[h.turno] ?? h.turno}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 font-mono">{h.hora_ingreso}</td>
                                    <td className="px-4 py-2 font-mono">{h.hora_salida}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </DialogContent>
        </Dialog>
    );
}
