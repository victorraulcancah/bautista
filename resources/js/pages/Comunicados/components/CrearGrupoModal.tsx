import { useEffect, useState } from 'react';
import { Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TitleForm from '@/components/TitleForm';
import api from '@/lib/api';


type Curso   = { curso_id: number; nombre: string; nivel: string | null; grado: string | null };
type Alumno  = { user_id: number; nombre: string };

type Props = {
    open:    boolean;
    onClose: () => void;
    onSaved: () => void;
};

export default function CrearGrupoModal({ open, onClose, onSaved }: Props) {
    const [nombre, setNombre]     = useState('');
    const [cursos, setCursos]     = useState<Curso[]>([]);
    const [cursoId, setCursoId]   = useState('');
    const [alumnos, setAlumnos]   = useState<Alumno[]>([]);
    const [seleccionados, setSel] = useState<Alumno[]>([]);
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState('');

    // Cargar cursos al abrir
    useEffect(() => {
        if (!open) {
            setNombre(''); setCursoId(''); setAlumnos([]); setSel([]); setError('');
            return;
        }
        api.get('/mensajeria/cursos').then(({ data }) => setCursos(data));
    }, [open]);

    // Cargar alumnos al seleccionar curso
    useEffect(() => {
        setAlumnos([]); setSel([]);
        if (!cursoId) return;
        api.get(`/mensajeria/cursos/${cursoId}/alumnos`).then(({ data }) => setAlumnos(data));
    }, [cursoId]);

    const seleccionarAlumno = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const uid = Number(e.target.value);
        if (!uid) return;
        const alumno = alumnos.find((a) => a.user_id === uid);
        if (!alumno || seleccionados.find((s) => s.user_id === uid)) return;
        setSel((prev) => [...prev, alumno]);
        e.target.value = '';
    };

    const quitar = (uid: number) => setSel((prev) => prev.filter((s) => s.user_id !== uid));

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (!nombre.trim())        { setError('El nombre del grupo es requerido.'); return; }
        if (seleccionados.length < 1) { setError('Selecciona al menos un alumno.'); return; }
        setSaving(true); setError('');
        try {
            await api.post('/mensajeria/grupos', {
                nombre,
                user_ids: seleccionados.map((s) => s.user_id),
            });
            onSaved(); onClose();
        } catch {
            setError('Error al crear el grupo.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-neutral-800">
                        <Users className="h-5 w-5 text-emerald-600" />
                        Nuevo Grupo
                    </DialogTitle>
                    <DialogDescription className="sr-only">Crea un grupo de mensajería con alumnos de un curso.</DialogDescription>
                </DialogHeader>

                <TitleForm>Datos del Grupo</TitleForm>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre del grupo */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-neutral-600">Nombre del grupo:</label>

                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                        />
                    </div>

                    <TitleForm className="pt-1">Seleccionar Miembros</TitleForm>

                    {/* Curso */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-neutral-600">Curso:</label>

                        <select
                            value={cursoId}
                            onChange={(e) => setCursoId(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                        >
                            <option value="">Seleccionar curso</option>
                            {cursos.map((c) => (
                                <option key={c.curso_id} value={c.curso_id}>
                                    {c.nombre}{c.grado ? ` — ${c.grado}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Alumnos */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-neutral-600">Alumnos:</label>

                        <select
                            onChange={seleccionarAlumno}
                            disabled={alumnos.length === 0}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a65a] disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            <option value="">
                                {cursoId && alumnos.length === 0 ? 'Sin alumnos en este curso' : 'Seleccionar Alumno'}
                            </option>
                            {alumnos
                                .filter((a) => !seleccionados.find((s) => s.user_id === a.user_id))
                                .map((a) => (
                                    <option key={a.user_id} value={a.user_id}>{a.nombre}</option>
                                ))}
                        </select>
                    </div>

                    {/* Tags de seleccionados */}
                    {seleccionados.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {seleccionados.map((s) => (
                                <span
                                    key={s.user_id}
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-xs text-white"
                                >
                                    {s.nombre}
                                    <button type="button" onClick={() => quitar(s.user_id)} className="hover:text-blue-200">
                                        <X className="size-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={saving} className="bg-[#00a65a] hover:bg-[#008d4c] text-white">
                            {saving ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
