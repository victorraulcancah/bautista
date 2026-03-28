import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import FormField from '@/components/shared/FormField';
import FormSection from '@/components/shared/FormSection';
import type { Usuario, UsuarioFormData } from '../hooks/useUsuarios';
import { defaultForm, ROLES, TIPOS_DOC } from '../hooks/useUsuarios';

type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     Usuario | null;
    onSave:      (data: UsuarioFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function UsuarioFormModal({ open, onClose, editing, onSave, apiErrors, clearErrors }: Props) {
    const [form, setForm]             = useState<UsuarioFormData>(defaultForm);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!open) return;
        clearErrors();
        if (editing) {
            setForm({
                username:         editing.username,
                email:            editing.email            ?? '',
                primer_nombre:    editing.perfil?.primer_nombre    ?? '',
                segundo_nombre:   editing.perfil?.segundo_nombre   ?? '',
                apellido_paterno: editing.perfil?.apellido_paterno ?? '',
                apellido_materno: editing.perfil?.apellido_materno ?? '',
                genero:           (editing.perfil?.genero as 'M' | 'F') ?? '',
                tipo_doc:         String(editing.perfil?.tipo_doc  ?? '1'),
                doc_numero:       editing.perfil?.doc_numero       ?? '',
                fecha_nacimiento: editing.perfil?.fecha_nacimiento ?? '',
                telefono:         editing.perfil?.telefono         ?? '',
                direccion:        editing.perfil?.direccion        ?? '',
                rol:              editing.rol                      ?? '',
                estado:           editing.estado,
            });
        } else {
            setForm(defaultForm);
        }
    }, [open, editing]);

    const set = (key: keyof UsuarioFormData, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const err = (key: keyof UsuarioFormData) => apiErrors[key]?.[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await onSave(form);
            onClose();
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ── Datos de Acceso ─────────────────────────────── */}
                    <FormSection title="Datos de Acceso">
                        <FormField
                            label="Usuario *"
                            value={form.username}
                            onChange={(v) => set('username', v)}
                            error={err('username')}
                            placeholder="Ej: admin123"
                        />
                        <FormField
                            label="Correo Electrónico"
                            value={form.email}
                            onChange={(v) => set('email', v)}
                            error={err('email')}
                            type="email"
                            placeholder="Ej: usuario@correo.com"
                        />
                        <div className="space-y-1">
                            <Label>Rol *</Label>
                            <Select value={form.rol} onValueChange={(v) => set('rol', v)}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                                <SelectContent>
                                    {ROLES.map((r) => (
                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {err('rol') && <p className="text-xs text-red-500">{err('rol')}</p>}
                        </div>
                        {editing && (
                            <div className="space-y-1">
                                <Label>Estado</Label>
                                <Select value={form.estado} onValueChange={(v) => set('estado', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Activo</SelectItem>
                                        <SelectItem value="0">Inactivo</SelectItem>
                                        <SelectItem value="5">Bloqueado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </FormSection>

                    {/* ── Datos Personales ────────────────────────────── */}
                    <FormSection title="Datos Personales">
                        <FormField label="Primer Nombre *"    value={form.primer_nombre}    onChange={(v) => set('primer_nombre', v)}    error={err('primer_nombre')}    placeholder="Ej: Juan" />
                        <FormField label="Segundo Nombre"     value={form.segundo_nombre}   onChange={(v) => set('segundo_nombre', v)}   error={err('segundo_nombre')}   placeholder="Ej: Carlos" />
                        <FormField label="Apellido Paterno *" value={form.apellido_paterno} onChange={(v) => set('apellido_paterno', v)} error={err('apellido_paterno')} placeholder="Ej: García" />
                        <FormField label="Apellido Materno"   value={form.apellido_materno} onChange={(v) => set('apellido_materno', v)} error={err('apellido_materno')} placeholder="Ej: López" />
                        <div className="space-y-1">
                            <Label>Género</Label>
                            <Select value={form.genero} onValueChange={(v) => set('genero', v)}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Masculino</SelectItem>
                                    <SelectItem value="F">Femenino</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <FormField label="Fecha de Nacimiento" value={form.fecha_nacimiento} onChange={(v) => set('fecha_nacimiento', v)} type="date" />
                    </FormSection>

                    {/* ── Documento de Identidad ──────────────────────── */}
                    <FormSection title="Documento de Identidad">
                        <div className="space-y-1">
                            <Label>Tipo de Documento *</Label>
                            <Select value={form.tipo_doc} onValueChange={(v) => set('tipo_doc', v)}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                                <SelectContent>
                                    {TIPOS_DOC.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {err('tipo_doc') && <p className="text-xs text-red-500">{err('tipo_doc')}</p>}
                        </div>
                        <FormField
                            label="Número de Documento *"
                            value={form.doc_numero}
                            onChange={(v) => set('doc_numero', v)}
                            error={err('doc_numero')}
                            placeholder="Ej: 78901234"
                        />
                    </FormSection>

                    {/* ── Contacto ────────────────────────────────────── */}
                    <FormSection title="Contacto">
                        <FormField label="Teléfono"  value={form.telefono}  onChange={(v) => set('telefono', v)}  placeholder="Ej: 987654321" />
                        <FormField label="Dirección" value={form.direccion} onChange={(v) => set('direccion', v)} placeholder="Ej: Av. Los Pinos 123" />
                    </FormSection>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing} className="bg-[#00a65a] hover:bg-[#008d4c] text-white">
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
