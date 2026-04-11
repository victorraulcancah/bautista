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
    MoreVertical,
    Download,
    Trash2,
    Edit3,
    UploadCloud,
    Mail
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
import MensajeriaTab from './MensajeriaTab';

const TABS = [
    { id: "contenido", label: "Contenido", icon: BookOpen },
    { id: "anuncios", label: "Anuncios", icon: MessageSquare },
    { id: "mensajeria", label: "Mensajería", icon: Mail },
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
                    {activeTab === "contenido" && <ContenidoTab unidades={unidades} expanded={expanded} setExpanded={setExpanded} docenteCursoId={docenteCursoId} courseData={courseData} onRefresh={loadBasicData} />}
                    {activeTab === "anuncios" && <AnunciosTab docenteCursoId={docenteCursoId} />}
                    {activeTab === "mensajeria" && <MensajeriaTab docenteCursoId={docenteCursoId} />}
                    {activeTab === "calificaciones" && <CalificacionesTab docenteCursoId={docenteCursoId} />}
                    {activeTab === "asistencia" && <AsistenciaTab docenteCursoId={docenteCursoId} />}
                    {activeTab === "alumnos" && <AlumnosTab docenteCursoId={docenteCursoId} />}
                    {activeTab === "configuracion" && <ConfiguracionTab docenteCursoId={docenteCursoId} />}
                </main>
            </div>
        </AppLayout>
    );
}

// ── SUB-COMPONENTES DE PESTAÑAS ───────────────────────────────────────────

