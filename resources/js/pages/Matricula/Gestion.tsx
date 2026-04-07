import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { MatriculaApertura, NivelCount } from './hooks/useMatricula';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Matrículas', href: '/matriculas/gestion' },
];

export default function MatriculaGestion() {
    const [aperturas, setAperturas] = useState<MatriculaApertura[]>([]);
    const [selectedAperturaId, setSelectedAperturaId] = useState<string>('');
    const [niveles, setNiveles] = useState<NivelCount[]>([]);
    const [loadingNiveles, setLoadingNiveles] = useState(false);

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

    useEffect(() => { cargarAperturas(); }, []);

    // ── Cargar niveles cuando cambia la apertura ──────────────────────────────
    useEffect(() => {
        if (!selectedAperturaId) return;
        setLoadingNiveles(true);
        api.get(`/matriculas/aperturas/${selectedAperturaId}/por-nivel`)
            .then(res => setNiveles(res.data ?? []))
            .finally(() => setLoadingNiveles(false));
    }, [selectedAperturaId]);

    const totalAlumnos = niveles.reduce((sum, n) => sum + n.total, 0);

    return (
        <>
            <Head title="Gestión de Matrículas" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-4 md:space-y-6 p-2 sm:p-4 md:p-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                <ClipboardList className="h-5 w-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Operaciones</span>
                            </div>
                            <h1 className="text-3xl font-black text-neutral-950 tracking-tight">
                                Gestión de <span className="text-emerald-600">Matrículas</span>
                            </h1>
                            <p className="text-neutral-500 text-sm font-medium">
                                Registro y administración de alumnos por periodo escolar.
                            </p>
                        </div>
                    </div>

                    {/* Selector de periodo */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <label className="text-sm font-semibold text-neutral-600 whitespace-nowrap">
                                Periodo de Matrícula
                            </label>
                            <select
                                value={selectedAperturaId}
                                onChange={(e) => setSelectedAperturaId(e.target.value)}
                                className="flex-1 max-w-sm bg-neutral-50 border border-neutral-200 rounded-xl h-10 px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
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

                    {/* Tabla de niveles */}
                    {selectedApertura && (
                        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-[#00a65a] px-4 sm:px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-white/80 text-sm">{selectedApertura.nombre}</p>
                                </div>
                                <span className="text-white/80 text-sm font-medium">
                                    {niveles.length} nivel{niveles.length !== 1 ? 'es' : ''}
                                </span>
                            </div>

                            {/* Vista Desktop (tabla) */}
                            <div className="hidden md:block overflow-y-auto max-h-[55vh]">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-[#00a65a]">
                                            <th className="px-6 py-3 text-center text-white font-semibold text-xs uppercase tracking-wide w-20">#</th>
                                            <th className="px-6 py-3 text-center text-white font-semibold text-xs uppercase tracking-wide">Nombre</th>
                                            <th className="px-6 py-3 text-center text-white font-semibold text-xs uppercase tracking-wide">CNT. Matri.</th>
                                            <th className="px-6 py-3 text-center text-white font-semibold text-xs uppercase tracking-wide w-32">Registra</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingNiveles ? (
                                            <tr>
                                                <td colSpan={4} className="py-10 text-center text-sm text-neutral-400">Cargando…</td>
                                            </tr>
                                        ) : niveles.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-10 text-center text-sm text-neutral-400">No hay alumnos matriculados en este periodo.</td>
                                            </tr>
                                        ) : (
                                            niveles.map((n, idx) => (
                                                <tr key={n.nivel_id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                                    <td className="px-6 py-4 text-center text-neutral-500">{idx + 1}</td>
                                                    <td className="px-6 py-4 text-center font-semibold text-neutral-800 uppercase">{n.nombre_nivel}</td>
                                                    <td className="px-6 py-4 text-center text-neutral-600">{n.total} alumno{n.total !== 1 ? 's' : ''}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Button
                                                            size="sm"
                                                            className="bg-[#00c0ef] hover:bg-[#00a8d0] text-white rounded-md h-8 w-8 p-0"
                                                            onClick={() => router.visit(`/matriculas/gestion/${selectedAperturaId}/nivel/${n.nivel_id}`)}
                                                            title="Ver alumnos"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {niveles.length > 0 && (
                                        <tfoot>
                                            <tr className="bg-neutral-50 border-t border-neutral-200">
                                                <td colSpan={2} className="px-6 py-3 text-right text-xs font-bold text-neutral-500 uppercase">Total</td>
                                                <td className="px-6 py-3 text-center font-bold text-neutral-700">{totalAlumnos} alumnos</td>
                                                <td />
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>

                            {/* Vista Mobile (tarjetas) */}
                            <div className="md:hidden flex flex-col divide-y divide-neutral-100">
                                {loadingNiveles ? (
                                    <p className="py-10 text-center text-sm text-neutral-400">Cargando…</p>
                                ) : niveles.length === 0 ? (
                                    <p className="py-10 text-center text-sm text-neutral-400">No hay alumnos matriculados en este periodo.</p>
                                ) : (
                                    <>
                                        {niveles.map((n, idx) => (
                                            <div key={n.nivel_id} className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-neutral-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                                        {idx + 1}
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold text-neutral-800 uppercase text-sm">{n.nombre_nivel}</p>
                                                        <p className="text-xs text-neutral-500">{n.total} alumno{n.total !== 1 ? 's' : ''}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#00c0ef] hover:bg-[#00a8d0] text-white rounded-lg gap-2 shrink-0"
                                                    onClick={() => router.visit(`/matriculas/gestion/${selectedAperturaId}/nivel/${n.nivel_id}`)}
                                                >
                                                    <Eye className="h-4 w-4" /> Ver
                                                </Button>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-t border-neutral-200">
                                            <span className="text-xs font-bold text-neutral-500 uppercase">Total</span>
                                            <span className="font-bold text-neutral-700">{totalAlumnos} alumnos</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>

        </>
    );
}
