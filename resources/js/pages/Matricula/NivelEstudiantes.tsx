import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, UserPlus, Lock, Unlock, Pencil, Printer, History, Trash2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import { useOptions } from '@/hooks/useOptions';
import MatricularModal from './components/MatricularModal';
import HistorialModal from './components/HistorialModal';
import ResetUserModal from './components/ResetUserModal';
import EstudianteFormModal from '../GestionAlumnos/components/EstudianteFormModal';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import type { Estudiante, EstudianteFormData } from '../GestionAlumnos/hooks/useEstudiantes';
import type {
    Matricula,
    MatriculaApertura,
    EstudianteDisponible,
    SeccionOption,
    GradoOption,
    MatriculaFormData,
} from './hooks/useMatricula';
import type { BreadcrumbItem } from '@/types';

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

    useEffect(() => { cargar(); }, [cargar]);

    const handleMatricular = async (data: MatriculaFormData) => {
        await api.post('/matriculas/', data);
        await cargar();
    };

    const handleAnular = async () => {
        if (!deletingId) return;
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
        if (!m.estudiante?.user_id) return;
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
        if (!m.estudiante?.user_id) return;
        const nombre = [m.estudiante.primer_nombre, m.estudiante.apellido_paterno].filter(Boolean).join(' ');
        setHistorialUserId(m.estudiante.user_id);
        setHistorialNombre(nombre);
        setHistorialOpen(true);
    };

    const openEditEst = async (m: Matricula) => {
        if (!m.estudiante?.estu_id) return;
        const res = await api.get(`/estudiantes/${m.estudiante.estu_id}`);
        setEditEstudiante(res.data.data ?? res.data);
        setEditEstOpen(true);
    };

    const handleSaveEstudiante = async (data: EstudianteFormData) => {
        if (!editEstudiante) return;
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
        if (!m.estudiante?.user_id) return;
        const nombre = [m.estudiante.primer_nombre, m.estudiante.apellido_paterno].filter(Boolean).join(' ');
        setResetUserId(m.estudiante.user_id);
        setResetNombre(nombre);
        setResetOpen(true);
    };

    return (
        <>
            <Head title={`Matriculados — ${nivelNombre}`} />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 p-6">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-neutral-500 hover:text-neutral-800"
                                onClick={() => router.visit('/matriculas/gestion')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-2xl font-black text-neutral-950">
                                    {nivelNombre
                                        ? `Lista de Matriculados para ${nivelNombre} del ${apertura?.anio ?? '…'}`
                                        : 'Cargando…'}
                                </h1>
                                <p className="text-sm text-neutral-500">
                                    {apertura ? apertura.nombre : '…'}
                                    {' · '}
                                    <span className="font-semibold text-emerald-600">{matriculas.length} alumnos</span>
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setModalOpen(true)}
                            disabled={false}
                            className="bg-[#00a65a] hover:bg-[#008d4c] text-white gap-2"
                        >
                            <UserPlus className="h-4 w-4" />
                            Matricular
                        </Button>
                    </div>

                    {/* Tabla de estudiantes */}
                    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                        {loading ? (
                            <p className="py-16 text-center text-sm text-neutral-400">Cargando…</p>
                        ) : matriculas.length === 0 ? (
                            <p className="py-16 text-center text-sm text-neutral-400">
                                No hay alumnos matriculados en este nivel.
                            </p>
                        ) : (
                            <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
                                <table className="w-full text-sm min-w-[1000px]">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-[#00a65a]">
                                            <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">#</th>
                                            <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Grado / Sección</th>
                                            <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Primer Nombre</th>
                                            <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Segundo Nombre</th>
                                            <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Ap. Paterno</th>
                                            <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Ap. Materno</th>
                                            <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">DNI</th>
                                            <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Matriculado</th>
                                            <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Bloquear</th>
                                            <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matriculas.map((m, idx) => {
                                            const bloqueado = m.estudiante?.estado_user === '5';
                                            return (
                                                <tr
                                                    key={m.matricula_id}
                                                    className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${bloqueado ? 'bg-red-50' : ''}`}
                                                >
                                                    <td className="px-4 py-3 text-center text-neutral-400">{idx + 1}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        {m.seccion ? (
                                                            <span className="font-medium">
                                                                {m.seccion.grado?.nombre_grado ?? '—'}
                                                                {' '}
                                                                <span className="text-neutral-500">{m.seccion.nombre}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="italic text-neutral-400">Sin sección</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{m.estudiante?.primer_nombre ?? '—'}</td>
                                                    <td className="px-4 py-3 text-center text-neutral-500">{m.estudiante?.segundo_nombre ?? '—'}</td>
                                                    <td className="px-4 py-3 text-center font-medium">{m.estudiante?.apellido_paterno ?? '—'}</td>
                                                    <td className="px-4 py-3 text-center text-neutral-500">{m.estudiante?.apellido_materno ?? '—'}</td>
                                                    <td className="px-4 py-3 text-center font-mono text-neutral-500">{m.estudiante?.doc_numero ?? '—'}</td>
                                                    <td className="px-4 py-3 text-center text-neutral-500">{m.fecha_matricula ?? '—'}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        {m.estudiante?.user_id ? (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className={`h-8 w-8 p-0 ${bloqueado ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                                                                onClick={() => handleToggleBloqueo(m)}
                                                                disabled={toggling === m.matricula_id}
                                                                title={bloqueado ? 'Desbloquear' : 'Bloquear'}
                                                            >
                                                                {bloqueado ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-neutral-300">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-cyan-500 hover:text-cyan-700"
                                                                title="Fotocheck (próximamente)"
                                                                disabled
                                                            >
                                                                <Printer className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                                                                title="Ver / Editar estudiante"
                                                                onClick={() => openEditEst(m)}
                                                                disabled={!m.estudiante?.estu_id}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-purple-500 hover:text-purple-700"
                                                                title="Historial de accesos"
                                                                onClick={() => openHistorial(m)}
                                                                disabled={!m.estudiante?.user_id}
                                                            >
                                                                <History className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-amber-500 hover:text-amber-700"
                                                                title="Resetear usuario/contraseña"
                                                                onClick={() => openReset(m)}
                                                                disabled={!m.estudiante?.user_id}
                                                            >
                                                                <KeyRound className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                                title="Anular matrícula"
                                                                onClick={() => setDeletingId(m.matricula_id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>

                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
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

            <EstudianteFormModal
                open={editEstOpen}
                onClose={() => { setEditEstOpen(false); setEditEstudiante(null); setEditEstApiErrors({}); }}
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

