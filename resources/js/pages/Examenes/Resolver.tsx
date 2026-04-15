import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Send, AlertCircle, BookOpen, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import ConfirmModal from '@/components/shared/ConfirmModal';
import AlertModal from '@/components/shared/AlertModal';
import ExamTimer from './components/ExamTimer';
import QuestionMap from './components/QuestionMap';
import api from '@/lib/api';

type ExamenState = {
    intento_id: number;
    fecha_limite: string;
    preguntas: any[];
};

export default function ResolverExamenPage({
    actividadId,
    estudianteId,
    actividadNombre,
}: {
    actividadId: number;
    estudianteId: number;
    actividadNombre: string;
}) {
    const [examen, setExamen] = useState<ExamenState | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{
        open: boolean;
        title?: string;
        message: string;
        variant: 'success' | 'error' | 'warning' | 'info';
    }>({ open: false, message: '', variant: 'info' });

    useEffect(() => {
        api.post('/examenes/comenzar', { actividad_id: actividadId, estu_id: estudianteId })
            .then(({ data }) => {
                setExamen(data);
                const limit = new Date(data.fecha_limite).getTime();
                setTimeLeft(Math.max(0, Math.floor((limit - Date.now()) / 1000)));
            })
            .catch(err => {
                setAlertConfig({
                    open: true,
                    variant: 'error',
                    title: 'Error de carga',
                    message: err.response?.data?.message || 'Error al cargar el examen',
                });
            });
    }, [actividadId, estudianteId]);

    useEffect(() => {
        if (timeLeft <= 0 && examen) { finalizeExam(); return; }
        if (timeLeft > 0) {
            const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
            return () => clearInterval(t);
        }
    }, [timeLeft, examen]);

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const handleAnswer = async (preguntaId: number, value: { alternativa_id?: number; texto?: string }) => {
        if (!examen) return;
        try {
            await api.post(`/examenes/${examen.intento_id}/responder`, {
                pregunta_id: preguntaId,
                alternativa_id: value.alternativa_id,
                texto: value.texto,
            });
            setExamen({
                ...examen,
                preguntas: examen.preguntas.map(p =>
                    p.pregunta_id === preguntaId ? { ...p, respuesta_estudiante: value } : p
                ),
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
                message: `Tu examen fue enviado correctamente. Puntaje: ${data.puntaje}`,
            });
            setTimeout(() => { window.location.href = '/alumno/notas'; }, 3000);
        } catch {
            setAlertConfig({
                open: true,
                variant: 'error',
                title: 'Error al enviar',
                message: 'No pudimos procesar el envío. Intenta nuevamente.',
            });
            setSubmitting(false);
        }
    };

    if (!examen) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Cargando examen...</p>
                </div>
            </div>
        );
    }

    const currentPregunta = examen.preguntas[currentIndex];
    const answeredFlags = examen.preguntas.map(
        p => !!(p.respuesta_estudiante?.alternativa_id || p.respuesta_estudiante?.texto)
    );
    const answeredCount = answeredFlags.filter(Boolean).length;
    const progress = (answeredCount / examen.preguntas.length) * 100;
    const isLast = currentIndex === examen.preguntas.length - 1;
    const imgSrc = currentPregunta.recurso_imagen
        ? currentPregunta.recurso_imagen.startsWith('http')
            ? currentPregunta.recurso_imagen
            : `/storage/${currentPregunta.recurso_imagen}`
        : null;

    const breadcrumbs = [
        { title: 'Panel Alumno', href: '/dashboard' },
        { title: actividadNombre || 'Examen', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={actividadNombre || 'Resolviendo Examen'} />

            <div className="max-w-6xl mx-auto pb-16 space-y-4 px-0 sm:px-2">

                {/* ── Top bar ── */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest leading-none">Evaluación</p>
                            <p className="text-sm font-bold text-gray-900 truncate">{actividadNombre}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <ExamTimer timeLeft={timeLeft} formatTime={formatTime} />

                        {/* Mobile sidebar toggle */}
                        <button
                            className="lg:hidden p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                            onClick={() => setSidebarOpen(v => !v)}
                        >
                            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>

                        <Button
                            onClick={() => setShowConfirm(true)}
                            disabled={submitting}
                            size="sm"
                            className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold gap-2"
                        >
                            <Send className="w-4 h-4" /> Finalizar
                        </Button>
                    </div>
                </div>

                {/* ── Progress bar ── */}
                <div className="space-y-1 px-1">
                    <div className="flex justify-between text-xs text-gray-400 font-medium">
                        <span>{answeredCount} de {examen.preguntas.length} respondidas</span>
                        <span className="text-indigo-600 font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-gray-100" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

                    {/* ── Question panel ── */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">

                            {/* Question header */}
                            <div className="bg-indigo-600 px-6 py-5 text-white">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-white/15 text-white border-0 text-[10px] font-bold uppercase tracking-widest hover:bg-white/15">
                                        Pregunta {currentIndex + 1} / {examen.preguntas.length}
                                    </Badge>
                                    <Badge className="bg-emerald-500/20 text-emerald-200 border-0 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20">
                                        {currentPregunta.valor} pts
                                    </Badge>
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold leading-snug">
                                    {currentPregunta.cabecera}
                                </h2>
                            </div>

                            {/* Question body */}
                            <div className="p-5 sm:p-8 flex flex-col gap-6 flex-1">

                                {/* Cuerpo HTML */}
                                {currentPregunta.cuerpo && currentPregunta.cuerpo !== currentPregunta.cabecera && (
                                    <div
                                        className="prose prose-sm max-w-none text-gray-600 bg-gray-50 rounded-lg p-4 border border-gray-100"
                                        dangerouslySetInnerHTML={{ __html: currentPregunta.cuerpo }}
                                    />
                                )}

                                {/* Imagen de apoyo */}
                                {imgSrc && (
                                    <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center" style={{ maxHeight: '280px' }}>
                                        <img
                                            src={imgSrc}
                                            alt="Imagen de apoyo"
                                            className="max-h-[280px] w-full object-contain"
                                        />
                                    </div>
                                )}

                                {/* Alternativas */}
                                {currentPregunta.alternativas?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {currentPregunta.alternativas.map((alt: any, i: number) => {
                                            const isSelected = currentPregunta.respuesta_estudiante?.alternativa_id === alt.alternativa_id;
                                            const letter = String.fromCharCode(65 + i);
                                            return (
                                                <button
                                                    key={alt.alternativa_id}
                                                    onClick={() => handleAnswer(currentPregunta.pregunta_id, { alternativa_id: alt.alternativa_id })}
                                                    className={`flex items-center gap-4 text-left px-4 py-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] ${
                                                        isSelected
                                                            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                                            : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span className={`size-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                                                        isSelected
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        {letter}
                                                    </span>
                                                    <span className={`text-sm font-semibold leading-snug ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                                                        {alt.contenido}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-800 font-medium">
                                                Pregunta de respuesta abierta. Será calificada manualmente por el docente.
                                            </p>
                                        </div>
                                        <Textarea
                                            rows={6}
                                            placeholder="Escribe tu respuesta aquí..."
                                            value={currentPregunta.respuesta_estudiante?.texto || ''}
                                            onChange={e => handleAnswer(currentPregunta.pregunta_id, { texto: e.target.value })}
                                            className="resize-none text-sm font-medium rounded-xl border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Navigation footer */}
                            <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between gap-3 bg-gray-50/60">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentIndex === 0}
                                    onClick={() => setCurrentIndex(p => p - 1)}
                                    className="rounded-lg font-semibold gap-1 border-gray-200"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Anterior
                                </Button>

                                <span className="text-xs text-gray-400 font-medium hidden sm:block">
                                    {currentIndex + 1} / {examen.preguntas.length}
                                </span>

                                {isLast ? (
                                    <Button
                                        size="sm"
                                        onClick={() => setShowConfirm(true)}
                                        disabled={submitting}
                                        className="rounded-lg font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <Send className="w-4 h-4" /> Enviar Examen
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => setCurrentIndex(p => p + 1)}
                                        className="rounded-lg font-semibold gap-1 bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Siguiente <ChevronRight className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className={`lg:block ${sidebarOpen ? 'block' : 'hidden'} space-y-4`}>

                        {/* Question map */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mapa de preguntas</p>
                            <QuestionMap
                                total={examen.preguntas.length}
                                currentIndex={currentIndex}
                                answered={answeredFlags}
                                onNavigate={(idx) => { setCurrentIndex(idx); setSidebarOpen(false); }}
                            />
                            <div className="flex items-center gap-4 pt-1 text-[10px] text-gray-400 font-medium">
                                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-indigo-600 inline-block" /> Actual</span>
                                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-emerald-500 inline-block" /> Respondida</span>
                                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-gray-200 inline-block" /> Pendiente</span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumen</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Respondidas</span>
                                    <span className="font-bold text-emerald-600">{answeredCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Pendientes</span>
                                    <span className="font-bold text-amber-500">{examen.preguntas.length - answeredCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total</span>
                                    <span className="font-bold text-gray-700">{examen.preguntas.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tip */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-1">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recuerda</p>
                            <p className="text-xs text-indigo-700 leading-relaxed">
                                Las respuestas se guardan automáticamente. Puedes navegar libremente entre preguntas.
                            </p>
                        </div>

                        {/* Finalizar mobile */}
                        <Button
                            onClick={() => setShowConfirm(true)}
                            disabled={submitting}
                            className="w-full sm:hidden bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold gap-2"
                        >
                            <Send className="w-4 h-4" /> Finalizar Examen
                        </Button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={finalizeExam}
                title="¿Finalizar Examen?"
                message={`Has respondido ${answeredCount} de ${examen.preguntas.length} preguntas. Una vez enviado no podrás hacer cambios.`}
                processing={submitting}
                confirmText="Sí, enviar ahora"
                variant="warning"
            />

            <AlertModal
                open={alertConfig.open}
                onClose={() => setAlertConfig(p => ({ ...p, open: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                variant={alertConfig.variant}
            />
        </AppLayout>
    );
}
