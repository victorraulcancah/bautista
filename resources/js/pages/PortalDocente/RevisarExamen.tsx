import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

interface Props {
    examenId: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel Docente', href: '/docente/dashboard' },
    { title: 'Mis Cursos', href: '/docente/mis-cursos' },
    { title: 'Revisar Examen', href: '#' },
];

export default function RevisarExamenPage({ examenId }: Props) {
    const [examen, setExamen] = useState<any>(null);
    const [preguntas, setPreguntas] = useState<any[]>([]);
    const [notasParciales, setNotasParciales] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

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
            });
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="p-10 text-center font-black animate-pulse text-indigo-600">
                    Cargando examen...
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revisar Examen" />

            <div className="min-h-screen bg-[#FDFDFF] p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                            {examen?.actividad_nombre}
                        </h1>
                        <p className="text-gray-500 font-medium italic mt-2">
                            Estudiante: {examen?.estudiante_nombre}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="bg-indigo-100 px-6 py-3 rounded-2xl">
                            <span className="text-sm font-bold text-gray-600">Nota Total:</span>
                            <span className="ml-2 text-2xl font-black text-indigo-600">
                                {calcularNotaTotal().toFixed(2)}
                            </span>
                        </div>
                        <Button
                            onClick={guardarCalificacion}
                            className="rounded-2xl bg-indigo-600"
                        >
                            <Save className="w-4 h-4 mr-2" /> Guardar
                        </Button>
                        <Link href={`/docente/actividades/${examen?.actividad_id}/calificar-examen`}>
                            <Button variant="outline" className="rounded-2xl">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-6">
                    {preguntas.map((pregunta, index) => (
                        <div
                            key={pregunta.id}
                            className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-black">
                                            {index + 1}
                                        </span>
                                        <h3 className="text-xl font-black text-gray-900">
                                            {pregunta.cabecera}
                                        </h3>
                                    </div>
                                    <div
                                        className="prose max-w-none mb-6"
                                        dangerouslySetInnerHTML={{ __html: pregunta.cuerpo }}
                                    />
                                </div>
                                <div className="ml-6 flex flex-col items-end space-y-2">
                                    <span className="text-sm font-bold text-gray-500">
                                        Valor: {pregunta.valor_nota} pts
                                    </span>
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
                                        className="w-24 text-center rounded-xl"
                                    />
                                </div>
                            </div>

                            {pregunta.tipo === 'multiple' && (
                                <div className="space-y-3">
                                    {pregunta.alternativas.map((alt: any, altIndex: number) => {
                                        const esCorrecta = alt.es_correcta;
                                        const esSeleccionada = alt.seleccionada;
                                        
                                        return (
                                            <div
                                                key={altIndex}
                                                className={`p-4 rounded-2xl border-2 ${
                                                    esCorrecta && esSeleccionada
                                                        ? 'bg-green-50 border-green-500'
                                                        : esSeleccionada
                                                        ? 'bg-red-50 border-red-500'
                                                        : esCorrecta
                                                        ? 'bg-green-50 border-green-300'
                                                        : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="font-bold text-gray-700">
                                                            {String.fromCharCode(65 + altIndex)}.
                                                        </span>
                                                        <span className="text-gray-900">{alt.contenido}</span>
                                                    </div>
                                                    {esCorrecta && (
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                    )}
                                                    {esSeleccionada && !esCorrecta && (
                                                        <XCircle className="w-5 h-5 text-red-600" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {pregunta.tipo === 'escrito' && (
                                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                                    <h4 className="font-bold text-gray-700 mb-3">Respuesta del estudiante:</h4>
                                    <div
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: pregunta.respuesta_estudiante }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
