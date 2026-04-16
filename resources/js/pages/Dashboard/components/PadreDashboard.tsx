import { Link } from '@inertiajs/react';
import { Users, CalendarCheck, CreditCard, GraduationCap, ChevronRight, MessageSquare } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';

interface Props {
    data: any;
}

export default function PadreDashboard({ data }: Props) {
    const hijos: any[] = data?.hijos ?? [];
    const pagosRecientes: any[] = data?.pagos_recientes ?? [];

    return (
        <div className="flex flex-col gap-6">
            {/* Accesos rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Mis Hijos',   href: '/padre/dashboard',  icon: Users,         color: 'bg-indigo-500' },
                    { label: 'Asistencia',  href: '/padre/asistencia', icon: CalendarCheck, color: 'bg-emerald-500' },
                    { label: 'Pagos',       href: '/padre/pagos',      icon: CreditCard,    color: 'bg-rose-500' },
                    { label: 'Profesores',  href: '/padre/profesores', icon: GraduationCap, color: 'bg-amber-500' },
                ].map(({ label, href, icon: Icon, color }) => (
                    <Link key={label} href={href}
                        className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-gray-200 transition-all group">
                        <div className={`size-12 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon size={22} className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{label}</span>
                    </Link>
                ))}
            </div>

            {/* Hijos */}
            {hijos.length > 0 && (
                <SectionCard title="Mis Hijos">
                    <div className="divide-y divide-gray-50">
                        {hijos.map((hijo: any) => (
                            <Link key={hijo.estu_id} href={`/padre/hijo/${hijo.estu_id}`}
                                className="flex items-center gap-4 py-3 hover:bg-gray-50 -mx-5 px-5 rounded-xl transition-colors group">
                                <div className="size-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm flex-shrink-0">
                                    {hijo.perfil?.primer_nombre?.charAt(0) ?? '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm truncate">
                                        {hijo.perfil?.primer_nombre} {hijo.perfil?.apellido_paterno}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Asistencia: <span className={`font-bold ${hijo.asistencia >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>{hijo.asistencia}%</span>
                                    </p>
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Pagos recientes */}
            {pagosRecientes.length > 0 && (
                <SectionCard title="Últimos Pagos">
                    <div className="divide-y divide-gray-50">
                        {pagosRecientes.map((p: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{p.pag_nombre1 || 'Mensualidad'}</p>
                                    <p className="text-xs text-gray-400">{p.pag_fecha}</p>
                                </div>
                                <span className="text-sm font-black text-gray-900">S/ {parseFloat(p.total ?? p.pag_monto ?? 0).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <Link href="/padre/pagos" className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline mt-3">
                        Ver todos los pagos <ChevronRight size={12} />
                    </Link>
                </SectionCard>
            )}

            {/* Mensajería */}
            <div className="flex items-start gap-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="size-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={18} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-indigo-900 text-sm">¿Necesitas contactar a un profesor?</p>
                    <p className="text-xs text-indigo-600 mt-0.5">Usa la mensajería para comunicarte directamente.</p>
                </div>
                <Link href="/mensajeria" className="text-xs font-bold text-indigo-600 hover:underline whitespace-nowrap">
                    Ir →
                </Link>
            </div>
        </div>
    );
}
