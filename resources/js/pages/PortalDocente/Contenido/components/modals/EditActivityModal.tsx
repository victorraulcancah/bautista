import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileText, Image as ImageIcon, Trash2, ExternalLink, Upload, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import ActivityBaseForm from '../forms/ActivityBaseForm';
import api from '@/lib/api';

const AVAILABLE_FORMATS = ['pdf', 'docx', 'doc', 'jpg', 'png', 'xlsx', 'zip'];

interface Props {
    open: boolean;
    onClose: () => void;
    actividad: any | null;
    onSuccess: () => void;
}

const toDatetimeLocal = (val: string) => {
    if (!val) return '';
    return val.replace(' ', 'T').slice(0, 16);
};

export default function EditActivityModal({ open, onClose, actividad, onSuccess }: Props) {
    const [formData, setFormData] = useState<any>({
        nombre_actividad: '', descripcion_corta: '', descripcion_larga: '',
        fecha_inicio: '', fecha_cierre: '', nota_actividad: '20',
        es_calificado: '1', nota_visible: '1', ocultar_actividad: '0',
        peso_porcentaje: '0', puntos_maximos: '20',
    });
    const [allowedFormats, setAllowedFormats] = useState<string[]>(['pdf', 'docx', 'jpg', 'png']);
    const [archivosDocente, setArchivosDocente] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const tipoNombre = actividad?.tipo_actividad?.nombre ?? '';
    const isTarea = tipoNombre === 'Tarea';
    const isQuiz = tipoNombre === 'Examen' || tipoNombre === 'Cuestionario';

    useEffect(() => {
        if (!open || !actividad) return;

        setFormData({
            nombre_actividad:  actividad.nombre_actividad ?? '',
            descripcion_corta: actividad.descripcion_corta ?? '',
            descripcion_larga: actividad.descripcion_larga ?? '',
            fecha_inicio:      toDatetimeLocal(actividad.fecha_inicio ?? ''),
            fecha_cierre:      toDatetimeLocal(actividad.fecha_cierre ?? ''),
            nota_actividad:    actividad.nota_actividad ?? '20',
            es_calificado:     actividad.es_calificado ?? '1',
            nota_visible:      actividad.nota_visible ?? '1',
            ocultar_actividad: actividad.ocultar_actividad ?? '0',
            peso_porcentaje:   actividad.peso_porcentaje ?? '0',
            puntos_maximos:    actividad.puntos_maximos ?? '20',
        });

        if (actividad.allowed_formats) {
            setAllowedFormats(actividad.allowed_formats.split(',').map((f: string) => f.trim()));
        }

        if (isTarea) {
            api.get(`/docente/actividades/${actividad.actividad_id}/archivos`)
                .then(res => setArchivosDocente(res.data))
                .catch(() => setArchivosDocente([]));
        }
    }, [open, actividad]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const toggleFormat = (fmt: string) => {
        setAllowedFormats(prev =>
            prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
        );
    };

    const handleUploadFile = async (file: File) => {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            await api.post(`/docente/actividades/${actividad.actividad_id}/archivos`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const res = await api.get(`/docente/actividades/${actividad.actividad_id}/archivos`);
            setArchivosDocente(res.data);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (archivoId: number) => {
        await api.delete(`/archivos/${archivoId}`);
        setArchivosDocente(prev => prev.filter((a: any) => a.archivo_id !== archivoId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actividad) return;
        setLoading(true);
        try {
            await api.put(`/actividades/${actividad.actividad_id}`, {
                ...formData,
                allowed_formats: allowedFormats.join(','),
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error updating activity:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!open || !actividad) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                            <Save size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Editar Actividad</h2>
                            <p className="text-xs text-gray-500 font-bold">{tipoNombre} · ID {actividad.actividad_id}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="size-10 rounded-2xl hover:bg-gray-100">
                        <X size={18} />
                    </Button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <ActivityBaseForm formData={formData} onChange={handleChange} />

                    {/* Tarea: formatos permitidos + archivos del docente */}
                    {isTarea && (
                        <>
                            {/* Formatos permitidos */}
                            <div className="space-y-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Formatos que puede entregar el alumno</p>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_FORMATS.map(fmt => (
                                        <label key={fmt} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={allowedFormats.includes(fmt)}
                                                onChange={() => toggleFormat(fmt)}
                                                className="size-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-xs font-bold text-gray-700 uppercase">{fmt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Archivos del docente */}
                            <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Archivos adjuntos para el alumno</p>
                                    <div className="relative">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={e => e.target.files?.[0] && handleUploadFile(e.target.files[0])}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={uploading}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 gap-2 text-xs font-bold"
                                        >
                                            <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir archivo'}
                                        </Button>
                                    </div>
                                </div>

                                {archivosDocente.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No hay archivos adjuntos.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {archivosDocente.map((a: any) => {
                                            const isImg = ['jpg','jpeg','png','gif','webp'].includes(a.tipo?.toLowerCase());
                                            return (
                                                <div key={a.archivo_id} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100">
                                                    {isImg
                                                        ? <ImageIcon size={14} className="text-indigo-500 shrink-0" />
                                                        : <FileText size={14} className="text-blue-500 shrink-0" />
                                                    }
                                                    <span className="flex-1 text-xs font-semibold text-gray-700 truncate">{a.nombre}</span>
                                                    <a href={a.url} target="_blank" className="text-gray-400 hover:text-indigo-500 transition-colors">
                                                        <ExternalLink size={13} />
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteFile(a.archivo_id)}
                                                        className="text-gray-300 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Examen / Cuestionario: enlace al QuizBuilder */}
                    {isQuiz && (
                        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Preguntas del {tipoNombre}</p>
                                <p className="text-xs text-indigo-700">Para editar las preguntas y alternativas usa el constructor de exámenes.</p>
                            </div>
                            <Link href={`/docente/actividades/${actividad.actividad_id}/quiz`}>
                                <Button type="button" size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold gap-2 shrink-0">
                                    <ExternalLink size={14} /> Abrir Constructor
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 shrink-0">
                    <Button type="button" variant="outline" onClick={onClose} className="h-12 px-6 rounded-2xl font-bold">
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold gap-2">
                        <Save size={16} />
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