function ContenidoTab({ unidades, expanded, setExpanded, docenteCursoId, courseData, onRefresh }: any) {
    const [showUnidadForm, setShowUnidadForm] = useState(false);
    const [nuevaUnidad, setNuevaUnidad] = useState('');

    const toggleSection = (id: number) => {
        setExpanded((s: any) => ({ ...s, [id]: !s[id] }));
    };

    const addUnidad = () => {
        if (!nuevaUnidad || !courseData?.curso_id) return;
        api.post('/contenido/unidades', { curso_id: courseData.curso_id, titulo: nuevaUnidad })
            .then(() => {
                setNuevaUnidad('');
                setShowUnidadForm(false);
                onRefresh();
            });
    };

    const addClase = (unidadId: number) => {
        const titulo = prompt('Título de la nueva sesión:');
        if (!titulo) return;
        api.post('/contenido/clases', { unidad_id: unidadId, titulo })
            .then(() => onRefresh());
    };

    const deleteUnidad = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta unidad? Se borrarán todas sus sesiones.')) return;
        await api.delete(`/contenido/unidades/${id}`);
        onRefresh();
    };

    const deleteClase = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta sesión?')) return;
        await api.delete(`/contenido/clases/${id}`);
        onRefresh();
    };

    const renameUnidad = async (id: number, current: string) => {
        const nuevo = prompt('Nuevo título para la unidad:', current);
        if (!nuevo || nuevo === current) return;
        await api.put(`/contenido/unidades/${id}`, { titulo: nuevo });
        onRefresh();
    };

    const renameClase = async (id: number, current: string) => {
        const nuevo = prompt('Nuevo título para la sesión:', current);
        if (!nuevo || nuevo === current) return;
        await api.put(`/contenido/clases/${id}`, { titulo: nuevo });
        onRefresh();
    };

    const deleteArchivo = async (id: number) => {
        if (!confirm('¿Seguro que quieres eliminar este archivo?')) return;
        await api.delete(`/contenido/archivos/${id}`);
        onRefresh();
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
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => { e.stopPropagation(); renameUnidad(unidad.unidad_id, unidad.titulo); }}
                                    className="size-9 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                                >
                                    <Edit3 size={14} />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => { e.stopPropagation(); deleteUnidad(unidad.unidad_id); }}
                                    className="size-9 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 size={14} />
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
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-1 flex-wrap max-w-[200px]">
                                                    {clase.archivos?.map((f: any) => (
                                                        <div key={f.archivo_id} className="group/file relative flex items-center gap-1 bg-white border border-gray-100 px-2 py-1 rounded-lg text-[9px] font-bold shadow-sm">
                                                            <a href={`/storage/${f.path}`} target="_blank" className="text-indigo-600 hover:underline">{f.nombre}</a>
                                                            <button 
                                                                onClick={() => deleteArchivo(f.archivo_id)}
                                                                className="size-4 rounded-full bg-rose-50 text-rose-500 opacity-0 group-hover/file:opacity-100 transition-opacity"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => renameClase(clase.clase_id, clase.titulo)}
                                                    className="size-8 rounded-full text-gray-400 hover:text-indigo-600"
                                                >
                                                    <Edit3 size={14} />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => deleteClase(clase.clase_id)}
                                                    className="size-8 rounded-full text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
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

    const handleDeleteAnuncio = async (id: number) => {
        if (!confirm('¿Seguro que quieres eliminar este anuncio?')) return;
        await api.delete(`/docente/anuncios/${id}`);
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
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">A</div>
                                        <div>
                                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Publicado por ti</p>
                                            <p className="text-[10px] font-bold text-gray-400 capitalize">{new Date(anuncio.created_at).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDeleteAnuncio(anuncio.id)}
                                        className="text-gray-300 hover:text-red-500 rounded-full"
                                    >
                                        ✕
                                    </Button>
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

function CalificacionesTab({ docenteCursoId }: any) {
    const [view, setView] = useState<'manage' | 'grades'>('manage');
    const [selectedGrade, setSelectedGrade] = useState<any>(null);
    const [gradematrix, setGradeMatrix] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (view === 'grades') {
            loadGrades();
        }
    }, [view]);

    const loadGrades = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/docente/curso/${docenteCursoId}/calificaciones`);
            setGradeMatrix(res.data);
        } finally {
            setLoading(false);
        }
    };

    const saveGrade = async () => {
        setSaving(true);
        try {
            await api.post(`/actividades/${selectedGrade.actividad_id}/calificar`, {
                notas: [
                    {
                        estu_id: selectedGrade.estu_id,
                        nota: selectedGrade.nota,
                        obs: selectedGrade.observacion
                    }
                ]
            });
            setSelectedGrade(null);
            loadGrades();
        } finally {
            setSaving(false);
        }
    };

    const addActividad = (claseId: number, tipoId: number) => {
        const nombre = prompt(tipoId === 2 ? 'Nombre del Examen:' : (tipoId === 3 ? 'Nombre del Cuestionario:' : 'Nombre de la tarea:'));
        if (!nombre) return;
        api.post('/actividades', { id_clase_curso: claseId, nombre_actividad: nombre, id_tipo_actividad: tipoId })
            .then(() => window.location.reload()); // Simplificado para refrescar todo
    };

    const downloadExcel = () => {
        window.open(`/api/docente/curso/${docenteCursoId}/exportar-excel`, '_blank');
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Evaluaciones & Calificaciones</h2>
                        <p className="text-gray-500 text-sm">Gestiona tareas, exámenes y el registro oficial de notas.</p>
                    </div>
                    {view === 'grades' && (
                        <Button 
                            onClick={downloadExcel}
                            className="rounded-2xl h-12 px-6 bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-emerald-100 animate-in fade-in zoom-in-95"
                        >
                            <Download size={16} /> Exportar Excel
                        </Button>
                    )}
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
                <div className="py-10 text-center opacity-30">
                    <BarChart3 size={64} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">Usa la pestaña Contenido para crear actividades</p>
                </div>
            ) : (
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center animate-pulse font-black text-indigo-400 uppercase tracking-[0.2em] text-xs">Generando Sábana de Notas...</div>
                    ) : gradematrix ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="p-6 sticky left-0 bg-gray-50 z-10">Estudiante</th>
                                        {gradematrix.actividades.map((a: any) => (
                                            <th key={a.id} className="p-6 text-center border-l border-gray-100 min-w-[120px]">{a.nombre}</th>
                                        ))}
                                        <th className="p-6 text-center border-l bg-indigo-50/50 text-indigo-600 min-w-[80px]">PROM.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {gradematrix.estudiantes.map((e: any) => (
                                        <tr key={e.estu_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-6 sticky left-0 bg-white group-hover:bg-gray-50 font-bold text-gray-700 text-sm">{e.nombre}</td>
                                            {e.notas.map((n: any) => {
                                                const actividad = gradematrix.actividades.find((a: any) => a.id === n.actividad_id);
                                                return (
                                                    <td 
                                                        key={n.actividad_id} 
                                                        className="p-6 text-center border-l border-gray-100 cursor-pointer hover:bg-indigo-50/50 transition-colors"
                                                        onClick={() => setSelectedGrade({
                                                            ...n,
                                                            estu_id: e.estu_id,
                                                            nombre_student: e.nombre,
                                                            nombre_activity: actividad?.nombre
                                                        })}
                                                    >
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`text-sm font-black p-2 rounded-xl min-w-[36px] ${n.nota ? (parseInt(n.nota) >= 11 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50') : 'text-gray-200'}`}>
                                                                {n.nota || '-'}
                                                            </span>
                                                            {n.entregado && (
                                                                <div className="size-2 rounded-full bg-blue-500 shadow-sm" title="Tarea Entregada" />
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                            <td className="p-6 text-center border-l bg-indigo-50/10 font-black text-indigo-700">{e.promedio}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-20 text-center">No hay datos disponibles</div>
                    )}
                </Card>
            )}

            {/* Modal de Calificación Rápida */}
            {selectedGrade && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-md rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedGrade.nombre_activity}</p>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">{selectedGrade.nombre_student}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Calificación (0-20)</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="20"
                                    value={selectedGrade.nota}
                                    onChange={(e) => setSelectedGrade({...selectedGrade, nota: e.target.value})}
                                    className="w-full h-16 bg-gray-50 border-none rounded-2xl px-6 text-2xl font-black text-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
                                    placeholder="--"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Observación / Feedback</label>
                                <textarea 
                                    value={selectedGrade.observacion}
                                    onChange={(e) => setSelectedGrade({...selectedGrade, observacion: e.target.value})}
                                    className="w-full min-h-[100px] bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold text-gray-600 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                                    placeholder="Escribe un comentario para el estudiante..."
                                />
                            </div>
                        </div>

                        {selectedGrade.entregado && (
                            <div className="p-4 bg-blue-50 rounded-2xl flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-700">El alumno entregó un archivo</span>
                                <a href={`/storage/${selectedGrade.archivo_entrega}`} target="_blank" className="text-[10px] font-black uppercase text-blue-600 hover:underline">Descargar</a>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button 
                                variant="ghost" 
                                onClick={() => setSelectedGrade(null)}
                                className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-xs text-gray-400"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                onClick={saveGrade}
                                disabled={saving}
                                className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-xs bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                            >
                                {saving ? 'Guardando...' : 'Guardar Nota'}
                            </Button>
                        </div>
                    </Card>
                </div>
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
    const [view, setView] = useState<'mark' | 'general'>('mark');
    const [matrixData, setMatrixData] = useState<any>(null);

    useEffect(() => {
        if (view === 'mark') {
            loadBasicAttendanceData();
        } else {
            loadMatrix();
        }
    }, [view, docenteCursoId]);

    const loadBasicAttendanceData = () => {
        setLoading(true);
        Promise.all([
            api.get(`/docente/curso/${docenteCursoId}/alumnos`),
            api.get(`/docente/curso/${docenteCursoId}/contenido`)
        ]).then(([alRes, clRes]) => {
            setAlumnos(alRes.data);
            const allClases = clRes.data.flatMap((u: any) => u.clases);
            setClases(allClases);
            setLoading(false);
        });
    };

    const loadMatrix = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/docente/curso/${docenteCursoId}/asistencia-matrix`);
            setMatrixData(res.data);
        } finally {
            setLoading(false);
        }
    };

    const [scanning, setScanning] = useState(false);

    const startScanner = () => {
        setScanning(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(onScanSuccess, onScanError);
        }, 100);
    };

    const onScanSuccess = (decodedText: string) => {
        const student = alumnos.find(a => 
            a.perfil?.doc_numero === decodedText || 
            a.estu_id?.toString() === decodedText
        );

        if (student) {
            setAsistencias(prev => ({ ...prev, [student.estu_id]: 'P' }));
            // Using a simple alert for now as per current project pattern
            alert(`Marcado: ${student.perfil?.primer_nombre} ${student.perfil?.apellido_paterno}`);
        } else {
            alert(`Código no reconocido: ${decodedText}`);
        }
        setScanning(false);
    };

    const onScanError = (err: any) => {};

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
                    <p className="text-gray-500 text-sm">Registra o monitorea la presencia de tus alumnos.</p>
                </div>
                <div className="flex p-1.5 bg-gray-100 rounded-[1.5rem]">
                    <Button 
                        variant="ghost" 
                        onClick={() => setView('mark')}
                        className={`rounded-2xl text-[10px] font-black uppercase px-6 h-10 ${view === 'mark' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                    >
                        Pasar Lista
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setView('general')}
                        className={`rounded-2xl text-[10px] font-black uppercase px-6 h-10 ${view === 'general' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                    >
                        General
                    </Button>
                </div>
            </div>

            {view === 'mark' ? (
                <>
                    {scanning && (
                        <Card className="rounded-[2rem] border-none shadow-2xl p-6 relative overflow-hidden bg-white mb-6 animate-in zoom-in-95 duration-300">
                            <div className="text-center mb-4">
                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Escaneando Credencial...</p>
                            </div>
                            <div id="reader" className="w-full max-w-sm mx-auto shadow-inner rounded-2xl overflow-hidden border-4 border-gray-50"></div>
                            <Button variant="ghost" onClick={() => setScanning(false)} className="absolute top-4 right-4 text-gray-400">Cerrar ✕</Button>
                        </Card>
                    )}

                    <div className="flex items-center gap-3">
                        <Button onClick={startScanner} variant="outline" className="rounded-2xl h-12 px-6 border-indigo-100 text-indigo-600 font-bold gap-2 hover:bg-indigo-50">
                            <QrCode size={18} /> Escanear QR
                        </Button>
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
                </>
            ) : (
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    {matrixData ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="p-6 sticky left-0 bg-gray-50 z-10">Estudiante</th>
                                        {matrixData.sesiones.map((s: any) => (
                                            <th key={s.id} className="p-6 text-center border-l border-gray-100 min-w-[100px]">
                                                {new Date(s.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {matrixData.estudiantes.map((e: any) => (
                                        <tr key={e.estu_id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-6 sticky left-0 bg-white group-hover:bg-gray-50 font-bold text-gray-700 text-sm border-r border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                                {e.nombre}
                                            </td>
                                            {matrixData.sesiones.map((s: any) => {
                                                const reg = e.registros.find((r: any) => r.id_asistencia_clase === s.id);
                                                const status = reg?.estado || '-';
                                                const colors: any = { 'P': 'text-emerald-600 bg-emerald-50', 'F': 'text-rose-600 bg-rose-50', 'T': 'text-amber-600 bg-amber-50', 'J': 'text-indigo-600 bg-indigo-50', '-': 'text-gray-200' };
                                                
                                                return (
                                                    <td key={s.id} className="p-6 text-center border-l border-gray-100">
                                                        <span className={`inline-flex items-center justify-center size-8 rounded-xl font-black text-[11px] ${colors[status]}`}>
                                                            {status === 'P' ? '✓' : (status === 'F' ? '✕' : (status === 'T' ? '🕒' : (status === 'J' ? '⚓' : '-')))}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-20 text-center text-gray-400 font-bold">Cargando historial...</div>
                    )}
                </Card>
            )}
        </div>
    );
}

function AlumnosTab({ docenteCursoId }: any) {
    const [loading, setLoading] = useState(true);
    const [alumnos, setAlumnos] = useState<any[]>([]);
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
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input 
                        placeholder="Buscar alumno..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-11 h-12 rounded-2xl border-none shadow-sm bg-white font-bold w-64"
                    />
                </div>
            </div>

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

function ConfiguracionTab({ docenteCursoId }: { docenteCursoId: number }) {
    const [settings, setSettings] = useState<any>({ weights: {} });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const activityTypes = [
        { id: 1, name: 'Tareas' },
        { id: 2, name: 'Exámenes' },
        { id: 3, name: 'Cuestionarios' },
        { id: 5, name: 'Dibujos' },
        { id: 6, name: 'Puzzles' },
    ];

    useEffect(() => {
        api.get(`/docente/curso/${docenteCursoId}/contenido`).then(() => { // Dummy call to satisfy any needed context or just use a direct settings call
            api.get(`/docente/mis-cursos`).then(res => {
                const current = res.data.find((c: any) => c.docen_curso_id === docenteCursoId);
                if (current?.settings) {
                    setSettings(current.settings);
                }
                setLoading(false);
            });
        });
    }, [docenteCursoId]);

    const handleWeightChange = (typeId: number, value: string) => {
        const numValue = parseInt(value) || 0;
        setSettings({
            ...settings,
            weights: {
                ...settings.weights,
                [typeId]: numValue
            }
        });
    };

    const saveSettings = async () => {
        const total = Object.values(settings.weights).reduce((acc: number, val: any) => acc + (parseInt(val) || 0), 0);
        if (total !== 100 && total !== 0) {
            alert(`La suma de los pesos debe ser 100%. Actual: ${total}%`);
            return;
        }

        setSaving(true);
        try {
            await api.put(`/docente/curso/${docenteCursoId}/settings`, { settings });
            alert("Configuración guardada correctamente");
        } catch (error) {
            alert("Error al guardar la configuración");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-indigo-400 font-black uppercase text-[10px]">Cargando configuración...</div>;

    const totalWeight = Object.values(settings.weights).reduce((acc: number, val: any) => acc + (parseInt(val) || 0), 0);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Configuración del Curso</h2>
                    <p className="text-gray-500 text-sm">Personaliza el sistema de calificación y preferencias.</p>
                </div>
                <Button 
                    onClick={saveSettings} 
                    disabled={saving}
                    className="rounded-2xl h-12 px-8 bg-indigo-600 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100"
                >
                    {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-[2.5rem] border-none shadow-sm p-10 space-y-8 bg-white">
                    <div className="flex items-center gap-4 text-indigo-600">
                        <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 leading-none">Sistema de Pesos</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Calificación Ponderada</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {activityTypes.map(type => (
                            <div key={type.id} className="flex items-center justify-between group">
                                <span className="font-bold text-gray-600 group-hover:text-indigo-600 transition-colors">{type.name}</span>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={settings.weights?.[type.id] || ''}
                                        onChange={(e) => handleWeightChange(type.id, e.target.value)}
                                        placeholder="0"
                                        className="w-20 h-12 bg-gray-50 border-none rounded-xl text-center font-black text-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
                                    />
                                    <span className="text-gray-400 font-black">%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                        <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Total</span>
                        <div className={`text-xl font-black ${totalWeight === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {totalWeight}%
                        </div>
                    </div>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-sm p-10 space-y-8 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Settings size={120} />
                    </div>
                    
                    <div className="flex items-center gap-4 text-indigo-600">
                        <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 leading-none">Preferencias</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Visualización y Acceso</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                            <div>
                                <p className="font-bold text-gray-900">Visibilidad del Curso</p>
                                <p className="text-[10px] font-bold text-gray-400">Ocultar contenido a alumnos</p>
                            </div>
                            <div className="size-12 rounded-full bg-gray-100 border-4 border-white shadow-inner" />
                        </div>
                        <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                            <div>
                                <p className="font-bold text-gray-900">Cerrar Calificaciones</p>
                                <p className="text-[10px] font-bold text-gray-400">Bloquear edición de notas</p>
                            </div>
                            <div className="size-12 rounded-full bg-gray-100 border-4 border-white shadow-inner" />
                        </div>
                    </div>

                    <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Nota Informativa</p>
                        <p className="text-blue-800 text-xs font-bold leading-relaxed">
                            Si el total de pesos es **0%**, el sistema calculará un promedio simple de todas las actividades.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
