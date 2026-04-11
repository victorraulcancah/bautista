import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
    actividadId: number;
}

interface Entrega {
    entrega_id: number;
    estudiante: {
        estu_id: number;
        nombre: string;
        apellido_paterno: string;
        apellido_materno: string;
    };
    archivos: Array<{
        archivo_id: number;
        nombre: string;
        path: string;
        tamanio: number;
    }>;
    fecha_entrega: string;
    nota: string | null;
    observacion: string | null;
    estado: string;
}

interface Actividad {
    actividad_id: number;
    nombre_actividad: string;
    descripcion_corta: string;
    nota_actividad: string;
    tipo_actividad: {
        nombre: string;
    };
}

export default function CalificarActividad({ actividadId }: Props) {
    const [actividad, setActividad] = useState<Actividad | null>(null);
    const [entregas, setEntregas] = useState<Entrega[]>([]);
    const [loading, setLoading] = useState(true);
    const [calificando, setCalificando] = useState<number | null>(null);
    const [notaForm, setNotaForm] = useState({ nota: '', observacion: '' });

    useEffect(() => {
        loadData();
    }, [actividadId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [actRes, entregasRes] = await Promise.all([
                api.get(`/actividades/${actividadId}`),
                api.get(`/actividades/${actividadId}/entregas`)
            ]);
            setActividad(actRes.data);
            setEntregas(entregasRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCalificar = async (entregaId: number) => {
        try {
            await api.post(`/actividades/${actividadId}/calificar`, {
                entrega_id: entregaId,
                nota: notaForm.nota,
                observacion: notaForm.observacion
            });
            setCalificando(null);
            setNotaForm({ nota: '', observacion: '' });
            loadData();
        } catch (error) {
            console.error('Error calificando:', error);
        }
    };

    const startCalificar = (entrega: Entrega) => {
        setCalificando(entrega.entrega_id);
        setNotaForm({
            nota: entrega.nota || '',
            observacion: entrega.observacion || ''
        });
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={[]}>
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="animate-spin size-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={`Calificar - ${actividad?.nombre_actividad}`} />
            
            <div className="min-h-screen bg-[#F8FAFC] p-8">
                {/* Header */}
                <div className="mb-6">
                    <Button 
                        variant="ghost" 
                        onClick={() => window.history.back()}
                        className="mb-4 gap-2"
                    >
                        <ArrowLeft size={16} />
                        Volver al Curso
                    </Button>
                    
                    <div className="flex items-start gap-4">
                        <div className="size-16 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <FileText size={28} className="text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-gray-900">{actividad?.nombre_actividad}</h1>
                            <p className="text-gray-500 mt-1">{actividad?.descripcion_corta}</p>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-600">
                                    {actividad?.tipo_actividad?.nombre}
                                </span>
                                <span className="text-sm text-gray-500 font-bold">
                                    Puntos: {actividad?.nota_actividad || '20'}
                                </span>
                                <span className="text-sm text-gray-500 font-bold">
                                    {entregas.length} entregas
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Entregas List */}
                <div className="space-y-4">
                    {entregas.length === 0 ? (
                        <Card className="rounded-[2.5rem] p-12 text-center">
                            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-bold">No hay entregas aún</p>
                            <p className="text-sm text-gray-400 mt-2">Los estudiantes aún no han enviado sus trabajos</p>
                        </Card>
                    ) : (
                        entregas.map((entrega) => (
                            <Card key={entrega.entrega_id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-md transition-all overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        {/* Student Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="size-12 rounded-2xl bg-blue-100 flex items-center justify-center font-black text-blue-600">
                                                    {entrega.estudiante.nombre.charAt(0)}{entrega.estudiante.apellido_paterno.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-lg text-gray-900">
                                                        {entrega.estudiante.nombre} {entrega.estudiante.apellido_paterno} {entrega.estudiante.apellido_materno}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 font-bold">
                                                        Entregado: {format(new Date(entrega.fecha_entrega), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Files */}
                                            {entrega.archivos.length > 0 && (
                                                <div className="space-y-2 mb-4">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Archivos Entregados</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {entrega.archivos.map((archivo) => (
                                                            <a
                                                                key={archivo.archivo_id}
                                                                href={`/storage/${archivo.path}`}
                                                                target="_blank"
                                                                className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all"
                                                            >
                                                                <FileText size={14} className="text-blue-600" />
                                                                <span className="text-xs font-bold text-gray-700">{archivo.nombre}</span>
                                                                <Download size={12} className="text-gray-400" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Calificación */}
                                            {calificando === entrega.entrega_id ? (
                                                <div className="space-y-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-700 mb-1 block">Nota</label>
                                                            <Input 
                                                                type="number"
                                                                value={notaForm.nota}
                                                                onChange={(e) => setNotaForm(prev => ({ ...prev, nota: e.target.value }))}
                                                                placeholder="0-20"
                                                                className="h-10 rounded-xl font-bold"
                                                                min="0"
                                                                max={actividad?.nota_actividad || '20'}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-700 mb-1 block">Observaciones</label>
                                                        <Textarea 
                                                            value={notaForm.observacion}
                                                            onChange={(e) => setNotaForm(prev => ({ ...prev, observacion: e.target.value }))}
                                                            placeholder="Comentarios para el estudiante..."
                                                            className="rounded-xl font-bold"
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            onClick={() => handleCalificar(entrega.entrega_id)}
                                                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold gap-2"
                                                        >
                                                            <CheckCircle size={16} />
                                                            Guardar Calificación
                                                        </Button>
                                                        <Button 
                                                            variant="outline"
                                                            onClick={() => setCalificando(null)}
                                                            className="rounded-xl font-bold"
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : entrega.nota ? (
                                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Award size={16} className="text-emerald-600" />
                                                        <span className="text-sm font-bold text-emerald-900">Calificado: {entrega.nota} / {actividad?.nota_actividad}</span>
                                                    </div>
                                                    {entrega.observacion && (
                                                        <p className="text-xs text-gray-600 mt-2">{entrega.observacion}</p>
                                                    )}
                                                    <Button 
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => startCalificar(entrega)}
                                                        className="mt-3 rounded-xl font-bold text-xs"
                                                    >
                                                        Editar Calificación
                                                    </Button>
                                                </div>
                                                                                            ) : (
                                                <Button 
                                                    onClick={() => startCalificar(entrega)}
                                                    className="rounded-xl bg-amber-600 hover:bg-amber-700 font-bold gap-2"
                                                >
                                                    <Award size={16} />
                                                    Calificar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
