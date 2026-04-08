import { User } from 'lucide-react';

type Props = {
    fotoPerfil?: string | null;
    nombre?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

export default function UserAvatar({ fotoPerfil, nombre, size = 'md', className = '' }: Props) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-14 h-14',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-7 h-7',
    };

    const getInitials = (name?: string) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (fotoPerfil) {
        // Si la foto ya es una URL completa, usarla directamente, sino agregar /storage/
        const imageUrl = fotoPerfil.startsWith('http') ? fotoPerfil : `/storage/${fotoPerfil}`;
        
        return (
            <div className={`${sizeClasses[size]} rounded-xl overflow-hidden flex-shrink-0 bg-indigo-600 ${className}`}>
                <img
                    src={imageUrl}
                    alt={nombre || 'Usuario'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Si la imagen falla, reemplazar con el fallback
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                            parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                    ${getInitials(nombre)}
                                </div>
                            `;
                        }
                    }}
                />
            </div>
        );
    }

    // Si no hay foto, mostrar iniciales o icono
    return (
        <div className={`${sizeClasses[size]} rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 ${className}`}>
            {nombre ? (
                <span className="font-bold text-sm">{getInitials(nombre)}</span>
            ) : (
                <User className={iconSizes[size]} />
            )}
        </div>
    );
}
