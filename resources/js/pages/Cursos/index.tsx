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
    const { hasRole, can } = usePermission();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cursos" />
            <div className="p-3 sm:p-6">
                {/* 1. Vista Administrativa (Gestión de Niveles/Grados) */}
                {can('cursos.ver') && hasRole(['administrador', 'usuario']) && <AdminCursos />}

                {/* 2. Vista Docente (Mis Materias Asignadas) */}
                {hasRole('docente') && <TeacherCursos />}

                {/* 3. Vista Estudiante (Mis Cursos) */}
                {hasRole('estudiante') && <StudentCursos />}

                {/* 4. Vista de Fallback para otros roles (Padres, etc.) */}
                {!hasRole(['administrador', 'usuario', 'docente', 'estudiante']) && (
                    <div className="p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed">
                        <p className="text-gray-500 font-medium">No tienes cursos asignados para visualizar en este panel.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
