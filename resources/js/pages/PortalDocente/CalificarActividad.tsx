import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, ClipboardList, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import PageHeader from '@/components/shared/PageHeader';
import GradeSubmissionView from './components/GradeSubmissionView';

interface Props {
    actividadId: number;
    entregasEndpoint?: string;
    saveEndpoint?: string;
    title?: string;
}

export default function CalificarActividad({ 
    actividadId, 
    entregasEndpoint,
    saveEndpoint,
    title = "Calificar Entregas"
}: Props) {
    const { url } = usePage();
    const backUrl = (() => {
        try {
            const params = new URLSearchParams(url.split('?')[1] ?? '');
            return params.get('back') || `/docente/actividades/${actividadId}`;
        } catch {
            return `/docente/actividades/${actividadId}`;
        }
    })();
    const [actividad, setActividad] = useState<any>(null);
    const [entregas, setEntregas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const effectiveEntregasEndpoint = entregasEndpoint || `/actividades/${actividadId}/entregas`;
    const effectiveSaveEndpoint = saveEndpoint || `/actividades/${actividadId}/calificar`;

    useEffect(() => {
        loadData();
    }, [actividadId, effectiveEntregasEndpoint]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [actRes, entregasRes] = await Promise.all([
                api.get(`/actividades/${actividadId}`),
                api.get(effectiveEntregasEndpoint)
            ]);
            setActividad(actRes.data);
            
            // Normalize data if coming from different endpoints
            let normalizedEntregas = entregasRes.data;
            if (effectiveEntregasEndpoint.includes('examenes') || effectiveEntregasEndpoint.includes('alumnos')) {
                normalizedEntregas = entregasRes.data.map((item: any) => ({
                    entrega_id: item.id,
                    estudiante: {
                        estu_id: item.estu_id || item.id,
                        nombre: item.primer_nombre || item.nombre,
                        apellido_paterno: item.apellido_paterno,
                        apellido_materno: item.apellido_materno,
                    },
                    archivos: item.archivos || [],
                    fecha_entrega: item.fecha_entrega || item.created_at || new Date().toISOString(),
                    nota: item.nota,
                    observacion: item.observacion,
                    estado: item.examen_entregado ? 'entregado' : 'pendiente'
                }));
            }
            
            setEntregas(normalizedEntregas);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGrade = async (entregaId: number, nota: string, observacion: string) => {
        await api.post(effectiveSaveEndpoint, {
            entrega_id: entregaId,
            estudiante_id: entregaId, // Support for endpoints using student ID as primary key
            nota: nota,
            observacion: observacion
        });
        loadData();
    };

    const breadcrumbs = [
        { title: 'Panel Docente', href: '/docente/dashboard' },
        { title: 'Mis Cursos', href: '/docente/mis-cursos' },
        { title: 'Curso', href: backUrl },
        { title: actividad?.nombre || 'Actividad', href: '#' },
    ];

    const filteredEntregas = entregas.filter(e => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const nombre = `${e.estudiante?.nombre} ${e.estudiante?.apellido_paterno} ${e.estudiante?.apellido_materno}`.toLowerCase();
        return nombre.includes(q);
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Calificar - ${actividad?.nombre || 'Cargando...'}`} />
            
            <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <PageHeader 
                        icon={ClipboardList} 
                        title={title} 
                        subtitle={actividad?.nombre || "Gestionando Calificaciones"}
                        iconColor="bg-emerald-600"
                    />
                    <Link href={backUrl}>
                        <Button variant="ghost" className="rounded-2xl font-bold bg-white shadow-sm border-none hover:bg-gray-50 uppercase text-[10px] tracking-widest h-11 px-6">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border-none shadow-sm space-y-6">
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                                <span className="size-2 rounded-full bg-emerald-600" /> Resumen de Actividad
                            </h4>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Puntaje Máximo</span>
                                    <span className="font-black text-emerald-600 text-xl">{actividad?.nota_actividad || '20'} Puntos</span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total Entregas</span>
                                    <span className="font-bold text-gray-900">{filteredEntregas.length} / {entregas.length} Estudiantes</span>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Tipo</span>
                                    <span className="font-black text-emerald-700 uppercase text-[11px]">{actividad?.tipo_actividad?.nombre || 'Actividad'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-4">
                        {/* Buscador */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar alumno por nombre..."
                                className="pl-10 h-11 rounded-2xl border-gray-200 bg-white shadow-sm font-medium text-sm focus:ring-emerald-500 focus:border-emerald-400"
                            />
                        </div>

                        <GradeSubmissionView 
                            entregas={filteredEntregas} 
                            maxNota={parseInt(actividad?.nota_actividad || '20')}
                            onSaveGrade={handleSaveGrade}
                            isLoading={loading}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
