import React, { useState, useEffect } from 'react';
import { QrCode, Calendar, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import api from '@/lib/api';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface Props {
    docenteCursoId: number;
}

export default function AsistenciaTab({ docenteCursoId }: Props) {
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [clases, setClases] = useState<any[]>([]);
    const [selectedClase, setSelectedClase] = useState<string>("");
    const [asistencias, setAsistencias] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState<'mark' | 'general'>('mark');
    const [matrixData, setMatrixData] = useState<any>(null);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        if (view === 'mark') {
            loadBasicAttendanceData();
        } else {
            loadMatrix();
        }
    }, [view, docenteCursoId]);

    const loadBasicAttendanceData = () => {
        setLoading(true);
        Promise.all([
            api.get(`/docente/curso/${docenteCursoId}/alumnos`),
            api.get(`/docente/curso/${docenteCursoId}/contenido`)
        ]).then(([alRes, clRes]) => {
            setAlumnos(alRes.data);
            const allClases = clRes.data.flatMap((u: any) => u.clases);
            setClases(allClases);
            setLoading(false);
        });
    };

    const loadMatrix = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/docente/curso/${docenteCursoId}/asistencia-matrix`);
            setMatrixData(res.data);
        } finally {
            setLoading(false);
        }
    };

    const startScanner = () => {
        setScanning(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(onScanSuccess, onScanError);
        }, 100);
    };

    const onScanSuccess = (decodedText: string) => {
        const student = alumnos.find(a => 
            a.perfil?.doc_numero === decodedText || 
            a.estu_id?.toString() === decodedText
        );

        if (student) {
            setAsistencias(prev => ({ ...prev, [student.estu_id]: 'P' }));
            // TODO: Replace with a toast if available
            alert(`Marcado: ${student.perfil?.primer_nombre} ${student.perfil?.apellido_paterno}`);
        } else {
            alert(`Código no reconocido: ${decodedText}`);
        }
        setScanning(false);
    };

    const onScanError = (err: any) => {};

    const handleSave = () => {
        if (!selectedClase) return alert("Selecciona una sesión.");
        setSaving(true);
        api.post('/docente/asistencia/iniciar', { id_clase_curso: selectedClase, fecha: new Date().toISOString().split('T')[0] })
            .then(res => {
                const payload = Object.entries(asistencias).map(([id, st]) => ({ id_estudiante: parseInt(id), estado: st }));
                return api.post(`/docente/asistencia/${res.data.id}/marcar`, { asistencias: payload });
            })
            .then(() => alert("¡Asistencia guardada!"))
            .finally(() => setSaving(false));
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-emerald-400 font-black uppercase text-[10px] tracking-widest">Cargando datos...</div>;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'P': return '✓';
            case 'F': return '✕';
            case 'T': return '🕒';
            case 'J': return '⚓';
            default: return '-';
        }
    };

    const getStatusColor = (status: string) => {
        const colors: any = { 
            'P': 'text-emerald-600 bg-emerald-50', 
            'F': 'text-rose-600 bg-rose-50', 
            'T': 'text-amber-600 bg-amber-50', 
            'J': 'text-emerald-600 bg-emerald-50', 
            '-': 'text-gray-200' 
        };
        return colors[status] || colors['-'];
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Control de Asistencia</h2>
                    <p className="text-gray-500 text-sm">Registra o monitorea la presencia de tus alumnos.</p>
                </div>
                <div className="flex p-1.5 bg-gray-100 rounded-[1.5rem]">
                    <Button 
                        variant="ghost" 
                        onClick={() => setView('mark')}
                        className={`rounded-2xl text-[10px] font-black uppercase px-6 h-10 ${view === 'mark' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
                    >
                        Pasar Lista
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setView('general')}
                        className={`rounded-2xl text-[10px] font-black uppercase px-6 h-10 ${view === 'general' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
                    >
                        General
                    </Button>
                </div>
            </div>

            {view === 'mark' ? (
                <>
                    {scanning && (
                        <Card className="rounded-[2rem] border-none shadow-2xl p-6 relative overflow-hidden bg-white mb-6 animate-in zoom-in-95 duration-300">
                            <div className="text-center mb-4">
                                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Escaneando Credencial...</p>
                            </div>
                            <div id="reader" className="w-full max-w-sm mx-auto shadow-inner rounded-2xl overflow-hidden border-4 border-gray-50"></div>
                            <Button variant="ghost" onClick={() => setScanning(false)} className="absolute top-4 right-4 text-gray-400 h-8 w-8 rounded-full">✕</Button>
                        </Card>
                    )}

                    <div className="flex items-center gap-3">
                        <Button onClick={startScanner} variant="outline" className="rounded-2xl h-12 px-6 border-emerald-100 text-emerald-600 font-bold gap-2 hover:bg-emerald-50">
                            <QrCode size={18} /> Escanear QR
                        </Button>
                        <Select onValueChange={setSelectedClase} value={selectedClase}>
                            <SelectTrigger className="w-[200px] h-12 rounded-2xl border-none shadow-sm bg-white font-bold">
                                <SelectValue placeholder="Elegir Sesión..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-xl">
                                {clases.map((c: any) => (
                                    <SelectItem key={c.clase_id} value={c.clase_id.toString()} className="font-bold">{c.titulo}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button 
                            onClick={handleSave} 
                            disabled={saving || !selectedClase}
                            className="rounded-2xl h-12 px-8 bg-emerald-600 font-black uppercase tracking-widest text-[10px]"
                        >
                            {saving ? "Guardando..." : "Guardar Registro"}
                        </Button>
                    </div>

                    <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-left">Alumno</th>
                                    <th className="px-8 py-5 text-center">Asistencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {alumnos.map((a: any) => (
                                    <tr key={a.estu_id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-2xl bg-emerald-50 flex items-center justify-center font-black text-emerald-600 text-xs shadow-sm shadow-emerald-100">
                                                    {a.perfil?.primer_nombre?.[0]}{a.perfil?.apellido_paterno?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-none">{a.perfil?.primer_nombre} {a.perfil?.apellido_paterno}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">DNI: {a.perfil?.doc_numero}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center gap-2">
                                                {[
                                                    { id: 'P', label: 'Pres.', color: 'emerald' },
                                                    { id: 'F', label: 'Fal.', color: 'rose' },
                                                    { id: 'T', label: 'Tar.', color: 'amber' },
                                                    { id: 'J', label: 'Jus.', color: 'indigo' },
                                                ].map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => setAsistencias(prev => ({ ...prev, [a.estu_id]: s.id }))}
                                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all duration-200
                                                            ${asistencias[a.estu_id] === s.id 
                                                                ? `bg-${s.color}-600 text-white shadow-lg shadow-${s.color}-100` 
                                                                : `bg-${s.color}-50 text-${s.color}-600 hover:bg-${s.color}-100`}`}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </>
            ) : (
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    {matrixData ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="p-6 sticky left-0 bg-gray-50 z-10 border-r border-gray-100">Estudiante</th>
                                        {matrixData.sesiones.map((s: any) => (
                                            <th key={s.id} className="p-6 text-center border-l border-gray-100 min-w-[100px]">
                                                {new Date(s.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {matrixData.estudiantes.map((e: any) => (
                                        <tr key={e.estu_id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-6 sticky left-0 bg-white group-hover:bg-gray-50 font-bold text-gray-700 text-sm border-r border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                                {e.nombre}
                                            </td>
                                            {matrixData.sesiones.map((s: any) => {
                                                const reg = e.registros.find((r: any) => r.id_asistencia_clase === s.id);
                                                const status = reg?.estado || '-';
                                                
                                                return (
                                                    <td key={s.id} className="p-6 text-center border-l border-gray-100">
                                                        <span className={`inline-flex items-center justify-center size-8 rounded-xl font-black text-[11px] transition-all ${getStatusColor(status)}`}>
                                                            {getStatusIcon(status)}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-20 text-center text-gray-400 font-bold">Cargando historial...</div>
                    )}
                </Card>
            )}
        </div>
    );
}
