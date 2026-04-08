import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Users, Calendar, Check, X, Clock, AlertCircle, Save, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

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
        // Load students and classes for this assignment
        Promise.all([
            api.get(`/docente/curso/${docenteCursoId}/alumnos`),
            api.get(`/alumno/curso/${docenteCursoId}`) // Reuse course detail to get classes
        ]).then(([alRes, clRes]) => {
            setAlumnos(alRes.data);
            // Flatten classes from units
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
return alert("Por favor, selecciona una sesión de clase.");
}
        
        setSaving(true);
        api.post('/docente/asistencia/iniciar', { id_clase_curso: selectedClase, fecha: new Date().toISOString().split('T')[0] })
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
            <div className="p-10 text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest">Cargando nómina de alumnos...</div>
        </AppLayout>
    );
}

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
        <div className="min-h-screen bg-[#FDFDFF] p-4 md:p-10 space-y-10 font-sans">
            <Head title="Pasar Lista" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                    <Link href="/docente/mis-cursos">
                        <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 p-0">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Control de Asistencia</h1>
                        <p className="text-gray-500 font-medium italic">Marca la presencia de tus alumnos en la sesión actual.</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                    <Select onValueChange={setSelectedClase} value={selectedClase}>
                        <SelectTrigger className="w-[250px] h-12 border-none font-bold bg-transparent focus:ring-0">
                            <SelectValue placeholder="Seleccionar Sesión..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            {clases.map(c => (
                                <SelectItem key={c.clase_id} value={c.clase_id.toString()} className="font-medium">{c.titulo}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="h-8 w-px bg-gray-100" />
                    <Button 
                        onClick={handleSave} 
                        disabled={saving || !selectedClase}
                        className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-12 px-8 font-black shadow-lg shadow-indigo-100"
                    >
                        {saving ? "Guardando..." : "Guardar Lista"} <Save className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/80 border-b text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <tr>
                            <th className="px-10 py-6">Alumno</th>
                            <th className="px-10 py-6">No. Documento</th>
                            <th className="px-10 py-6 text-center">Estado de Asistencia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {alumnos.map((a: any) => (
                            <tr key={a.estu_id} className="hover:bg-indigo-50/20 transition-colors group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400 border border-gray-200 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                            {a.estudiante?.perfil?.primer_nombre?.[0]}{a.estudiante?.perfil?.apellido_paterno?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 tracking-tight">{a.estudiante?.perfil?.primer_nombre} {a.estudiante?.perfil?.apellido_paterno} {a.estudiante?.perfil?.apellido_materno}</p>
                                            <p className="text-[10px] font-black text-gray-400">ESTUDIANTE REGULAR</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className="font-bold text-gray-500 font-mono">{a.estudiante?.perfil?.doc_numero || '76543210'}</span>
                                </td>
                                <td className="px-10 py-8 text-center">
                                    <div className="flex justify-center space-x-2">
                                        <StatusButton 
                                            active={asistencias[a.estu_id] === 'P'} 
                                            onClick={() => handleStatus(a.estu_id, 'P')}
                                            icon={<Check className="w-4 h-4" />}
                                            label="Presente"
                                            color="emerald"
                                        />
                                        <StatusButton 
                                            active={asistencias[a.estu_id] === 'F'} 
                                            onClick={() => handleStatus(a.estu_id, 'F')}
                                            icon={<X className="w-4 h-4" />}
                                            label="Falta"
                                            color="rose"
                                        />
                                        <StatusButton 
                                            active={asistencias[a.estu_id] === 'T'} 
                                            onClick={() => handleStatus(a.estu_id, 'T')}
                                            icon={<Clock className="w-4 h-4" />}
                                            label="Tardanza"
                                            color="amber"
                                        />
                                        <StatusButton 
                                            active={asistencias[a.estu_id] === 'J'} 
                                            onClick={() => handleStatus(a.estu_id, 'J')}
                                            icon={<AlertCircle className="w-4 h-4" />}
                                            label="Justif."
                                            color="blue"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </AppLayout>
    );
}

function StatusButton({ active, onClick, icon, label, color }: any) {
    const colors: any = {
        emerald: active ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
        rose: active ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-rose-50 text-rose-600 hover:bg-rose-100',
        amber: active ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-amber-50 text-amber-600 hover:bg-amber-100',
        blue: active ? 'bg-blue-500 text-white shadow-blue-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    };

    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 border border-transparent shadow-sm ${colors[color]}`}
            title={label}
        >
            {icon}
            <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">{label}</span>
        </button>
    );
}
