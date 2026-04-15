import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    total: number;
    currentIndex: number;
    answered: boolean[];
    onNavigate: (idx: number) => void;
};

export default function QuestionMap({ total, currentIndex, answered, onNavigate }: Props) {
    return (
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-5 gap-2">
            {Array.from({ length: total }).map((_, idx) => {
                const isCurrent = currentIndex === idx;
                const isAnswered = answered[idx];
                return (
                    <button
                        key={idx}
                        onClick={() => onNavigate(idx)}
                        title={`Pregunta ${idx + 1}`}
                        className={cn(
                            'aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition-all border',
                            isCurrent
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : isAnswered
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-white text-gray-400 border-gray-200 hover:border-indigo-300 hover:text-indigo-500'
                        )}
                    >
                        {isAnswered && !isCurrent
                            ? <CheckCircle2 className="w-3 h-3" />
                            : idx + 1}
                    </button>
                );
            })}
        </div>
    );
}
