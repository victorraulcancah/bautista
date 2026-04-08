import { Pencil, Printer, Trash2 } from 'lucide-react';
import type { Paginated } from '@/components/shared/ResourceTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Estudiante } from '../hooks/useEstudiantes';
import { nombreCompleto, dniEstudiante } from '../hooks/useEstudiantes';

type Props = {
    estudiantes:  Paginated<Estudiante>;
    onEdit:       (e: Estudiante) => void;
    onDelete:     (e: Estudiante) => void;
    onPageChange: (page: number) => void;
};

const estadoBadge = (estado: string) => {
    if (estado === '1') {
return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Activo</Badge>;
}

    if (estado === '5') {
return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Bloqueado</Badge>;
}

    return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Inactivo</Badge>;
};

export default function EstudiantesTable({ estudiantes, onEdit, onDelete, onPageChange }: Props) {
    return (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
            {estudiantes.data.length === 0 ? (
                <p className="py-16 text-center text-xs sm:text-sm text-neutral-400">
                    No se encontraron estudiantes.
                </p>
            ) : (
                <>
                    {/* Vista móvil: Cards */}
                    <div className="block sm:hidden space-y-3 p-4">
                        {estudiantes.data.map((est, i) => (
                            <div key={est.estu_id} className="border rounded-lg p-3 space-y-2 bg-white shadow-sm">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-neutral-400">
                                                #{(estudiantes.from ?? 0) + i}
                                            </span>
                                            {estadoBadge(est.estado)}
                                        </div>
                                        <p className="text-sm font-bold text-neutral-900">{nombreCompleto(est)}</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            DNI: {dniEstudiante(est)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {est.perfil?.genero === 'M' && (
                                                <span className="text-xs text-blue-600 font-medium">Masculino</span>
                                            )}
                                            {est.perfil?.genero === 'F' && (
                                                <span className="text-xs text-pink-600 font-medium">Femenino</span>
                                            )}
                                            {est.perfil?.telefono && (
                                                <span className="text-xs text-neutral-500">· {est.perfil.telefono}</span>
                                            )}
                                        </div>
                                        {est.colegio && (
                                            <p className="text-xs text-neutral-400 mt-0.5">
                                                Colegio: {est.colegio}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-1.5 pt-2 border-t">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 h-8 text-xs text-blue-500"
                                        onClick={() => onEdit(est)}
                                    >
                                        <Pencil className="h-3.5 w-3.5 mr-1" />
                                        Editar
                                    </Button>
                                    <a
                                        href={`/estudiantes/${est.estu_id}/fotocheck`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1"
                                    >
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full h-8 text-xs text-emerald-600"
                                        >
                                            <Printer className="h-3.5 w-3.5 mr-1" />
                                            Carnet
                                        </Button>
                                    </a>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 w-8 p-0 text-red-500"
                                        onClick={() => onDelete(est)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Vista desktop: Tabla */}
                    <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-[60vh]">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-[#00a65a] text-white text-center">
                                    <th className="px-3 py-2 w-10">N°</th>
                                    <th className="px-3 py-2 text-left">Nombre Completo</th>
                                    <th className="px-3 py-2">DNI</th>
                                    <th className="px-3 py-2">Género</th>
                                    <th className="px-3 py-2">Teléfono</th>
                                    <th className="px-3 py-2">Colegio</th>
                                    <th className="px-3 py-2">Estado</th>
                                    <th className="px-3 py-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.data.map((est, i) => (
                                    <tr
                                        key={est.estu_id}
                                        className="border-b border-gray-100 hover:bg-gray-50 text-center"
                                    >
                                        <td className="px-3 py-2 text-gray-500">{(estudiantes.from ?? 0) + i}</td>
                                        <td className="px-3 py-2 text-left font-medium text-gray-800">
                                            {nombreCompleto(est)}
                                        </td>
                                        <td className="px-3 py-2 text-gray-600">{dniEstudiante(est)}</td>
                                        <td className="px-3 py-2">
                                            {est.perfil?.genero === 'M' && (
                                                <span className="text-blue-600 font-medium">Masculino</span>
                                            )}
                                            {est.perfil?.genero === 'F' && (
                                                <span className="text-pink-600 font-medium">Femenino</span>
                                            )}
                                            {!est.perfil?.genero && <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="px-3 py-2 text-gray-600">{est.perfil?.telefono || '—'}</td>
                                        <td className="px-3 py-2 text-gray-600">{est.colegio || '—'}</td>
                                        <td className="px-3 py-2">{estadoBadge(est.estado)}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-7 text-blue-600 hover:bg-blue-50"
                                                    onClick={() => onEdit(est)}
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                                <a
                                                    href={`/estudiantes/${est.estu_id}/fotocheck`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-7 text-emerald-600 hover:bg-emerald-50"
                                                        title="Imprimir Fotocheck / Carnet"
                                                    >
                                                        <Printer className="size-3.5" />
                                                    </Button>
                                                </a>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-7 text-red-500 hover:bg-red-50"
                                                    onClick={() => onDelete(est)}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Paginación */}
            {estudiantes.last_page > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 px-4 py-3 gap-3">
                    <span className="text-xs sm:text-sm text-gray-500">
                        Mostrando {estudiantes.from}–{estudiantes.to} de {estudiantes.total} estudiantes
                    </span>
                    <div className="flex gap-1 flex-wrap justify-center">
                        {Array.from({ length: estudiantes.last_page }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`size-8 rounded text-xs font-medium transition-colors ${
                                    p === estudiantes.current_page
                                        ? 'bg-[#00a65a] text-white'
                                        : 'hover:bg-gray-100 text-gray-600'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
