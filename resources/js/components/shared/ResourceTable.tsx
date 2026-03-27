import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type Column<T> = {
    label:      string;
    className?: string;
    render:     (row: T, index: number) => React.ReactNode;
};

export type Paginated<T> = {
    data:         T[];
    current_page: number;
    last_page:    number;
    per_page:     number;
    total:        number;
    from:         number;
    to:           number;
};

type Props<T> = {
    rows:          Paginated<T>;
    columns:       Column<T>[];
    getKey:        (row: T) => number | string;
    onEdit?:       (row: T) => void;
    onDelete?:     (row: T) => void;
    onPageChange:  (page: number) => void;
};

export default function ResourceTable<T>({ rows, columns, getKey, onEdit, onDelete, onPageChange }: Props<T>) {
    const showActions = !!(onEdit || onDelete);
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-[#00a65a] text-white text-center">
                        <th className="px-3 py-2 w-10">N°</th>
                        {columns.map((c, idx) => (
                            <th key={`col-${idx}`} className={`px-3 py-2 ${c.className ?? ''}`}>{c.label}</th>
                        ))}
                        {showActions && <th className="px-3 py-2">Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + 1 + (showActions ? 1 : 0)} className="py-8 text-center text-gray-400">
                                No se encontraron registros.
                            </td>
                        </tr>
                    ) : rows.data.map((row, i) => (
                        <tr key={getKey(row)} className="border-b border-gray-100 hover:bg-gray-50 text-center">
                            <td className="px-3 py-2 text-gray-500">{(rows.from ?? 0) + i}</td>
                            {columns.map((c, idx) => (
                                <td key={`cell-${idx}`} className={`px-3 py-2 ${c.className ?? ''}`}>
                                    {c.render(row, i)}
                                </td>
                            ))}
                            {showActions && (
                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-center gap-1">
                                        {onEdit && (
                                            <Button size="icon" variant="ghost" className="size-7 text-blue-600 hover:bg-blue-50" onClick={() => onEdit(row)}>
                                                <Pencil className="size-3.5" />
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button size="icon" variant="ghost" className="size-7 text-red-500 hover:bg-red-50" onClick={() => onDelete(row)}>
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {rows.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
                    <span>Mostrando {rows.from}–{rows.to} de {rows.total} registros</span>
                    <div className="flex gap-1">
                        {Array.from({ length: rows.last_page }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`size-8 rounded text-xs font-medium transition-colors ${p === rows.current_page ? 'bg-[#00a65a] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
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
