const TIPO_COLORS: Record<string, string> = {
    'Examen':        'bg-red-100 text-red-700',
    'Cuestionario':  'bg-purple-100 text-purple-700',
    'Tarea':         'bg-blue-100 text-blue-700',
    'Dibujo':        'bg-yellow-100 text-yellow-700',
    'Rompecabezas':  'bg-green-100 text-green-700',
};

export default function TipoBadge({ nombre }: { nombre?: string }) {
    if (!nombre) return <span className="text-gray-400 text-xs">—</span>;
    const cls = TIPO_COLORS[nombre] ?? 'bg-gray-100 text-gray-600';
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
            {nombre}
        </span>
    );
}
