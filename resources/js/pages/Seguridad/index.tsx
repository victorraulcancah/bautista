import { Head } from '@inertiajs/react';
import AccessControlManager from '../Usuarios/components/AccessControlManager';
import { Shield } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Seguridad', href: '/roles-permisos' },
    { title: 'Roles y Permisos', href: '/roles-permisos' },
];

export default function RolesPermisosPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles y Permisos" />

            <div className="flex flex-col gap-8 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                        <div className="h-16 w-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-100">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Configuración Avanzada</p>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
                                Roles y Permisos del Sistema
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AccessControlManager />
                </div>
            </div>
        </AppLayout>
    );
}
