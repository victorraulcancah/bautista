import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    label:        string;
    value:        string;
    onChange:     (v: string) => void;
    error?:       string;
    type?:        string;
    placeholder?: string;
};

export default function FormField({ label, value, onChange, error, type = 'text', placeholder }: Props) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
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
