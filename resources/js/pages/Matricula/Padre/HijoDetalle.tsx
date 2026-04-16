import { Head, Link } from '@inertiajs/react';
import { GraduationCap, ClipboardCheck, CreditCard, ChevronLeft, ChevronDown, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import AppLayout from '@/layouts/app-layout';
import SubirVoucherModal from './components/SubirVoucherModal';
import type { BreadcrumbItem } from '@/types';

// ── Tab Asistencia: resumen global + cards por curso ─────────────────────────
function TabAsistencia({ asistencia }: { asistencia: any }) {
    const [cursoSel, setCursoSel] = useState<any | null>(null);

    if (cursoSel) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setCursoSel(null)}
                        className="size-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <ChevronLeft size={16} className="text-gray-600" />
                    </button>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asistencia del curso</p>
                        <h3 className="font-black text-gray-900 text-lg uppercase">{cursoSel.curso}</h3>
                    </div>
                    <span className={`ml-auto px-4 py-1.5 rounded-full text-sm font-black ${cursoSel.porcentaje >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {cursoSel.porcentaje}% asistencia
                    </span>
                </div>
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Observación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {cursoSel.historial.map((h: any, i: number) => {
                                const cfg = {
                                    P: { label: 'Presente',    cls: 'bg-emerald-100 text-emerald-700' },
                                    T: { label: 'Tardanza',    cls: 'bg-amber-100 text-amber-700' },
                                    F: { label: 'Falta',       cls: 'bg-rose-100 text-rose-700' },
                                    J: { label: 'Justificado', cls: 'bg-blue-100 text-blue-700' },
                                }[h.estado as string] ?? { label: h.estado, cls: 'bg-gray-100 text-gray-500' };
                                return (
                                    <tr key={i} className="hover:bg-rose-50/20 transition-colors">
                                        <td className="px-6 py-3 font-semibold text-gray-800 text-sm">{h.fecha}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.cls}`}>{cfg.label}</span>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-gray-500 italic hidden sm:table-cell">{h.observacion || '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Resumen global */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Asistencia',  value: `${asistencia.porcentaje}%`, color: 'indigo' },
                    { label: 'Presentes',   value: asistencia.presentes,        color: 'emerald' },
                    { label: 'Tardanzas',   value: asistencia.tardanzas,        color: 'amber' },
                    { label: 'Faltas',      value: asistencia.faltas,           color: 'rose' },
                ].map(({ label, value, color }) => (
                    <div key={label} className={`bg-${color}-50 p-5 rounded-[2rem] flex flex-col items-center justify-center text-center`}>
                        <p className={`text-[10px] font-black text-${color}-400 uppercase tracking-widest mb-1`}>{label}</p>
                        <p className={`text-3xl font-black text-${color}-600`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Cards por curso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {asistencia.por_curso?.length === 0 ? (
                    <div className="col-span-full bg-white rounded-[2rem] border border-gray-100 p-12 text-center text-gray-400 font-bold">
                        No hay registros de asistencia por curso.
                    </div>
                ) : (
                    asistencia.por_curso?.map((curso: any) => {
                        const ok = curso.porcentaje >= 70;
                        return (
                            <button key={curso.curso_id} onClick={() => setCursoSel(curso)}
                                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:border-rose-200 hover:shadow-lg transition-all group text-left">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100 transition-colors">
                                        <ClipboardCheck size={20} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-sm uppercase leading-tight">{curso.curso}</p>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">{curso.total} sesiones</p>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asistencia</p>
                                        <p className={`text-3xl font-black mt-0.5 ${ok ? 'text-emerald-600' : 'text-rose-600'}`}>{curso.porcentaje}%</p>
                                    </div>
                                    <div className="text-right text-xs text-gray-400 font-medium space-y-0.5">
                                        <p><span className="text-emerald-600 font-black">{curso.presentes}</span> P</p>
                                        <p><span className="text-amber-500 font-black">{curso.tardanzas}</span> T</p>
                                        <p><span className="text-rose-500 font-black">{curso.faltas}</span> F</p>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${ok ? 'bg-emerald-400' : 'bg-rose-400'}`}
                                        style={{ width: `${curso.porcentaje}%` }} />
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// ── Tab Notas: lista de cursos → detalle de notas ────────────────────────────
function TabNotas({ notas }: { notas: any[] }) {
    const [cursoSeleccionado, setCursoSeleccionado] = useState<any | null>(null);

    if (cursoSeleccionado) {
        return <NotasCurso curso={cursoSeleccionado} onVolver={() => setCursoSeleccionado(null)} />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notas.length === 0 ? (
                <div className="col-span-full bg-white rounded-[2rem] border border-gray-100 p-16 text-center text-gray-400 font-bold">
                    No hay calificaciones registradas aún.
                </div>
            ) : (
                notas.map((curso: any) => {
                    const aprobado = curso.promedio !== null && curso.promedio >= 11;
                    return (
                        <button
                            key={curso.curso_id}
                            onClick={() => setCursoSeleccionado(curso)}
                            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:border-rose-200 hover:shadow-lg transition-all group text-left"
                        >
                            {/* Icono + nombre */}
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100 transition-colors">
                                    <GraduationCap size={22} className="text-rose-400" />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm uppercase leading-tight">{curso.curso}</p>
                                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                                        {curso.notas.length} actividad{curso.notas.length !== 1 ? 'es' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Promedio */}
                            <div className="flex items-end justify-between">
                                {curso.promedio !== null ? (
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Promedio</p>
                                        <p className={`text-3xl font-black mt-0.5 ${aprobado ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {curso.promedio}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-300 font-bold">Sin calificar</p>
                                )}
                                <ChevronLeft size={18} className="text-gray-200 rotate-180 group-hover:text-rose-400 transition-colors mb-1" />
                            </div>

                            {/* Barra de progreso del promedio */}
                            {curso.promedio !== null && (
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${aprobado ? 'bg-emerald-400' : 'bg-rose-400'}`}
                                        style={{ width: `${Math.min((curso.promedio / 20) * 100, 100)}%` }}
                                    />
                                </div>
                            )}
                        </button>
                    );
                })
            )}
        </div>
    );
}

// ── Detalle de notas de un curso ──────────────────────────────────────────────
function NotasCurso({ curso, onVolver }: { curso: any; onVolver: () => void }) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onVolver}
                    className="size-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    <ChevronLeft size={16} className="text-gray-600" />
                </button>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notas del curso</p>
                    <h3 className="font-black text-gray-900 text-lg uppercase">{curso.curso}</h3>
                </div>
                {curso.promedio !== null && (
                    <span className={`ml-auto px-5 py-2 rounded-full text-sm font-black ${curso.promedio >= 11 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        Promedio: {curso.promedio}
                    </span>
                )}
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Actividad</th>
                            <th className="px-6 py-4 text-center w-24">Nota</th>
                            <th className="px-6 py-4 text-center w-20">Máx.</th>
                            <th className="px-6 py-4 hidden sm:table-cell">Observación</th>
                            <th className="px-6 py-4 text-right w-28 hidden sm:table-cell">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {curso.notas.map((n: any) => {
                            const nota = parseFloat(n.nota);
                            const max  = parseFloat(n.puntos_maximos) || 20;
                            const ok   = !isNaN(nota) && nota >= (max * 0.55);
                            return (
                                <tr key={n.actividad_id} className="hover:bg-rose-50/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-800 text-sm">{n.nombre_actividad}</p>
                                        {n.tipo && <p className="text-[10px] text-gray-400 font-medium">{n.tipo}</p>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {n.nota !== null ? (
                                            <span className={`text-xl font-black ${ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {n.nota}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-300 font-bold">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center text-xs text-gray-400 font-bold">{n.puntos_maximos ?? 20}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500 italic hidden sm:table-cell max-w-xs truncate">{n.observacion || '—'}</td>
                                    <td className="px-6 py-4 text-right text-xs text-gray-400 font-medium hidden sm:table-cell">{n.fecha}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function HijoDetallePage({ hijoId }: { hijoId: number }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'academico' | 'asistencia'>('academico');
    const [voucherPagId, setVoucherPagId] = useState<number | null>(null);
    const [voucherMes, setVoucherMes] = useState('');

    useEffect(() => {
        api.get(`/padre/hijo/${hijoId}/resumen`)
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, [hijoId]);

    if (loading) {
        return (
            <AppLayout breadcrumbs={[]}>
                <div className="p-10 text-center font-black animate-pulse text-rose-500">Cargando detalles...</div>
            </AppLayout>
        );
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mis Hijos', href: '/padre/dashboard' },
        { title: data.hijo?.perfil?.primer_nombre ?? 'Detalle', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
        <Head title={`Seguimiento - ${data.hijo?.perfil?.primer_nombre}`} />
        <div className="p-4 md:p-8 space-y-6 font-sans">

            {/* Header — una sola fila */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seguimiento Académico</p>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
                        {data.hijo?.perfil?.primer_nombre} {data.hijo?.perfil?.apellido_paterno}
                    </h1>
                </div>
                <div className="flex p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm flex-shrink-0">
                    {[
                        { id: 'academico', icon: GraduationCap, label: 'Notas' },
                        { id: 'asistencia', icon: ClipboardCheck, label: 'Asistencia' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all font-bold text-xs ${
                                activeTab === tab.id
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'academico' && (
                    <TabNotas notas={data.notas} />
                )}

                {activeTab === 'asistencia' && (
                    <TabAsistencia asistencia={data.asistencia} />
                )}
            </div>
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
