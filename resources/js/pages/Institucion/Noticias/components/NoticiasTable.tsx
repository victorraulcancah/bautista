import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/components/shared/ResourceTable';
import type { Noticia } from '../hooks/useNoticias';

type Props = {
    noticias:    Paginated<Noticia>;
    onEdit:      (n: Noticia) => void;
    onDelete:    (n: Noticia) => void;
    onPageChange:(page: number) => void;
};

export default function NoticiasTable({ noticias, onEdit, onDelete, onPageChange }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-[#00a65a] text-white text-center">
                        <th className="px-3 py-2 w-10">N°</th>
                        <th className="px-3 py-2 text-left">Título</th>
                        <th className="px-3 py-2 text-left">Contenido</th>
                        <th className="px-3 py-2">Fecha</th>
                        <th className="px-3 py-2">Imagen</th>
                        <th className="px-3 py-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {noticias.data.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-400">
                                No hay noticias publicadas.
                            </td>
                        </tr>
                    ) : noticias.data.map((n, i) => (
                        <tr key={n.not_id} className="border-b border-gray-100 hover:bg-gray-50 text-center">
                            <td className="px-3 py-2 text-gray-500">{(noticias.from ?? 0) + i}</td>
                            <td className="px-3 py-2 text-left font-medium text-gray-800 max-w-[200px] truncate">{n.not_titulo}</td>
                            <td className="px-3 py-2 text-left text-gray-600 max-w-[300px] truncate">{n.not_mensaje || '—'}</td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{n.not_fecha ?? '—'}</td>
                            <td className="px-3 py-2">
                                {n.url ? (
                                    <img
                                        src={n.url}
                                        alt={n.not_titulo}
                                        className="mx-auto h-10 w-16 rounded object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-300">—</span>
                                )}
                            </td>
                            <td className="px-3 py-2">
                                <div className="flex items-center justify-center gap-1">
                                    <Button size="icon" variant="ghost" className="size-7 text-blue-600 hover:bg-blue-50" onClick={() => onEdit(n)}>
                                        <Pencil className="size-3.5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="size-7 text-red-500 hover:bg-red-50" onClick={() => onDelete(n)}>
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {noticias.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
                    <span>Mostrando {noticias.from}–{noticias.to} de {noticias.total} noticias</span>
                    <div className="flex gap-1">
                        {Array.from({ length: noticias.last_page }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`size-8 rounded text-xs font-medium transition-colors ${p === noticias.current_page ? 'bg-[#00a65a] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
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
