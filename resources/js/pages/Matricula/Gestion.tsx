import { Head, router } from '@inertiajs/react';
import { ClipboardList, Eye, IdCard } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { useCallback, useEffect, useState } from 'react';
import ResourceTable from '@/components/shared/ResourceTable';
import type { Column } from '@/components/shared/ResourceTable';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import type { MatriculaApertura, NivelCount } from './hooks/useMatricula';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Matrículas', href: '/matriculas/gestion' },
];

export default function MatriculaGestion() {
    const [aperturas, setAperturas] = useState<MatriculaApertura[]>([]);
    const [selectedAperturaId, setSelectedAperturaId] = useState<string>('');
    const [niveles, setNiveles] = useState<NivelCount[]>([]);
    const [loadingNiveles, setLoadingNiveles] = useState(false);
    const { can } = usePermission();

    const selectedApertura = aperturas.find(a => a.apertura_id.toString() === selectedAperturaId) ?? null;

    // ── Cargar aperturas al montar ────────────────────────────────────────────
    const cargarAperturas = useCallback(async () => {
        const res = await api.get('/matriculas/aperturas', { params: { per_page: 100 } });
        const lista: MatriculaApertura[] = res.data.data ?? [];
        setAperturas(lista);

        if (lista.length > 0 && !selectedAperturaId) {
            setSelectedAperturaId(lista[0].apertura_id.toString());
        }
    }, [selectedAperturaId]);

    useEffect(() => {
 cargarAperturas(); 
}, []);

    // ── Cargar niveles cuando cambia la apertura ──────────────────────────────
    useEffect(() => {
        if (!selectedAperturaId) {
return;
}

        setLoadingNiveles(true);
        api.get(`/matriculas/aperturas/${selectedAperturaId}/por-nivel`)
            .then(res => setNiveles(res.data ?? []))
            .finally(() => setLoadingNiveles(false));
    }, [selectedAperturaId]);

    const totalAlumnos = niveles.reduce((sum, n) => sum + n.total, 0);

    const columns: Column<NivelCount>[] = [
        {
            label: '#',
            render: (_, idx) => (
                <span className="text-neutral-500 font-medium text-sm">
                    {idx + 1}
                </span>
            ),
        },
        {
            label: 'Nombre',
            render: (n) => (
                <span className="font-bold text-neutral-900 uppercase text-sm">
                    {n.nombre_nivel}
                </span>
            ),
        },
        {
            label: 'Cnt. Matri.',
            render: (n) => (
                <span className="font-semibold text-blue-600">
                    {n.total}
                </span>
            ),
        },
    ];

    // Crear datos mock para la paginación (ResourceTable espera este formato)
    const mockPaginatedData = {
        data: niveles,
        current_page: 1,
        last_page: 1,
        per_page: niveles.length,
        total: niveles.length,
        from: niveles.length > 0 ? 1 : 0,
        to: niveles.length,
    };

    return (
        <>
            <Head title="Gestión de Matrículas" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-4 md:space-y-6 p-3 sm:p-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Operaciones</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
                                Gestión de <span className="text-emerald-600">Matrículas</span>
                            </h1>
                            <p className="text-neutral-500 text-xs sm:text-sm font-medium">
                                Registro y administración de alumnos por periodo escolar.
                            </p>
                        </div>
                    </div>

                    {/* Selector de periodo */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-3 sm:p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <label className="text-xs sm:text-sm font-semibold text-neutral-600 whitespace-nowrap">
                                Periodo de Matrícula
                            </label>
                            <select
                                value={selectedAperturaId}
                                onChange={(e) => setSelectedAperturaId(e.target.value)}
                                className="flex-1 max-w-sm bg-neutral-50 border border-neutral-200 rounded-xl h-9 sm:h-10 px-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                            >
                                <option value="" disabled>Seleccionar periodo…</option>
                                {aperturas.map(a => (
                                    <option key={a.apertura_id} value={a.apertura_id.toString()}>
                                        {a.nombre} — {a.anio}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Lista de niveles */}
                    {selectedApertura && (
                        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                            {loadingNiveles ? (
                                <div className="py-16 flex flex-col items-center justify-center gap-3">
                                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs text-neutral-400">Cargando…</p>
                                </div>
                            ) : niveles.length === 0 ? (
                                <p className="py-16 text-center text-xs text-neutral-400">No hay alumnos matriculados en este periodo.</p>
                            ) : (
                                <>
                                    <ResourceTable
                                        rows={mockPaginatedData}
                                        columns={columns}
                                        getKey={(n) => n.nivel_id?.toString() ?? `sin-nivel-${Math.random()}`}
                                        extraActions={(n) => (
                                            <div className="flex items-center gap-2">
                                                {can('matriculas.gestion.ver') && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-lg h-9 w-9 p-0"
                                                        onClick={() => {
                                                            if (n.nivel_id) {
                                                                window.open(`/matriculas/aperturas/${selectedAperturaId}/niveles/${n.nivel_id}/fotochecks`, '_blank');
                                                            }
                                                        }}
                                                        disabled={!n.nivel_id}
                                                        title="Descargar Fotochecks Masivos"
                                                    >
                                                        <IdCard className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {can('matriculas.gestion.ver') && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg h-9 w-9 p-0"
                                                        onClick={() => {
                                                            if (n.nivel_id) {
                                                                router.visit(`/matriculas/gestion/${selectedAperturaId}/nivel/${n.nivel_id}`);
                                                            }
                                                        }}
                                                        disabled={!n.nivel_id}
                                                        title="Ver Registros"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                        onPageChange={() => {}}
                                    />
                                    <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-t-2 border-neutral-200">
                                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Total</span>
                                        <span className="font-bold text-neutral-900 text-base">{totalAlumnos} alumnos</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </AppLayout>

        </>
    );
}
