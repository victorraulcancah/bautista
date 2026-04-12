import { Users, X, CheckSquare, Search, PlusCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import TitleForm from '@/components/TitleForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';

type Estrategia = 'curso' | 'grado' | 'aula' | 'personal';
type OpcionAgrupacion = { id: number; nombre: string; detalle: string | null };
type Miembro  = { user_id: number; nombre: string; rol?: string };

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
    const [miembrosSug, setMiembrosSug] = useState<Miembro[]>([]);
    const [seleccionados, setSel] = useState<Miembro[]>([]);
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState('');

    // Búsqueda manual "A Dedo"
    const [manualQuery, setManualQuery] = useState('');
    const [manualResults, setManualResults] = useState<Miembro[]>([]);
    const [searching, setSearching]     = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cargar opciones al cambiar estrategia o abrir
    useEffect(() => {
        if (!open) {
            setNombre(''); setOpcionId(''); setMiembrosSug([]); setSel([]); setError(''); setTipoAgrupacion('curso');
            setFoto(null); setFotoPreview(null); setManualQuery(''); setManualResults([]);

            return;
        }

        setOpciones([]);
        setOpcionId('');

        let endpoint = '';

        if (tipoAgrupacion === 'curso')    endpoint = '/mensajeria/cursos';
        if (tipoAgrupacion === 'grado')    endpoint = '/mensajeria/grados';
        if (tipoAgrupacion === 'aula')     endpoint = '/mensajeria/aulas';
        if (tipoAgrupacion === 'personal') endpoint = '/mensajeria/roles-personal';

        api.get(endpoint).then(({ data }) => {
            const mapeado = data.map((item: any) => {
                if (tipoAgrupacion === 'curso') return { id: item.curso_id, nombre: item.nombre, detalle: item.grado ? `— ${item.grado}` : null };
                if (tipoAgrupacion === 'grado') return { id: item.grado_id, nombre: item.nombre, detalle: item.nivel ? `— ${item.nivel}` : null };
                if (tipoAgrupacion === 'aula')  return { id: item.seccion_id, nombre: item.nombre, detalle: item.grado ? `— ${item.grado}` : null };
                if (tipoAgrupacion === 'personal') return { id: item.id, nombre: item.nombre, detalle: 'Rol del Sistema' };
                return null;
            });
            setOpciones(mapeado);
            setOpcionId('');
        });
    }, [open, tipoAgrupacion]);

    // Cargar sugerencias al seleccionar la opción
    useEffect(() => {
        setMiembrosSug([]); 

        if (!opcionId) return;

        let endpoint = '';
        if (tipoAgrupacion === 'curso')    endpoint = `/mensajeria/cursos/${opcionId}/alumnos`;
        if (tipoAgrupacion === 'grado')    endpoint = `/mensajeria/grados/${opcionId}/alumnos`;
        if (tipoAgrupacion === 'aula')     endpoint = `/mensajeria/aulas/${opcionId}/alumnos`;
        if (tipoAgrupacion === 'personal') endpoint = `/mensajeria/roles-personal/${opcionId}/usuarios`;

        api.get(endpoint).then(({ data }) => {
            const dataMapeada = data.map((d: any) => ({
                user_id: d.user_id,
                nombre: d.nombre,
                rol: tipoAgrupacion === 'personal' ? opciones.find(o => o.id === Number(opcionId))?.nombre : 'Estudiante'
            }));
            setMiembrosSug(dataMapeada);
            // Agregamos automáticamente si es curso/grado/aula
            if (tipoAgrupacion !== 'personal') {
                setSel(dataMapeada);
            }
        });
    }, [opcionId, tipoAgrupacion, opciones]);

    const buscarManual = (q: string) => {
        setManualQuery(q);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (q.length < 2) { setManualResults([]); return; }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const { data } = await api.get('/usuarios/buscar', { params: { q } });
                setManualResults(data.map((u: any) => ({ user_id: u.id, nombre: u.nombre, rol: u.rol })));
            } finally {
                setSearching(false);
            }
        }, 300);
    };

    const agregarMiembro = (m: Miembro) => {
        if (seleccionados.find(s => s.user_id === m.user_id)) return;
        setSel((prev) => [...prev, m]);
        setManualQuery('');
        setManualResults([]);
    };

    const handleSelectOptionItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const uid = Number(e.target.value);
        if (!uid) return;
        const item = miembrosSug.find(m => m.user_id === uid);
        if (item) agregarMiembro(item);
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

        if (!nombre.trim()) { setError('El nombre del grupo es requerido.'); return; }
        if (seleccionados.length < 1) { setError('Selecciona al menos un miembro.'); return; }

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
                    <DialogTitle className="flex items-center gap-2 text-neutral-800 uppercase italic font-black tracking-tighter text-xl">
                        <Users className="h-6 w-6 text-indigo-600" />
                        Configurar Nuevo Grupo
                    </DialogTitle>
                    <DialogDescription className="sr-only">Crea un grupo de mensajería con alumnos o personal.</DialogDescription>
                </DialogHeader>

                <TitleForm>1. Datos del Grupo</TitleForm>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Imagen del Grupo */}
                    <div className="flex flex-col items-center gap-3 py-2">
                        <div 
                            className="w-24 h-24 rounded-[2rem] border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all relative group shadow-sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {fotoPreview ? (
                                <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Users className="w-10 h-10 text-gray-300 group-hover:text-indigo-300" />
                            )}
                            <div className="absolute inset-0 bg-indigo-600/60 hidden group-hover:flex items-center justify-center">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest text-center">Subir<br/>Logo</span>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFotoChange} />
                    </div>

                    {/* Nombre del grupo */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Nombre del Grupo de Mensajería</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="EJ: DOCENTES 5TO GRADO..."
                            className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all"
                        />
                    </div>

                    <TitleForm>2. Miembros del Grupo</TitleForm>

                    {/* Búsqueda Manual "A Dedo" */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                            <Search className="size-3" /> Agregar individualmente (A Dedo)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={manualQuery}
                                onChange={(e) => buscarManual(e.target.value)}
                                placeholder={searching ? "BUSCANDO..." : "BUSCAR POR NOMBRE O ROL..."}
                                className="w-full rounded-2xl border-2 border-indigo-50 bg-indigo-50/20 px-4 py-3 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                            />
                            {manualResults.length > 0 && (
                                <ul className="absolute z-50 top-full mt-2 w-full rounded-2xl border-2 border-gray-100 bg-white shadow-2xl overflow-hidden">
                                    {manualResults.map((u) => (
                                        <li
                                            key={u.user_id}
                                            className="cursor-pointer px-4 py-3 text-xs font-bold hover:bg-indigo-50 flex items-center justify-between group"
                                            onClick={() => agregarMiembro(u)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-gray-900">{u.nombre}</span>
                                                <span className="text-[9px] text-gray-400 uppercase tracking-tighter">{u.rol || 'USUARIO'}</span>
                                            </div>
                                            <PlusCircle className="size-4 text-gray-300 group-hover:text-indigo-600" />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Agrupación rápida */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Agrupar Por</label>
                            <select
                                value={tipoAgrupacion}
                                onChange={(e) => setTipoAgrupacion(e.target.value as Estrategia)}
                                className="w-full rounded-xl border-2 border-gray-50 bg-gray-50 px-3 py-2 text-[10px] font-black uppercase tracking-tighter focus:outline-none focus:border-indigo-500"
                            >
                                <option value="curso">Cursos</option>
                                <option value="grado">Grados</option>
                                <option value="aula">Aulas</option>
                                <option value="personal">Personal</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest capitalize">{tipoAgrupacion}</label>
                            <select
                                value={opcionId}
                                onChange={(e) => setOpcionId(e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-50 bg-gray-50 px-3 py-2 text-[10px] font-black uppercase tracking-tighter focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">SELECCIONAR...</option>
                                {opciones.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.nombre.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Sugerencias de Miembros */}
                    {miembrosSug.length > 0 && (
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Resultados de {tipoAgrupacion} (Click para añadir)</label>
                            <select
                                onChange={handleSelectOptionItem}
                                className="w-full rounded-xl border border-gray-100 bg-white px-3 py-2 text-[10px] font-bold text-indigo-600 focus:outline-none"
                            >
                                <option value="">Elegir de la lista...</option>
                                {miembrosSug
                                    .filter((a) => !seleccionados.find((s) => s.user_id === a.user_id))
                                    .map((a) => (
                                        <option key={a.user_id} value={a.user_id}>{a.nombre} ({a.rol || '---'})</option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {/* Lista de Seleccionados */}
                    {seleccionados.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                <CheckSquare className="size-3" /> Miembros Seleccionados ({seleccionados.length})
                            </label>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50/50 rounded-2xl border-2 border-gray-50">
                                {seleccionados.map((s) => (
                                    <div
                                        key={s.user_id}
                                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-100 px-3 py-1.5 shadow-sm group animate-in zoom-in-95 duration-200"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-800 leading-none">{s.nombre}</span>
                                            <span className="text-[8px] text-indigo-400 font-black uppercase tracking-tighter mt-1">{s.rol || 'Miembro'}</span>
                                        </div>
                                        <button type="button" onClick={() => quitar(s.user_id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <p className="text-[10px] font-black text-red-500 uppercase p-3 bg-red-50 rounded-xl">{error}</p>}

                    <DialogFooter className="pt-4 border-t border-gray-100">
                        <Button type="button" variant="ghost" className="font-bold text-xs" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest px-8 rounded-xl h-12 shadow-lg shadow-indigo-100">
                            {saving ? 'PROCESANDO...' : 'CREAR GRUPO'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
