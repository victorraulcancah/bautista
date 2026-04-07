import { RefreshCw, Users } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
        return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
};

const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

type Mensaje = {
    id:          number;
    asunto:      string;
    cuerpo:      string;
    leido:       boolean;
    created_at:  string;
    remitente:   { id: number; nombre: string; foto?: string | null } | null;
    grupo:       { id: number; nombre: string; foto?: string | null } | null;
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
        <div className="flex flex-col h-full bg-white">
            {/* Header de Bandeja */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                <p className="text-base font-black uppercase tracking-widest text-gray-900">Mensajes</p>
                <button onClick={onRefresh} className="rounded-full p-2 hover:bg-gray-200/50 transition-colors" title="Actualizar">
                    <RefreshCw className={`size-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading && !mensajes ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="size-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
                    </div>
                ) : !mensajes || mensajes.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <p className="text-sm">No hay mensajes.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {mensajes.data.map((m) => (
                            <li
                                key={m.id}
                                onClick={() => onSelect(m.id)}
                                className={`group cursor-pointer px-4 py-3.5 transition-all hover:bg-gray-50 ${!m.leido ? 'bg-emerald-50/30' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar Column */}
                                    <div className="relative shrink-0">
                                        <Avatar className="size-12 ring-2 ring-transparent transition-all group-hover:ring-emerald-100">
                                            {m.grupo ? (
                                                <>
                                                    <AvatarImage src={m.grupo.foto || ''} alt={m.grupo.nombre} />
                                                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                                        <Users className="size-6" />
                                                    </AvatarFallback>
                                                </>
                                            ) : (
                                                <>
                                                    <AvatarImage src={m.remitente?.foto || ''} alt={m.remitente?.nombre} />
                                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-sm">
                                                        {getInitials(m.remitente?.nombre || '?')}
                                                    </AvatarFallback>
                                                </>
                                            )}
                                        </Avatar>
                                        {!m.leido && (
                                            <span className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full border-2 border-white bg-[#00a65a]" />
                                        )}
                                    </div>

                                    {/* Content Column */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <h3 className={`truncate text-sm tracking-tight ${!m.leido ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                                                {m.grupo ? m.grupo.nombre : (m.remitente?.nombre ?? '—')}
                                            </h3>
                                            <span className={`whitespace-nowrap text-[10px] tabular-nums ${!m.leido ? 'font-bold text-emerald-600' : 'text-gray-400'}`}>
                                                {fmtDate(m.created_at)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                            <p className={`line-clamp-1 text-xs ${!m.leido ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                                {m.asunto}
                                            </p>
                                        </div>
                                        
                                        <p className="mt-1 line-clamp-1 text-xs text-gray-400">
                                            {m.grupo && <span className="font-semibold text-emerald-600 mr-1">{m.remitente?.nombre}:</span>}
                                            {stripHtml(m.cuerpo)}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Pagination */}
            {mensajes && mensajes.last_page > 1 && (
                <div className="flex justify-center gap-1.5 border-t border-gray-100 bg-gray-50/50 px-4 py-3">
                    {Array.from({ length: mensajes.last_page }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`size-8 rounded-lg text-xs font-black transition-all ${p === mensajes.current_page ? 'bg-[#00a65a] text-white shadow-sm ring-1 ring-emerald-500' : 'hover:bg-gray-200/50 text-gray-500 border border-gray-200'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
