import { Head, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Camera, IdCard, KeyRound, Lock, Mail, MapPin, Phone, Save, ShieldCheck, User as UserIcon, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mi Perfil',  href: '/settings/profile' },
];

const TIPOS_DOC: Record<number, string> = { 1: 'DNI', 2: 'Carnet de Extranjería', 3: 'Pasaporte', 4: 'RUC' };
const ROLES_ES: Record<string, string> = {
    administrador: 'Administrador', docente: 'Docente', estudiante: 'Estudiante',
    padre_familia: 'Padre de Familia', madre_familia: 'Madre de Familia',
    apoderado: 'Apoderado', psicologo: 'Psicólogo',
};

export default function Profile() {
    const { auth } = usePage().props as any;
    const user     = auth.user;
    const perfil   = user.perfil ?? null;
    const rol      = user.roles?.[0]?.name ?? null;
    const getInitials = useInitials();

    const nombreCompleto = perfil
        ? [perfil.primer_nombre, perfil.apellido_paterno, perfil.apellido_materno].filter(Boolean).join(' ')
        : (user.name || user.username);

    // ── Foto ─────────────────────────────────────────────────────────────────
    const fotoInputRef = useRef<HTMLInputElement>(null);
    const [fotoUrl, setFotoUrl]         = useState<string | null>(
        perfil?.foto_perfil ? `/storage/${perfil.foto_perfil}` : null
    );
    const [uploadingFoto, setUploadingFoto] = useState(false);

    const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingFoto(true);
        try {
            const fd = new FormData();
            fd.append('foto', file);
            const { data } = await api.post('/me/foto', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFotoUrl(data.url);
            setFotoSuccess('Foto actualizada correctamente.');
        } catch {
            setFotoSuccess('');
        } finally {
            setUploadingFoto(false);
            if (fotoInputRef.current) fotoInputRef.current.value = '';
        }
    };

    // ── Datos de contacto ─────────────────────────────────────────────────────
    const [telefono, setTelefono]       = useState(perfil?.telefono ?? '');
    const [direccion, setDireccion]     = useState(perfil?.direccion ?? '');
    const [docNumero, setDocNumero]     = useState(perfil?.doc_numero ?? '');
    const [savingDatos, setSavingDatos] = useState(false);
    const [datosSuccess, setDatosSuccess] = useState('');
    const [fotoSuccess, setFotoSuccess]   = useState('');

    const handleSaveDatos = async () => {
        setSavingDatos(true);
        setDatosSuccess('');
        try {
            await api.patch('/me/perfil', {
                telefono,
                direccion,
                doc_numero: docNumero,
            });
            setDatosSuccess('Guardado correctamente.');
            setTimeout(() => setDatosSuccess(''), 3000);
        } finally {
            setSavingDatos(false);
        }
    };

    // ── Modal contraseña ──────────────────────────────────────────────────────
    const [passOpen, setPassOpen]           = useState(false);
    const [currentPass, setCurrentPass]     = useState('');
    const [newPass, setNewPass]             = useState('');
    const [confirmPass, setConfirmPass]     = useState('');
    const [passErrors, setPassErrors]       = useState<Record<string, string>>({});
    const [savingPass, setSavingPass]       = useState(false);
    const [passSuccess, setPassSuccess]     = useState('');

    const handleChangePass = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setPassErrors({});
        setPassSuccess('');
        setSavingPass(true);
        try {
            await api.put('/me/password', {
                current_password:      currentPass,
                password:              newPass,
                password_confirmation: confirmPass,
            });
            setPassSuccess('Contraseña actualizada correctamente.');
            setCurrentPass(''); setNewPass(''); setConfirmPass('');
            setTimeout(() => { setPassSuccess(''); setPassOpen(false); }, 2000);
        } catch (err: any) {
            const errors = err?.response?.data?.errors ?? {};
            const mapped: Record<string, string> = {};
            Object.entries(errors).forEach(([k, v]) => { mapped[k] = (v as string[])[0]; });
            setPassErrors(mapped);
        } finally {
            setSavingPass(false);
        }
    };

    const closePassModal = () => {
        setPassOpen(false);
        setCurrentPass(''); setNewPass(''); setConfirmPass('');
        setPassErrors({}); setPassSuccess('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Perfil" />

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

                {/* ── Tarjeta de identidad ─────────────────────────── */}
                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-[#00a65a] to-[#008d4c]" />
                    <div className="px-6 pb-6">
                        <div className="flex items-end gap-4 -mt-12 mb-4">
                            {/* Avatar clicable */}
                            <div className="relative group cursor-pointer" onClick={() => !uploadingFoto && fotoInputRef.current?.click()}>
                                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                                    {fotoUrl && <AvatarImage src={fotoUrl} alt={nombreCompleto} className="object-cover" />}
                                    <AvatarFallback className="text-2xl font-bold bg-[#00a65a] text-white">
                                        {getInitials(nombreCompleto)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="size-6 text-white" />
                                </div>
                                {uploadingFoto && (
                                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                        <span className="text-white text-xs">...</span>
                                    </div>
                                )}
                            </div>
                            <input ref={fotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />

                            <div className="pb-1">
                                <h2 className="text-xl font-bold text-gray-900">{nombreCompleto}</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {rol && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                            <ShieldCheck className="size-3" />
                                            {ROLES_ES[rol] ?? rol}
                                        </span>
                                    )}
                                    <span className="text-sm text-gray-500">@{user.username}</span>
                                </div>
                                {fotoSuccess && <p className="text-xs text-green-600 mt-1">{fotoSuccess}</p>}
                            </div>
                        </div>

                        {/* Info rápida (solo lectura) */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <InfoTile icon={Mail}   label="Correo"                           value={user.email ?? '—'} />
                            <InfoTile icon={Phone}  label="Teléfono"                         value={perfil?.telefono ?? '—'} />
                            <InfoTile icon={IdCard} label={TIPOS_DOC[perfil?.tipo_doc] ?? 'Documento'} value={perfil?.doc_numero ?? '—'} />
                            <InfoTile icon={MapPin} label="Dirección"                        value={perfil?.direccion ?? '—'} />
                        </div>
                    </div>
                </div>

                {/* ── Datos de contacto ─────────────────────────────── */}
                <div className="rounded-xl border bg-white shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Phone className="size-4 text-[#00a65a]" />
                        <h3 className="font-semibold text-gray-800">Datos de Contacto</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="grid gap-1.5">
                            <Label>N° Documento (DNI)</Label>
                            <Input
                                value={docNumero}
                                onChange={(e) => setDocNumero(e.target.value)}
                                placeholder="Ej: 71234567"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Teléfono</Label>
                            <Input
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="Ej: 987654321"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Dirección</Label>
                            <Input
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                placeholder="Ej: Av. Principal 123, Lima"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleSaveDatos}
                                disabled={savingDatos}
                                className="bg-[#00a65a] hover:bg-[#008d4c] text-white"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {savingDatos ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                            {datosSuccess && <p className="text-sm text-green-600">{datosSuccess}</p>}
                        </div>
                    </div>
                </div>

                {/* ── Datos de acceso (solo lectura) ───────────────── */}
                <div className="rounded-xl border bg-white shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <UserIcon className="size-4 text-[#00a65a]" />
                        <h3 className="font-semibold text-gray-800">Datos de Acceso</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                            <UserIcon className="size-4 text-gray-400 shrink-0" />
                            <div>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Usuario</p>
                                <p className="text-sm font-medium text-gray-700">{user.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                            <Mail className="size-4 text-gray-400 shrink-0" />
                            <div>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Correo</p>
                                <p className="text-sm font-medium text-gray-700">{user.email ?? '—'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                        <Button
                            variant="outline"
                            className="gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
                            onClick={() => setPassOpen(true)}
                        >
                            <KeyRound className="h-4 w-4" />
                            Cambiar contraseña
                        </Button>
                    </div>
                </div>

            </div>

            {/* ── Modal cambiar contraseña ─────────────────────────────────────── */}
            <Dialog open={passOpen} onOpenChange={(v) => !v && closePassModal()}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="size-4 text-orange-500" />
                            Cambiar Contraseña
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleChangePass} className="space-y-4 mt-2">
                        <div className="space-y-1">
                            <Label>Contraseña actual</Label>
                            <Input
                                type="password"
                                value={currentPass}
                                onChange={(e) => setCurrentPass(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            {passErrors.current_password && (
                                <p className="text-xs text-red-500">{passErrors.current_password}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label>Nueva contraseña</Label>
                            <Input
                                type="password"
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            {passErrors.password && (
                                <p className="text-xs text-red-500">{passErrors.password}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label>Confirmar nueva contraseña</Label>
                            <Input
                                type="password"
                                value={confirmPass}
                                onChange={(e) => setConfirmPass(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                        </div>

                        {passSuccess && <p className="text-sm text-green-600">{passSuccess}</p>}

                        <div className="flex flex-col gap-2 pt-1">
                            <Button type="submit" disabled={savingPass} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                                <Save className="h-4 w-4 mr-2" />
                                {savingPass ? 'Guardando...' : 'Actualizar contraseña'}
                            </Button>
                            <Button type="button" variant="destructive" className="w-full" onClick={closePassModal}>
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function InfoTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
            <Icon className="size-4 text-[#00a65a] mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm text-gray-700 truncate">{value}</p>
            </div>
        </div>
    );
}
