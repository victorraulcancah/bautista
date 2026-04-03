import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, PlusCircle, Trash2, Eye, Clock, FileText, CheckCircle2, X } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 10);

export default function QuizBuilder({ docenteCursoId, actividadId }: { docenteCursoId: number, actividadId: number }) {
    const [cuestionario, setCuestionario] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get(`/actividades/${actividadId}/cuestionario`)
            .then(res => setCuestionario(res.data))
            .finally(() => setLoading(false));
    }, [actividadId]);

    const addPregunta = () => {
        setCuestionario({
            ...cuestionario,
            preguntas: [
                ...(cuestionario.preguntas || []),
                {
                    _frontId: generateId(),
                    cabecera: '',
                    valor_nota: 1,
                    alternativas: [
                        { _frontId: generateId(), contenido: 'Opción 1', estado_res: '1' },
                        { _frontId: generateId(), contenido: 'Opción 2', estado_res: '0' }
                    ]
                }
            ]
        });
    };

    const deletePregunta = (index: number) => {
        const p = [...cuestionario.preguntas];
        p.splice(index, 1);
        setCuestionario({ ...cuestionario, preguntas: p });
    };

    const updatePregunta = (index: number, field: string, value: any) => {
        const p = [...cuestionario.preguntas];
        p[index] = { ...p[index], [field]: value };
        setCuestionario({ ...cuestionario, preguntas: p });
    };

    const addAlternativa = (pIndex: number) => {
        const p = [...cuestionario.preguntas];
        p[pIndex].alternativas.push({
            _frontId: generateId(),
            contenido: `Opción ${p[pIndex].alternativas.length + 1}`,
            estado_res: '0'
        });
        setCuestionario({ ...cuestionario, preguntas: p });
    };

    const deleteAlternativa = (pIndex: number, aIndex: number) => {
        const p = [...cuestionario.preguntas];
        if (p[pIndex].alternativas.length <= 2) {
            alert('Una pregunta debe tener al menos 2 alternativas.');
            return;
        }
        p[pIndex].alternativas.splice(aIndex, 1);
        // Si borró la respuesta correcta, marca la primera
        if (!p[pIndex].alternativas.find((a: any) => a.estado_res === '1')) {
            p[pIndex].alternativas[0].estado_res = '1';
        }
        setCuestionario({ ...cuestionario, preguntas: p });
    };

    const updateAlternativa = (pIndex: number, aIndex: number, field: string, value: any) => {
        const p = [...cuestionario.preguntas];
        p[pIndex].alternativas[aIndex][field] = value;
        setCuestionario({ ...cuestionario, preguntas: p });
    };

    const setRespuestaCorrecta = (pIndex: number, aIndex: number) => {
        const p = [...cuestionario.preguntas];
        p[pIndex].alternativas = p[pIndex].alternativas.map((alt: any, i: number) => ({
            ...alt,
            estado_res: i === aIndex ? '1' : '0'
        }));
        setCuestionario({ ...cuestionario, preguntas: p });
    };

    const handleSave = () => {
        setSaving(true);
        api.put(`/actividades/${actividadId}/cuestionario`, cuestionario)
            .then(() => alert('Examen guardado exitosamente.'))
            .catch(() => alert('Ocurrió un error al guardar el examen.'))
            .finally(() => setSaving(false));
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest text-2xl mt-10">Cargando constructor...</div>;

    const totalPuntos = cuestionario.preguntas?.reduce((acc: number, p: any) => acc + Number(p.valor_nota), 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Head title="Constructor de Examen" />

            {/* Topbar */}
            <div className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4 shadow-sm sticky top-0 z-50">
                <div className="flex items-center space-x-4">
                    <Link href={`/docente/cursos/${docenteCursoId}/contenido`}>
                        <Button variant="ghost" className="h-12 w-12 rounded-full hover:bg-gray-100 p-0">
                            <ArrowLeft className="w-6 h-6 text-gray-500" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none">Generador de Exámenes</h1>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">
                            Total: {totalPuntos} Puntos / {cuestionario.preguntas?.length || 0} Preguntas
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving} 
                        className="rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 h-12 px-8 font-black shadow-lg shadow-indigo-200 uppercase tracking-widest"
                    >
                        <Save className="w-5 h-5 mr-3" /> {saving ? 'Guardando...' : 'Guardar Examen'}
                    </Button>
                </div>
            </div>

            <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8 pb-32">
                {/* Metadatos Generales */}
                <div className="bg-white rounded-[2rem] p-8 border border-t-8 border-indigo-600 shadow-xl shadow-gray-200/50 space-y-6">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
                        <FileText className="w-8 h-8 mr-4 text-indigo-300" /> Configuración Básica
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center"><Clock className="w-4 h-4 mr-2"/> Duración (MIN)</label>
                            <Input 
                                type="number" 
                                value={cuestionario.duracion || ''} 
                                onChange={(e) => setCuestionario({...cuestionario, duracion: e.target.value})}
                                placeholder="Ej: 60"
                                className="h-12 rounded-xl bg-gray-50 border-gray-100 font-bold text-center text-lg focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center"><Eye className="w-4 h-4 mr-2"/> Ver Notas Fin</label>
                            <select 
                                value={cuestionario.nota_visible}
                                onChange={(e) => setCuestionario({...cuestionario, nota_visible: e.target.value})}
                                className="w-full h-12 rounded-xl bg-gray-50 border-gray-100 font-bold focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="1">Sí, alumno verá la nota al terminar</option>
                                <option value="0">No, calcular pero ocultar al alumno</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center"><CheckCircle2 className="w-4 h-4 mr-2"/> Ver Respuestas</label>
                            <select 
                                value={cuestionario.mostrar_respuesta}
                                onChange={(e) => setCuestionario({...cuestionario, mostrar_respuesta: e.target.value})}
                                className="w-full h-12 rounded-xl bg-gray-50 border-gray-100 font-bold focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="1">Sí, mostrar correctas al finalizar</option>
                                <option value="0">No, no mostrar respuestas</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Preguntas */}
                <div className="space-y-6">
                    {cuestionario.preguntas?.map((p: any, pIndex: number) => (
                        <div key={p.pregunta_id || p._frontId} className="bg-white rounded-[2rem] border border-gray-200 shadow-xl shadow-gray-200/50 flex flex-col transition-all duration-300 focus-within:ring-4 ring-indigo-500/20 group">
                            {/* Pregunta Cabecera */}
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
                                    <div className="flex-1 w-full">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2 mb-2 block">Cuerpo de la pregunta</label>
                                        <Input 
                                            value={p.cabecera}
                                            onChange={(e) => updatePregunta(pIndex, 'cabecera', e.target.value)}
                                            placeholder="Ej: ¿En qué año se descubrió américa?"
                                            className="h-14 font-black text-lg bg-gray-50 border-gray-100 rounded-2xl w-full"
                                        />
                                    </div>
                                    <div className="w-full md:w-32">
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2 mb-2 block text-center">Puntaje</label>
                                        <Input 
                                            type="number" 
                                            value={p.valor_nota}
                                            onChange={(e) => updatePregunta(pIndex, 'valor_nota', e.target.value)}
                                            className="h-14 font-black text-xl text-center text-emerald-600 bg-emerald-50 border-emerald-100 rounded-2xl"
                                        />
                                    </div>
                                </div>

                                {/* Opciones */}
                                <div className="space-y-4 pt-4">
                                    {p.alternativas.map((alt: any, aIndex: number) => (
                                        <div key={alt.alternativa_id || alt._frontId} className="flex items-center space-x-4 pl-4 group/alt">
                                            {/* Custom Radio Button for Correct Answer */}
                                            <button
                                                onClick={() => setRespuestaCorrecta(pIndex, aIndex)}
                                                className={`flex-shrink-0 w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all ${
                                                    alt.estado_res === '1' 
                                                    ? 'border-emerald-500 bg-emerald-50' 
                                                    : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                                                }`}
                                                title="Marcar como respuesta correcta"
                                            >
                                                {alt.estado_res === '1' && <div className="w-3 h-3 bg-emerald-500 rounded-full" />}
                                            </button>
                                            
                                            <Input
                                                value={alt.contenido}
                                                onChange={(e) => updateAlternativa(pIndex, aIndex, 'contenido', e.target.value)}
                                                placeholder={`Opción ${aIndex + 1}`}
                                                className={`h-12 border-gray-100 font-bold transition-all ${
                                                    alt.estado_res === '1' ? 'bg-emerald-50/50 text-emerald-900' : 'bg-white hover:bg-gray-50'
                                                }`}
                                            />
                                            
                                            <button 
                                                onClick={() => deleteAlternativa(pIndex, aIndex)}
                                                className="opacity-0 group-hover/alt:opacity-100 text-gray-300 hover:text-rose-500 p-2 transition-all"
                                                title="Eliminar opción"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <div className="pl-16 pt-2">
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => addAlternativa(pIndex)}
                                            className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl px-4"
                                        >
                                            <PlusCircle className="w-4 h-4 mr-2" /> Añadir Opción
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones de la Pregunta */}
                            <div className="bg-gray-50 border-t border-gray-100 p-4 rounded-b-[2rem] flex items-center justify-end space-x-4">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => deletePregunta(pIndex)}
                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-xl"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar Pregunta
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Action Floater */}
                <div className="flex justify-center pt-8 pb-10">
                    <Button 
                        onClick={addPregunta}
                        className="bg-white border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 h-16 rounded-[2rem] px-10 shadow-xl shadow-indigo-100 font-black text-lg transition-transform hover:scale-105"
                    >
                        <PlusCircle className="w-6 h-6 mr-3" /> Añadir Nueva Pregunta
                    </Button>
                </div>
            </div>
        </div>
    );
}
