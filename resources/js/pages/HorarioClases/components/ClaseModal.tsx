import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormField from '@/components/shared/FormField';
import api from '@/lib/api';

type Props = {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
    seccionId: number | null;
    gradoId?: number | null;
    anioEscolar: number;
    clase?: any;
};

const DIAS_SEMANA = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
];

type FormState = {
    dia_semana:  string;
    hora_inicio: string;
    hora_fin:    string;
    curso_id:    string;
    docente_id:  string;
    aula:        string;
    aula_id:     string;
};

const EMPTY_FORM: FormState = {
    dia_semana:  '1',
    hora_inicio: '08:00',
    hora_fin:    '09:00',
    curso_id:    '',
    docente_id:  '',
    aula:        '',
    aula_id:     '',
};

export default function ClaseModal({ open, onClose, onSaved, seccionId, gradoId, anioEscolar, clase }: Props) {
    const [form, setForm]         = useState<FormState>(EMPTY_FORM);
    const [cursos, setCursos]     = useState<any[]>([]);
    const [docentes, setDocentes] = useState<any[]>([]);
    const [aulas, setAulas]       = useState<any[]>([]);
    const [conflictos, setConflictos] = useState<any[]>([]);
    const [loading, setLoading]   = useState(false);
    const [saving, setSaving]     = useState(false);

    useEffect(() => {
        if (open) {
            cargarCursos();
            const cursoId = clase?.curso_id?.toString() || '';
            setForm(clase ? {
                dia_semana:  clase.dia_semana?.toString() || '1',
                hora_inicio: clase.hora_inicio || '08:00',
                hora_fin:    clase.hora_fin || '09:00',
                curso_id:    cursoId,
                docente_id:  clase.docente_id?.toString() || '',
                aula:        clase.aula || '',
                aula_id:     clase.aula_id?.toString() || '',
            } : EMPTY_FORM);
            setDocentes([]);
            setConflictos([]);
            if (cursoId) cargarDocentes(cursoId);
        }
    }, [open, clase]);

    useEffect(() => {
        if (!open) return;
        if (form.curso_id) {
            cargarDocentes(form.curso_id);
        } else {
            setDocentes([]);
        }
    }, [form.curso_id]);

    const cargarCursos = async () => {
        setLoading(true);
        try {
            const cursosUrl = gradoId ? `/grados/${gradoId}/cursos` : '/cursos';
            const [cursosRes, aulasRes] = await Promise.all([
                api.get(cursosUrl),
                api.get('/aulas-all'),
            ]);
            setCursos(cursosRes.data.data || cursosRes.data || []);
            setAulas(aulasRes.data.data || aulasRes.data || []);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarDocentes = async (cursoId: string) => {
        try {
            const res = await api.get(`/cursos/${cursoId}/docentes`);
            setDocentes(res.data || []);
        } catch (error) {
            console.error('Error al cargar docentes:', error);
        }
    };

    const validarConflictos = async () => {
        if (!seccionId || !form.curso_id || !form.docente_id) return;

        try {
            const response = await api.post('/horario-clases/validar-conflictos', {
                seccion_id:       seccionId,
                curso_id:         parseInt(form.curso_id),
                docente_id:       parseInt(form.docente_id),
                dia_semana:       parseInt(form.dia_semana),
                hora_inicio:      form.hora_inicio,
                hora_fin:         form.hora_fin,
                aula_id:          form.aula_id ? parseInt(form.aula_id) : null,
                anio_escolar:     anioEscolar,
                horario_clase_id: clase?.id,
            });

            setConflictos(response.data.conflictos || []);
        } catch (error) {
            console.error('Error al validar conflictos:', error);
        }
    };

    useEffect(() => {
        if (open && form.docente_id && form.hora_inicio && form.hora_fin) {
            const timer = setTimeout(() => {
                validarConflictos();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [form.dia_semana, form.hora_inicio, form.hora_fin, form.docente_id, form.aula_id]);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!seccionId) return;

        setSaving(true);
        try {
            const data = {
                seccion_id:  seccionId,
                curso_id:    parseInt(form.curso_id),
                docente_id:  parseInt(form.docente_id),
                dia_semana:  parseInt(form.dia_semana),
                hora_inicio: form.hora_inicio,
                hora_fin:    form.hora_fin,
                aula_id:     form.aula_id ? parseInt(form.aula_id) : null,
                anio_escolar: anioEscolar,
                periodo:     'A',
            };

            if (clase) {
                await api.put(`/horario-clases/${clase.id}`, data);
            } else {
                await api.post('/horario-clases', data);
            }

            onSaved();
            onClose();
        } catch (error: any) {
            console.error('Error al guardar clase:', error);
            if (error.response?.data?.conflictos) {
                setConflictos(error.response.data.conflictos);
            } else {
                alert('Error al guardar la clase');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {clase ? 'Editar Clase' : 'Agregar Clase al Horario'}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Día de la semana *
                                </label>
                                <select
                                    value={form.dia_semana}
                                    onChange={(e) => setForm({ ...form, dia_semana: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    required
                                >
                                    {DIAS_SEMANA.map((dia) => (
                                        <option key={dia.value} value={dia.value}>
                                            {dia.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Aula (select from registered aulas) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Aula
                                </label>
                                <select
                                    value={form.aula_id}
                                    onChange={(e) => setForm({ ...form, aula_id: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Sin aula (sin restricción)</option>
                                    {aulas.map((aula) => (
                                        <option key={aula.aula_id} value={aula.aula_id}>
                                            {aula.nombre}{aula.capacidad ? ` (cap. ${aula.capacidad})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                label="Hora inicio *"
                                type="time"
                                value={form.hora_inicio}
                                onChange={(v) => setForm({ ...form, hora_inicio: v })}
                                required
                            />

                            <FormField
                                label="Hora fin *"
                                type="time"
                                value={form.hora_fin}
                                onChange={(v) => setForm({ ...form, hora_fin: v })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Curso *
                            </label>
                            <select
                                value={form.curso_id}
                                onChange={(e) => setForm({ ...form, curso_id: e.target.value, docente_id: '' })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            >
                                <option value="">Seleccionar curso</option>
                                {cursos.map((curso) => (
                                    <option key={curso.curso_id} value={curso.curso_id}>
                                        {curso.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Docente *
                            </label>
                            <select
                                value={form.docente_id}
                                onChange={(e) => setForm({ ...form, docente_id: e.target.value })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                                required
                                disabled={!form.curso_id}
                            >
                                <option value="">
                                    {!form.curso_id ? 'Selecciona un curso primero' : docentes.length === 0 ? 'Sin docentes asignados a este curso' : 'Seleccionar docente'}
                                </option>
                                {docentes.map((docente) => (
                                    <option key={docente.docente_id} value={docente.docente_id}>
                                        {docente.nombre_completo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {conflictos.length > 0 && (
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-amber-900 mb-2">
                                            Conflictos detectados:
                                        </h4>
                                        <ul className="space-y-1">
                                            {conflictos.map((conflicto, idx) => (
                                                <li key={idx} className="text-sm text-amber-800">
                                                    • {conflicto.mensaje}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving || conflictos.length > 0}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
