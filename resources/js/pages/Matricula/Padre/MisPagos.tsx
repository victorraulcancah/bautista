import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { CreditCard, Upload, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import SectionCard from '@/components/shared/SectionCard';
import SubirVoucherModal from './components/SubirVoucherModal';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Portal Familia', href: '/padre/dashboard' },
    { title: 'Mis Pagos', href: '#' },
];

export default function MisPagosPage() {
    const [hijos, setHijos] = useState<any[]>([]);
    const [pagos, setPagos] = useState<any[]>([]);
    const [hijoSel, setHijoSel] = useState<number | 'todos'>('todos');
    const [loading, setLoading] = useState(true);
    const [voucherPagId, setVoucherPagId] = useState<number | null>(null);
    const [voucherMes, setVoucherMes] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const hijosRes = await api.get('/padre/hijos');
                const hijosData = hijosRes.data || [];
                setHijos(hijosData);

                const pagosAll: any[] = [];
                for (const hijo of hijosData) {
                    const res = await api.get(`/padre/hijo/${hijo.estu_id}/resumen`);
                    (res.data.pagos || []).forEach((p: any) => {
                        pagosAll.push({ ...p, hijo_nombre: hijo.perfil?.primer_nombre, estu_id: hijo.estu_id });
                    });
                }
                setPagos(pagosAll);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const pagosFiltrados = hijoSel === 'todos'
        ? pagos
        : pagos.filter(p => p.estu_id === hijoSel);

    const totalPagado = pagosFiltrados.reduce((sum, p) => sum + parseFloat(p.total ?? p.pag_monto ?? 0), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Pagos" />
            <div className="space-y-6 p-4 sm:p-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <PageHeader
                        icon={CreditCard}
                        title="Mis Pagos"
                        subtitle="Historial de pagos de tus hijos"
                        iconColor="bg-indigo-600"
                    />

                    {/* Filtro por hijo */}
                    {hijos.length > 1 && (
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                            <button onClick={() => setHijoSel('todos')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${hijoSel === 'todos' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                                Todos
                            </button>
                            {hijos.map(h => (
                                <button key={h.estu_id} onClick={() => setHijoSel(h.estu_id)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${hijoSel === h.estu_id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                                    {h.perfil?.primer_nombre}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Pagado"
                        value={`S/ ${totalPagado.toFixed(2)}`}
                        icon={TrendingUp}
                        color="text-indigo-600"
                        iconBg="bg-indigo-500"
                    />
                    <StatCard
                        title="Registros"
                        value={pagosFiltrados.length}
                        icon={FileText}
                        color="text-gray-700"
                        iconBg="bg-gray-500"
                    />
                    <StatCard
                        title="Estado"
                        value="Al día"
                        icon={AlertCircle}
                        color="text-emerald-600"
                        iconBg="bg-emerald-500"
                    />
                </div>

                {/* Tabla */}
                <SectionCard title="Historial de Pagos">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="size-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                        </div>
                    ) : pagosFiltrados.length === 0 ? (
                        <div className="py-12 text-center text-sm text-gray-400 font-medium">
                            No hay pagos registrados.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {hijoSel === 'todos' && <th className="pb-3 pr-4">Alumno</th>}
                                        <th className="pb-3 pr-4">Concepto</th>
                                        <th className="pb-3 pr-4 text-right">Monto</th>
                                        <th className="pb-3 pr-4 text-center hidden sm:table-cell">Estado</th>
                                        <th className="pb-3 pr-4 text-right hidden sm:table-cell">Fecha</th>
                                        <th className="pb-3 text-center">Voucher</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pagosFiltrados.map((p: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            {hijoSel === 'todos' && (
                                                <td className="py-3 pr-4 text-xs text-gray-500 font-medium">{p.hijo_nombre}</td>
                                            )}
                                            <td className="py-3 pr-4">
                                                <p className="font-medium text-gray-800">{p.pag_nombre1 || 'Mensualidad'}</p>
                                                {p.pag_mes && <p className="text-xs text-gray-400">{p.pag_mes}</p>}
                                            </td>
                                            <td className="py-3 pr-4 text-right font-semibold text-gray-900">
                                                S/ {parseFloat(p.total ?? p.pag_monto ?? 0).toFixed(2)}
                                            </td>
                                            <td className="py-3 pr-4 text-center hidden sm:table-cell">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                    Pagado
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-right text-xs text-gray-400 hidden sm:table-cell">
                                                {p.pag_fecha}
                                            </td>
                                            <td className="py-3 text-center">
                                                <Button size="sm" variant="ghost"
                                                    className="h-8 w-8 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                    onClick={() => { setVoucherPagId(p.pag_id); setVoucherMes(p.pag_mes ?? ''); }}
                                                >
                                                    <Upload className="h-3.5 w-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>
            </div>

            <SubirVoucherModal
                open={voucherPagId !== null}
                onClose={() => setVoucherPagId(null)}
                pagId={voucherPagId}
                mes={voucherMes}
            />
        </AppLayout>
    );
}
