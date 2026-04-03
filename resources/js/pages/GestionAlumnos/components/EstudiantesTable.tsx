import { Pencil, Printer, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/components/shared/ResourceTable';
import type { Estudiante } from '../hooks/useEstudiantes';
import { nombreCompleto, dniEstudiante } from '../hooks/useEstudiantes';

type Props = {
    estudiantes:  Paginated<Estudiante>;
    onEdit:       (e: Estudiante) => void;
    onDelete:     (e: Estudiante) => void;
    onPageChange: (page: number) => void;
};

const estadoBadge = (estado: string) => {
    if (estado === '1') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Activo</Badge>;
    if (estado === '5') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Bloqueado</Badge>;
    return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Inactivo</Badge>;
};

export default function EstudiantesTable({ estudiantes, onEdit, onDelete, onPageChange }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
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
                    {estudiantes.data.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="py-8 text-center text-gray-400">
                                No se encontraron estudiantes.
                            </td>
                        </tr>
                    ) : estudiantes.data.map((est, i) => (
                        <tr key={est.estu_id} className="border-b border-gray-100 hover:bg-gray-50 text-center">
                            <td className="px-3 py-2 text-gray-500">{(estudiantes.from ?? 0) + i}</td>
                            <td className="px-3 py-2 text-left font-medium text-gray-800">{nombreCompleto(est)}</td>
                            <td className="px-3 py-2 text-gray-600">{dniEstudiante(est)}</td>
                            <td className="px-3 py-2">
                                {est.perfil?.genero === 'M' && <span className="text-blue-600 font-medium">Masculino</span>}
                                {est.perfil?.genero === 'F' && <span className="text-pink-600 font-medium">Femenino</span>}
                                {!est.perfil?.genero && <span className="text-gray-400">—</span>}
                            </td>
                            <td className="px-3 py-2 text-gray-600">{est.perfil?.telefono || '—'}</td>
                            <td className="px-3 py-2 text-gray-600">{est.colegio || '—'}</td>
                            <td className="px-3 py-2">{estadoBadge(est.estado)}</td>
                            <td className="px-3 py-2">
                                <div className="flex items-center justify-center gap-1">
                                    <Button size="icon" variant="ghost" className="size-7 text-blue-600 hover:bg-blue-50" onClick={() => onEdit(est)}>
                                        <Pencil className="size-3.5" />
                                    </Button>
                                    <a href={`/estudiantes/${est.estu_id}/fotocheck`} target="_blank" rel="noopener noreferrer">
                                        <Button size="icon" variant="ghost" className="size-7 text-emerald-600 hover:bg-emerald-50" title="Imprimir Fotocheck / Carnet">
                                            <Printer className="size-3.5" />
                                        </Button>
                                    </a>
                                    <Button size="icon" variant="ghost" className="size-7 text-red-500 hover:bg-red-50" onClick={() => onDelete(est)}>
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {estudiantes.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
                    <span>Mostrando {estudiantes.from}–{estudiantes.to} de {estudiantes.total} estudiantes</span>
                    <div className="flex gap-1">
                        {Array.from({ length: estudiantes.last_page }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`size-8 rounded text-xs font-medium transition-colors ${p === estudiantes.current_page ? 'bg-[#00a65a] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
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
