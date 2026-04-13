import { Head } from '@inertiajs/react';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle, Award, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import ConfirmModal from '@/components/shared/ConfirmModal';
import AlertModal from '@/components/shared/AlertModal';
import api from '@/lib/api';

type ExamenState = {
    intento_id: number;
    fecha_limite: string;
    preguntas: any[];
};

export default function ResolverExamenPage({ actividadId, estudianteId, actividadNombre }: { actividadId: number, estudianteId: number, actividadNombre: string }) {
    const [examen, setExamen] = useState<ExamenState | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);
    
    // Modal states
    const [showConfirm, setShowConfirm] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ open: boolean; title?: string; message: string; variant: 'success' | 'error' | 'warning' | 'info' }>({
        open: false,
        message: '',
        variant: 'info'
    });

    useEffect(() => {
        api.post('/examenes/comenzar', { actividad_id: actividadId, estu_id: estudianteId })
            .then(({ data }) => {
                setExamen(data);
                const limit = new Date(data.fecha_limite).getTime();
                const now = new Date().getTime();
                setTimeLeft(Math.max(0, Math.floor((limit - now) / 1000)));
            })
            .catch(err => {
                setAlertConfig({
                    open: true,
                    variant: 'error',
                    title: 'Error de carga',
                    message: err.response?.data?.message || 'Error al cargar el examen'
                });
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
                    p.pregunta_id === preguntaId ? { ...p, respuesta_estudiante: value } : p
                )
            });
        } catch (err) {
            console.error('Error saving answer', err);
        }
    };

    const finalizeExam = async () => {
        if (!examen || submitting) return;
        setSubmitting(true);
        setShowConfirm(false);
        try {
            const { data } = await api.post(`/examenes/${examen.intento_id}/finalizar`);
            setAlertConfig({
                open: true,
                variant: 'success',
                title: 'Examen Finalizado',
                message: `Tu examen ha sido enviado correctamente. Puntaje obtenido: ${data.puntaje}`
            });
            // Delay redirection to allow user to see the success message
            setTimeout(() => {
                window.location.href = '/alumno/notas';
            }, 3000);
        } catch (err) {
            setAlertConfig({
                open: true,
                variant: 'error',
                title: 'Error al enviar',
                message: 'No pudimos procesar el envío de tu examen en este momento.'
            });
            setSubmitting(false);
        }
    };

    if (!examen) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
                <div className="text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest text-2xl">
                    Cargando examen...
                </div>
            </div>
        );
    }

    const currentPregunta = examen.preguntas[currentIndex];
    const answeredCount = examen.preguntas.filter(p => p.respuesta_estudiante.alternativa_id || p.respuesta_estudiante.texto).length;
    const progress = (answeredCount / examen.preguntas.length) * 100;

    const breadcrumbs = [
        { title: 'Panel Alumno', href: '/dashboard' },
        { title: actividadNombre || 'Resolviendo Examen', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resolviendo Examen" />
            
            <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Info */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className={`size-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${
                            timeLeft < 300 ? 'bg-rose-100 text-rose-600 animate-pulse ring-4 ring-rose-50' : 'bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-100'
                        }`}>
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 leading-none">Tiempo Restante</p>
                            <p className={`text-4xl font-black font-mono tracking-tighter ${timeLeft < 300 ? 'text-rose-600' : 'text-gray-900'}`}>
                                {formatTime(timeLeft)}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-sm hidden md:block">
                        <div className="flex justify-between text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest leading-none">
                            <span>Tu Progreso</span>
                            <span className="text-emerald-500">{Math.round(progress)}% Completado</span>
                        </div>
                        <Progress value={progress} className="h-3 bg-emerald-50" />
                    </div>

                    <Button 
                        onClick={() => setShowConfirm(true)} 
                        disabled={submitting}
                        className="h-16 px-10 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black text-lg transition-all hover:scale-105 active:scale-95"
                    >
                        <Send className="w-5 h-5 mr-3" /> Finalizar Examen
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Question Panel */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col min-h-[600px] group transition-all duration-500 hover:shadow-indigo-100/40">
                            {/* Question Header */}
                            <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 p-10 md:p-14 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Award className="size-40 rotate-12" />
                                </div>
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                                            Pregunta {currentIndex + 1} de {examen.preguntas.length}
                                        </span>
                                        <span className="bg-emerald-500/20 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 text-emerald-300">
                                            {currentPregunta.valor} puntos
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                                        {currentPregunta.cabecera}
                                    </h2>
                                </div>
                            </div>

                            {/* Question Body */}
                            <div className="p-10 md:p-14 flex-1 flex flex-col items-stretch space-y-12">
                                {currentPregunta.cuerpo && (
                                    <div className="prose prose-xl prose-indigo max-w-none text-gray-700 font-medium leading-relaxed bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100" 
                                         dangerouslySetInnerHTML={{ __html: currentPregunta.cuerpo }} 
                                    />
                                )}

                                <div className="flex-1 w-full">
                                    {(currentPregunta.alternativas && currentPregunta.alternativas.length > 0) ? ( // Objective (Multiple Choice, True/False, etc.)
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {currentPregunta.alternativas.map((alt: any) => {
                                                const isSelected = currentPregunta.respuesta_estudiante.alternativa_id === alt.alternativa_id;
                                                return (
                                                    <button
                                                        key={alt.alternativa_id}
                                                        onClick={() => handleAnswer(currentPregunta.pregunta_id, { alternativa_id: alt.alternativa_id })}
                                                        className={`group flex items-center text-left p-8 rounded-[2rem] border-4 transition-all duration-300 active:scale-95 ${
                                                            isSelected 
                                                            ? 'border-emerald-500 bg-emerald-50/50 shadow-xl shadow-emerald-100 ring-8 ring-emerald-500/5' 
                                                            : 'border-gray-50 bg-white hover:border-indigo-100 hover:bg-gray-50/50'
                                                        }`}
                                                    >
                                                        <div className={`size-8 rounded-full border-4 mr-6 flex items-center justify-center transition-all ${
                                                            isSelected ? 'border-emerald-500 bg-emerald-500 shadow-inner' : 'border-gray-200 group-hover:border-indigo-300'
                                                        }`}>
                                                            {isSelected && <div className="size-2 rounded-full bg-white animate-in zoom-in" />}
                                                        </div>
                                                        <span className={`text-lg font-black transition-colors ${isSelected ? 'text-emerald-900' : 'text-gray-600'}`}>
                                                            {alt.contenido}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : ( // Open ended
                                        <div className="space-y-6">
                                            <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                                                <AlertCircle className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
                                                <p className="text-sm text-indigo-900 font-bold leading-relaxed">
                                                    Redacta tu respuesta a continuación. Este tipo de preguntas son calificadas manualmente por el docente.
                                                </p>
                                            </div>
                                            <textarea 
                                                className="w-full min-h-[300px] text-2xl p-10 rounded-[2.5rem] border-4 border-gray-50 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-[15px] focus:ring-indigo-500/5 transition-all outline-none resize-none font-black text-gray-800 placeholder:text-gray-200"
                                                placeholder="Escribe tu respuesta aquí..."
                                                value={currentPregunta.respuesta_estudiante.texto || ''}
                                                onChange={(e) => handleAnswer(currentPregunta.pregunta_id, { texto: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Navigation */}
                            <div className="bg-gray-50/80 backdrop-blur-sm border-t p-8 md:px-14 flex items-center justify-between gap-6">
                                <Button 
                                    variant="ghost" 
                                    className="h-14 px-8 rounded-2xl font-black text-gray-500 hover:bg-gray-200"
                                    disabled={currentIndex === 0} 
                                    onClick={() => setCurrentIndex(prev => prev - 1)}
                                >
                                    <ChevronLeft className="w-6 h-6 mr-2" /> Pregunta Anterior
                                </Button>
                                
                                <Button 
                                    className={`h-14 px-12 rounded-2xl font-black shadow-lg transition-all active:scale-95 ${
                                        currentIndex === examen.preguntas.length - 1 
                                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                    }`}
                                    onClick={() => currentIndex === examen.preguntas.length - 1 ? setShowConfirm(true) : setCurrentIndex(prev => prev + 1)}
                                    disabled={submitting}
                                >
                                    {currentIndex === examen.preguntas.length - 1 ? 'Enviar Examen' : 'Siguiente Pregunta'}
                                    {currentIndex !== examen.preguntas.length - 1 && <ChevronRight className="w-6 h-6 ml-2" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Navigation Pins */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/30 space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest text-center leading-none">Mapa de Preguntas</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {examen.preguntas.map((_, idx) => {
                                    const isCurrent = currentIndex === idx;
                                    const isAnswered = examen.preguntas[idx].respuesta_estudiante.alternativa_id || examen.preguntas[idx].respuesta_estudiante.texto;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`aspect-square rounded-2xl text-sm font-black transition-all transform hover:scale-110 active:scale-90 flex items-center justify-center ${
                                                isCurrent ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 ring-4 ring-indigo-100' : 
                                                isAnswered ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' :
                                                'bg-gray-50 text-gray-300 border border-gray-100 hover:border-indigo-300 hover:text-indigo-500'
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100 space-y-4">
                            <div className="flex items-center gap-3 text-emerald-600 mb-2">
                                <AlertCircle size={20} />
                                <span className="font-black text-[10px] uppercase tracking-widest">Consejo de Resolución</span>
                            </div>
                            <p className="text-xs text-emerald-800 font-bold leading-relaxed">
                                Tus respuestas se guardan automáticamente cada vez que seleccionas una opción. Puedes navegar entre preguntas en cualquier momento.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal 
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={finalizeExam}
                title="¿Finalizar Examen?"
                message="Tus respuestas se enviarán y no podrás realizar más cambios. ¿Estás seguro?"
                processing={submitting}
                confirmText="Sí, enviar ahora"
                variant="warning"
            />

            <AlertModal 
                open={alertConfig.open}
                onClose={() => setAlertConfig(prev => ({ ...prev, open: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                variant={alertConfig.variant}
            />
        </AppLayout>
    );
}
