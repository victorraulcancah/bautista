import { Link } from '@inertiajs/react';
import { User, ChevronRight } from 'lucide-react';
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
            <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 transition-colors ${
                    isUnread
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-100 text-neutral-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                }`}
            >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
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
