import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Eye, AlertCircle, CheckCircle2, ClipboardCheck, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import PageHeader from '@/components/shared/PageHeader';

interface Props {
    actividadId: string;
}

export default function CalificarExamenPage({ actividadId }: Props) {
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [actividad, setActividad] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notas, setNotas] = useState<Record<string, string>>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel Docente', href: '/docente/dashboard' },
        { title: 'Mis Cursos', href: '/docente/mis-cursos' },
        { title: 'Calificar Evaluación', href: '#' },
    ];

    useEffect(() => {
        cargarDatos();
    }, [actividadId]);

    const cargarDatos = () => {
        setLoading(true);
        Promise.all([
            api.get(`/docente/actividades/${actividadId}/examenes`),
            api.get(`/docente/actividades/${actividadId}`)
        ])
            .then(([resAlumnos, resActividad]) => {
                setAlumnos(resAlumnos.data);
                setActividad(resActividad.data);
                const notasIniciales: Record<string, string> = {};
                resAlumnos.data.forEach((alumno: any) => {
                    notasIniciales[alumno.id] = alumno.nota || '';
                });
                setNotas(notasIniciales);
            })
            .finally(() => setLoading(false));
    };

    const guardarNota = (estudianteId: string) => {
        const nota = notas[estudianteId];
        if (!nota || nota.trim() === '') {
            alert('Debe ingresar una nota');
            return;
        }

        setSavingId(estudianteId);
        api.post(`/docente/actividades/${actividadId}/calificar-examen`, {
            estudiante_id: estudianteId,
            nota: parseFloat(nota),
        })
            .then(() => {
                // Success feedback can be improved later
            })
            .catch(() => {
                alert('No se pudo guardar la nota');
            })
            .finally(() => setSavingId(null));
    };

    if (loading && !actividad) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                        <p className="font-black text-xs uppercase tracking-widest text-gray-400 animate-pulse">Analizando Resultados...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calificar Examen" />

            <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <PageHeader 
                        icon={ClipboardCheck} 
                        title="Consolidado de Calificaciones" 
                        subtitle={actividad?.nombre || "Evaluación"}
                        iconColor="bg-emerald-600"
                    />
                    <Link href={`/docente/actividades/${actividadId}`}>
                        <Button variant="ghost" className="rounded-2xl font-bold bg-white shadow-sm border-none hover:bg-gray-50 uppercase text-[10px] tracking-widest h-11 px-6">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </Link>
                </div>

                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400">#</th>
                                    <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Estudiante</th>
                                    <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Estado Entrega</th>
                                    <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Calificación</th>
                                    <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {alumnos.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <GraduationCap size={48} className="text-gray-300" />
                                                <p className="font-black uppercase tracking-widest text-sm text-gray-400">No hay alumnos matriculados</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    alumnos.map((alumno, index) => (
                                        <tr key={alumno.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6 font-black text-gray-300 group-hover:text-emerald-600 transition-colors">
                                                {index + 1}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-[1rem] bg-emerald-50 flex items-center justify-center font-black text-emerald-600 text-[10px] shadow-sm uppercase">
                                                        {alumno.primer_nombre?.[0]}{alumno.apellido_paterno?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900 leading-none group-hover:text-emerald-600 transition-colors uppercase text-xs">
                                                            {alumno.primer_nombre} {alumno.segundo_nombre}
                                                        </div>
                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-tight mt-1">
                                                            {alumno.apellido_paterno} {alumno.apellido_materno}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {alumno.examen_entregado ? (
                                                    <Badge className="rounded-xl bg-emerald-50 text-emerald-600 border-none shadow-none font-black uppercase text-[9px] px-3 h-7">
                                                        <CheckCircle2 size={10} className="mr-1.5" /> Entregado
                                                    </Badge>
                                                ) : (
                                                    <Badge className="rounded-xl bg-rose-50 text-rose-600 border-none shadow-none font-black uppercase text-[9px] px-3 h-7">
                                                        <AlertCircle size={10} className="mr-1.5" /> Pendiente
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-4">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="20"
                                                        value={notas[alumno.id] || ''}
                                                        onChange={(e) =>
                                                            setNotas({ ...notas, [alumno.id]: e.target.value })
                                                        }
                                                        className="w-24 h-12 text-center rounded-xl border-none bg-gray-100 font-black text-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all text-lg"
                                                        placeholder="0.0"
                                                    />
                                                    <Button
                                                        onClick={() => guardarNota(alumno.id)}
                                                        disabled={savingId === alumno.id}
                                                        className="size-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                                                    >
                                                        <Save className={`w-4 h-4 ${savingId === alumno.id ? 'animate-pulse' : ''}`} />
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {alumno.examen_entregado ? (
                                                    <Link
                                                        href={`/docente/examenes/${alumno.examen_id}/revisar`}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="rounded-xl font-black uppercase text-[9px] tracking-widest px-4 h-10 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all gap-2"
                                                        >
                                                            <Eye className="w-4 h-4" /> Revisar Evaluación
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Sin Entregas</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
