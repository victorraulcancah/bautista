import { useEffect, useState, useRef } from 'react';
import { Users, X, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TitleForm from '@/components/TitleForm';
import api from '@/lib/api';

type Estrategia = 'curso' | 'grado' | 'aula';
type OpcionAgrupacion = { id: number; nombre: string; detalle: string | null };
type Alumno  = { user_id: number; nombre: string };

type Props = {
    open:    boolean;
    onClose: () => void;
    onSaved: () => void;
};

export default function CrearGrupoModal({ open, onClose, onSaved }: Props) {
    const [nombre, setNombre]     = useState('');
    const [foto, setFoto]         = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const fileInputRef            = useRef<HTMLInputElement>(null);
    const [tipoAgrupacion, setTipoAgrupacion] = useState<Estrategia>('curso');
    const [opciones, setOpciones] = useState<OpcionAgrupacion[]>([]);
    const [opcionId, setOpcionId] = useState('');
    const [alumnos, setAlumnos]   = useState<Alumno[]>([]);
    const [seleccionados, setSel] = useState<Alumno[]>([]);
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState('');

    // Cargar opciones al cambiar estrategia o abrir
    useEffect(() => {
        if (!open) {
            setNombre(''); setOpcionId(''); setAlumnos([]); setSel([]); setError(''); setTipoAgrupacion('curso');
            setFoto(null); setFotoPreview(null);
            return;
        }

        setOpciones([]);
        setOpcionId('');

        let endpoint = '';
        if (tipoAgrupacion === 'curso') endpoint = '/mensajeria/cursos';
        if (tipoAgrupacion === 'grado') endpoint = '/mensajeria/grados';
        if (tipoAgrupacion === 'aula') endpoint = '/mensajeria/aulas';

        api.get(endpoint).then(({ data }) => {
            const mapeado = data.map((item: any) => {
                if (tipoAgrupacion === 'curso') return { id: item.curso_id, nombre: item.nombre, detalle: item.grado ? `— ${item.grado}` : null };
                if (tipoAgrupacion === 'grado') return { id: item.grado_id, nombre: item.nombre, detalle: item.nivel ? `— ${item.nivel}` : null };
                if (tipoAgrupacion === 'aula') return { id: item.seccion_id, nombre: item.nombre, detalle: item.grado ? `— ${item.grado}` : null };
                return null;
            });
            setOpciones(mapeado);
            setOpcionId('');
        });
    }, [open, tipoAgrupacion]);

    // Cargar alumnos al seleccionar la opción (curso, grado o aula)
    useEffect(() => {
        setAlumnos([]); setSel([]);
        if (!opcionId) return;

        let endpoint = '';
        if (tipoAgrupacion === 'curso') endpoint = `/mensajeria/cursos/${opcionId}/alumnos`;
        if (tipoAgrupacion === 'grado') endpoint = `/mensajeria/grados/${opcionId}/alumnos`;
        if (tipoAgrupacion === 'aula') endpoint = `/mensajeria/aulas/${opcionId}/alumnos`;

        api.get(endpoint).then(({ data }) => {
            setAlumnos(data);
            setSel(data); // Agrega automáticamente a todos los alumnos obtenidos
        });
    }, [opcionId, tipoAgrupacion]);

    const seleccionarAlumno = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const uid = Number(e.target.value);
        if (!uid) return;
        const alumno = alumnos.find((a) => a.user_id === uid);
        if (!alumno || seleccionados.find((s) => s.user_id === uid)) return;
        setSel((prev) => [...prev, alumno]);
        e.target.value = '';
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFoto(file);
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    const quitar = (uid: number) => setSel((prev) => prev.filter((s) => s.user_id !== uid));

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (!nombre.trim())        { setError('El nombre del grupo es requerido.'); return; }
        if (seleccionados.length < 1) { setError('Selecciona al menos un alumno.'); return; }
        setSaving(true); setError('');
        
        try {
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('user_ids', JSON.stringify(seleccionados.map((s) => s.user_id)));
            if (foto) {
                formData.append('foto', foto);
            }

            await api.post('/mensajeria/grupos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
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
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-neutral-800">
                        <Users className="h-5 w-5 text-emerald-600" />
                        Nuevo Grupo
                    </DialogTitle>
                    <DialogDescription className="sr-only">Crea un grupo de mensajería con alumnos.</DialogDescription>
                </DialogHeader>

                <TitleForm>Datos del Grupo</TitleForm>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Imagen del Grupo */}
                    <div className="flex flex-col items-center gap-2">
                        <div 
                            className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors relative group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {fotoPreview ? (
                                <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Users className="w-8 h-8 text-gray-300 group-hover:text-gray-400" />
                            )}
                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest text-center">Cambiar<br/>Foto</span>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFotoChange} />
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Icono del Grupo (Opcional)</label>
                    </div>

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

                    {/* Estrategia de agrupación */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-neutral-600">Agrupar por:</label>
                        <select
                            value={tipoAgrupacion}
                            onChange={(e) => setTipoAgrupacion(e.target.value as Estrategia)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a65a] bg-neutral-50 font-medium"
                        >
                            <option value="curso">Por Curso</option>
                            <option value="grado">Por Grado</option>
                            <option value="aula">Por Aula / Sección</option>
                        </select>
                    </div>

                    {/* Entidad seleccionada (Curso, Grado o Aula) */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-neutral-600 capitalize">{tipoAgrupacion}:</label>
                        <select
                            value={opcionId}
                            onChange={(e) => setOpcionId(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                        >
                            <option value="">{`Seleccionar ${tipoAgrupacion}`}</option>
                            {opciones.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.nombre} {opt.detalle}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Alumnos */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-neutral-600">Alumnos a excluir o agregar manualmente:</label>

                        <select
                            onChange={seleccionarAlumno}
                            disabled={alumnos.length === 0}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a65a] disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            <option value="">
                                {opcionId && alumnos.length === 0 ? `Sin alumnos en este ${tipoAgrupacion}` : 'Seleccionar Alumno (uno por uno)'}
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
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-neutral-100 rounded-md">
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
