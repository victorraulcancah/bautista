import { Head } from '@inertiajs/react';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type ExamenState = {
    intento_id: number;
    fecha_limite: string;
    preguntas: any[];
};

export default function ResolverExamenPage({ actividadId, estudianteId }: { actividadId: number, estudianteId: number }) {
    const [examen, setExamen] = useState<ExamenState | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.post('/examenes/comenzar', { actividad_id: actividadId, estu_id: estudianteId })
            .then(({ data }) => {
                setExamen(data);
                const limit = new Date(data.fecha_limite).getTime();
                const now = new Date().getTime();
                setTimeLeft(Math.max(0, Math.floor((limit - now) / 1000)));
            })
            .catch(err => {
                alert(err.response?.data?.message || 'Error al cargar el examen');
            });
    }, [actividadId, estudianteId]);

    useEffect(() => {
        if (timeLeft <= 0 && examen) {
            finalizeExam();
            return;
        }
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, examen]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = async (preguntaId: number, value: { alternativa_id?: number, texto?: string }) => {
        if (!examen) return;
        try {
            await api.post(`/examenes/${examen.intento_id}/responder`, {
                pregunta_id: preguntaId,
                alternativa_id: value.alternativa_id,
                texto: value.texto
            });
            setExamen({
                ...examen,
                preguntas: examen.preguntas.map(p => 
                    p.pregunta_id === preguntaId 
                    ? { ...p, respuesta_estudiante: value } 
                    : p
                )
            });
        } catch (err) {
            console.error('Error saving answer', err);
        }
    };

    const finalizeExam = async () => {
        if (!examen || submitting) return;
        setSubmitting(true);
        try {
            const { data } = await api.post(`/examenes/${examen.intento_id}/finalizar`);
            alert(`Examen finalizado. Puntaje obtenido: ${data.puntaje}`);
            window.location.href = '/dashboard';
        } catch (err) {
            alert('Error al finalizar el examen');
            setSubmitting(false);
        }
    };

    if (!examen) return <div className="p-10 text-center font-medium animate-pulse text-purple-600">Cargando examen...</div>;

    const currentPregunta = examen.preguntas[currentIndex];
    const answeredCount = examen.preguntas.filter(p => p.respuesta_estudiante.alternativa_id || p.respuesta_estudiante.texto).length;
    const progress = (answeredCount / examen.preguntas.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-purple-200">
            <Head title="Resolviendo Examen" />
            
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className={`p-2.5 rounded-xl transition-colors ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tiempo Restante</p>
                        <p className={`text-2xl font-black font-mono transition-colors ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                </div>

                <div className="flex-1 max-w-md mx-12 hidden lg:block">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-tight">
                        <span>Tu Progreso</span>
                        <span>{Math.round(progress)}% Completado</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200/50">
                        <div 
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(168,85,247,0.4)]" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                </div>

                <Button 
                    variant="destructive" 
                    className="shadow-lg shadow-red-500/20 hover:scale-105 transition-transform"
                    onClick={() => { if(confirm('¿Seguro que deseas finalizar? Tus respuestas se enviarán ahora.')) finalizeExam(); }} 
                    disabled={submitting}
                >
                    <Send className="w-4 h-4 mr-2" />
                    Finalizar
                </Button>
            </header>

            {/* Content */}
            <main className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-8 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/20">
                                Pregunta {currentIndex + 1} de {examen.preguntas.length}
                            </span>
                            <span className="text-white/80 text-xs font-bold bg-black/10 px-3 py-1.5 rounded-lg border border-white/10">
                                Valor: <span className="text-white">{currentPregunta.valor} pts</span>
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black leading-tight drop-shadow-sm">{currentPregunta.cabecera}</h2>
                    </div>

                    <div className="p-8 md:p-12 flex-1 flex flex-col">
                        <div className="prose prose-lg prose-purple max-w-none mb-12 text-gray-700 leading-relaxed" 
                             dangerouslySetInnerHTML={{ __html: currentPregunta.cuerpo }} 
                        />

                        <div className="flex-1">
                            {currentPregunta.tipo === 1 ? ( // Multiple Choice
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentPregunta.alternativas.map((alt: any) => {
                                        const isSelected = currentPregunta.respuesta_estudiante.alternativa_id === alt.alternativa_id;
                                        return (
                                            <button
                                                key={alt.alternativa_id}
                                                onClick={() => handleAnswer(currentPregunta.pregunta_id, { alternativa_id: alt.alternativa_id })}
                                                className={`group flex items-center text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                                                    isSelected 
                                                    ? 'border-purple-600 bg-purple-50/50 shadow-md ring-4 ring-purple-100' 
                                                    : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-gray-50/50'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                                                    isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300 group-hover:border-purple-400'
                                                }`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                                                </div>
                                                <span className={`font-bold transition-colors ${isSelected ? 'text-purple-900' : 'text-gray-600'}`}>
                                                    {alt.contenido}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : ( // Open ended
                                <div className="space-y-4">
                                    <Label className="text-sm font-black text-gray-400 uppercase tracking-tighter">Tu respuesta detallada</Label>
                                    <textarea 
                                        className="w-full min-h-[250px] text-xl p-6 rounded-2xl border-2 border-gray-100 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none font-medium text-gray-800 placeholder:text-gray-300"
                                        placeholder="Comienza a escribir aquí..."
                                        value={currentPregunta.respuesta_estudiante.texto || ''}
                                        onChange={(e) => handleAnswer(currentPregunta.pregunta_id, { texto: e.target.value })}
                                    />
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start">
                                        <AlertCircle className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-800 font-bold leading-relaxed">
                                            Recuerda: Las preguntas abiertas son calificadas manualmente por tu profesor después de finalizar el examen.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Bar */}
                    <div className="bg-gray-50/50 border-t p-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <Button 
                            variant="secondary" 
                            className="w-full sm:w-auto font-bold rounded-xl h-12 px-6"
                            disabled={currentIndex === 0} 
                            onClick={() => setCurrentIndex(prev => prev - 1)}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Pregunta Anterior
                        </Button>
                        
                        <div className="flex flex-wrap justify-center gap-1.5 max-w-xs md:max-w-none">
                            {examen.preguntas.map((_, idx) => {
                                const isCurrent = currentIndex === idx;
                                const isAnswered = examen.preguntas[idx].respuesta_estudiante.alternativa_id || examen.preguntas[idx].respuesta_estudiante.texto;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all transform hover:scale-110 ${
                                            isCurrent ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40 ring-2 ring-offset-2 ring-purple-600' : 
                                            isAnswered ? 'bg-green-500 text-white shadow-md shadow-green-500/20' :
                                            'bg-white text-gray-400 border border-gray-200 hover:border-purple-400 hover:text-purple-600'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <Button 
                            className={`w-full sm:w-auto font-bold rounded-xl h-12 px-8 shadow-lg transition-all ${
                                currentIndex === examen.preguntas.length - 1 
                                ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' 
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                            }`}
                            onClick={() => currentIndex === examen.preguntas.length - 1 ? (confirm('¿Deseas finalizar el examen?') && finalizeExam()) : setCurrentIndex(prev => prev + 1)}
                            disabled={submitting}
                        >
                            {currentIndex === examen.preguntas.length - 1 ? 'Enviar Todo' : 'Siguiente'}
                            {currentIndex !== examen.preguntas.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
