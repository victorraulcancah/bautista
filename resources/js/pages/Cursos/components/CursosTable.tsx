import { ArrowLeft, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Curso } from '../hooks/useCursos';

type Props = {
    cursos: Curso[];
    loading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    onBack: () => void;
    onCreate: () => void;
    onEdit: (curso: Curso) => void;
    onDelete: (curso: Curso) => void;
    title: string;
    subtitle: string;
    modoNivelDirecto?: boolean;
};

export default function CursosTable({
    cursos,
    loading,
    search,
    onSearchChange,
    onBack,
    onCreate,
    onEdit,
    onDelete,
    title,
    subtitle,
    modoNivelDirecto = false,
}: Props) {
    return (
        <>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-neutral-500 hover:text-neutral-800 h-8 px-2 sm:px-3"
                        onClick={onBack}
                    >
                        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">Volver</span>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-lg sm:text-2xl font-black text-neutral-950">
                            {title}
                            {!modoNivelDirecto && <span className="ml-2 text-neutral-400 font-normal text-sm sm:text-lg">· Cursos</span>}
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500">
                            {subtitle}
                            {' · '}
                            <span className="font-semibold text-emerald-600">{cursos.length} cursos</span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Buscar curso..."
                            className="pl-9 w-full sm:w-56 h-9 text-sm"
                        />
                    </div>
                    <Button onClick={onCreate} className="bg-[#00a65a] hover:bg-[#008d4c] text-white gap-2 h-9 text-sm">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Agregar Curso</span>
                        <span className="sm:hidden">Agregar</span>
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <p className="py-16 text-center text-xs sm:text-sm text-neutral-400">Cargando…</p>
                ) : (
                    <>
                        {/* Vista móvil: Cards */}
                        <div className="block sm:hidden space-y-3 p-4">
                            {cursos.map((c, idx) => (
                                <div key={c.curso_id} className="border rounded-lg p-3 space-y-2 bg-white shadow-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-neutral-400">#{idx + 1}</span>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.estado === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {c.estado === '1' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-neutral-900">{c.nombre}</p>
                                            {c.descripcion && (
                                                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                                                    {c.descripcion}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5 pt-2 border-t">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs text-blue-500"
                                            onClick={() => onEdit(c)}
                                        >
                                            <Pencil className="h-3.5 w-3.5 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 text-red-500"
                                            onClick={() => onDelete(c)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {cursos.length === 0 && (
                                <p className="py-16 text-center text-xs text-neutral-400">
                                    {search ? 'Sin resultados para la búsqueda.' : 'No hay cursos para este grado.'}
                                </p>
                            )}
                        </div>

                        {/* Vista desktop: Tabla */}
                        <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-[60vh]">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-[#00a65a]">
                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">#</th>
                                        <th className="px-4 py-3 text-left text-white text-xs font-semibold uppercase">Curso</th>
                                        <th className="px-4 py-3 text-left text-white text-xs font-semibold uppercase">Descripción</th>
                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Estado</th>
                                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cursos.map((c, idx) => (
                                        <tr key={c.curso_id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 text-center text-neutral-400">{idx + 1}</td>
                                            <td className="px-4 py-3 font-medium">{c.nombre}</td>
                                            <td className="px-4 py-3 text-neutral-600">{c.descripcion ?? '—'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${c.estado === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {c.estado === '1' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                                                        title="Editar curso"
                                                        onClick={() => onEdit(c)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                        title="Eliminar curso"
                                                        onClick={() => onDelete(c)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {cursos.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center text-sm text-neutral-400">
                                                {search ? 'Sin resultados para la búsqueda.' : 'No hay cursos para este grado.'}
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
