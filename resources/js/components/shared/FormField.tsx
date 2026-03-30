import { Input } from '@/components/ui/input';
import { ReqLabel, OptLabel } from './FormLabels';

type Props = {
    label:        string;
    value:        string;
    onChange:     (v: string) => void;
    error?:       string;
    type?:        string;
    placeholder?: string;
    required?:    boolean;
};

export default function FormField({ label, value, onChange, error, type = 'text', placeholder, required }: Props) {
    const LabelComponent = required ? ReqLabel : OptLabel;

    return (
        <div className="space-y-1">
            <LabelComponent>{label}</LabelComponent>
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
