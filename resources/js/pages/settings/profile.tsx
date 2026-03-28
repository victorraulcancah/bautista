import { Transition } from '@headlessui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import { Mail, Phone, MapPin, IdCard, User as UserIcon, ShieldCheck } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/shared/input-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
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

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage().props as any;
    const user     = auth.user;
    const perfil   = user.perfil ?? null;
    const rol      = user.roles?.[0]?.name ?? null;
    const getInitials = useInitials();

    const nombreCompleto = perfil
        ? [perfil.primer_nombre, perfil.apellido_paterno, perfil.apellido_materno].filter(Boolean).join(' ')
        : (user.name || user.username);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Perfil" />

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

                {/* ── Tarjeta de identidad ─────────────────────────── */}
                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <div className="h-20 bg-gradient-to-r from-[#00a65a] to-[#008d4c]" />
                    <div className="px-6 pb-6">
                        <div className="flex items-end gap-4 -mt-10 mb-4">
                            <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                                <AvatarFallback className="text-2xl font-bold bg-[#00a65a] text-white">
                                    {getInitials(nombreCompleto)}
                                </AvatarFallback>
                            </Avatar>
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
                            </div>
                        </div>

                        {/* Info rápida */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <InfoTile icon={Mail} label="Correo" value={user.email ?? '—'} />
                            <InfoTile icon={Phone} label="Teléfono" value={perfil?.telefono ?? '—'} />
                            <InfoTile
                                icon={IdCard}
                                label={TIPOS_DOC[perfil?.tipo_doc] ?? 'Documento'}
                                value={perfil?.doc_numero ?? '—'}
                            />
                            <InfoTile icon={MapPin} label="Dirección" value={perfil?.direccion ?? '—'} />
                        </div>
                    </div>
                </div>

                {/* ── Editar nombre y correo ───────────────────────── */}
                <div className="rounded-xl border bg-white shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <UserIcon className="size-4 text-[#00a65a]" />
                        <h3 className="font-semibold text-gray-800">Datos de Acceso</h3>
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-4"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="name">Nombre completo</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={user.name}
                                        required
                                        autoComplete="name"
                                        placeholder="Tu nombre completo"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="email">Correo electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        defaultValue={user.email ?? ''}
                                        autoComplete="email"
                                        placeholder="correo@ejemplo.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {mustVerifyEmail && user.email_verified_at === null && (
                                    <p className="text-sm text-amber-600">
                                        Tu correo no está verificado.
                                    </p>
                                )}

                                {status === 'verification-link-sent' && (
                                    <p className="text-sm text-green-600">
                                        Se envió un enlace de verificación a tu correo.
                                    </p>
                                )}

                                <div className="flex items-center gap-3 pt-1">
                                    <Button
                                        disabled={processing}
                                        className="bg-[#00a65a] hover:bg-[#008d4c] text-white"
                                    >
                                        {processing ? 'Guardando...' : 'Guardar cambios'}
                                    </Button>
                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600">Guardado correctamente.</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

            </div>
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
