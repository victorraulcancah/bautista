import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    title: string;
    children: ReactNode;
    className?: string;
};

export default function SectionCard({ title, children, className }: Props) {
    return (
        <div className={cn(
            'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800',
            className,
        )}>
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}
