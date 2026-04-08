import UserAvatar from './UserAvatar';

type Respuesta = {
    id: number;
    respuesta: string;
    created_at: string;
    autor?: {
        id: number;
        perfil?: {
            primer_nombre: string;
            apellido_paterno: string;
            foto_perfil?: string | null;
        };
    };
};

type Props = {
    respuestas: Respuesta[];
    remitenteId: number;
};

export default function MessageThread({ respuestas, remitenteId }: Props) {
    if (!respuestas || respuestas.length === 0) return null;

    return (
        <div className="space-y-4">
            {respuestas.map((resp) => {
                const isFromRemitente = resp.autor?.id === remitenteId;

                return (
                    <div
                        key={resp.id}
                        className={`flex ${isFromRemitente ? 'justify-start' : 'justify-end'}`}
                    >
                        <div
                            className={`w-full sm:max-w-[85%] md:max-w-[80%] rounded-2xl p-4 sm:p-6 ${
                                isFromRemitente
                                    ? 'bg-white border border-neutral-200'
                                    : 'bg-indigo-600 text-white'
                            }`}
                        >
                            {/* Avatar y nombre */}
                            <div className="flex items-center gap-3 mb-3">
                                <UserAvatar
                                    fotoPerfil={resp.autor?.perfil?.foto_perfil}
                                    nombre={`${resp.autor?.perfil?.primer_nombre} ${resp.autor?.perfil?.apellido_paterno}`}
                                    size="sm"
                                    className={isFromRemitente ? '' : 'ring-2 ring-indigo-500'}
                                />
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-xs font-bold truncate ${
                                            isFromRemitente ? 'text-neutral-900' : 'text-white'
                                        }`}
                                    >
                                        {resp.autor?.perfil?.primer_nombre}{' '}
                                        {resp.autor?.perfil?.apellido_paterno}
                                    </p>
                                    <p
                                        className={`text-[10px] font-medium ${
                                            isFromRemitente ? 'text-neutral-400' : 'text-indigo-200'
                                        }`}
                                    >
                                        {new Date(resp.created_at).toLocaleString('es-ES', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Contenido */}
                            <p
                                className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                    isFromRemitente ? 'text-neutral-700' : 'text-white'
                                }`}
                            >
                                {resp.respuesta}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
