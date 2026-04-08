import { Head } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import { useState } from 'react';
import FormField from '@/components/shared/FormField';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { Column } from '@/components/shared/ResourceTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useResource } from '@/hooks/useResource';
import type { BreadcrumbItem } from '@/types';

type Horario = {
    id: number;
    nombre: string;
    hora_entrada: string;
    hora_salida: string;
    tolerancia_minutos: number | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Horarios de Asistencia', href: '/horarios' },
];

export default function HorariosPage() {
    const res = useResource<Horario>('/horarios-asistencia');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Horario | null>(null);
    const [form, setForm] = useState({
        nombre: '',
        hora_entrada: '',
        hora_salida: '',
        tolerancia_minutos: '10'
    });

    const openCreate = () => {
        setEditing(null);
        setForm({ nombre: '', hora_entrada: '', hora_salida: '', tolerancia_minutos: '10' });
        setOpen(true);
    };

    const openEdit = (h: Horario) => {
        setEditing(h);
        setForm({
            nombre: h.nombre,
            hora_entrada: h.hora_entrada,
            hora_salida: h.hora_salida,
            tolerancia_minutos: (h.tolerancia_minutos ?? 0).toString()
        });
        setOpen(true);
    };

    const columns: Column<Horario>[] = [
        { label: 'Nombre', render: (h) => h.nombre },
        { label: 'Entrada', render: (h) => h.hora_entrada },
        { label: 'Salida', render: (h) => h.hora_salida },
        { label: 'Tolerancia', render: (h) => `${h.tolerancia_minutos ?? 0} min` },
        {
            label: 'Acciones',
            render: (h) => (
                <Button variant="ghost" size="sm" onClick={() => openEdit(h)}>
                    Editar
                </Button>
            )
        }
    ];

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (editing) {
            await res.update(editing.id, form);
        } else {
            await res.create(form);
        }

        setOpen(false);
    };

    return (
        <>
            <Head title="Horarios de Asistencia" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Horarios de Asistencia"
                subtitle="Configuración de horarios para entrada y salida"
                icon={Clock}
                iconColor="bg-blue-600"
                btnLabel="Nuevo Horario"
                onNew={openCreate}
                search={res.search}
                onSearch={res.setSearch}
            >
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={columns}
                        getKey={(h) => h.id}
                        onPageChange={res.setPage}
                    />
                )}
            </ResourcePage>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Editar Horario' : 'Nuevo Horario'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField
                            label="Nombre del Horario"
                            value={form.nombre}
                            onChange={(v) => setForm({ ...form, nombre: v })}
                            placeholder="ej. Turno Mañana"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                label="Hora Entrada"
                                type="time"
                                value={form.hora_entrada}
                                onChange={(v) => setForm({ ...form, hora_entrada: v })}
                            />
                            <FormField
                                label="Hora Salida"
                                type="time"
                                value={form.hora_salida}
                                onChange={(v) => setForm({ ...form, hora_salida: v })}
                            />
                        </div>
                        <FormField
                            label="Tolerancia (minutos)"
                            type="number"
                            value={form.tolerancia_minutos}
                            onChange={(v) => setForm({ ...form, tolerancia_minutos: v })}
                        />
                        <DialogFooter>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
