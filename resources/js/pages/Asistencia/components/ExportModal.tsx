import { useState } from 'react';
import { FileSpreadsheet, Calendar } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

type Props = {
    open: boolean;
    onClose: () => void;
    tipo: 'E' | 'D';
};

const months = [
    { v: '1', l: 'Enero' }, { v: '2', l: 'Febrero' }, { v: '3', l: 'Marzo' },
    { v: '4', l: 'Abril' }, { v: '5', l: 'Mayo' }, { v: '6', l: 'Junio' },
    { v: '7', l: 'Julio' }, { v: '8', l: 'Agosto' }, { v: '9', l: 'Septiembre' },
    { v: '10', l: 'Octubre' }, { v: '11', l: 'Noviembre' }, { v: '12', l: 'Diciembre' }
];

export default function ExportModal({ open, onClose, tipo }: Props) {
    const [exportType, setExportType] = useState<'mes' | 'rango'>('mes');
    const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        const tipoLabel = tipo === 'E' ? 'Estudiantes' : 'Docentes';
        
        try {
            let url = '/asistencia/export-all?tipo=' + tipo;
            let filename = `Reporte_Asistencia_${tipoLabel}`;

            if (exportType === 'mes') {
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
            
            onClose();
        } catch (error) {
            console.error('Error al descargar Excel:', error);
        } finally {
            setLoading(false);
        }
    };

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white border-neutral-200 rounded-3xl p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-neutral-100 bg-emerald-50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center">
                            <FileSpreadsheet className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-neutral-950 tracking-tight">
                                Exportar a Excel
                            </DialogTitle>
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">
                                {tipo === 'E' ? 'Estudiantes' : 'Docentes'}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Selector de tipo de exportación */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                            Tipo de exportación
                        </Label>
                        <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                            <button 
                                onClick={() => setExportType('mes')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    exportType === 'mes' 
                                        ? 'bg-white text-emerald-600 shadow-sm' 
                                        : 'text-neutral-500'
                                }`}
                            >
                                <Calendar className="h-4 w-4" /> Por Mes
                            </button>
                            <button 
                                onClick={() => setExportType('rango')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    exportType === 'rango' 
                                        ? 'bg-white text-emerald-600 shadow-sm' 
                                        : 'text-neutral-500'
                                }`}
                            >
                                <Calendar className="h-4 w-4" /> Por Rango
                            </button>
                        </div>
                    </div>

                    {/* Filtros por mes */}
                    {exportType === 'mes' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                    Mes
                                </Label>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="bg-white border-neutral-200 h-11 rounded-xl text-sm font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-neutral-200">
                                        {months.map(m => (
                                            <SelectItem key={m.v} value={m.v} className="text-sm font-medium">
                                                {m.l}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                    Año
                                </Label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="bg-white border-neutral-200 h-11 rounded-xl text-sm font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-neutral-200">
                                        {years.map(y => (
                                            <SelectItem key={y} value={String(y)} className="text-sm font-medium">
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Filtros por rango de fechas */}
                    {exportType === 'rango' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                    Fecha de inicio
                                </Label>
                                <Input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="bg-white border-neutral-200 h-11 rounded-xl text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                    Fecha de fin
                                </Label>
                                <Input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="bg-white border-neutral-200 h-11 rounded-xl text-sm font-medium"
                                />
                            </div>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 h-11 rounded-xl border-neutral-200 font-bold text-sm"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={loading || (exportType === 'rango' && (!fechaInicio || !fechaFin))}
                            className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Exportando...
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="h-4 w-4" />
                                    Exportar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
