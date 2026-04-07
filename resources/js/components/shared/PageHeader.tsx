import type { LucideIcon } from 'lucide-react';

type Props = {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    iconColor?: string;
};

export default function PageHeader({ icon: Icon, title, subtitle, iconColor = 'bg-blue-500' }: Props) {
    return (
        <div className="flex items-center gap-3">
            <div className={`rounded-lg ${iconColor} p-2 shrink-0`}>
                <Icon className="size-5 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
        </div>
    );
}
