import { Link } from '@inertiajs/react';
import SectionCard from '@/components/shared/SectionCard';
import { BookOpen } from 'lucide-react';

interface Curso {
    docen_curso_id: number;
    curso?: { nombre: string };
    seccion?: { 
        nombre: string;
        grado?: { nombre_grado: string };
    };
}

export default function DocenteCourses({ cursos }: { cursos: Curso[] }) {
    if (cursos.length === 0) {
        return (
            <SectionCard title="Mis Cursos Actuales">
                <p className="py-12 text-center text-gray-400 italic text-sm">
                    No tienes cursos asignados aún.
                </p>
            </SectionCard>
        );
    }

    return (
        <SectionCard title="Mis Cursos Actuales">
            {/* ── Tabla: visible en md+ ─────────────────────────────── */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
                        {cursos.map((c) => (
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Cards: visible solo en móvil ──────────────────────── */}
            <div className="flex flex-col gap-3 md:hidden">
                {cursos.map((c) => (
                    <div
                        key={c.docen_curso_id}
                        className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                        {/* Ícono */}
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <BookOpen className="size-5" />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-black text-gray-900 text-sm">
                                {c.curso?.nombre ?? '—'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {c.seccion?.grado?.nombre_grado ?? '—'}
                                {c.seccion?.nombre ? ` · ${c.seccion.nombre}` : ''}
                            </p>
                        </div>

                        {/* Botón */}
                        <Link
                            href={`/docente/cursos/${c.docen_curso_id}/contenido`}
                            className="shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white"
                        >
                            Ver
                        </Link>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
}
