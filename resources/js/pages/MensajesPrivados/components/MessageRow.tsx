import { Link } from '@inertiajs/react';
import { User, ChevronRight } from 'lucide-react';
import type { Mensaje } from '../hooks/useMensajes';

type Props = {
    message: Mensaje;
    type: 'inbox' | 'sent';
};

export default function MessageRow({ message, type }: Props) {
    const contact = type === 'inbox' ? message.remitente : message.destinatario;

    return (
        <Link
            href={`/mensajeria/ver/${message.id}`}
            className={`flex items-center p-8 hover:bg-indigo-50/50 transition-all group ${
                type === 'inbox' && !message.leido ? 'bg-indigo-50/30' : ''
            }`}
        >
            <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-6 border transition-colors ${
                    type === 'inbox' && !message.leido
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-white text-gray-400 border-gray-100 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                }`}
            >
                <User className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center justify-between mb-1">
                    <p
                        className={`text-sm tracking-tight ${
                            type === 'inbox' && !message.leido
                                ? 'font-black text-indigo-900'
                                : 'font-bold text-gray-800'
                        }`}
                    >
                        {contact?.perfil?.primer_nombre} {contact?.perfil?.apellido_paterno}
                    </p>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {new Date(message.created_at).toLocaleDateString()}
                    </span>
                </div>
                <h4
                    className={`text-sm truncate ${
                        type === 'inbox' && !message.leido
                            ? 'font-black text-indigo-600'
                            : 'font-medium text-gray-500'
                    }`}
                >
                    {message.asunto}
                </h4>
                <p className="text-xs text-gray-400 truncate line-clamp-1 mt-1 font-medium italic">
                    {message.cuerpo}
                </p>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-indigo-300 transition-colors" />
        </Link>
    );
}
