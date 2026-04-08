import { Clock } from 'lucide-react';

type Respuesta = {
    id: number;
    respuesta: string;
    created_at: string;
    autor?: {
        id: number;
    };
};

type Props = {
    respuestas: Respuesta[];
    remitenteId: number;
};

export default function MessageThread({ respuestas, remitenteId }: Props) {
    if (!respuestas || respuestas.length === 0) return null;

    return (
        <div className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center mb-10">
                — Conversación —
            </h4>

            {respuestas.map((resp) => {
                const isFromRemitente = resp.autor?.id === remitenteId;

                return (
                    <div
                        key={resp.id}
                        className={`flex ${isFromRemitente ? 'justify-start' : 'justify-end'}`}
                    >
                        <div
                            className={`max-w-[80%] p-8 rounded-[2.5rem] shadow-lg ${
                                isFromRemitente
                                    ? 'bg-white border border-gray-50 rounded-tl-none'
                                    : 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100'
                            }`}
                        >
                            <p className="text-sm font-medium leading-relaxed">
                                {resp.respuesta}
                            </p>
                            <div
                                className={`flex items-center space-x-2 mt-4 text-[10px] font-black uppercase tracking-widest ${
                                    isFromRemitente ? 'text-gray-400' : 'text-indigo-200'
                                }`}
                            >
                                <Clock className="w-3 h-3" />
                                <span>
                                    {new Date(resp.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
