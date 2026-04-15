import { Head } from '@inertiajs/react';
import { Clock, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import FormField from '@/components/shared/FormField';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { Column } from '@/components/shared/ResourceTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResource } from '@/hooks/useResource';
import type { BreadcrumbItem } from '@/types';
import axios from 'axios';

type Horario = {
    horario_id: number;
    insti_id: number;
    nivel_id: number | null;
    tipo_usuario: 'E' | 'D';
    turno: 'M' | 'T';
    hora_ingreso: string;
    hora_salida: string;
    nivel?: {
        nivel_id: number;
        nombre_nivel: string;
    };
};

type Nivel = {
    nivel_id: number;
    nombre_nivel: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Horarios de Asistencia', href: '/horarios' },
];

export default function HorariosPage() {
    const res = useResource<Horario>('/horarios-asistencia');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Horario | null>(null);
    const [niveles, setNiveles] = useState<Nivel[]>([]);
    const [confirmDelete, setConfirmDelete] = useState<Horario | null>(null);
    const [form, setForm] = useState({
        nivel_id: '',
        tipo_usuario: 'E' as 'E' | 'D',
        turno: 'M' as 'M' | 'T',
        hora_ingreso: '',
        hora_salida: ''
    });

    useEffect(() => {
        // Cargar niveles educativos
        axios.get('/api/niveles').then(res => {
            const data = res.data.data || res.data;
            console.log('Niveles cargados:', data);
            setNiveles(Array.isArray(data) ? data : []);
        }).catch(err => {
            console.error('Error al cargar niveles:', err);
            setNiveles([]);
        });
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ 
            nivel_id: '', 
            tipo_usuario: 'E', 
            turno: 'M', 
            hora_ingreso: '', 
            hora_salida: '' 
        });
        setOpen(true);
    };

    const openEdit = (h: Horario) => {
        setEditing(h);
        setForm({
            nivel_id: h.nivel_id?.toString() || '',
            tipo_usuario: h.tipo_usuario,
            turno: h.turno,
            hora_ingreso: h.hora_ingreso.substring(0, 5),
            hora_salida: h.hora_salida.substring(0, 5)
        });
        setOpen(true);
    };

    const handleDelete = async (h: Horario) => {
        setConfirmDelete(h);
    };

    const confirmDeleteAction = async () => {
        if (confirmDelete) {
            await res.remove(confirmDelete.horario_id);
            setConfirmDelete(null);
        }
    };

    const columns: Column<Horario>[] = [
        { 
            label: '#', 
            render: (h, index) => {
                const currentPage = res.rows?.current_page || 1;
                const perPage = res.rows?.per_page || 15;
                return (currentPage - 1) * perPage + (index || 0) + 1;
            }
        },
        { label: 'Nivel', render: (h) => h.nivel?.nombre_nivel || 'Sin nivel' },
        { label: 'Tipo', render: (h) => h.tipo_usuario === 'E' ? 'Estudiante' : 'Docente' },
        { label: 'Turno', render: (h) => h.turno === 'M' ? 'Mañana' : 'Tarde' },
        { label: 'Ingreso', render: (h) => h.hora_ingreso.substring(0, 5) },
        { label: 'Salida', render: (h) => h.hora_salida.substring(0, 5) },
        {
            label: 'Acciones',
            render: (h) => (
                <div className="flex gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEdit(h)} 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(h)} 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        const data = {
            nivel_id: form.nivel_id ? parseInt(form.nivel_id) : null,
            tipo_usuario: form.tipo_usuario,
            turno: form.turno,
            hora_ingreso: form.hora_ingreso,
            hora_salida: form.hora_salida
        };

        if (editing) {
            await res.update(editing.horario_id, data);
        } else {
            await res.create(data);
        }

        setOpen(false);
    };

    return (
        <>
            <Head title="Horarios de Asistencia" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Horarios de Asistencia"
                subtitle="Configuración de horarios de entrada y salida por nivel educativo"
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
                        getKey={(h) => h.horario_id}
                        onPageChange={res.setPage}
                    />
                )}
            </ResourcePage>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Editar Horario de Asistencia' : 'Nuevo Horario de Asistencia'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nivel Educativo <span className="text-red-500">*</span></Label>
                            <Select 
                                value={form.nivel_id} 
                                onValueChange={(v) => setForm({ ...form, nivel_id: v })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un nivel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {niveles.map(n => (
                                        <SelectItem key={n.nivel_id} value={n.nivel_id.toString()}>
                                            {n.nombre_nivel}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de Usuario</Label>
                            <Select 
                                value={form.tipo_usuario} 
                                onValueChange={(v: 'E' | 'D') => setForm({ ...form, tipo_usuario: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="E">Estudiante</SelectItem>
                                    <SelectItem value="D">Docente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Turno</Label>
                            <Select 
                                value={form.turno} 
                                onValueChange={(v: 'M' | 'T') => setForm({ ...form, turno: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Mañana</SelectItem>
                                    <SelectItem value="T">Tarde</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                label="Hora de Ingreso"
                                type="time"
                                value={form.hora_ingreso}
                                onChange={(v) => setForm({ ...form, hora_ingreso: v })}
                                required
                            />
                            <FormField
                                label="Hora de Salida"
                                type="time"
                                value={form.hora_salida}
                                onChange={(v) => setForm({ ...form, hora_salida: v })}
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                open={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={confirmDeleteAction}
                title="Eliminar Horario de Asistencia"
                message={confirmDelete ? `¿Está seguro de eliminar el horario de ${confirmDelete.nivel?.nombre_nivel || 'Sin nivel'} - ${confirmDelete.tipo_usuario === 'E' ? 'Estudiante' : 'Docente'} - ${confirmDelete.turno === 'M' ? 'Mañana' : 'Tarde'}?` : ''}
                confirmText="Eliminar"
                variant="danger"
            />
        </>
    );
}
