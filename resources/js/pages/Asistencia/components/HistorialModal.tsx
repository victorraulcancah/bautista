import { useState, useEffect } from 'react';
import { Download, Calendar } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Usuario, HistorialAsistencia } from '../hooks/useAsistencia';
import api from '@/lib/api';

type Props = {
    open: boolean;
    onClose: () => void;
    user: Usuario | null;
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
    tipo,
}: Props) {
    const [filterType, setFilterType] = useState<'mes' | 'rango'>('mes');
    const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [history, setHistory] = useState<HistorialAsistencia[]>([]);
    const [loading, setLoading] = useState(false);

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    // Cargar historial cuando cambian los filtros
    useEffect(() => {
        if (!open || !user) return;

        const loadHistory = async () => {
            setLoading(true);
            const id = user.estu_id || user.docente_id;
            
            try {
                let url = `/asistencia/usuario/${id}?tipo=${tipo}`;
                
                if (filterType === 'mes') {
                    url += `&mes=${selectedMonth}&anio=${selectedYear}`;
                } else if (fechaInicio && fechaFin) {
                    url += `&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
                } else {
                    // Si está en modo rango pero no hay fechas, no cargar nada
                    setHistory([]);
                    setLoading(false);
                    return;
                }

                const response = await api.get(url);
                setHistory(response.data);
            } catch (error) {
                console.error('Error al cargar historial:', error);
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [open, user, tipo, filterType, selectedMonth, selectedYear, fechaInicio, fechaFin]);

    const handleExport = async () => {
        if (!user) return;
        const id = user.estu_id || user.docente_id;
        const nombre = `${user.perfil?.primer_nombre} ${user.perfil?.apellido_paterno}`;
        
        try {
            let url = `/asistencia/usuario/${id}/export?tipo=${tipo}`;
            let filename = `Asistencia_${nombre}`;

            if (filterType === 'mes') {
                url += `&mes=${selectedMonth}&anio=${selectedYear}`;
                filename += `_${months.find(m => m.v === selectedMonth)?.l}_${selectedYear}.xlsx`;
            } else {
                url += `&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
                filename += `_${fechaInicio}_${fechaFin}.xlsx`;
            }

            const response = await api.get(url, {
                responseType: 'blob'
            });
            
            const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = urlBlob;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(urlBlob);
        } catch (error) {
            console.error('Error al descargar Excel:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl bg-white border-neutral-200 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-8 pb-4 border-b border-neutral-100 bg-neutral-50">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-2xl font-black text-neutral-950 tracking-tight uppercase">
                                    Historial de Asistencia
                                </DialogTitle>
                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1">
                                    {user?.perfil?.primer_nombre} {user?.perfil?.apellido_paterno}
                                </p>
                            </div>
                            
                            <Button 
                                onClick={handleExport}
                                disabled={filterType === 'rango' && (!fechaInicio || !fechaFin)}
                                variant="outline" 
                                className="h-10 border-neutral-200 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 gap-2 font-bold text-xs disabled:opacity-50"
                            >
                                <Download className="h-4 w-4" /> Excel
                            </Button>
                        </div>

                        {/* Selector de tipo de filtro */}
                        <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                            <button 
                                onClick={() => setFilterType('mes')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                    filterType === 'mes' 
                                        ? 'bg-white text-indigo-600 shadow-sm' 
                                        : 'text-neutral-500'
                                }`}
                            >
                                <Calendar className="h-4 w-4" /> Por Mes
                            </button>
                            <button 
                                onClick={() => setFilterType('rango')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                    filterType === 'rango' 
                                        ? 'bg-white text-indigo-600 shadow-sm' 
                                        : 'text-neutral-500'
                                }`}
                            >
                                <Calendar className="h-4 w-4" /> Por Rango
                            </button>
                        </div>

                        {/* Filtros por mes */}
                        {filterType === 'mes' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                        Mes
                                    </Label>
                                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                        <SelectTrigger className="bg-white border-neutral-200 h-9 rounded-lg text-xs font-medium">
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
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                        Año
                                    </Label>
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="bg-white border-neutral-200 h-9 rounded-lg text-xs font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-neutral-200">
                                            {years.map(y => (
                                                <SelectItem key={y} value={String(y)} className="text-xs font-medium">
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Filtros por rango de fechas */}
                        {filterType === 'rango' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                        Fecha de inicio
                                    </Label>
                                    <Input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        className="bg-white border-neutral-200 h-9 rounded-lg text-xs font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                        Fecha de fin
                                    </Label>
                                    <Input
                                        type="date"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        className="bg-white border-neutral-200 h-9 rounded-lg text-xs font-medium"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="p-8">
                    {/* Vista Desktop - Tabla */}
                    <div className="hidden md:block bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#00a65a]">
                                <TableRow className="border-green-600 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white text-center">
                                        Fecha
                                    </TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white text-center">
                                        Turno
                                    </TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white text-center">
                                        Entrada
                                    </TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white text-center">
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
                                            {filterType === 'rango' && (!fechaInicio || !fechaFin) 
                                                ? 'Selecciona un rango de fechas' 
                                                : 'No hay registros para este periodo.'}
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

                    {/* Vista Mobile - Cards */}
                    <div className="md:hidden flex flex-col gap-3">
                        {loading ? (
                            <div className="py-16 text-center text-xs font-bold opacity-30 animate-pulse">
                                Cargando...
                            </div>
                        ) : history.length === 0 ? (
                            <div className="py-16 text-center text-neutral-500 text-xs border border-neutral-100 rounded-lg">
                                {filterType === 'rango' && (!fechaInicio || !fechaFin) 
                                    ? 'Selecciona un rango de fechas' 
                                    : 'No hay registros para este periodo.'}
                            </div>
                        ) : (
                            history.map((log) => (
                                <div key={log.asistencia_id} className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-neutral-400 uppercase">Fecha</span>
                                        <span className="font-mono text-sm text-neutral-900">
                                            {new Date(log.fecha).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-neutral-400 uppercase">Turno</span>
                                        <Badge className={`text-[9px] uppercase font-bold px-2 ${
                                            log.turno === 'M' 
                                                ? 'bg-amber-100 text-amber-700' 
                                                : 'bg-indigo-100 text-indigo-700'
                                        }`}>
                                            {log.turno === 'M' ? 'Mañana' : 'Tarde'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-emerald-600 uppercase">Entrada</span>
                                        <span className="font-bold text-emerald-600">
                                            {log.hora_entrada?.substring(0, 5) || '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-rose-600 uppercase">Salida</span>
                                        <span className="font-bold text-rose-600">
                                            {log.hora_salida?.substring(0, 5) || '—'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
