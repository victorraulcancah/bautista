import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';
import type { Actividad, Pregunta } from '../types';

type Props = {
    open:      boolean;
    onClose:   () => void;
    actividad: Actividad | null;
};

// ─── Question card ───────────────────────────────────────────────────────
function PreguntaCard({ pregunta, index }: { pregunta: Pregunta; index: number }) {
    return (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800">
                    {index + 1}. {pregunta.cabecera}
                </p>
                {pregunta.valor_nota != null && (
                    <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        {pregunta.valor_nota} pt{pregunta.valor_nota !== 1 ? 's' : ''}
                    </span>
                )}
            </div>
            {pregunta.cuerpo && (
                <p className="mb-3 text-xs text-gray-500">{pregunta.cuerpo}</p>
            )}
            <ul className="space-y-1">
                {pregunta.alternativas.map((alt) => (
                    <li
                        key={alt.alternativa_id}
                        className={`flex items-center gap-2 rounded px-2 py-1 text-xs ${
                            alt.es_correcta
                                ? 'bg-green-50 text-green-700'
                                : 'text-gray-600'
                        }`}
                    >
                        {alt.es_correcta
                            ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                            : <XCircle className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                        }
                        {alt.contenido}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ─── Drawer ──────────────────────────────────────────────────────────────
export default function CuestionarioDrawer({ open, onClose, actividad }: Props) {
    const [detail, setDetail]   = useState<Actividad | null>(null);
    const [loading, setLoading] = useState(false);

    const cargar = useCallback(async () => {
        if (!actividad) {
return;
}

        setLoading(true);

        try {
            const { data } = await api.get(`/actividades/${actividad.actividad_id}`);
            setDetail(data.data ?? data);
        } finally {
            setLoading(false);
        }
    }, [actividad]);

    useEffect(() => {
        if (open && actividad) {
cargar();
}
    }, [open, actividad, cargar]);

    if (!actividad) {
return null;
}

    const cuestionario = detail?.cuestionario;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-purple-700">
                        {actividad.nombre_actividad}
                    </DialogTitle>
                    {actividad.tipo && (
                        <p className="text-sm text-gray-500">
                            Tipo:&nbsp;
                            <span className="font-medium">{actividad.tipo.nombre}</span>
                        </p>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4">
                    {/* Actividad info */}
                    <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm">
                        <div>
                            <span className="text-xs font-medium text-gray-400 uppercase">Inicio</span>
                            <p>{actividad.fecha_inicio?.slice(0, 10) ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-gray-400 uppercase">Cierre</span>
                            <p>{actividad.fecha_cierre?.slice(0, 10) ?? '—'}</p>
                        </div>
                        {actividad.descripcion_corta && (
                            <div className="col-span-2">
                                <span className="text-xs font-medium text-gray-400 uppercase">Descripción</span>
                                <p className="text-gray-600">{actividad.descripcion_corta}</p>
                            </div>
                        )}
                    </div>

                    {/* Cuestionario */}
                    {loading && (
                        <p className="py-6 text-center text-sm text-gray-400">Cargando cuestionario...</p>
                    )}

                    {!loading && !cuestionario && (
                        <p className="py-6 text-center text-sm text-gray-400">
                            Esta actividad no tiene cuestionario asociado.
                        </p>
                    )}

                    {!loading && cuestionario && (
                        <>
                            {/* Header cuestionario */}
                            <div className="flex items-center gap-3 rounded-lg bg-purple-50 px-4 py-3">
                                <Clock className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="text-sm font-semibold text-purple-700">
                                        Cuestionario #{cuestionario.cuestionario_id}
                                    </p>
                                    <p className="text-xs text-purple-500">
                                        Duración: {cuestionario.duracion} min ·&nbsp;
                                        {cuestionario.preguntas.length} pregunta{cuestionario.preguntas.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Preguntas */}
                            <div className="space-y-3">
                                {cuestionario.preguntas.map((p, i) => (
                                    <PreguntaCard key={p.pregunta_id} pregunta={p} index={i} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
