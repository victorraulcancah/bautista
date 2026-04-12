import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, CheckCircle2, XCircle, HelpCircle, User, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import PageHeader from '@/components/shared/PageHeader';

interface Props {
    examenId: string;
}

export default function RevisarExamenPage({ examenId }: Props) {
    const [examen, setExamen] = useState<any>(null);
    const [preguntas, setPreguntas] = useState<any[]>([]);
    const [notasParciales, setNotasParciales] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel Docente', href: '/docente/dashboard' },
        { title: 'Mis Cursos', href: '/docente/mis-cursos' },
        { title: 'Revisión de Examen', href: '#' },
    ];

    useEffect(() => {
        cargarExamen();
    }, [examenId]);

    const cargarExamen = () => {
        setLoading(true);
        api.get(`/docente/examenes/${examenId}/revisar`)
            .then((res) => {
                setExamen(res.data.examen);
                setPreguntas(res.data.preguntas);
                
                const notas: Record<string, number> = {};
                res.data.preguntas.forEach((pregunta: any) => {
                    notas[pregunta.id] = pregunta.nota_obtenida || 0;
                });
                setNotasParciales(notas);
            })
            .finally(() => setLoading(false));
    };

    const calcularNotaTotal = () => {
        return Object.values(notasParciales).reduce((sum, nota) => sum + nota, 0);
    };

    const guardarCalificacion = () => {
        const notaTotal = calcularNotaTotal();
        setSaving(true);
        api.post(`/docente/examenes/${examenId}/calificar`, {
            nota_total: notaTotal,
            notas_parciales: notasParciales,
        })
            .then(() => {
                alert(`Nota guardada: ${notaTotal.toFixed(2)}`);
                router.visit(`/docente/actividades/${examen.actividad_id}/calificar-examen`);
            })
            .catch(() => {
                alert('No se pudo guardar la calificación');
            })
            .finally(() => setSaving(false));
    };

    if (loading && !examen) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                        <p className="font-black text-xs uppercase tracking-widest text-gray-400 animate-pulse">Cargando Calificaciones...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revisar Examen" />

            <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between gap-6">
                    <PageHeader 
                        icon={Award} 
                        title="Revisión de Evaluación" 
                        subtitle={examen?.actividad_nombre}
                        iconColor="bg-emerald-600"
                    />
                    
                    <div className="flex items-center gap-4">
                        <Card className="flex items-center gap-4 px-6 py-3 rounded-2xl border-none shadow-sm bg-white">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Puntaje Total</span>
                                <span className={`text-2xl font-black ${calcularNotaTotal() >= 11 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {calcularNotaTotal().toFixed(2)}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-gray-100 mx-1" />
                            <Button
                                onClick={guardarCalificacion}
                                disabled={saving}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-[10px] tracking-widest px-8 h-12 shadow-lg shadow-emerald-100"
                            >
                                <Save className="w-4 h-4 mr-2" /> {saving ? 'Guardando...' : 'Finalizar Revisión'}
                            </Button>
                        </Card>
                        <Link href={`/docente/actividades/${examen?.actividad_id}/calificar-examen`}>
                            <Button variant="ghost" className="rounded-2xl font-bold bg-white shadow-sm border-none hover:bg-gray-50 uppercase text-[10px] tracking-widest h-12 px-6">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Estudiante Info Card */}
                <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <User size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Evaluado:</span>
                            <h3 className="font-black text-gray-900 text-lg uppercase">{examen?.estudiante_nombre}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Iniciado</span>
                            <span className="font-bold text-gray-900 text-sm">--/--/----</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Entregado</span>
                            <span className="font-bold text-gray-900 text-sm">--/--/----</span>
                        </div>
                    </div>
                </Card>

                {/* Questions List */}
                <div className="space-y-6">
                    {preguntas.map((pregunta, index) => (
                        <Card
                            key={pregunta.id}
                            className="p-10 rounded-[3rem] border-none shadow-sm bg-white space-y-8 group transition-all"
                        >
                            <div className="flex items-start justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-100">
                                            {index + 1}
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                                            {pregunta.cabecera}
                                        </h3>
                                    </div>
                                    <div
                                        className="prose prose-indigo max-w-none text-gray-600 font-bold text-sm bg-gray-50/50 p-6 rounded-[2rem]"
                                        dangerouslySetInnerHTML={{ __html: pregunta.cuerpo }}
                                    />
                                </div>
                                <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Puntaje Pregunta</span>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={pregunta.valor_nota}
                                                value={notasParciales[pregunta.id] || 0}
                                                onChange={(e) =>
                                                    setNotasParciales({
                                                        ...notasParciales,
                                                        [pregunta.id]: parseFloat(e.target.value) || 0,
                                                    })
                                                }
                                                className="w-24 h-12 text-center rounded-xl border-none bg-gray-100 font-black text-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all text-lg"
                                            />
                                            <span className="font-black text-gray-400">/ {pregunta.valor_nota}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alternatives (if multiple choice) */}
                            {pregunta.tipo === 'multiple' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pregunta.alternativas.map((alt: any, altIndex: number) => {
                                        const esCorrecta = alt.es_correcta;
                                        const esSeleccionada = alt.seleccionada;
                                        
                                        return (
                                            <div
                                                key={altIndex}
                                                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                                                    esCorrecta && esSeleccionada
                                                        ? 'bg-emerald-50 border-emerald-500/30'
                                                        : esSeleccionada
                                                        ? 'bg-rose-50 border-rose-500/30'
                                                        : esCorrecta
                                                        ? 'bg-emerald-50 border-emerald-200'
                                                        : 'bg-gray-50 border-gray-100'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={`size-8 rounded-lg flex items-center justify-center font-black text-[10px] ${
                                                        esCorrecta ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400 border border-gray-100'
                                                    }`}>
                                                        {String.fromCharCode(65 + altIndex)}
                                                    </span>
                                                    <span className="font-bold text-gray-700 text-sm">{alt.contenido}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {esSeleccionada && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Seleccionada</span>
                                                    )}
                                                    {esCorrecta ? (
                                                        <CheckCircle2 className="size-5 text-emerald-600" />
                                                    ) : (
                                                        esSeleccionada && <XCircle className="size-5 text-rose-600" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Written Response (if essay) */}
                            {pregunta.tipo === 'escrito' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest px-2">
                                        <HelpCircle size={12} /> Respuesta del Estudiante
                                    </div>
                                    <div className="bg-amber-50/50 p-8 rounded-[2rem] border border-amber-100 text-sm font-bold text-gray-700 leading-relaxed shadow-inner">
                                        <div
                                            className="prose prose-amber max-w-none"
                                            dangerouslySetInnerHTML={{ __html: pregunta.respuesta_estudiante || '<p className="italic text-gray-400">Sin respuesta registrada.</p>' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
