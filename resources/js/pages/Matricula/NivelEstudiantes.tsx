import { Head, router } from '@inertiajs/react';
import { ArrowLeft, UserPlus, Lock, Unlock, Pencil, Printer, History, Trash2, KeyRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { Button } from '@/components/ui/button';
import { useOptions } from '@/hooks/useOptions';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import EstudianteFormModal from '../GestionAlumnos/components/EstudianteFormModal';
import type { Estudiante, EstudianteFormData } from '../GestionAlumnos/hooks/useEstudiantes';
import FotocheckModal from '../Shared/components/FotocheckModal';
import HistorialModal from './components/HistorialModal';
import MatricularModal from './components/MatricularModal';
import ResetUserModal from './components/ResetUserModal';
import type {
    Matricula,
    MatriculaApertura,
    EstudianteDisponible,
    SeccionOption,
    GradoOption,
    MatriculaFormData,
} from './hooks/useMatricula';

type Props = {
    aperturaId: number;
    nivelId:    number;
};

export default function NivelEstudiantes({ aperturaId, nivelId }: Props) {
    const secciones = useOptions<SeccionOption>('/secciones');
    const grados = useOptions<GradoOption>('/grados');

    const [apertura, setApertura]       = useState<MatriculaApertura | null>(null);
    const [nivelNombre, setNivelNombre] = useState<string>('');
    const [matriculas, setMatriculas]   = useState<Matricula[]>([]);
    const [disponibles, setDisponibles] = useState<EstudianteDisponible[]>([]);
    const [loading, setLoading]         = useState(false);
    const [modalOpen, setModalOpen]     = useState(false);
    const [toggling, setToggling]       = useState<number | null>(null);
    const [deletingId, setDeletingId]   = useState<number | null>(null);

    // Historial modal
    const [historialOpen, setHistorialOpen]     = useState(false);
    const [historialUserId, setHistorialUserId] = useState<number | null>(null);
    const [historialNombre, setHistorialNombre] = useState('');

    // Reset credenciales modal
    const [resetOpen, setResetOpen]     = useState(false);
    const [resetUserId, setResetUserId] = useState<number | null>(null);
    const [resetNombre, setResetNombre] = useState('');

    // Editar estudiante modal
    const [editEstOpen, setEditEstOpen]       = useState(false);
    const [editEstudiante, setEditEstudiante] = useState<Estudiante | null>(null);
    const [editEstApiErrors, setEditEstApiErrors] = useState<Record<string, string[]>>({});

    // Fotocheck modal
    const [fotoOpen, setFotoOpen]   = useState(false);
    const [selectedMatricula, setSelectedMatricula] = useState<Matricula | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard',           href: '/dashboard' },
        { title: 'Gestión Matrículas',  href: '/matriculas/gestion' },
        { title: nivelNombre || 'Nivel', href: '#' },
    ];

    const cargar = useCallback(async () => {
        setLoading(true);

        try {
            const [matRes, dispRes, aperRes, nivelRes] = await Promise.all([
                api.get(`/matriculas/aperturas/${aperturaId}/estudiantes`, {
                    params: { per_page: 500, nivel_id: nivelId },
                }),
                api.get(`/matriculas/aperturas/${aperturaId}/disponibles`),
                api.get(`/matriculas/aperturas/${aperturaId}`),
                api.get(`/niveles/${nivelId}`),
            ]);
            setMatriculas(matRes.data.data ?? []);
            setDisponibles(dispRes.data ?? []);
            setApertura(aperRes.data.data ?? aperRes.data);
            setNivelNombre(nivelRes.data.data?.nombre_nivel ?? nivelRes.data?.nombre_nivel ?? '');
        } finally {
            setLoading(false);
        }
    }, [aperturaId, nivelId]);

    useEffect(() => {
 cargar(); 
}, [cargar]);

    const handleMatricular = async (data: MatriculaFormData) => {
        await api.post('/matriculas/', data);
        await cargar();
    };

    const handleAnular = async () => {
        if (!deletingId) {
return;
}

        setLoading(true);

        try {
            await api.delete(`/matriculas/${deletingId}`);
            setDeletingId(null);
            await cargar();
        } finally {
            setLoading(false);
        }
    };

    const deletingMatricula = matriculas.find(m => m.matricula_id === deletingId);
    const studentName = deletingMatricula?.estudiante 
        ? `${deletingMatricula.estudiante.primer_nombre} ${deletingMatricula.estudiante.apellido_paterno}`
        : 'este alumno';


    const handleToggleBloqueo = async (m: Matricula) => {
        if (!m.estudiante?.user_id) {
return;
}

        setToggling(m.matricula_id);

        try {
            await api.patch(`/usuarios/${m.estudiante.user_id}/estado`);
            setMatriculas(prev => prev.map(item =>
                item.matricula_id === m.matricula_id && item.estudiante
                    ? { ...item, estudiante: { ...item.estudiante, estado_user: item.estudiante.estado_user === '5' ? '1' : '5' } }
                    : item
            ));
        } finally {
            setToggling(null);
        }
    };

    const openHistorial = (m: Matricula) => {
        if (!m.estudiante?.user_id) {
return;
}

        const nombre = [m.estudiante.primer_nombre, m.estudiante.apellido_paterno].filter(Boolean).join(' ');
        setHistorialUserId(m.estudiante.user_id);
        setHistorialNombre(nombre);
        setHistorialOpen(true);
    };

    const openEditEst = async (m: Matricula) => {
        if (!m.estudiante?.estu_id) {
return;
}

        const res = await api.get(`/estudiantes/${m.estudiante.estu_id}`);
        setEditEstudiante(res.data.data ?? res.data);
        setEditEstOpen(true);
    };

    const handleSaveEstudiante = async (data: EstudianteFormData) => {
        if (!editEstudiante) {
return;
}

        try {
            await api.put(`/estudiantes/${editEstudiante.estu_id}`, data);
            setEditEstOpen(false);
            setEditEstudiante(null);
            await cargar();
        } catch (e: any) {
            setEditEstApiErrors(e?.response?.data?.errors ?? {});
        }
    };

    const openReset = (m: Matricula) => {
        if (!m.estudiante?.user_id) {
return;
}

        const nombre = [m.estudiante.primer_nombre, m.estudiante.apellido_paterno].filter(Boolean).join(' ');
        setResetUserId(m.estudiante.user_id);
        setResetNombre(nombre);
        setResetOpen(true);
    };

    const openFotocheck = (m: Matricula) => {
        if (!m.estu_id) return;
        setSelectedMatricula(m);
        setFotoOpen(true);
    };

    return (
        <>
            <Head title={`Matriculados — ${nivelNombre}`} />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 p-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden sm:flex gap-1 text-neutral-500 hover:text-neutral-800"
                                onClick={() => router.visit('/matriculas/gestion')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-neutral-950 leading-tight">
                                    {nivelNombre
                                        ? `Lista de Matriculados: ${nivelNombre} ${apertura?.anio ?? ''}`
                                        : 'Cargando…'}
                                </h1>
                                <p className="text-sm text-neutral-500 flex items-center gap-2">
                                    <span className="hidden sm:inline">{apertura?.nombre} ·</span>
                                    <span className="font-semibold text-emerald-600 truncate">{matriculas.length} alumnos</span>
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setModalOpen(true)}
                            className="w-full sm:w-auto bg-[#00a65a] hover:bg-[#008d4c] text-white gap-2 shadow-lg shadow-emerald-100"
                        >
                            <UserPlus className="h-4 w-4" />
                            Matricular Alumno
                        </Button>
                    </div>

                    {/* Lista / Tabla de estudiantes */}
                    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3">
                                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm text-neutral-400 animate-pulse font-medium">Cargando lista…</p>
                            </div>
                        ) : matriculas.length === 0 ? (
                            <div className="py-24 text-center px-6">
                                <div className="bg-neutral-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserPlus className="h-8 w-8 text-neutral-400" />
                                </div>
                                <p className="text-base font-semibold text-neutral-900">Sin alumnos matriculados</p>
                                <p className="text-sm text-neutral-400 max-w-xs mx-auto mt-1">
                                    No hay alumnos registrados en {nivelNombre} para este periodo.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Vista Tableta / Escritorio (Scroll horizontal si es necesario) */}
                                <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[60vh]">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 z-10">
                                            <tr className="bg-[#00a65a]">
                                                <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">#</th>
                                                <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Grado / Sección</th>
                                                <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase lg:hidden">Nombre Completo</th>
                                                <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase lg:table-cell hidden">Primer Nombre</th>
                                                <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase xl:table-cell hidden">Segundo Nombre</th>
                                                <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase lg:table-cell hidden">Ap. Paterno</th>
                                                <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase xl:table-cell hidden">Ap. Materno</th>
                                                <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">DNI</th>
                                                <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase hidden lg:table-cell">Matriculado</th>
                                                <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Estado</th>
                                                <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase w-[220px]">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {matriculas.map((m, idx) => {
                                                const bloqueado = m.estudiante?.estado_user === '5';
                                                const student = m.estudiante;

                                                return (
                                                    <tr
                                                        key={m.matricula_id}
                                                        className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${bloqueado ? 'bg-red-50' : ''}`}
                                                    >
                                                        <td className="px-4 py-4 text-center text-neutral-400 font-mono text-xs">{idx + 1}</td>
                                                        <td className="px-4 py-4 text-center">
                                                            {m.seccion ? (
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-neutral-900 leading-tight">
                                                                        {m.seccion.grado?.nombre_grado ?? '—'}
                                                                    </span>
                                                                    <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full inline-block mt-1 mx-auto">
                                                                        Secc. {m.seccion.nombre}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="italic text-neutral-400 text-xs italic">Sin sección</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 text-center lg:hidden">
                                                            <div className="font-bold text-neutral-900 capitalize leading-tight">
                                                                {student?.primer_nombre} {student?.apellido_paterno}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center lg:table-cell hidden capitalize">{student?.primer_nombre ?? '—'}</td>
                                                        <td className="px-4 py-4 text-center text-neutral-500 xl:table-cell hidden capitalize">{student?.segundo_nombre ?? '—'}</td>
                                                        <td className="px-4 py-4 text-center font-bold text-neutral-900 lg:table-cell hidden capitalize">{student?.apellido_paterno ?? '—'}</td>
                                                        <td className="px-4 py-4 text-center text-neutral-500 xl:table-cell hidden capitalize">{student?.apellido_materno ?? '—'}</td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="font-mono text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                                                                {student?.doc_numero ?? '—'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-xs text-neutral-500 hidden lg:table-cell">
                                                            {m.fecha_matricula ?? '—'}
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            {student?.user_id ? (
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className={`h-9 w-9 p-0 rounded-full ${bloqueado ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-emerald-600 hover:bg-emerald-100'}`}
                                                                        onClick={() => handleToggleBloqueo(m)}
                                                                        disabled={toggling === m.matricula_id}
                                                                        title={bloqueado ? 'Desbloquear acceso' : 'Bloquear acceso'}
                                                                    >
                                                                        {bloqueado ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                                                    </Button>
                                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${bloqueado ? 'text-red-500' : 'text-emerald-500'}`}>
                                                                        {bloqueado ? 'Cerrado' : 'Activo'}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] bg-neutral-100 text-neutral-400 px-2 py-1 rounded-full uppercase font-bold">Sin cuenta</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                                                                    title="Imprimir Fotocheck"
                                                                    onClick={() => openFotocheck(m)}
                                                                >
                                                                    <Printer className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <div className="w-px h-4 bg-neutral-200 mx-1" />
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0 text-indigo-500 hover:bg-indigo-50"
                                                                    title="Ver / Editar"
                                                                    onClick={() => openEditEst(m)}
                                                                    disabled={!student?.estu_id}
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0 text-cyan-600 hover:bg-cyan-50"
                                                                    title="Accesos"
                                                                    onClick={() => openHistorial(m)}
                                                                    disabled={!student?.user_id}
                                                                >
                                                                    <History className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50"
                                                                    title="Reset Clave"
                                                                    onClick={() => openReset(m)}
                                                                    disabled={!student?.user_id}
                                                                >
                                                                    <KeyRound className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <div className="w-px h-4 bg-neutral-200 mx-1" />
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                                                    title="Anular"
                                                                    onClick={() => setDeletingId(m.matricula_id)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Vista Móvil (Cards) */}
                                <div className="md:hidden divide-y divide-neutral-100 overflow-y-auto max-h-[70vh]">
                                    {matriculas.map((m, idx) => {
                                        const student = m.estudiante;
                                        const bloqueado = student?.estado_user === '5';

                                        return (
                                            <div key={m.matricula_id} className={`p-4 flex flex-col gap-3 transition-colors ${bloqueado ? 'bg-red-50' : 'bg-white'}`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex gap-3">
                                                        <div className="bg-neutral-100 text-neutral-500 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <h3 className="font-bold text-neutral-900 capitalize leading-tight">
                                                                {student?.primer_nombre} {student?.apellido_paterno}
                                                            </h3>
                                                            <p className="text-xs text-neutral-500 mt-1">
                                                                <span className="font-bold text-emerald-600 uppercase">
                                                                    {m.seccion?.grado?.nombre_grado ?? '—'}
                                                                </span>
                                                                {' • '}
                                                                Sección {m.seccion?.nombre ?? '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {student?.user_id && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className={`h-9 w-9 p-0 rounded-full border ${bloqueado ? 'border-red-200 bg-red-100 text-red-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`}
                                                            onClick={() => handleToggleBloqueo(m)}
                                                            disabled={toggling === m.matricula_id}
                                                        >
                                                            {bloqueado ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-neutral-400">DNI / Documento</span>
                                                        <span className="text-neutral-700 font-mono">{student?.doc_numero ?? '—'}</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-neutral-200" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-neutral-400">F. Matrícula</span>
                                                        <span className="text-neutral-700">{m.fecha_matricula ?? '—'}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-5 gap-2 mt-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-10 border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-0 flex flex-col items-center justify-center"
                                                        onClick={() => openFotocheck(m)}
                                                        title="Fotocheck"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" />
                                                        <span className="text-[9px] font-bold">Foto</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-10 border-neutral-200 text-neutral-600 p-0 flex flex-col items-center justify-center"
                                                        onClick={() => openEditEst(m)}
                                                        disabled={!student?.estu_id}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        <span className="text-[9px] font-bold">Editar</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-10 border-neutral-200 text-neutral-600 p-0 flex flex-col items-center justify-center"
                                                        onClick={() => openHistorial(m)}
                                                        disabled={!student?.user_id}
                                                    >
                                                        <History className="h-3.5 w-3.5" />
                                                        <span className="text-[9px] font-bold">Log</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-10 border-neutral-200 text-neutral-600 p-0 flex flex-col items-center justify-center"
                                                        onClick={() => openReset(m)}
                                                        disabled={!student?.user_id}
                                                    >
                                                        <KeyRound className="h-3.5 w-3.5" />
                                                        <span className="text-[9px] font-bold">Clave</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-10 border-red-100 bg-red-50 text-red-500 hover:bg-red-100 p-0 flex flex-col items-center justify-center"
                                                        onClick={() => setDeletingId(m.matricula_id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span className="text-[9px] font-bold">Anular</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </AppLayout>

            {apertura && (
                <MatricularModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    aperturaId={apertura.apertura_id}
                    nivelId={nivelId}
                    anio={apertura.anio}
                    estudiantes={disponibles}
                    grados={grados}
                    secciones={secciones}
                    onSave={handleMatricular}
                    apiErrors={{}}
                    clearErrors={() => {}}
                />
            )}

            <HistorialModal
                open={historialOpen}
                onClose={() => setHistorialOpen(false)}
                userId={historialUserId}
                nombre={historialNombre}
            />

            <ResetUserModal
                open={resetOpen}
                onClose={() => setResetOpen(false)}
                userId={resetUserId}
                nombre={resetNombre}
            />

            <FotocheckModal
                open={fotoOpen}
                onClose={() => setFotoOpen(false)}
                matricula={selectedMatricula}
            />

            <EstudianteFormModal
                open={editEstOpen}
                onClose={() => {
 setEditEstOpen(false); setEditEstudiante(null); setEditEstApiErrors({}); 
}}
                editing={editEstudiante}
                onSave={handleSaveEstudiante}
                apiErrors={editEstApiErrors}
                clearErrors={() => setEditEstApiErrors({})}
            />
            <ConfirmDeleteModal
                open={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleAnular}
                title="Anular Matrícula"
                message={`¿Estás seguro de que deseas anular la matrícula de ${studentName}? Esta acción eliminará el registro del periodo actual.`}
                processing={loading}
            />
        </>
    );
}

