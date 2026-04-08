import { Head } from '@inertiajs/react';
import { Users, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel Docente', href: '/docente/dashboard' },
    { title: 'Mis Alumnos', href: '/docente/mis-alumnos' },
];

type Alumno = {
    estu_id: number;
    doc_numero: string | null;
    primer_nombre: string | null;
    segundo_nombre: string | null;
    apellido_paterno: string | null;
    apellido_materno: string | null;
    fecha_nacimiento: string | null;
    telefono: string | null;
    direccion: string | null;
    grado: string | null;
    seccion: string | null;
};

export default function MisAlumnosPage() {
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/docente/mis-alumnos')
            .then(res => setAlumnos(res.data))
            .catch(() => setError('No se pudo cargar la lista de alumnos.'))
            .finally(() => setLoading(false));
    }, []);

    const filtrados = alumnos.filter(a => {
        const q = search.toLowerCase();
        const nombre = `${a.primer_nombre} ${a.segundo_nombre} ${a.apellido_paterno} ${a.apellido_materno}`.toLowerCase();
        const dni = (a.doc_numero ?? '').toLowerCase();

        return nombre.includes(q) || dni.includes(q);
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Alumnos" />

            <div className="p-4 md:p-8 space-y-6 font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Users className="w-7 h-7 text-indigo-600" /> Mis Alumnos
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Listado de estudiantes en tus secciones.</p>
                    </div>
                </div>

                {/* Buscador */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nombre o DNI..."
                        className="pl-9 rounded-xl"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {loading && (
                    <div className="p-10 text-center font-bold text-indigo-600 animate-pulse">Cargando alumnos...</div>
                )}

                {error && (
                    <div className="p-6 bg-red-50 text-red-600 rounded-2xl font-medium">{error}</div>
                )}

                {!loading && !error && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">DNI</th>
                                    <th className="px-4 py-3">Nombres</th>
                                    <th className="px-4 py-3">Apellidos</th>
                                    <th className="px-4 py-3">F. Nacimiento</th>
                                    <th className="px-4 py-3">Teléfono</th>
                                    <th className="px-4 py-3">Dirección</th>
                                    <th className="px-4 py-3">Grado / Sección</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                                            No se encontraron alumnos.
                                        </td>
                                    </tr>
                                ) : (
                                    filtrados.map((a, i) => (
                                        <tr key={a.estu_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                            <td className="px-4 py-3 font-mono text-gray-700">{a.doc_numero ?? '—'}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {[a.primer_nombre, a.segundo_nombre].filter(Boolean).join(' ')}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {[a.apellido_paterno, a.apellido_materno].filter(Boolean).join(' ')}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{a.fecha_nacimiento ?? '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{a.telefono ?? '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{a.direccion ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                                                    {[a.grado, a.seccion].filter(Boolean).join(' — ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
