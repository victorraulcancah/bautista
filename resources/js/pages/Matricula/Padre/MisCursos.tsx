import { Head } from '@inertiajs/react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cursos de mis hijos', href: '#' },
];

export default function MisCursosPage() {
    const [hijos, setHijos] = useState<any[]>([]);
    const [cursosPorHijo, setCursosPorHijo] = useState<Record<number, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);

    useEffect(() => {
        api.get('/padre/hijos').then(async res => {
            const hijosData = res.data;
            setHijos(hijosData);
            if (hijosData.length > 0) setExpanded(hijosData[0].estu_id);

            const cursosMap: Record<number, any[]> = {};
            await Promise.all(hijosData.map(async (h: any) => {
                try {
                    const r = await api.get(`/alumno/cursos`, { params: { estu_id: h.estu_id } });
                    cursosMap[h.estu_id] = r.data?.data ?? r.data ?? [];
                } catch { cursosMap[h.estu_id] = []; }
            }));
            setCursosPorHijo(cursosMap);
        }).finally(() => setLoading(false));
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cursos de mis hijos" />
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <BookOpen className="size-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Cursos de mis hijos</h1>
                        <p className="text-sm text-gray-500">Materias y contenido académico</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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
                                        <div className="size-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                                            {hijo.perfil?.primer_nombre?.charAt(0) ?? '?'}
                                        </div>
                                        <span className="font-bold text-gray-900 capitalize">
                                            {hijo.perfil?.primer_nombre} {hijo.perfil?.apellido_paterno}
                                        </span>
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {cursosPorHijo[hijo.estu_id]?.length ?? 0} cursos
                                        </span>
                                    </div>
                                    {expanded === hijo.estu_id
                                        ? <ChevronUp className="size-4 text-gray-400" />
                                        : <ChevronDown className="size-4 text-gray-400" />}
                                </button>

                                {expanded === hijo.estu_id && (
                                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                                        {(cursosPorHijo[hijo.estu_id] ?? []).length === 0 ? (
                                            <p className="px-5 py-6 text-sm text-gray-400 italic">Sin cursos registrados.</p>
                                        ) : (
                                            (cursosPorHijo[hijo.estu_id] ?? []).map((curso: any) => (
                                                <div key={curso.curso_id ?? curso.id} className="px-5 py-4 flex items-center gap-4">
                                                    <div className="size-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                        <BookOpen className="size-4 text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-sm">{curso.nombre ?? curso.nombre_curso}</p>
                                                        <p className="text-xs text-gray-400">{curso.docente ?? ''}</p>
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
