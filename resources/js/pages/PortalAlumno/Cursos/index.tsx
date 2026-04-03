import { Head, Link } from '@inertiajs/react';
import { Book, GraduationCap, ChevronRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/shared/PageHeader';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Portal', href: '/alumno/dashboard' },
    { title: 'Mis Materias', href: '/alumno/cursos' },
];

export default function AlumnoCursosPage() {
    const [cursos, setCursos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/alumno/cursos')
            .then(res => setCursos(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center font-black animate-pulse text-primary">Cargando tus cursos...</div>;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Cursos" />

            <div className="flex flex-col gap-8 p-6">
                <PageHeader 
                    icon={Book}
                    title="Mis Materias"
                    subtitle="Explora tus cursos activos y revisa tu avance por unidad."
                    iconColor="bg-blue-600"
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cursos.map((c: any) => (
                        <div key={c.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                            {/* Color Bar */}
                            <div className="h-2 w-full bg-blue-600" />
                            
                            <div className="flex flex-1 flex-col p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{c.curso?.nombre}</h3>
                                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                                        <Book className="size-5" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                            <User className="size-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Docente</p>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                {c.docente?.perfil?.primer_nombre} {c.docente?.perfil?.apellido_paterno}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold text-gray-500">
                                            <span>Progreso</span>
                                            <span className="text-blue-600">65%</span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                            <div className="h-full bg-blue-600 w-[65%]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-2">
                                    <Link 
                                        href={`/alumno/cursos/${c.docen_curso_id}`} 
                                        className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600"
                                    >
                                        Entrar al Curso
                                    </Link>
                                    <Link 
                                        href="/alumno/notas" 
                                        className="flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <GraduationCap className="size-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
