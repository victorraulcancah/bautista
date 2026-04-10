import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    BookOpen, 
    Megaphone, 
    BarChart3, 
    Users, 
    Settings, 
    Plus, 
    FileText, 
    ClipboardCheck, 
    QrCode, 
    TrendingUp, 
    Calendar,
    ChevronDown,
    ChevronRight,
    Search,
    MessageSquare,
    MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress'; // UI Component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import CourseHero from '@/pages/Cursos/components/CourseHero';
import { Html5QrcodeScanner } from 'html5-qrcode';

const TABS = [
    { id: "contenido", label: "Contenido", icon: BookOpen },
    { id: "anuncios", label: "Anuncios", icon: MessageSquare },
    { id: "calificaciones", label: "Calificaciones", icon: BarChart3 },
    { id: "asistencia", label: "Asistencia", icon: Calendar },
    { id: "alumnos", label: "Alumnos", icon: Users },
    { id: "configuracion", label: "Configuración", icon: Settings },
];

export default function ContenidoEditor({ docenteCursoId }: { docenteCursoId: number }) {
    const [activeTab, setActiveTab] = useState("contenido");
    const [courseData, setCourseData] = useState<any>(null);
    const [unidades, setUnidades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadBasicData();
    }, [docenteCursoId]);

    const loadBasicData = async () => {
        try {
            setLoading(true);
            const courseRes = await api.get('/docente/mis-cursos');
            const currentCourse = courseRes.data.find((c: any) => c.docen_curso_id === docenteCursoId);
            setCourseData(currentCourse);

            const contentRes = await api.get(`/docente/curso/${docenteCursoId}/contenido`);
            setUnidades(contentRes.data);
            
            if (contentRes.data.length > 0) {
                setExpanded({ [contentRes.data[0].unidad_id]: true });
            }
        } catch (error) {
            console.error("Error loading course data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={[]}>
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="font-black text-xs uppercase tracking-widest text-gray-400">Preparando Entorno...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mis Cursos', href: '/docente/mis-cursos' },
        { title: courseData?.curso?.nombre || 'Curso', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={courseData?.curso?.nombre || 'Curso'} />
            
            <div className="min-h-screen bg-[#f8fafc] pb-20">
                
                {/* Full Width Hero */}
                <div className="p-4 md:p-6 max-w-7xl mx-auto">
                    <CourseHero 
                        title={courseData?.curso?.nombre}
                        courseCode={`COD-${courseData?.curso_id}`}
                        color="#4f46e5"
                        image={courseData?.curso?.logo ? `/storage/${courseData.curso.logo}` : undefined}
                        term={courseData?.apertura?.nombre}
                        professor="Tú"
                        role="teacher"
                    />
                </div>

                {/* Sticky Centered Navigation (Blackboard Style) */}
                <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-y border-gray-100 dark:bg-gray-900/80 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
                        <div className="flex items-center space-x-1 py-1">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                                        ${activeTab === tab.id 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                            : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="max-w-7xl mx-auto p-4 md:p-8">
                    {activeTab === "contenido" && <ContenidoTab unidades={unidades} expanded={expanded} setExpanded={setExpanded} docenteCursoId={docenteCursoId} onRefresh={loadBasicData} />}
                    {activeTab === "anuncios" && <AnunciosTab docenteCursoId={docenteCursoId} />}
                    {activeTab === "calificaciones" && <CalificacionesTab docenteCursoId={docenteCursoId} unidades={unidades} onRefresh={loadBasicData} />}
                    {activeTab === "asistencia" && <AsistenciaTab docenteCursoId={docenteCursoId} />}
                    {activeTab === "alumnos" && <AlumnosTab docenteCursoId={docenteCursoId} />}
                    {activeTab === "configuracion" && <ConfiguracionTab />}
                </main>
            </div>
        </AppLayout>
    );
}

// ── SUB-COMPONENTES DE PESTAÑAS ───────────────────────────────────────────

function ContenidoTab({ unidades, expanded, setExpanded, docenteCursoId, onRefresh }: any) {
    const [showUnidadForm, setShowUnidadForm] = useState(false);
    const [nuevaUnidad, setNuevaUnidad] = useState('');

    const toggleSection = (id: number) => {
        setExpanded((s: any) => ({ ...s, [id]: !s[id] }));
    };

    const addUnidad = () => {
        if (!nuevaUnidad) return;
        api.post('/docente/unidad', { docente_curso_id: docenteCursoId, titulo: nuevaUnidad })
            .then(() => {
                setNuevaUnidad('');
                setShowUnidadForm(false);
                onRefresh();
            });
    };

    const addClase = (unidadId: number) => {
        const titulo = prompt('Título de la nueva sesión:');
        if (!titulo) return;
        api.post('/docente/clase', { unidad_id: unidadId, titulo })
            .then(() => onRefresh());
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Material de Curso</h2>
                    <p className="text-gray-500 text-sm">Gestiona fichas, guías y documentos de estudio.</p>
                </div>
                <Button 
                    onClick={() => setShowUnidadForm(true)}
                    className="rounded-[1.25rem] h-12 px-6 bg-indigo-600 hover:bg-indigo-700 font-bold gap-2"
                >
                    <Plus size={18} /> Nueva Unidad
                </Button>
            </div>

            {showUnidadForm && (
                <Card className="rounded-[2rem] border-2 border-indigo-100 shadow-xl shadow-indigo-100/50 overflow-hidden">
                    <CardContent className="p-6 flex gap-3 bg-indigo-50/50">
                        <Input 
                            placeholder="Nombre de la nueva unidad académica..." 
                            value={nuevaUnidad}
                            onChange={e => setNuevaUnidad(e.target.value)}
                            className="bg-white rounded-2xl h-12 border-indigo-100 font-bold"
                        />
                        <Button onClick={addUnidad} className="bg-indigo-600 rounded-xl px-6 h-12 font-bold">Crear</Button>
                        <Button variant="ghost" onClick={() => setShowUnidadForm(false)} className="rounded-xl h-12">✕</Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {unidades.map((unidad: any) => (
                    <Card key={unidad.unidad_id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                        <div 
                            className="flex items-center justify-between p-6 cursor-pointer bg-white"
                            onClick={() => toggleSection(unidad.unidad_id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${expanded[unidad.unidad_id] ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50'}`}>
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-gray-900 leading-tight">{unidad.titulo}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{unidad.clases?.length || 0} Sesiones</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={(e) => { e.stopPropagation(); addClase(unidad.unidad_id); }}
                                    className="rounded-xl border-gray-100 font-bold text-[10px] uppercase h-9"
                                >
                                    + Sesión
                                </Button>
                                <div className={`p-2 rounded-xl transition-transform ${expanded[unidad.unidad_id] ? 'rotate-180 bg-gray-100' : 'bg-gray-50'}`}>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {expanded[unidad.unidad_id] && (
                            <div className="px-6 pb-6 bg-white animate-in slide-in-from-top-2 duration-300">
                                <div className="border-t border-gray-100 pt-4 space-y-2">
                                    {unidad.clases?.map((clase: any) => (
                                        <div key={clase.clase_id} className="flex items-center justify-between p-4 rounded-3xl border border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                    <FileText size={14} className="text-indigo-600" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">{clase.titulo}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex -space-x-1">
                                                    {clase.archivos?.map((f: any) => (
                                                        <div key={f.id} className="size-6 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[8px] font-bold shadow-sm" title={f.nombre_archivo}>
                                                            PDF
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                                                    <MoreVertical size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!unidad.clases || unidad.clases.length === 0) && (
                                        <p className="text-center py-6 text-xs font-bold text-gray-400 italic">No hay sesiones creadas en esta unidad.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}

function AnunciosTab({ docenteCursoId }: any) {
    const [anuncios, setAnuncios] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ titulo: '', contenido: '' });

    useEffect(() => {
        loadAnuncios();
    }, []);

    const loadAnuncios = () => {
        api.get(`/docente/curso/${docenteCursoId}/anuncios`)
            .then(res => setAnuncios(res.data));
    };

    const handlePublish = async () => {
        if (!form.titulo || !form.contenido) return;
        await api.post('/docente/anuncios', { ...form, docente_curso_id: docenteCursoId });
        setForm({ titulo: '', contenido: '' });
        setShowForm(false);
        loadAnuncios();
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Anuncios del Curso</h2>
                    <p className="text-gray-500 text-sm">Comunícate con tus estudiantes durante el ciclo.</p>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-2xl h-12 bg-indigo-600 font-bold"
                >
                    {showForm ? 'Cancelar' : 'Publicar Anuncio'}
                </Button>
            </div>

            {showForm && (
                <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-indigo-100/50 p-8 space-y-4">
                    <Input 
                        placeholder="Título del anuncio..." 
                        value={form.titulo}
                        onChange={e => setForm({...form, titulo: e.target.value})}
                        className="h-14 rounded-2xl border-gray-100 font-black text-lg focus:ring-indigo-600"
                    />
                    <textarea 
                        placeholder="¿Qué quieres anunciar a tus alumnos?"
                        value={form.contenido}
                        onChange={e => setForm({...form, contenido: e.target.value})}
                        className="w-full min-h-[150px] p-6 rounded-[2rem] border border-gray-100 bg-gray-50 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-600/10"
                    />
                    <div className="flex justify-end pt-2">
                        <Button onClick={handlePublish} className="rounded-2xl h-12 px-8 bg-indigo-600 font-black uppercase tracking-widest text-[10px]">Publicar Ahora</Button>
                    </div>
                </Card>
            )}

            <div className="space-y-6">
                {anuncios.map(anuncio => (
                    <Card key={anuncio.id} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">A</div>
                                <div>
                                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Publicado por ti</p>
                                    <p className="text-[10px] font-bold text-gray-400 capitalize">{new Date(anuncio.created_at).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">{anuncio.titulo}</h3>
                            <p className="text-gray-600 font-bold leading-relaxed">{anuncio.contenido}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function CalificacionesTab({ docenteCursoId, unidades, onRefresh }: any) {
    const [view, setView] = useState<'manage' | 'grades'>('manage');

    const addActividad = (claseId: number, tipoId: number) => {
        const nombre = prompt(tipoId === 2 ? 'Nombre del Examen:' : (tipoId === 3 ? 'Nombre del Cuestionario:' : 'Nombre de la tarea:'));
        if (!nombre) return;
        api.post('/docente/actividad', { id_clase_curso: claseId, nombre_actividad: nombre, tipo_id: tipoId })
            .then(() => onRefresh());
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Evaluaciones & Calificaciones</h2>
                    <p className="text-gray-500 text-sm">Gestiona tareas, exámenes y el registro oficial de notas.</p>
                </div>
                <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-[1.5rem]">
                    <Button 
                        variant="ghost" 
                        onClick={() => setView('manage')}
                        className={`rounded-2xl text-[10px] font-black uppercase px-6 h-10 ${view === 'manage' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                    >
                        Gestionar
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setView('grades')}
                        className={`rounded-2xl text-[10px] font-black uppercase px-6 h-10 ${view === 'grades' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                    >
                        Registro de Notas
                    </Button>
                </div>
            </div>

            {view === 'manage' ? (
                <div className="space-y-4">
                    {unidades.map((unidad: any) => (
                        <div key={unidad.unidad_id} className="space-y-2">
                            <h4 className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{unidad.titulo}</h4>
                            {unidad.clases?.map((clase: any) => (clase.actividades?.length > 0 || true) && (
                                <Card key={clase.clase_id} className="rounded-[2rem] border-none shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <ClipboardCheck size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{clase.titulo}</p>
                                            <div className="flex gap-2 mt-1">
                                                {clase.actividades?.map((act: any) => (
                                                    <Badge key={act.actividad_id} variant="secondary" className="rounded-full bg-indigo-50 text-indigo-600 text-[9px] px-2 border-none">
                                                        {act.tipo_actividad?.nombre || 'Actividad'}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            onClick={() => addActividad(clase.clase_id, 1)}
                                            variant="outline" 
                                            className="rounded-xl font-bold text-[10px] uppercase h-9 border-gray-100"
                                        >
                                            + Tarea
                                        </Button>
                                        <Button 
                                            onClick={() => addActividad(clase.clase_id, 2)}
                                            variant="outline" 
                                            className="rounded-xl font-bold text-[10px] uppercase h-9 border-indigo-100 text-indigo-600 bg-indigo-50/50"
                                        >
                                            + Examen
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
                    <div className="p-10 text-center space-y-4">
                        <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                            <BarChart3 size={32} />
                        </div>
                        <h3 className="font-black text-gray-900">Registro General de Notas</h3>
                        <p className="text-gray-500 font-bold max-w-sm mx-auto text-sm">Próximamente: Vista tipo hoja de cálculo para ingreso masivo de notas.</p>
                    </div>
                </Card>
            )}
        </div>
    );
}

function AsistenciaTab({ docenteCursoId }: any) {
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [clases, setClases] = useState<any[]>([]);
    const [selectedClase, setSelectedClase] = useState<string>("");
    const [asistencias, setAsistencias] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get(`/docente/curso/${docenteCursoId}/alumnos`),
            api.get(`/docente/curso/${docenteCursoId}/contenido`)
        ]).then(([alRes, clRes]) => {
            setAlumnos(alRes.data);
            const allClases = clRes.data.flatMap((u: any) => u.clases);
            setClases(allClases);
            setLoading(false);
        });
    }, [docenteCursoId]);

    const handleSave = () => {
        if (!selectedClase) return alert("Selecciona una sesión.");
        setSaving(true);
        api.post('/docente/asistencia/iniciar', { id_clase_curso: selectedClase, fecha: new Date().toISOString().split('T')[0] })
            .then(res => {
                const payload = Object.entries(asistencias).map(([id, st]) => ({ id_estudiante: parseInt(id), estado: st }));
                return api.post(`/docente/asistencia/${res.data.id}/marcar`, { asistencias: payload });
            })
            .then(() => alert("¡Asistencia guardada!"))
            .finally(() => setSaving(false));
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-indigo-400 font-black uppercase text-[10px] tracking-widest">Cargando nómina...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Control de Asistencia</h2>
                    <p className="text-gray-500 text-sm">Registra la presencia de tus alumnos en cada sesión.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select onValueChange={setSelectedClase} value={selectedClase}>
                        <SelectTrigger className="w-[200px] h-12 rounded-2xl border-none shadow-sm bg-white font-bold">
                            <SelectValue placeholder="Elegir Sesión..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-xl">
                            {clases.map((c: any) => (
                                <SelectItem key={c.clase_id} value={c.clase_id.toString()} className="font-bold">{c.titulo}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button 
                        onClick={handleSave} 
                        disabled={saving || !selectedClase}
                        className="rounded-2xl h-12 px-8 bg-indigo-600 font-black uppercase tracking-widest text-[10px]"
                    >
                        {saving ? "Guardando..." : "Guardar Registro"}
                    </Button>
                </div>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-left">Alumno</th>
                            <th className="px-8 py-5 text-center">Asistencia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {alumnos.map((a: any) => (
                            <tr key={a.estu_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-xs shadow-sm">
                                            {a.perfil?.primer_nombre?.[0]}{a.perfil?.apellido_paterno?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 leading-none">{a.perfil?.primer_nombre} {a.perfil?.apellido_paterno}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">DNI: {a.perfil?.doc_numero}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex justify-center gap-2">
                                        {[
                                            { id: 'P', label: 'Pres.', color: 'emerald' },
                                            { id: 'F', label: 'Fal.', color: 'rose' },
                                            { id: 'T', label: 'Tar.', color: 'amber' },
                                            { id: 'J', label: 'Jus.', color: 'indigo' },
                                        ].map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => setAsistencias(prev => ({ ...prev, [a.estu_id]: s.id }))}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all
                                                    ${asistencias[a.estu_id] === s.id 
                                                        ? `bg-${s.color}-600 text-white shadow-lg` 
                                                        : `bg-${s.color}-50 text-${s.color}-600 hover:bg-${s.color}-100`}`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

function AlumnosTab({ docenteCursoId }: any) {
    const [loading, setLoading] = useState(true);
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [scanning, setScanning] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadAlumnos();
    }, []);

    const loadAlumnos = async () => {
        try {
            const res = await api.get(`/docente/curso/${docenteCursoId}/alumnos`);
            setAlumnos(res.data);
        } finally {
            setLoading(false);
        }
    };

    const startScanner = () => {
        setScanning(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(onScanSuccess, onScanError);
        }, 100);
    };

    const onScanSuccess = (decodedText: string) => {
        alert("Código detectado: " + decodedText);
        setScanning(false);
    };

    const onScanError = (err: any) => {};

    const filtered = alumnos.filter(a => 
        `${a.perfil?.primer_nombre} ${a.perfil?.apellido_paterno}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Mis Estudiantes</h2>
                    <p className="text-gray-500 text-sm">Monitorea el desempeño y asitencia en tiempo real.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input 
                            placeholder="Buscar alumno..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-11 h-12 rounded-2xl border-none shadow-sm bg-white font-bold w-64"
                        />
                    </div>
                    <Button onClick={startScanner} className="rounded-2xl h-12 px-6 bg-indigo-600 font-bold gap-2">
                        <QrCode size={18} /> Escanear QR
                    </Button>
                </div>
            </div>

            {scanning && (
                <Card className="rounded-[2rem] border-none shadow-2xl p-6 relative overflow-hidden">
                    <div id="reader" className="w-full max-w-sm mx-auto"></div>
                    <Button variant="ghost" onClick={() => setScanning(false)} className="absolute top-4 right-4 text-gray-400">Cerrar ✕</Button>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(alumno => (
                    <Card key={alumno.estu_id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="size-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center font-black text-2xl text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                                {alumno.perfil?.primer_nombre?.[0]}{alumno.perfil?.apellido_paterno?.[0]}
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 line-clamp-1">{alumno.perfil?.primer_nombre} {alumno.perfil?.apellido_paterno}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">DNI: {alumno.perfil?.doc_numero}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-1.5 mb-2 text-indigo-600">
                                    <TrendingUp size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Promedio</span>
                                </div>
                                <p className="text-xl font-black text-gray-900">{alumno.promedio_notas}</p>
                            </div>
                            <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-1.5 mb-2 text-indigo-600">
                                    <Calendar size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Asistencia</span>
                                </div>
                                <p className="text-xl font-black text-gray-900">{alumno.asistencia_porcentaje}%</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span>Progreso</span>
                                <span>{alumno.asistencia_porcentaje}%</span>
                            </div>
                            <Progress value={alumno.asistencia_porcentaje} className="h-1.5 bg-gray-100 rounded-full" />
                        </div>

                        <Button variant="ghost" className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[9px] text-indigo-600 hover:bg-indigo-50">
                            Ver Perfil Completo
                        </Button>
                    </Card>
                ))}
            </div>
            
            {filtered.length === 0 && (
                <div className="py-20 text-center opacity-30 flex flex-col items-center">
                    <Search size={64} className="mb-4" />
                    <p className="font-black text-lg uppercase tracking-widest">No hay resultados</p>
                </div>
            )}
        </div>
    );
}

function ConfiguracionTab() {
    return (
        <Card className="rounded-[2.5rem] border-none shadow-sm p-12 text-center">
            <Settings size={64} className="mx-auto text-gray-200 mb-6" />
            <h3 className="text-xl font-black text-gray-900 mb-2">Configuración del Curso</h3>
            <p className="text-gray-500 font-bold max-w-md mx-auto">Próximamente: Ajuste de pesos de calificación, visibilidad del curso, delegación de asistencia y más.</p>
        </Card>
    );
}
