import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Users, Calendar, Check, X, Clock, AlertCircle, Save, UserCheck, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import PageHeader from '@/components/shared/PageHeader';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel Docente', href: '/docente/dashboard' },
    { title: 'Mis Cursos', href: '/docente/mis-cursos' },
    { title: 'Pasar Lista', href: '#' },
];

export default function PasarLista({ docenteCursoId }: { docenteCursoId: number }) {
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [clases, setClases] = useState<any[]>([]);
    const [selectedClase, setSelectedClase] = useState<string>("");
    const [asistencias, setAsistencias] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get(`/docente/curso/${docenteCursoId}/alumnos`),
            api.get(`/docente/curso/${docenteCursoId}/contenido`)
        ]).then(([alRes, clRes]) => {
            setAlumnos(alRes.data);
            const allClases = clRes.data.flatMap((u: any) => u.clases);
            setClases(allClases);
            setLoading(false);
        });
    }, [docenteCursoId]);

    const handleStatus = (estuId: number, status: string) => {
        setAsistencias(prev => ({ ...prev, [estuId]: status }));
    };

    const handleSave = () => {
        if (!selectedClase) {
            alert("Por favor, selecciona una sesión de clase.");
            return;
        }
        
        setSaving(true);
        api.post('/docente/asistencia/iniciar', { 
            id_clase_curso: selectedClase, 
            fecha: new Date().toISOString().split('T')[0] 
        })
            .then(res => {
                const sessionId = res.data.id;
                const payload = Object.entries(asistencias).map(([id, st]) => ({
                    id_estudiante: parseInt(id),
                    estado: st
                }));

                return api.post(`/docente/asistencia/${sessionId}/marcar`, { asistencias: payload });
            })
            .then(() => alert("¡Asistencia guardada correctamente!"))
            .finally(() => setSaving(false));
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                        <p className="font-black text-xs uppercase tracking-widest text-gray-400 animate-pulse">Sincronizando Alumnos...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pasar Lista" />

            <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <PageHeader 
                        icon={UserCheck} 
                        title="Control de Asistencia" 
                        subtitle="Marca la presencia de tus estudiantes para la sesión seleccionada."
                        iconColor="bg-emerald-600"
                    />
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 sm:p-2 rounded-3xl sm:rounded-[2.5rem] border-none shadow-sm shadow-emerald-100/20">
                        <Select onValueChange={setSelectedClase} value={selectedClase}>
                            <SelectTrigger className="w-full sm:w-[300px] h-14 border-none font-bold bg-gray-50 sm:bg-transparent rounded-2xl sm:rounded-none focus:ring-0 px-6">
                                <SelectValue placeholder="Seleccione una sesión de clase..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2 w-full">
                                {clases.map(c => (
                                    <SelectItem 
                                        key={c.clase_id} 
                                        value={c.clase_id.toString()} 
                                        className="rounded-xl font-bold py-3 px-4 focus:bg-emerald-50 focus:text-emerald-600"
                                    >
                                        {c.titulo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="h-10 w-px bg-gray-100" />
                        <Button 
                            onClick={handleSave} 
                            disabled={saving || !selectedClase}
                            className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl h-14 px-10 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95"
                        >
                            {saving ? "Registrando..." : "Guardar Lista"}
                        </Button>
                    </div>
                </div>

                <Card className="rounded-[3rem] border-none shadow-sm bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-10 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Estudiante</th>
                                    <th className="px-10 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Documento</th>
                                    <th className="px-10 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Acción Manual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {alumnos.map((a: any) => (
                                    <tr key={a.estu_id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="size-12 bg-emerald-50 rounded-2xl flex items-center justify-center font-black text-emerald-600 text-[11px] shadow-sm uppercase border border-emerald-100">
                                                    {a.estudiante?.perfil?.primer_nombre?.[0]}{a.estudiante?.perfil?.apellido_paterno?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 leading-none group-hover:text-emerald-600 transition-colors uppercase text-xs">
                                                        {a.estudiante?.perfil?.primer_nombre} {a.estudiante?.perfil?.apellido_paterno}
                                                    </p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5">Alumno Regular</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="font-mono text-[13px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                                {a.estudiante?.perfil?.doc_numero || '—'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex justify-center gap-3">
                                                <StatusButton 
                                                    active={asistencias[a.estu_id] === 'P'} 
                                                    onClick={() => handleStatus(a.estu_id, 'P')}
                                                    icon={<Check className="w-5 h-5" />}
                                                    label="P"
                                                    color="emerald"
                                                    tooltip="Presente"
                                                />
                                                <StatusButton 
                                                    active={asistencias[a.estu_id] === 'F'} 
                                                    onClick={() => handleStatus(a.estu_id, 'F')}
                                                    icon={<X className="w-5 h-5" />}
                                                    label="F"
                                                    color="rose"
                                                    tooltip="Falta"
                                                />
                                                <StatusButton 
                                                    active={asistencias[a.estu_id] === 'T'} 
                                                    onClick={() => handleStatus(a.estu_id, 'T')}
                                                    icon={<Clock className="w-5 h-5" />}
                                                    label="T"
                                                    color="amber"
                                                    tooltip="Tardanza"
                                                />
                                                <StatusButton 
                                                    active={asistencias[a.estu_id] === 'J'} 
                                                    onClick={() => handleStatus(a.estu_id, 'J')}
                                                    icon={<AlertCircle className="w-5 h-5" />}
                                                    label="J"
                                                    color="blue"
                                                    tooltip="Justificado"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}

function StatusButton({ active, onClick, icon, label, color, tooltip }: any) {
    const variants: any = {
        emerald: active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white text-emerald-600 hover:bg-emerald-50 border-emerald-100',
        rose: active ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-white text-rose-600 hover:bg-rose-50 border-rose-100',
        amber: active ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-white text-amber-600 hover:bg-amber-50 border-amber-100',
        blue: active ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-100'
    };

    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center size-14 rounded-2xl transition-all duration-300 border-2 active:scale-90 ${variants[color]}`}
            title={tooltip}
        >
            {icon}
            <span className="text-[9px] font-black mt-0.5 uppercase tracking-tighter leading-none">{label}</span>
        </button>
    );
}
