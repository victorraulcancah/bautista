import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import TeacherCursos from '../Cursos/components/TeacherCursos';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Portal Docente', href: '/docente/mis-cursos' },
    { title: 'Mis Cursos', href: '/docente/mis-cursos' },
];

export default function MisCursosPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Cursos" />
            <div className="p-3 sm:p-6">
                <TeacherCursos />
            </div>
        </AppLayout>
    );
}
