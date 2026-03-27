import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Wallet, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { Column } from '@/components/shared/ResourceTable';
import type { BreadcrumbItem } from '@/types';
import { useResource } from '@/hooks/useResource';
import PagosDrawer from './components/PagosDrawer';
import type { Pagador } from './hooks/usePago';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pagos',     href: '/pagos' },
];

export default function PagosPage() {
    const res = useResource<Pagador>('/pagos/pagadores');

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selected, setSelected]     = useState<Pagador | null>(null);

    const openDrawer = (p: Pagador) => { setSelected(p); setDrawerOpen(true); };

    const columns: Column<Pagador>[] = [
        {
            label:  '#',
            render: (p) => p.id_usuario,
        },
        {
            label:  'DNI',
            render: (p) => p.numero_doc ?? '—',
        },
        {
            label:  'Nombres',
            render: (p) => p.nombres,
        },
        {
            label:  'Apellidos',
            render: (p) => p.apellidos,
        },
        {
            label:  'Teléfono',
            render: (p) => p.telefono_1 ?? '—',
        },
        {
            label:  'Mensualidad',
            render: (p) => p.mensualidad
                ? <span className="font-semibold text-green-700">
                    S/ {Number(p.mensualidad).toFixed(2)}
                  </span>
                : '—',
        },
        {
            label:  'Agregar',
            render: (p) => (
                <Button
                    size="sm"
                    className="bg-[#00a65a] hover:bg-[#008d4c] text-white h-7 px-3"
                    onClick={(e) => { e.stopPropagation(); openDrawer(p); }}
                >
                    <PlusCircle className="h-3.5 w-3.5" />
                </Button>
            ),
        },
    ];

    return (
        <>
            <Head title="Pagos" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Pagos"
                subtitle={res.rows ? `${res.rows.total} registros` : '…'}
                icon={Wallet}
                iconColor="bg-green-600"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
            >
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={columns}
                        getKey={(p) => p.estu_id}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && (
                    <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>
                )}
            </ResourcePage>

            <PagosDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                pagador={selected}
            />
        </>
    );
}