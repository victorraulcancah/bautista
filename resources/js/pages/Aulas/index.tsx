import { Head } from '@inertiajs/react';
import { DoorOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import FormField from '@/components/shared/FormField';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { Column } from '@/components/shared/ResourceTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/hooks/useResource';
import type { BreadcrumbItem } from '@/types';

// ── Types ────────────────────────────────────────────────────────────────────

type Aula = {
    aula_id:     number;
    nombre:      string;
    capacidad:   number | null;
    descripcion: string | null;
    activo:      boolean;
};

type AulaFormData = {
    nombre:      string;
    capacidad:   string;
    descripcion: string;
    activo:      boolean;
};

const defaultForm: AulaFormData = {
    nombre:      '',
    capacidad:   '',
    descripcion: '',
    activo:      true,
};

// ── Column definitions ───────────────────────────────────────────────────────

const aulasColumns: Column<Aula>[] = [
    { label: '#',           render: (_, i) => i + 1 },
    { label: 'Nombre',      render: (a) => a.nombre },
    { label: 'Capacidad',   render: (a) => a.capacidad ?? '—' },
    { label: 'Descripción', render: (a) => a.descripcion ?? '—' },
    {
        label: 'Estado',
        render: (a) => (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                a.activo
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
            }`}>
                {a.activo ? 'Activo' : 'Inactivo'}
            </span>
        ),
    },
];

// ── Breadcrumbs ──────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Aulas', href: '/aulas' },
];

// ── Form Modal ───────────────────────────────────────────────────────────────

type ModalProps = {
    open:        boolean;
    onClose:     () => void;
    editing:     Aula | null;
    onSave:      (data: AulaFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

function AulaFormModal({ open, onClose, editing, onSave, apiErrors, clearErrors }: ModalProps) {
    const [form, setForm]             = useState<AulaFormData>(defaultForm);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open) {
            setForm(editing
                ? {
                    nombre:      editing.nombre,
                    capacidad:   editing.capacidad?.toString() ?? '',
                    descripcion: editing.descripcion ?? '',
                    activo:      editing.activo,
                }
                : defaultForm,
            );
            clearErrors();
        }
    }, [open, editing]);

    const set = <K extends keyof AulaFormData>(key: K, value: AulaFormData[K]) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await onSave(form);
            onClose();
        } catch {
            // validation errors surface via apiErrors
        } finally {
            setProcessing(false);
        }
    };

    const err = (key: keyof AulaFormData) => apiErrors[key]?.[0];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Aula' : 'Nueva Aula'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="Nombre"
                        value={form.nombre}
                        onChange={(v) => set('nombre', v)}
                        error={err('nombre')}
                        placeholder="Ej: Aula 201"
                        required
                    />

                    <FormField
                        label="Capacidad"
                        type="number"
                        value={form.capacidad}
                        onChange={(v) => set('capacidad', v)}
                        error={err('capacidad')}
                        placeholder="Ej: 30"
                    />

                    {/* Descripción */}
                    <div className="space-y-1">
                        <label className="text-xs sm:text-sm font-medium text-gray-700">Descripción</label>
                        <textarea
                            value={form.descripcion}
                            onChange={(e) => set('descripcion', e.target.value)}
                            placeholder="Descripción opcional del aula..."
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00a65a] focus:outline-none focus:ring-1 focus:ring-[#00a65a] resize-none"
                        />
                        {err('descripcion') && <p className="text-xs text-red-500">{err('descripcion')}</p>}
                    </div>

                    {/* Activo */}
                    <div className="flex items-center gap-2">
                        <input
                            id="activo"
                            type="checkbox"
                            checked={form.activo}
                            onChange={(e) => set('activo', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-[#00a65a] focus:ring-[#00a65a]"
                        />
                        <label htmlFor="activo" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Aula activa
                        </label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-[#00a65a] hover:bg-[#008d4c] text-white"
                        >
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AulasPage() {
    const res = useResource<Aula>('/aulas');

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState<Aula | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        open:       boolean;
        aula:       Aula | null;
        processing: boolean;
    }>({ open: false, aula: null, processing: false });

    const openCreate   = () => { setEditing(null); setModalOpen(true); };
    const openEdit     = (a: Aula) => { setEditing(a); setModalOpen(true); };
    const handleDelete = (a: Aula) => {
        setDeleteModal({ open: true, aula: a, processing: false });
    };

    const confirmDelete = async () => {
        if (!deleteModal.aula) return;
        setDeleteModal(prev => ({ ...prev, processing: true }));
        await res.remove(deleteModal.aula.aula_id);
        setDeleteModal({ open: false, aula: null, processing: false });
    };

    return (
        <>
            <Head title="Aulas" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Aulas"
                subtitle={res.rows ? `${res.rows.total} registradas` : '…'}
                icon={DoorOpen}
                iconColor="bg-teal-600"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nueva Aula"
                onNew={openCreate}
            >
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={aulasColumns}
                        getKey={(a) => a.aula_id}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}
            </ResourcePage>

            <AulaFormModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); res.clearSuccess(); }}
                editing={editing}
                onSave={editing
                    ? (data) => res.update(editing.aula_id, data)
                    : (data) => res.create(data)}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />

            <ConfirmDeleteModal
                open={deleteModal.open}
                title="Eliminar Aula"
                message={`¿Estás seguro de que deseas eliminar el aula "${deleteModal.aula?.nombre}"? Esta acción no se puede deshacer.`}
                processing={deleteModal.processing}
                onClose={() => setDeleteModal({ open: false, aula: null, processing: false })}
                onConfirm={confirmDelete}
            />
        </>
    );
}
