import { Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/components/shared/ResourceTable';
import type { Noticia } from '../hooks/useNoticias';

type Props = {
    noticias:    Paginated<Noticia>;
    onEdit:      (n: Noticia) => void;
    onDelete:    (n: Noticia) => void;
    onView:      (n: Noticia) => void;
    onPageChange:(page: number) => void;
};

export default function NoticiasTable({ noticias, onEdit, onDelete, onView, onPageChange }: Props) {
    return (
        <div className="overflow-x-auto bg-white rounded-2xl border border-neutral-100 shadow-sm">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-[#00a65a] text-white text-[11px] font-black uppercase tracking-widest text-center shadow-sm">
                        <th className="px-6 py-4 w-10">N° Edición</th>
                        <th className="px-6 py-4 text-left">Titulares de Portada</th>
                        <th className="px-6 py-4 text-left">Resumen Editorial</th>
                        <th className="px-6 py-4">Fecha Crónica</th>
                        <th className="px-6 py-4">Fotografía</th>
                        <th className="px-6 py-4">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {noticias.data.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-12 text-center text-neutral-400 font-medium italic">
                                La mesa de redacción está vacía. Comience a redactar una nueva crónica.
                            </td>
                        </tr>
                    ) : noticias.data.map((n, i) => (
                        <tr key={n.not_id} className="group hover:bg-neutral-50/50 transition-colors text-center">
                            <td className="px-6 py-5 text-neutral-400 font-bold">{(noticias.from ?? 0) + i}</td>
                            <td className="px-6 py-5 text-left font-black text-neutral-900 max-w-[200px] truncate group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{n.not_titulo}</td>
                            <td className="px-6 py-5 text-left text-neutral-500 max-w-[300px] truncate italic">{n.not_resumen || n.not_mensaje || '—'}</td>
                            <td className="px-6 py-5 text-neutral-600 whitespace-nowrap font-medium">{n.not_fecha ?? '—'}</td>
                            <td className="px-6 py-5">
                                {n.url ? (
                                    <img
                                        src={n.url}
                                        alt={n.not_titulo}
                                        className="mx-auto h-12 w-20 rounded-xl object-cover border-2 border-neutral-100 shadow-sm group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="mx-auto h-12 w-20 rounded-xl border-2 border-dashed border-neutral-200 flex items-center justify-center text-[10px] text-neutral-300 font-black">NO IMAGE</div>
                                )}
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center justify-center gap-2">
                                    <Button size="icon" variant="ghost" className="size-9 rounded-xl text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-100" title="Previsualizar" onClick={() => onView(n)}>
                                        <Eye className="size-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="size-9 rounded-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-100" title="Editar" onClick={() => onEdit(n)}>
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="size-9 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100" title="Eliminar" onClick={() => onDelete(n)}>
                                        <Trash2 className="size-4" />
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
