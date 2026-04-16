import { Head, Link } from '@inertiajs/react';
import { Users, ChevronRight, GraduationCap, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mis Hijos', href: '#' },
];

export default function MisHijosPage() {
    const [hijos, setHijos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/padre/hijos')
            .then(res => setHijos(res.data))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Hijos" />
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-rose-500 flex items-center justify-center">
                        <Users className="size-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Mis Hijos</h1>
                        <p className="text-sm text-gray-500">Seguimiento académico de tus hijos</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : hijos.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Users className="size-12 mx-auto mb-3 opacity-30" />
                        <p className="font-semibold">No tienes hijos registrados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hijos.map((hijo: any) => (
                            <Link key={hijo.estu_id} href={`/padre/hijo/${hijo.estu_id}`}>
                                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-rose-200 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-black text-xl">
                                            {hijo.perfil?.primer_nombre?.charAt(0) ?? '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate capitalize">
                                                {hijo.perfil?.primer_nombre} {hijo.perfil?.apellido_paterno}
                                            </p>
                                            <p className="text-xs text-gray-400 font-medium">
                                                DNI: {hijo.perfil?.doc_numero ?? '—'}
                                            </p>
                                        </div>
                                        <ChevronRight className="size-4 text-gray-300 group-hover:text-rose-400 transition-colors shrink-0" />
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                            <GraduationCap className="size-3" /> Ver notas
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                            <BookOpen className="size-3" /> Asistencia
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
