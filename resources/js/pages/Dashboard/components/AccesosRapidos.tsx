import { Link } from '@inertiajs/react';
import SectionCard from '@/components/shared/SectionCard';
import { accesosRapidos } from '../hooks/useDashboard';

export default function AccesosRapidos() {
    return (
        <SectionCard title="Accesos Rápidos">
            <div className="flex flex-col gap-1 -m-2">
                {accesosRapidos.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </SectionCard>
    );
}
