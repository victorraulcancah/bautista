import { Head } from '@inertiajs/react';
import { GraduationCap, Save, Search, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type EstudianteNota = {
    estu_id: number;
    nombre_completo: string;
    nota: string;
    observacion: string;
};

export default function NotasPage() {
    const [actividades, setActividades] = useState<any[]>([]);
    const [selectedActividad, setSelectedActividad] = useState<string>('');
    const [seccionId, setSeccionId] = useState<string>('');
    const [aperturaId, setAperturaId] = useState<string>('');
    
    const [secciones, setSecciones] = useState<any[]>([]);
    const [aperturas, setAperturas] = useState<any[]>([]);

    const [estudiantes, setEstudiantes] = useState<EstudianteNota[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/actividades').then(({ data }) => setActividades(data.data || data));
        api.get('/secciones').then(({ data }) => setSecciones(data.data || data));
        api.get('/matriculas/aperturas').then(({ data }) => setAperturas(data.data || data));
    }, []);

    const fetchNotas = async () => {
        if (!selectedActividad || !seccionId || !aperturaId) {
            alert('Por favor complete todos los filtros antes de cargar.');
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.get(`/actividades/${selectedActividad}/notas?seccion_id=${seccionId}&apertura_id=${aperturaId}`);
            setEstudiantes(data.estudiantes);
        } catch {
            alert('No se pudieron cargar los alumnos.');
        } finally {
            setLoading(false);
        }
    };

    const handleNotaChange = (id: number, field: keyof EstudianteNota, value: string) => {
        setEstudiantes(prev => prev.map(e => e.estu_id === id ? { ...e, [field]: value } : e));
    };

    const saveNotas = async () => {
        setSaving(true);
        try {
            await api.post(`/actividades/${selectedActividad}/calificar`, {
                notas: estudiantes.map(e => ({
                    estu_id: e.estu_id,
                    nota: e.nota,
                    obs: e.observacion
                }))
            });
            alert('Calificaciones guardadas correctamente.');
        } catch {
            alert('Ocurrió un error al guardar.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Head title="Ingreso de Notas" />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Registro de Notas</h1>
                    <p className="text-purple-600 font-bold flex items-center mt-1">
                        <GraduationCap className="w-4 h-4 mr-2" /> Panel de evaluación por actividad
                    </p>
                </div>
                
                <div className="flex bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800 text-xs font-bold max-w-md">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    Las notas ingresadas aquí se sincronizarán directamente con el promedio de la unidad y el portal del estudiante.
                </div>
            </div>

            {/* Filtros Premium */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seleccionar Actividad</label>
                    <Select value={selectedActividad} onValueChange={setSelectedActividad}>
                        <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-purple-200">
                            <SelectValue placeholder="Actividad..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {actividades.map(a => (
                                <SelectItem key={a.actividad_id} value={a.actividad_id.toString()}>
                                    {a.nombre_actividad}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sección / Aula</label>
                    <Select value={seccionId} onValueChange={setSeccionId}>
                        <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-purple-200">
                            <SelectValue placeholder="Sección..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {secciones.map(s => (
                                <SelectItem key={s.seccion_id} value={s.seccion_id.toString()}>
                                    {s.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Año Lectivo</label>
                    <Select value={aperturaId} onValueChange={setAperturaId}>
                        <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-purple-200">
                            <SelectValue placeholder="Año..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {aperturas.map(ap => (
                                <SelectItem key={ap.apertura_id} value={ap.apertura_id.toString()}>
                                    {ap.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <Button onClick={fetchNotas} className="w-full h-12 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 rounded-xl font-bold transition-all hover:scale-105" disabled={loading}>
                        <Search className="w-4 h-4 mr-2" />
                        {loading ? 'Cargando...' : 'Cargar Estudiantes'}
                    </Button>
                </div>
            </div>

            {/* Grid de Notas */}
            {estudiantes.length > 0 ? (
                <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/80 border-b text-gray-500 font-black text-[10px] uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Nombre del Estudiante</th>
                                    <th className="px-8 py-5 w-40 text-center">Calificación</th>
                                    <th className="px-8 py-5">Observación / Feedback</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {estudiantes.map(e => (
                                    <tr key={e.estu_id} className="group hover:bg-purple-50/30 transition-colors">
                                        <td className="px-8 py-5 font-bold text-gray-700">{e.nombre_completo}</td>
                                        <td className="px-8 py-5">
                                            <input 
                                                className="w-full text-center font-black text-xl h-12 rounded-2xl border-2 border-gray-100 bg-white group-hover:border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                                                value={e.nota} 
                                                maxLength={5}
                                                onChange={(ev) => handleNotaChange(e.estu_id, 'nota', ev.target.value)}
                                            />
                                        </td>
                                        <td className="px-8 py-5">
                                            <input 
                                                placeholder="Ej. Buen desempeño, repasar temas..."
                                                className="w-full h-12 px-5 rounded-2xl border-2 border-gray-100 bg-white group-hover:border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none font-medium"
                                                value={e.observacion} 
                                                onChange={(ev) => handleNotaChange(e.estu_id, 'observacion', ev.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="p-8 bg-gray-50/50 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                            Total: <span className="text-purple-600 font-black">{estudiantes.length} alumnos cargados</span>
                        </p>
                        <Button onClick={saveNotas} className="w-full md:w-auto h-14 px-12 bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 rounded-2xl font-black text-lg transition-all hover:scale-105" disabled={saving}>
                            <Save className="w-5 h-5 mr-3" />
                            {saving ? 'Guardando...' : 'Aplicar Calificaciones'}
                        </Button>
                    </div>
                </div>
            ) : (
                !loading && (
                    <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <GraduationCap className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">Seleccione los filtros para empezar a calificar</h3>
                    </div>
                )
            )}
        </div>
    );
}
