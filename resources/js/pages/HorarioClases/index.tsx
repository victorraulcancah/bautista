import { Head, usePage } from '@inertiajs/react';
import { Calendar, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import AdminHorarioView from '@/pages/HorarioClases/components/AdminHorarioView';
import DocenteHorarioView from '@/pages/HorarioClases/components/DocenteHorarioView';
import AlumnoHorarioView from '@/pages/HorarioClases/components/AlumnoHorarioView';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Horario de Clases', href: '/horario-clases' },
];

export default function HorarioClasesPage() {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    const roleName = user?.rol?.name;

    // Determinar qué vista mostrar según el rol
    const renderContent = () => {
        // Admin puede gestionar horarios de todas las secciones
        if (roleName === 'administrador' || roleName === 'director') {
            return <AdminHorarioView />;
        }

        // Docente ve su propio horario
        if (roleName === 'docente' && user.docente_id) {
            return <DocenteHorarioView docenteId={user.docente_id} />;
        }

        // Alumno ve el horario de su sección
        if (roleName === 'estudiante') {
            return <AlumnoHorarioView />;
        }

        // Fallback
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay horario disponible
                </h3>
                <p className="text-sm text-gray-500">
                    No se pudo determinar el horario para tu perfil
                </p>
            </div>
        );
    };

    return (
        <>
            <Head title="Horario de Clases" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-neutral-950">
                                Horario de Clases
                            </h1>
                            <p className="text-sm text-neutral-500">
                                {roleName === 'administrador' || roleName === 'director'
                                    ? 'Gestiona los horarios de todas las secciones'
                                    : 'Consulta tu horario semanal'}
                            </p>
                        </div>
                    </div>

                    {renderContent()}
                </div>
            </AppLayout>
        </>
    );
}
