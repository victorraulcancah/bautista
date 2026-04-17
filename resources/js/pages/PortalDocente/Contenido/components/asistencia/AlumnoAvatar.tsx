interface Props {
    nombre?: string | null;
    foto?: string | null;
    size?: 'sm' | 'md' | 'lg';
}

export function AlumnoAvatar({ nombre, foto, size = 'md' }: Props) {
    const dimensions = {
        sm: 'size-8 text-[10px]',
        md: 'size-10 text-xs',
        lg: 'size-14 text-sm'
    };
    
    const dim = dimensions[size];
    const inicial = nombre?.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

    if (foto) {
        return (
            <div className={`${dim} rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-neutral-100`}>
                <img
                    src={foto}
                    alt={nombre || ''}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    return (
        <div className={`${dim} rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-100 uppercase tracking-tighter`}>
            {inicial}
        </div>
    );
}
