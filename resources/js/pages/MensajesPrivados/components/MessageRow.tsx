import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import UserAvatar from './UserAvatar';
import type { Mensaje } from '../hooks/useMensajes';

type Props = {
    message: Mensaje;
    type: 'inbox' | 'sent';
};

export default function MessageRow({ message, type }: Props) {
    const contact = type === 'inbox' ? message.remitente : message.destinatario;
    const isUnread = type === 'inbox' && !message.leido;

    return (
        <Link
            href={`/mensajeria/ver/${message.id}`}
            className={`flex items-center p-4 sm:p-6 hover:bg-indigo-50 transition-all group ${
                isUnread ? 'bg-indigo-50/50' : ''
            }`}
        >
            {/* Avatar */}
            <div className="mr-3 sm:mr-4">
                <UserAvatar
                    fotoPerfil={contact?.perfil?.foto_perfil}
                    nombre={`${contact?.perfil?.primer_nombre} ${contact?.perfil?.apellido_paterno}`}
                    size="md"
                    className={`transition-all ${
                        isUnread
                            ? 'ring-2 ring-indigo-600'
                            : 'group-hover:ring-2 group-hover:ring-indigo-200'
                    }`}
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <p
                        className={`text-xs sm:text-sm truncate ${
                            isUnread
                                ? 'font-black text-neutral-900'
                                : 'font-bold text-neutral-700'
                        }`}
                    >
                        {contact?.perfil?.primer_nombre} {contact?.perfil?.apellido_paterno}
                    </p>
                    <span className="text-[10px] sm:text-xs font-medium text-neutral-400 ml-2 flex-shrink-0">
                        {new Date(message.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                        })}
                    </span>
                </div>
                <h4
                    className={`text-xs sm:text-sm truncate mb-1 ${
                        isUnread ? 'font-bold text-indigo-600' : 'font-medium text-neutral-600'
                    }`}
                >
                    {message.asunto}
                </h4>
                <p className="text-[10px] sm:text-xs text-neutral-400 truncate font-medium hidden sm:block">
                    {message.cuerpo}
                </p>
            </div>

            {/* Icon */}
            <div className="ml-3 sm:ml-4 flex items-center gap-2 flex-shrink-0">
                {isUnread && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                )}
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300 group-hover:text-indigo-400 transition-colors" />
            </div>
        </Link>
    );
}
