import { Link } from '@inertiajs/react';
import { ArrowRight  } from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

type Props = {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: string;   // text-cyan-500, text-purple-600, etc. — used for icon & accent
    iconBg: string;  // bg-cyan-500, bg-purple-600, etc. — icon background
    href: string;
};

export default function StatCard({ title, value, icon: Icon, color, iconBg, href }: Props) {
    return (
        <div className="relative overflow-hidden rounded-xl bg-white shadow-md transition-transform hover:scale-[1.02] dark:bg-gray-800">
            {/* Contenido */}
            <div className="flex items-center gap-4 px-5 py-4">
                <div className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className="size-7 text-white" strokeWidth={1.5} />
                </div>
                <div>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-2 dark:border-gray-700">
                <Link
                    href={href}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors ${color} opacity-70 hover:opacity-100`}
                >
                    Más información
                    <ArrowRight className="size-3" />
                </Link>
            </div>
        </div>
    );
}
