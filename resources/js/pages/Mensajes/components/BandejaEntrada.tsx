import { RefreshCw } from 'lucide-react';

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
        return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};


type Mensaje = {
    id:          number;
    asunto:      string;
    cuerpo:      string;
    leido:       boolean;
    created_at:  string;
    remitente:   { id: number; nombre: string } | null;
    grupo:       { id: number; nombre: string } | null;
};

type Paginated<T> = {
    data:         T[];
    current_page: number;
    last_page:    number;
    total:        number;
    from:         number;
    to:           number;
};

type Props = {
    mensajes:    Paginated<Mensaje> | null;
    loading:     boolean;
    onSelect:    (id: number) => void;
    onRefresh:   () => void;
    onPageChange:(p: number) => void;
};

export default function BandejaEntrada({ mensajes, loading, onSelect, onRefresh, onPageChange }: Props) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
                <p className="text-sm font-medium text-gray-700">Bandeja de Entrada</p>
                <button onClick={onRefresh} className="rounded p-1 hover:bg-gray-100" title="Actualizar">
                    <RefreshCw className={`size-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading && !mensajes ? (
                    <p className="py-8 text-center text-sm text-gray-400">Cargando...</p>
                ) : !mensajes || mensajes.data.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-400">No hay mensajes.</p>
                ) : (
                    <ul>
                        {mensajes.data.map((m) => (
                            <li
                                key={m.id}
                                onClick={() => onSelect(m.id)}
                                className={`cursor-pointer border-b border-gray-100 px-4 py-3 hover:bg-gray-50 ${!m.leido ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className={`truncate text-sm ${!m.leido ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                            {m.asunto}
                                        </p>
                                        <p className="truncate text-xs text-gray-500">
                                            {m.remitente?.nombre ?? '—'}
                                            {m.grupo ? <span className="ml-1 text-green-600">· {m.grupo.nombre}</span> : null}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-gray-400">
                                            {stripHtml(m.cuerpo).substring(0, 80)}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        <span className="whitespace-nowrap text-xs text-gray-400">{fmtDate(m.created_at)}</span>

                                        {!m.leido && (
                                            <span className="inline-block size-2 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {mensajes && mensajes.last_page > 1 && (
                <div className="flex justify-center gap-1 border-t border-gray-100 px-4 py-2">
                    {Array.from({ length: mensajes.last_page }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`size-7 rounded text-xs font-medium ${p === mensajes.current_page ? 'bg-[#00a65a] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
