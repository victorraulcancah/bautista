/**
 * AlumnoAvatar — avatar circular con inicial o foto del alumno.
 * Responsabilidad: solo renderizar la imagen/inicial del alumno.
 */
interface Props {
    nombre?: string | null;
    foto?: string | null;
    size?: 'sm' | 'md';
}

export function AlumnoAvatar({ nombre, foto, size = 'md' }: Props) {
    const dim = size === 'sm' ? 'size-8 text-xs' : 'size-10 text-sm';
    const inicial = nombre?.trim().charAt(0).toUpperCase() || '?';

    if (foto) {
        return (
            <img
                src={foto}
                alt={nombre || ''}
                className={`${dim} rounded-full object-cover flex-shrink-0 bg-gray-100`}
            />
        );
    }

    return (
        <div className={`${dim} rounded-full bg-gray-700 text-white font-bold flex items-center justify-center flex-shrink-0`}>
            {inicial}
        </div>
    );
}
