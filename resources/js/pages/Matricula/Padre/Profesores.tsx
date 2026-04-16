import { Head } from '@inertiajs/react';
import { GraduationCap, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Profesores', href: '#' },
];

export default function ProfesoresPage() {
    const [hijos, setHijos] = useState<any[]>([]);
    const [profsPorHijo, setProfsPorHijo] = useState<Record<number, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);

    useEffect(() => {
        api.get('/padre/hijos').then(async res => {
            const hijosData = res.data;
            setHijos(hijosData);
            if (hijosData.length > 0) setExpanded(hijosData[0].estu_id);

            const profsMap: Record<number, any[]> = {};
            await Promise.all(hijosData.map(async (h: any) => {
                try {
                    const r = await api.get('/alumno/profesores', { params: { estu_id: h.estu_id } });
                    profsMap[h.estu_id] = r.data ?? [];
                } catch { profsMap[h.estu_id] = []; }
            }));
            setProfsPorHijo(profsMap);
        }).finally(() => setLoading(false));
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profesores" />
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                        <GraduationCap className="size-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Profesores</h1>
                        <p className="text-sm text-gray-500">Docentes de tus hijos</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {hijos.map(hijo => (
                            <div key={hijo.estu_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpanded(expanded === hijo.estu_id ? null : hijo.estu_id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">
                                            {hijo.perfil?.primer_nombre?.charAt(0) ?? '?'}
                                        </div>
                                        <span className="font-bold text-gray-900 capitalize">
                                            {hijo.perfil?.primer_nombre} {hijo.perfil?.apellido_paterno}
                                        </span>
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {profsPorHijo[hijo.estu_id]?.length ?? 0} profesores
                                        </span>
                                    </div>
                                    {expanded === hijo.estu_id
                                        ? <ChevronUp className="size-4 text-gray-400" />
                                        : <ChevronDown className="size-4 text-gray-400" />}
                                </button>

                                {expanded === hijo.estu_id && (
                                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                                        {(profsPorHijo[hijo.estu_id] ?? []).length === 0 ? (
                                            <p className="px-5 py-6 text-sm text-gray-400 italic">Sin profesores registrados.</p>
                                        ) : (
                                            (profsPorHijo[hijo.estu_id] ?? []).map((prof: any, i: number) => (
                                                <div key={i} className="px-5 py-4 flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-sm">
                                                        {prof.nombre?.charAt(0) ?? 'P'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-800 text-sm capitalize">{prof.nombre} {prof.apellido}</p>
                                                        <p className="text-xs text-indigo-500 font-medium">{prof.curso ?? prof.materia ?? ''}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {prof.email && (
                                                            <a href={`mailto:${prof.email}`} className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                                                                <Mail className="size-3.5" />
                                                            </a>
                                                        )}
                                                        {prof.telefono && (
                                                            <a href={`tel:${prof.telefono}`} className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors">
                                                                <Phone className="size-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
