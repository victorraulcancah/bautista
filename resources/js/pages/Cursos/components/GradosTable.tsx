import { BookOpen, Pencil, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Grado } from '../../Grados/hooks/useGrados';

type Props = {
    grados: Grado[];
    loading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    onSelectGrado: (grado: Grado) => void;
    onEditGrado: (grado: Grado) => void;
    onDeleteGrado: (grado: Grado) => void;
};

export default function GradosTable({
    grados,
    loading,
    search,
    onSearchChange,
    onSelectGrado,
    onEditGrado,
    onDeleteGrado,
}: Props) {
    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-600 p-2 shadow-lg shadow-emerald-100">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-neutral-950">Cursos</h1>
                        <p className="text-xs sm:text-sm text-neutral-500">
                            {loading ? '…' : `${grados.length} grados registrados`}
                        </p>
                    </div>
                </div>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar grado..."
                        className="pl-9 w-full sm:w-56 h-9 text-sm"
                    />
                </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <p className="py-16 text-center text-xs sm:text-sm text-neutral-400">Cargando…</p>
                ) : (
                    <>
                        {/* Vista móvil: Cards */}
                        <div className="block sm:hidden space-y-3 p-4">
                            {grados.map((g, idx) => (
                                <div key={g.grado_id} className="border rounded-lg p-3 space-y-2 bg-white shadow-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-neutral-400">#{idx + 1}</span>
                                            </div>
                                            <p className="text-sm font-bold text-neutral-900">{g.nombre_grado}</p>
                                            <p className="text-xs text-neutral-500 mt-0.5">
                                                {g.nivel?.nombre_nivel ?? '—'}
                                            </p>
                                            {g.abreviatura && (
                                                <p className="text-xs text-neutral-400 mt-0.5">
                                                    Abrev: {g.abreviatura}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5 pt-2 border-t justify-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                                            onClick={() => onSelectGrado(g)}
                                            title="Ver cursos"
                                        >
                                            <BookOpen className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 text-amber-500"
                                            onClick={() => onEditGrado(g)}
                                            title="Editar"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 text-red-500"
                                            onClick={() => onDeleteGrado(g)}
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {grados.length === 0 && (
                                <p className="py-16 text-center text-xs text-neutral-400">
                                    {search ? 'Sin resultados para la búsqueda.' : 'No hay grados registrados.'}
                                </p>
                            )}
                        </div>

                        {/* Vista desktop: Tabla */}
                        <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-[60vh]">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 z-10 border-b border-emerald-700">
                                    <tr className="bg-emerald-600">
                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">#</th>
                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Nivel Académico</th>
                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Grado</th>
                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Abreviatura</th>
                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grados.map((g, idx) => (
                                        <tr key={g.grado_id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 text-center text-neutral-400">{idx + 1}</td>
                                            <td className="px-4 py-3 text-center text-neutral-600">{g.nivel?.nombre_nivel ?? '—'}</td>
                                            <td className="px-4 py-3 text-center font-medium">{g.nombre_grado}</td>
                                            <td className="px-4 py-3 text-center text-neutral-500">{g.abreviatura ?? '—'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                                                        title="Ver cursos"
                                                        onClick={() => onSelectGrado(g)}
                                                    >
                                                        <BookOpen className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-amber-500 hover:text-amber-700"
                                                        title="Editar grado"
                                                        onClick={() => onEditGrado(g)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                        title="Eliminar grado"
                                                        onClick={() => onDeleteGrado(g)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {grados.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center text-sm text-neutral-400">
                                                {search ? 'Sin resultados para la búsqueda.' : 'No hay grados registrados.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
