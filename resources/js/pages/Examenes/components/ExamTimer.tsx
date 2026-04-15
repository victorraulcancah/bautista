import { Clock } from 'lucide-react';

type Props = {
    timeLeft: number;
    formatTime: (s: number) => string;
};

export default function ExamTimer({ timeLeft, formatTime }: Props) {
    const isUrgent = timeLeft < 300;
    return (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
            isUrgent
                ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
                : 'bg-gray-50 border-gray-200 text-gray-700'
        }`}>
            <Clock className="w-4 h-4 shrink-0" />
            <span className="font-mono font-bold text-sm tracking-widest">
                {formatTime(timeLeft)}
            </span>
        </div>
    );
}
