import { Eye } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import type { MensajePendiente } from '../hooks/useDashboard';
import { Link } from '@inertiajs/react';

type Props = {
    messages?: MensajePendiente[];
};

export default function NotificacionesPendientes({ messages = [] }: Props) {
    return (
        <SectionCard title="Consultas y Mensajes Pendientes">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-[#00a65a] text-white">
                                <th className="px-4 py-3.5 font-black uppercase tracking-wider">Fecha</th>
                                <th className="px-4 py-3.5 font-black uppercase tracking-wider">Representante</th>
                                <th className="px-4 py-3.5 font-black uppercase tracking-wider">Teléfono</th>
                                <th className="px-4 py-3.5 font-black uppercase tracking-wider">Exalumno / Alumno</th>
                                <th className="px-4 py-3.5 font-black uppercase tracking-wider">Asunto</th>
                                <th className="px-4 py-3.5 font-black uppercase tracking-wider text-center">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {messages.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400 italic">
                                        No hay nuevos mensajes o consultas pendientes en este momento.
                                    </td>
                                </tr>
                            ) : (
                                messages.map((m) => (
                                    <tr key={m.id} className="transition-colors hover:bg-gray-50/50">
                                        <td className="whitespace-nowrap px-4 py-3 text-gray-500 tabular-nums">{m.fecha}</td>
                                        <td className="px-4 py-3 font-bold text-gray-900">{m.representante}</td>
                                        <td className="px-4 py-3 text-gray-600 font-medium">{m.telefono}</td>
                                        <td className="px-4 py-3 text-gray-600">{m.exalumno}</td>
                                        <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">{m.asunto}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Link 
                                                href={`/mensajeria/ver/${m.id}`}
                                                className="inline-flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white shadow-sm ring-1 ring-black/5"
                                            >
                                                <Eye className="size-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </SectionCard>
    );
}
