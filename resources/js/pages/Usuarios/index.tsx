import { Head } from '@inertiajs/react';
import { Users, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import { useResource } from '@/hooks/useResource';
import type { BreadcrumbItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsuarioFormModal from './components/UsuarioFormModal';
import AccessControlManager from './components/AccessControlManager';
import type { Usuario } from './hooks/useUsuarios';
import { usuariosColumns } from './hooks/useUsuariosColumns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuarios y Seguridad', href: '/usuarios' },
];

export default function UsuariosPage() {
    const res = useResource<Usuario>('/usuarios');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState<Usuario | null>(null);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (u: Usuario) => {
        setEditing(u);
        setModalOpen(true);
    };

    return (
        <>
            <Head title="Usuarios y Seguridad" />
            
            <div className="p-4 sm:p-6 space-y-6">
                <Tabs defaultValue="listado" className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">Gestión de Acceso</h1>
                            <p className="text-sm text-gray-500 font-medium">Administra quiénes entran al sistema y qué pueden hacer.</p>
                        </div>
                        <TabsList className="bg-gray-100/80 p-1 rounded-xl">
                            <TabsTrigger value="listado" className="rounded-lg font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                                <Users className="size-3 mr-2 text-indigo-600" /> USUARIOS
                            </TabsTrigger>
                            <TabsTrigger value="seguridad" className="rounded-lg font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                                <ShieldCheck className="size-3 mr-2 text-indigo-600" /> ROLES Y PERMISOS
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="listado" className="mt-0 border-none shadow-none bg-transparent outline-none">
                        <ResourcePage
                            pageTitle=""
                            breadcrumbs={breadcrumbs}
                            subtitle={res.rows ? `${res.rows.total} registrados` : '…'}
                            icon={ShieldCheck}
                            search={res.search}
                            onSearch={res.setSearch}
                            flashSuccess={res.success}
                            btnLabel="Nuevo Usuario"
                            onNew={openCreate}
                            hideHeader={true} // Necesitaré que ResourcePage soporte esto o simplemente lo dejo así
                        >
                            {res.rows && (
                                <ResourceTable
                                    rows={res.rows}
                                    columns={usuariosColumns}
                                    getKey={(u) => u.id}
                                    onEdit={openEdit}
                                    onLoadMore={res.loadMore}
                                    hasMore={res.hasMore}
                                    loading={res.loading}
                                />
                            )}
                            {res.loading && !res.rows && <p className="py-6 text-center text-sm text-gray-400 font-medium italic">Sincronizando base de datos...</p>}
                        </ResourcePage>
                    </TabsContent>

                    <TabsContent value="seguridad" className="mt-0 border-none shadow-none bg-transparent outline-none">
                        <AccessControlManager />
                    </TabsContent>
                </Tabs>
            </div>

            <UsuarioFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    res.clearSuccess();
                }}
                editing={editing}
                onSave={editing
                    ? (data) => res.update(editing.id, data)
                    : (data) => res.create(data)}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />
        </>
    );
}
