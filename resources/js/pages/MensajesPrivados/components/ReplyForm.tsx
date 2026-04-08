import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Props = {
    respuesta: string;
    onRespuestaChange: (value: string) => void;
    onSubmit: () => void;
    sending: boolean;
};

export default function ReplyForm({
    respuesta,
    onRespuestaChange,
    onSubmit,
    sending,
}: Props) {
    return (
        <div className="pt-10">
            <div className="bg-gray-100/50 p-6 rounded-[3rem] border-2 border-dashed border-gray-200 focus-within:border-indigo-600 focus-within:bg-white transition-all space-y-4">
                <Textarea
                    placeholder="Escribe tu respuesta aquí..."
                    value={respuesta}
                    onChange={(e) => onRespuestaChange(e.target.value)}
                    className="bg-transparent border-none focus-visible:ring-0 min-h-[120px] font-medium p-4 resize-none"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                            onSubmit();
                        }
                    }}
                />
                <div className="flex items-center justify-between pt-2">
                    <Button
                        variant="ghost"
                        className="rounded-xl h-12 w-12 text-gray-400 hover:text-indigo-600"
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={sending || !respuesta.trim()}
                        className="rounded-2xl h-14 px-10 bg-gray-900 hover:bg-black font-black uppercase tracking-widest text-xs transition-transform active:scale-95"
                    >
                        {sending ? 'Enviando...' : 'Responder'}{' '}
                        <Send className="w-4 h-4 ml-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
