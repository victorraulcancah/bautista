import { Head, usePage } from '@inertiajs/react';
import { Camera, IdCard, KeyRound, Lock, Mail, MapPin, Phone, Save, ShieldCheck, User as UserIcon, X } from 'lucide-react';
import { useRef, useState } from 'react';
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
    const [fotoSuccess, setFotoSuccess]   = useState('');

    const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
return;
}

        setUploadingFoto(true);

        try {
            const fd = new FormData();
            fd.append('foto', file);
            const { data } = await api.post('/me/foto', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFotoUrl(data.url);
            setFotoSuccess('Foto actualizada.');
            setTimeout(() => setFotoSuccess(''), 3000);
        } catch {
            setFotoSuccess('');
        } finally {
            setUploadingFoto(false);

            if (fotoInputRef.current) {
fotoInputRef.current.value = '';
}
        }
    };

    // ── Datos de contacto ─────────────────────────────────────────────────────
    const [telefono, setTelefono]       = useState(perfil?.telefono ?? '');
    const [direccion, setDireccion]     = useState(perfil?.direccion ?? '');
    const [docNumero, setDocNumero]     = useState(perfil?.doc_numero ?? '');
    const [savingDatos, setSavingDatos] = useState(false);
    const [datosSuccess, setDatosSuccess] = useState('');

    const handleSaveDatos = async () => {
        setSavingDatos(true);
        setDatosSuccess('');

        try {
            await api.patch('/me/perfil', {
                telefono,
                direccion,
                doc_numero: docNumero,
            });
            setDatosSuccess('Cambios guardados con éxito.');
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

    const handleChangePass = async (e: React.FormEvent) => {
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
            setPassSuccess('Contraseña actualizada.');
            setCurrentPass(''); setNewPass(''); setConfirmPass('');
            setTimeout(() => {
 setPassSuccess(''); setPassOpen(false); 
}, 2000);
        } catch (err: any) {
            const errors = err?.response?.data?.errors ?? {};
            const mapped: Record<string, string> = {};
            Object.entries(errors).forEach(([k, v]) => {
 mapped[k] = (v as string[])[0]; 
});
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

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-8 animate-in fade-in duration-500">
                    
                    {/* ── SECCIÓN 1: IDENTIDAD ────────────────────────── */}
                    <div className="relative rounded-2xl border bg-white shadow-sm overflow-hidden group/card">
                        <div className="h-40 bg-gradient-to-br from-[#00a65a] via-[#008d4c] to-[#00733e]" />
                        <div className="px-8 pb-8">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 sm:-mt-16">
                                {/* Avatar con interacción premium */}
                                <div className="relative group cursor-pointer ring-8 ring-white rounded-full transition-transform hover:scale-105" onClick={() => !uploadingFoto && fotoInputRef.current?.click()}>
                                    <Avatar className="h-40 w-40 border shadow-xl">
                                        {fotoUrl && <AvatarImage src={fotoUrl} alt={nombreCompleto} className="object-cover" />}
                                        <AvatarFallback className="text-5xl font-black bg-[#00a65a] text-white">
                                            {getInitials(nombreCompleto)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                        <Camera className="size-10 text-white" />
                                    </div>
                                    {uploadingFoto && (
                                        <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                            <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <input ref={fotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                                
                                <div className="text-center sm:text-left flex-1 space-y-2">
                                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                        {nombreCompleto}
                                    </h2>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-[#00a65a] rounded-full text-xs font-bold uppercase tracking-widest border border-green-100">
                                            <ShieldCheck className="size-4" />
                                            {ROLES_ES[rol] ?? rol}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-400 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
                                            @{user.username}
                                        </span>
                                    </div>
                                    {fotoSuccess && (
                                        <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black animate-in slide-in-from-left-2">
                                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                            {fotoSuccess}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── SECCIÓN 2: INFORMACIÓN ──────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Tarjeta: Información de Contacto (Editable) */}
                        <div className="rounded-2xl border bg-white p-8 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="p-3 rounded-2xl bg-green-50 text-[#00a65a]">
                                    <Phone className="size-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 uppercase tracking-tight text-base">Información de Contacto</h3>
                                    <p className="text-xs text-gray-400 font-medium tracking-tight">Actualiza tus medios de comunicación</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2.5 group">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1 transition-colors group-focus-within:text-[#00a65a]">
                                        N° Documento ({TIPOS_DOC[perfil?.tipo_doc] ?? 'DNI'})
                                    </Label>
                                    <div className="relative">
                                        <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-300" />
                                        <Input
                                            value={docNumero}
                                            onChange={(e) => setDocNumero(e.target.value)}
                                            className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:bg-white transition-all font-bold text-gray-700"
                                            placeholder="Ej: 71234567"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5 group">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1 transition-colors group-focus-within:text-[#00a65a]">
                                        Teléfono / Móvil
                                    </Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-300" />
                                        <Input
                                            value={telefono}
                                            onChange={(e) => setTelefono(e.target.value)}
                                            className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:bg-white transition-all font-bold text-gray-700"
                                            placeholder="Ej: 987654321"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5 group">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1 transition-colors group-focus-within:text-[#00a65a]">
                                        Dirección Domiciliaria
                                    </Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-300" />
                                        <Input
                                            value={direccion}
                                            onChange={(e) => setDireccion(e.target.value)}
                                            className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:bg-white transition-all font-bold text-gray-700"
                                            placeholder="Ej: Av. Principal 123, Lima"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex items-center justify-between gap-4">
                                    <Button
                                        onClick={handleSaveDatos}
                                        disabled={savingDatos}
                                        className="h-14 px-8 bg-[#00a65a] hover:bg-[#008d4c] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all shadow-xl shadow-green-100"
                                    >
                                        <Save className="size-5 mr-3" />
                                        {savingDatos ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                                    </Button>
                                    {datosSuccess && (
                                        <p className="text-xs font-black text-emerald-600 animate-in fade-in slide-in-from-right-3 lowercase first-letter:uppercase">
                                            {datosSuccess}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta: Cuenta y Seguridad (Lectura y Acción) */}
                        <div className="space-y-8">
                            <div className="rounded-2xl border bg-white p-8 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100">
                                        <UserIcon className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 uppercase tracking-tight text-base">Datos de Acceso</h3>
                                        <p className="text-xs text-gray-400 font-medium tracking-tight">Tu identidad en la plataforma</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <ReadOnlyField icon={UserIcon} label="Nombre de Usuario" value={user.username} />
                                    <ReadOnlyField icon={Mail}     label="Correo Institucional" value={user.email ?? '—'} />
                                </div>
                            </div>

                            <div className="rounded-2xl border bg-white p-8 shadow-sm hover:shadow-md transition-all border-dashed border-gray-200">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 rounded-2xl bg-orange-50 text-orange-600 shadow-sm shadow-orange-100">
                                        <KeyRound className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 uppercase tracking-tight text-base">Seguridad</h3>
                                        <p className="text-xs text-gray-400 font-medium tracking-tight">Mantén tu cuenta protegida</p>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full h-16 gap-4 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-400 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all"
                                    onClick={() => setPassOpen(true)}
                                >
                                    <Lock className="size-5" />
                                    Modificar Contraseña Acceso
                                </Button>
                            </div>
                        </div>

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
                                <Save className="size-4 mr-2" />
                                {savingPass ? 'Guardando...' : 'Actualizar contraseña'}
                            </Button>
                            <Button type="button" variant="destructive" className="w-full" onClick={closePassModal}>
                                <X className="size-4 mr-2" />
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function ReadOnlyField({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all group/field">
            <div className="p-2 rounded-lg bg-white shadow-sm ring-1 ring-gray-100">
                <Icon className="size-4 text-gray-400 group-hover/field:text-[#00a65a] transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-bold text-gray-700 truncate">{value}</p>
            </div>
        </div>
    );
}
