import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import type { Usuario, HistorialAsistencia } from '../hooks/useAsistencia';

type Props = {
    open: boolean;
    onClose: () => void;
    user: Usuario | null;
    history: HistorialAsistencia[];
    loading: boolean;
    selectedMonth: string;
    onMonthChange: (month: string) => void;
    tipo: 'E' | 'D';
};

const months = [
    { v: '1', l: 'Enero' }, { v: '2', l: 'Febrero' }, { v: '3', l: 'Marzo' },
    { v: '4', l: 'Abril' }, { v: '5', l: 'Mayo' }, { v: '6', l: 'Junio' },
    { v: '7', l: 'Julio' }, { v: '8', l: 'Agosto' }, { v: '9', l: 'Septiembre' },
    { v: '10', l: 'Octubre' }, { v: '11', l: 'Noviembre' }, { v: '12', l: 'Diciembre' }
];

export default function HistorialModal({
    open,
    onClose,
    user,
    history,
    loading,
    selectedMonth,
    onMonthChange,
    tipo,
}: Props) {
    const handleExport = () => {
        if (!user) return;
        const id = user.estu_id || user.docente_id;
        window.open(`/api/asistencia/usuario/${id}/export?tipo=${tipo}&mes=${selectedMonth}`, '_blank');
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white border-neutral-200 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-8 pb-4 border-b border-neutral-100 flex flex-row items-center justify-between bg-neutral-50">
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl font-black text-neutral-950 tracking-tight uppercase">
                            Historial Mensual
                        </DialogTitle>
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">
                            {user?.perfil?.primer_nombre} {user?.perfil?.apellido_paterno}
                        </p>
                    </div>
                    
                    <div className="flex gap-3">
                        <Select value={selectedMonth} onValueChange={onMonthChange}>
                            <SelectTrigger className="w-32 bg-white border-neutral-200 h-10 rounded-xl text-xs font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-200">
                                {months.map(m => (
                                    <SelectItem key={m.v} value={m.v} className="text-xs font-medium">
                                        {m.l}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button 
                            onClick={handleExport}
                            variant="outline" 
                            className="h-10 border-neutral-200 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 gap-2 font-bold text-xs"
                        >
                            <Download className="h-4 w-4" /> CSV
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-8">
                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-neutral-50/50">
                                <TableRow className="border-neutral-100 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-center">
                                        Fecha
                                    </TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-center">
                                        Turno
                                    </TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 text-center">
                                        Entrada
                                    </TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-rose-600 text-center">
                                        Salida
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-48 text-center text-xs font-bold opacity-30 animate-pulse">
                                            Cargando...
                                        </TableCell>
                                    </TableRow>
                                ) : history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-48 text-center text-neutral-500 text-xs">
                                            No hay registros para este mes.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map((log) => (
                                        <TableRow key={log.asistencia_id} className="border-neutral-100 hover:bg-neutral-50">
                                            <TableCell className="text-center font-mono text-sm text-neutral-600">
                                                {new Date(log.fecha).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={`text-[9px] uppercase font-bold px-2 ${
                                                    log.turno === 'M' 
                                                        ? 'bg-amber-100 text-amber-700' 
                                                        : 'bg-indigo-100 text-indigo-700'
                                                }`}>
                                                    {log.turno === 'M' ? 'Mañana' : 'Tarde'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-emerald-600">
                                                {log.hora_entrada?.substring(0, 5) || '—'}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-rose-600">
                                                {log.hora_salida?.substring(0, 5) || '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
