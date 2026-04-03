import { Head } from '@inertiajs/react';
import { Users, GraduationCap, Mail, AlertCircle, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/shared/PageHeader';
import SectionCard from '@/components/shared/SectionCard';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Portal', href: '/alumno/dashboard' },
    { title: 'Profesores', href: '/alumno/profesores' },
];

export default function Profesores() {
    const [profesores, setProfesores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/alumno/profesores')
            .then(res => setProfesores(res.data))
            .catch(err => console.error("Error fetching teachers:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Profesores" />
            
            <div className="flex flex-col gap-8 p-6">
                <PageHeader
                    icon={Users}
                    title="Nuestros Docentes"
                    subtitle="Listado de profesores asignados a tus cursos"
                    iconColor="bg-indigo-600"
                />

                <SectionCard title="Cuerpo Docente">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-12 text-center text-sm font-black uppercase tracking-widest text-indigo-600 animate-pulse">
                                Cargando profesores...
                            </div>
                        ) : profesores.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 italic">
                                <AlertCircle className="mx-auto mb-2 size-8 opacity-20" />
                                <p>No tienes profesores asignados en este período.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-separate border-spacing-0 overflow-hidden rounded-xl border border-gray-100">
                                <thead>
                                    <tr className="bg-[#00a65a] text-white text-[10px] font-black uppercase tracking-widest">
                                        <th className="py-4 pl-6 first:rounded-tl-xl border-b border-green-600">ID</th>
                                        <th className="py-4 border-b border-green-600">Foto</th>
                                        <th className="py-4 border-b border-green-600">Nombres</th>
                                        <th className="py-4 border-b border-green-600">Apellidos</th>
                                        <th className="py-4 border-b border-green-600">Especialidad</th>
                                        <th className="py-4 pr-6 last:rounded-tr-xl border-b border-green-600">Teléfono</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {profesores.map((prof, idx) => (
                                        <tr key={idx} className="group transition-all hover:bg-gray-50/50">
                                            <td className="py-4 pl-6 font-mono text-[10px] text-gray-400">
                                                {prof.docente_id}
                                            </td>
                                            <td className="py-4">
                                                {prof.foto ? (
                                                    <img src={prof.foto} alt={prof.nombres} className="size-10 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-100" />
                                                ) : (
                                                    <div className="size-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs uppercase shadow-sm ring-1 ring-indigo-100">
                                                        {prof.nombres[0]}{prof.apellidos[0]}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 font-bold text-gray-900 leading-tight">
                                                {prof.nombres}
                                            </td>
                                            <td className="py-4 font-bold text-gray-900 leading-tight">
                                                {prof.apellidos}
                                            </td>
                                            <td className="py-4 font-bold text-gray-600 text-sm">
                                                <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                                                    <GraduationCap className="size-4 text-emerald-500" />
                                                    {prof.especialidad}
                                                </div>
                                            </td>
                                            <td className="py-4 pr-6">
                                                <div className="flex items-center gap-2 font-mono text-sm font-bold text-indigo-600">
                                                    {prof.telefono}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </SectionCard>

                {/* Info Note */}
                <div className="rounded-2xl bg-amber-50 p-6 border border-amber-100 shadow-sm shadow-amber-500/5">
                    <div className="flex gap-4">
                        <div className="rounded-xl bg-white p-3 shadow-sm text-amber-600">
                            <UserCircle className="size-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-amber-900 uppercase text-[10px] tracking-widest mb-1">Centro de Ayuda</h4>
                            <p className="text-sm text-amber-800/80 leading-relaxed max-w-2xl font-medium">
                                Si tienes dudas sobre los cursos o los docentes asignados, te recomendamos contactarlos vía mensajeria interna o asistir a las horas de consulta programadas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
