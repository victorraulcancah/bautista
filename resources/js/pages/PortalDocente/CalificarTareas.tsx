import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save, FileText, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

interface Props {
    actividadId: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel Docente', href: '/docente/dashboard' },
    { title: 'Mis Cursos', href: '/docente/mis-cursos' },
    { title: 'Calificar Tareas', href: '#' },
];

export default function CalificarTareasPage({ actividadId }: Props) {
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [notas, setNotas] = useState<Record<string, string>>({});

    useEffect(() => {
        cargarAlumnos();
    }, [actividadId]);

    const cargarAlumnos = () => {
        setLoading(true);
        api.get(`/docente/actividades/${actividadId}/alumnos`)
            .then((res) => {
                setAlumnos(res.data);
                const notasIniciales: Record<string, string> = {};
                res.data.forEach((alumno: any) => {
                    notasIniciales[alumno.id] = alumno.nota || '';
                });
                setNotas(notasIniciales);
            })
            .finally(() => setLoading(false));
    };

    const guardarNota = (estudianteId: string) => {
        const nota = notas[estudianteId];
        if (!nota || nota.trim() === '') {
            alert('Debe ingresar una nota');
            return;
        }

        api.post(`/docente/actividades/${actividadId}/calificar`, {
            estudiante_id: estudianteId,
            nota: parseFloat(nota),
        })
            .then(() => {
                alert('Nota guardada correctamente');
            })
            .catch(() => {
                alert('No se pudo guardar la nota');
            });
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="p-10 text-center font-black animate-pulse text-indigo-600">
                    Cargando alumnos...
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calificar Tareas" />

            <div className="min-h-screen bg-[#FDFDFF] p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                            Calificar Tareas
                        </h1>
                        <p className="text-gray-500 font-medium italic mt-2">
                            Lista de alumnos matriculados
                        </p>
                    </div>
                    <Link href={`/docente/actividades/${actividadId}`}>
                        <Button variant="outline" className="rounded-2xl">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </Link>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#00a65a] text-white">
                            <tr>
                                <th className="px-6 py-4 font-black uppercase tracking-wider text-center">#</th>
                                <th className="px-6 py-4 font-black uppercase tracking-wider text-center">Nombres</th>
                                <th className="px-6 py-4 font-black uppercase tracking-wider text-center">Apellidos</th>
                                <th className="px-6 py-4 font-black uppercase tracking-wider text-center">Archivo</th>
                                <th className="px-6 py-4 font-black uppercase tracking-wider text-center">Nota</th>
                                <th className="px-6 py-4 font-black uppercase tracking-wider text-center">Guardar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {alumnos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                        No hay alumnos matriculados
                                    </td>
                                </tr>
                            ) : (
                                alumnos.map((alumno, index) => (
                                    <tr key={alumno.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-center font-bold text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-700">
                                            {alumno.primer_nombre} {alumno.segundo_nombre}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-700">
                                            {alumno.apellido_paterno} {alumno.apellido_materno}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {alumno.archivos && alumno.archivos.length > 0 ? (
                                                <div className="space-y-1">
                                                    {alumno.archivos.map((archivo: any) => (
                                                        <a
                                                            key={archivo.id}
                                                            href={archivo.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                                                        >
                                                            <FileText className="w-4 h-4 mr-1" />
                                                            {archivo.nombre}
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Sin archivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="20"
                                                value={notas[alumno.id] || ''}
                                                onChange={(e) =>
                                                    setNotas({ ...notas, [alumno.id]: e.target.value })
                                                }
                                                className="w-24 mx-auto text-center rounded-xl"
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Button
                                                onClick={() => guardarNota(alumno.id)}
                                                size="sm"
                                                className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                <Save className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
