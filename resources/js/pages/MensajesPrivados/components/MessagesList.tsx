import { Inbox, Send, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MessageRow from './MessageRow';
import type { Mensaje } from '../hooks/useMensajes';

type Props = {
    recibidos: Mensaje[];
    enviados: Mensaje[];
    searchTerm: string;
    onSearchChange: (term: string) => void;
};

export default function MessagesList({
    recibidos,
    enviados,
    searchTerm,
    onSearchChange,
}: Props) {
    return (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden min-h-[500px]">
            <Tabs defaultValue="recibidos" className="w-full">
                <div className="px-10 py-6 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <TabsList className="bg-gray-100/50 p-1 rounded-2xl h-14">
                        <TabsTrigger
                            value="recibidos"
                            className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest"
                        >
                            <Inbox className="w-4 h-4 mr-2" /> Recibidos
                        </TabsTrigger>
                        <TabsTrigger
                            value="enviados"
                            className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest"
                        >
                            <Send className="w-4 h-4 mr-2" /> Enviados
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Filtrar mensajes..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-11 h-12 rounded-2xl border-gray-100 border-2"
                        />
                    </div>
                </div>

                <TabsContent value="recibidos" className="m-0">
                    {recibidos.length === 0 ? (
                        <EmptyState text="No hay mensajes en tu bandeja de entrada." />
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {recibidos.map((m) => (
                                <MessageRow key={m.id} message={m} type="inbox" />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="enviados" className="m-0">
                    {enviados.length === 0 ? (
                        <EmptyState text="Aún no has enviado ningún mensaje." />
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {enviados.map((m) => (
                                <MessageRow key={m.id} message={m} type="sent" />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                <Inbox className="w-10 h-10" />
            </div>
            <p className="text-gray-400 font-bold italic">{text}</p>
        </div>
    );
}
