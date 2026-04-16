import { Head, router } from '@inertiajs/react';
import { ArrowLeft, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import FotocheckModal from '../Shared/components/FotocheckModal';
import HistorialModal from './components/HistorialModal';
import MatricularModal from './components/MatricularModal';
import ResetUserModal from './components/ResetUserModal';
import MatriculaTable from './components/MatriculaTable';
import MatriculaCards from './components/MatriculaCards';
import { useNivelEstudiantes } from './hooks/useNivelEstudiantes';
import type { BreadcrumbItem } from '@/types';

type Props = { aperturaId: number; nivelId: number };

export default function NivelEstudiantes({ aperturaId, nivelId }: Props) {
    const {
        apertura, nivelNombre, matriculas, filteredMatriculas, disponibles, loading, toggling,
        secciones, grados, search, setSearch, studentName,
        modalOpen, setModalOpen,
        editModalOpen, setEditModalOpen, editingMatricula,
        deletingId, setDeletingId,
        historialOpen, setHistorialOpen, historialUserId, historialNombre,
        resetOpen, setResetOpen, resetUserId, resetNombre,
        editEstOpen, setEditEstOpen, editEstudiante, editEstApiErrors,
        fotoOpen, setFotoOpen, selectedMatricula,
        handleMatricular, handleAnular, handleToggleBloqueo,
        openHistorial, openEditEst, handleSaveEstudiante, openReset, openFotocheck,
    } = useNivelEstudiantes(aperturaId, nivelId);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard',          href: '/dashboard' },
        { title: 'Gestión Matrículas', href: '/matriculas/gestion' },
        { title: nivelNombre || 'Nivel', href: '#' },
    ];

    const tableProps = {
        matriculas: filteredMatriculas,
        toggling,
        onToggleBloqueo: handleToggleBloqueo,
        onEdit: openEditEst,
        onHistorial: openHistorial,
        onReset: openReset,
        onFotocheck: openFotocheck,
        onDelete: setDeletingId,
    };

    return (
        <>
            <Head title={`Matriculados — ${nivelNombre}`} />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-4 p-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" className="hidden sm:flex gap-1 text-neutral-500 hover:text-neutral-800" onClick={() => router.visit('/matriculas/gestion')}>
                                <ArrowLeft className="h-4 w-4" /> Volver
                            </Button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-neutral-950 leading-tight">
                                    {nivelNombre ? `Matriculados: ${nivelNombre} ${apertura?.anio ?? ''}` : 'Cargando…'}
                                </h1>
                                <p className="text-sm text-neutral-500 flex items-center gap-2">
                                    <span className="hidden sm:inline">{apertura?.nombre} ·</span>
                                    <span className="font-semibold text-emerald-600">
                                        {filteredMatriculas.length}{search ? ` de ${matriculas.length}` : ''} alumnos
                                    </span>
                                </p>
                            </div>
                        </div>
                        <Button onClick={() => setModalOpen(true)} className="w-full sm:w-auto bg-[#00a65a] hover:bg-[#008d4c] text-white gap-2 shadow-lg shadow-emerald-100">
                            <UserPlus className="h-4 w-4" /> Matricular Alumno
                        </Button>
                    </div>

                    {/* Buscador */}
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, DNI, grado..."
                            className="w-full pl-9 pr-4 h-10 rounded-xl border border-neutral-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        />
                    </div>

                    {/* Tabla */}
                    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3">
                                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-neutral-400 animate-pulse font-medium">Cargando lista…</p>
                            </div>
                        ) : matriculas.length === 0 ? (
                            <div className="py-24 text-center px-6">
                                <div className="bg-neutral-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserPlus className="h-8 w-8 text-neutral-400" />
                                </div>
                                <p className="text-base font-semibold text-neutral-900">Sin alumnos matriculados</p>
                                <p className="text-sm text-neutral-400 max-w-xs mx-auto mt-1">No hay alumnos en {nivelNombre} para este periodo.</p>
                            </div>
                        ) : filteredMatriculas.length === 0 ? (
                            <div className="py-24 text-center px-6">
                                <Search className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                                <p className="text-base font-semibold text-neutral-900">Sin resultados</p>
                                <p className="text-sm text-neutral-400 mt-1">No se encontraron alumnos con "{search}".</p>
                            </div>
                        ) : (
                            <>
                                <MatriculaTable {...tableProps} />
                                <MatriculaCards {...tableProps} />
                            </>
                        )}
                    </div>
                </div>
            </AppLayout>

            {/* Modals */}
            <MatricularModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aperturaId={aperturaId}
                anio={apertura?.anio ?? new Date().getFullYear()}
                secciones={secciones}
                grados={grados}
                nivelId={nivelId}
                onSave={handleMatricular}
                apiErrors={{}}
                clearErrors={() => {}}
            />

            {/* Modal editar estudiante — mismo modal con datos pre-cargados */}
            <MatricularModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                aperturaId={aperturaId}
                anio={apertura?.anio ?? new Date().getFullYear()}
                secciones={secciones}
                grados={grados}
                nivelId={nivelId}
                onSave={handleMatricular}
                apiErrors={{}}
                clearErrors={() => {}}
                editingMatricula={editingMatricula}
            />

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

            <ConfirmDeleteModal
                open={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleAnular}
                title="Anular Matrícula"
                message={`¿Anular la matrícula de ${studentName}? Esta acción no se puede deshacer.`}
            />
        </>
    );
}
