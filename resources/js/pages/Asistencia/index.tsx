import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { CalendarDays, QrCode, Eye, GraduationCap, UserCheck, FileSpreadsheet } from 'lucide-react';
import ResourcePage from '@/components/shared/ResourcePage';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';
import { usePermission } from '@/hooks/usePermission';
import HistorialModal from './components/HistorialModal';
import ExportModal from './components/ExportModal';
import { useAsistencia } from './hooks/useAsistencia';
import { useHistorialAsistencia } from './hooks/useHistorialAsistencia';
import type { Usuario } from './hooks/useAsistencia';
import type { Column } from '@/components/shared/ResourceTable';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Asistencia', href: '/asistencia' },
];

export default function AsistenciaIndex() {
    const [showExportModal, setShowExportModal] = useState(false);
    const { can } = usePermission();
    
    const {
        tipo,
        search,
        allUsers,
        loading,
        hasMore,
        totalCount,
        scrollContainerRef,
        handleScroll,
        setSearch,
        changeTipo,
    } = useAsistencia();

    const {
        showModal,
        selectedUser,
        openHistory,
        closeModal,
    } = useHistorialAsistencia(tipo);

    const columns: Column<Usuario>[] = [
        {
            label: 'DNI',
            render: (user) => (
                <span className="font-mono text-indigo-600">
                    {user.perfil?.doc_numero}
                </span>
            ),
        },
        {
            label: 'Apellidos',
            render: (user) => (
                <span className="font-bold text-neutral-900 uppercase text-sm">
                    {user.perfil?.apellido_paterno} {user.perfil?.apellido_materno}
                </span>
            ),
        },
        {
            label: 'Nombres',
            render: (user) => (
                <span className="font-bold text-neutral-900 uppercase text-sm">
                    {user.perfil?.primer_nombre}
                </span>
            ),
        },
    ];

    return (
        <>
            <Head title="Gestión de Asistencia" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Gestión de Asistencia"
                subtitle={totalCount > 0 ? `${totalCount} registros` : 'Administración y control de accesos'}
                icon={CalendarDays}
                iconColor="bg-indigo-600"
                search={search}
                onSearch={setSearch}
            >
                {/* Filtro de tipo y botón scanner */}
                <div className="mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200 w-full sm:w-auto">
                        <button 
                            onClick={() => changeTipo('E')}
                            className={`flex-1 sm:flex-none sm:px-6 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                                tipo === 'E' 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'text-neutral-500 hover:bg-neutral-200'
                            }`}
                        >
                            <GraduationCap className="h-4 w-4" /> Estudiantes
                        </button>
                        <button 
                            onClick={() => changeTipo('D')}
                            className={`flex-1 sm:flex-none sm:px-6 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                                tipo === 'D' 
                                    ? 'bg-amber-600 text-white' 
                                    : 'text-neutral-500 hover:bg-neutral-200'
                            }`}
                        >
                            <UserCheck className="h-4 w-4" /> Docentes
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {can('asistencia.reportes.exportar') && (
                            <Button 
                                onClick={() => setShowExportModal(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all gap-2"
                            >
                                <FileSpreadsheet className="h-5 w-5" />
                                <span className="hidden sm:inline">Exportar Excel</span>
                                <span className="sm:hidden">Excel</span>
                            </Button>
                        )}
                        
                        {can('asistencia.scanner.ver') && (
                            <Link href="/asistencia/scanner">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all gap-2">
                                    <QrCode className="h-5 w-5" />
                                    <span className="hidden sm:inline">Escáner QR</span>
                                    <span className="sm:hidden">QR</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Tabla con scroll infinito */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                    {/* Vista Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <div 
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="overflow-y-auto max-h-[600px] rounded-lg"
                        >
                            <table className="w-full text-sm border-separate border-spacing-0">
                                <thead className="sticky top-0 z-20">
                                    <tr className="bg-[#00a65a] text-white text-center">
                                        {columns.map((c, idx) => (
                                            <th key={`col-${idx}`} className="px-3 py-3 font-semibold first:rounded-tl-lg border-b border-green-600 whitespace-nowrap">
                                                {c.label}
                                            </th>
                                        ))}
                                        <th className="px-3 py-3 font-semibold last:rounded-tr-lg border-b border-green-600 whitespace-nowrap">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.length === 0 && !loading ? (
                                        <tr>
                                            <td colSpan={columns.length + 1} className="py-8 text-center text-gray-400">
                                                No se encontraron registros.
                                            </td>
                                        </tr>
                                    ) : (
                                        allUsers.map((user, i) => (
                                            <tr key={user.estu_id || user.docente_id || i} className="border-b border-gray-100 hover:bg-gray-50 text-center">
                                                {columns.map((c, idx) => (
                                                    <td key={`cell-${idx}`} className="px-3 py-2">
                                                        {c.render(user, i)}
                                                    </td>
                                                ))}
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button 
                                                            onClick={() => openHistory(user)}
                                                            size="sm"
                                                            className="h-9 px-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors gap-2"
                                                        >
                                                            <Eye className="h-4 w-4" /> Ver
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    {loading && (
                                        <tr>
                                            <td colSpan={columns.length + 1} className="py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-xs text-gray-400">Cargando más...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Vista Mobile (Cards) */}
                    <div className="md:hidden">
                        <div 
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex flex-col gap-3 p-4 max-h-[600px] overflow-y-auto"
                        >
                            {allUsers.length === 0 && !loading ? (
                                <div className="py-8 text-center text-gray-400 border border-gray-100 rounded-lg">
                                    No se encontraron registros.
                                </div>
                            ) : (
                                allUsers.map((user, i) => (
                                    <div key={user.estu_id || user.docente_id || i} className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                        {columns.map((c, idx) => (
                                            <div key={`cell-mob-${idx}`} className="flex items-center justify-between gap-4 text-sm">
                                                <span className="font-semibold text-gray-400">{c.label}</span>
                                                <div className="text-right font-medium text-gray-800 break-words max-w-[60%]">
                                                    {c.render(user, i)}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="mt-2 flex items-center justify-end gap-2 border-t border-gray-50 pt-3">
                                            <Button 
                                                onClick={() => openHistory(user)}
                                                size="sm"
                                                className="h-9 px-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors gap-2"
                                            >
                                                <Eye className="h-4 w-4" /> Ver
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                            {loading && (
                                <div className="py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xs text-gray-400">Cargando más...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ResourcePage>

            <HistorialModal
                open={showModal}
                onClose={closeModal}
                user={selectedUser}
                tipo={tipo}
            />

            <ExportModal
                open={showExportModal}
                onClose={() => setShowExportModal(false)}
                tipo={tipo}
            />
        </>
    );
}
