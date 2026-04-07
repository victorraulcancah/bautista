import { Circle } from 'lucide-react';
import { Label } from '@/components/ui/label';

export const SELECT_CLS =
    'w-full bg-neutral-50/50 border border-neutral-200 rounded-xl h-10 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400';

export const ReqLabel = ({ children }: { children: React.ReactNode }) => (
    <Label className="text-xs flex items-center gap-1.5 font-semibold text-neutral-700">
        <Circle size={8} className="text-rose-700 fill-rose-700 shrink-0" />
        {children}
    </Label>
);

export const OptLabel = ({ children }: { children: React.ReactNode }) => (
    <Label className="text-xs flex items-center gap-1.5 font-semibold text-neutral-700">
        <Circle size={8} className="text-cyan-600 fill-cyan-600 shrink-0" />
        {children}
    </Label>
);

export const FormLegend = () => (
    <div className="flex items-center gap-4 py-2 border-b border-neutral-100 mb-4 sticky top-0 bg-white z-10 transition-colors">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <Circle size={8} className="text-rose-700 fill-rose-700 shrink-0" />
            <span>Obligatorio</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <Circle size={8} className="text-cyan-600 fill-cyan-600 shrink-0" />
            <span>Opcional</span>
        </div>
    </div>
);

