import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { usePermission } from '@/hooks/usePermission';
import AdminCursos from './components/AdminCursos';
import StudentCursos from './components/StudentCursos';
import TeacherCursos from './components/TeacherCursos';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cursos', href: '/cursos' },
];

export default function CursosPage() {
    const { can } = usePermission();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cursos" />
            <div className="p-3 sm:p-6">
                {/* Vista Administrativa (Gestión de Grados/Cursos) */}
                {can('cursos.ver') && <AdminCursos />}
            </div>
        </AppLayout>
    );
}
