import SectionCard from '@/components/shared/SectionCard';

export default function NotificacionesPendientes() {
    return (
        <SectionCard title="Notificaciones Pendientes" className="lg:col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay notificaciones pendientes.
            </p>
        </SectionCard>
    );
}
