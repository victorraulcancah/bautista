import { Link } from '@inertiajs/react';
import SectionCard from '@/components/shared/SectionCard';

interface Curso {
    docen_curso_id: number;
    curso?: { nombre: string };
    seccion?: { 
        nombre: string;
        grado?: { nombre_grado: string };
    };
}

export default function DocenteCourses({ cursos }: { cursos: Curso[] }) {
    return (
        <SectionCard title="Mis Cursos Actuales">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-[#00a65a] text-white">
                            <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Curso</th>
                            <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Grado</th>
                            <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Sección</th>
                            <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cursos.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-12 text-center text-gray-400 italic">
                                    No tienes cursos asignados aún.
                                </td>
                            </tr>
                        ) : (
                            cursos.map((c) => (
                                <tr key={c.docen_curso_id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-gray-900">{c.curso?.nombre}</td>
                                    <td className="px-4 py-3 text-gray-600">{c.seccion?.grado?.nombre_grado}</td>
                                    <td className="px-4 py-3 text-gray-600">{c.seccion?.nombre}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Link
                                            href={`/docente/cursos/${c.docen_curso_id}/contenido`}
                                            className="inline-flex items-center justify-center rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white"
                                        >
                                            Ver contenido
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </SectionCard>
    );
}
