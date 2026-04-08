import { Head, usePage, useForm } from '@inertiajs/react';
import { Image as ImageIcon, Upload, Eye, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppearanceTabs from '@/components/shared/appearance-tabs';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

export default function Appearance() {
    const { auth, branding } = usePage<any>().props;
    const isAdmin = (auth.user?.rol as any)?.name === 'administrador';

    const { data, setData, post, processing, errors } = useForm({
        logo: null as File | null,
        background: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(branding?.logo || null);
    const [backgroundPreview, setBackgroundPreview] = useState<string | null>(branding?.background || null);

    // Actualizar previsualizaciones si cambian desde el servidor
    useEffect(() => {
        if (branding?.logo) {
setLogoPreview(branding.logo);
}

        if (branding?.background) {
setBackgroundPreview(branding.background);
}
    }, [branding]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('background', file);
            const reader = new FileReader();
            reader.onloadend = () => setBackgroundPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/appearance/system', {
            forceFormData: true,
            onSuccess: () => {
                // Opcional: mostrar notificación de éxito
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Ajustes del Sistema" />

            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="space-y-10">
                    {/* Sección de Tema personal */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <Heading
                            variant="small"
                            title="Personal Appearance"
                            description="Personaliza tu experiencia visual personal"
                        />
                        <div className="mt-4">
                            <AppearanceTabs />
                        </div>
                    </div>

                    {/* Sección de Configuración de Sistema (Solo Admin) */}
                    {isAdmin && (
                        <form onSubmit={submit} className="space-y-6">
                            <Heading
                                title="Configuración de la Institución"
                                description="Personaliza la identidad visual del sistema para todos los usuarios."
                            />

                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                <div className="space-y-8">
                                    {/* Logo Card */}
                                    <Card className="border-indigo-100 shadow-md transition-all hover:shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-lg">Logotipo para Login</CardTitle>
                                            <CardDescription>Este logo será visible únicamente en la pantalla de acceso.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-8 transition-all hover:border-indigo-400 hover:bg-indigo-50/50">
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="Logo preview" className="max-h-32 object-contain drop-shadow-md" />
                                                ) : (
                                                    <ImageIcon className="h-16 w-16 text-indigo-300" />
                                                )}
                                                <div className="mt-6 flex flex-col items-center gap-3">
                                                    <Label htmlFor="logo-upload" className="cursor-pointer">
                                                        <div className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            {logoPreview ? 'Cambiar Logo' : 'Cargar Nuevo Logo'}
                                                        </div>
                                                        <Input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                                    </Label>
                                                    {errors.logo && <p className="text-xs text-red-500">{errors.logo}</p>}
                                                    <p className="text-xs font-medium text-muted-foreground italic">Se recomienda PNG transparente (300x100px)</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Background Card */}
                                    <Card className="border-indigo-100 shadow-md transition-all hover:shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-lg">Fondo de Login</CardTitle>
                                            <CardDescription>Imagen de alto impacto para la pantalla de bienvenida.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-8 transition-all hover:border-indigo-400 hover:bg-indigo-50/50">
                                                {backgroundPreview ? (
                                                    <div className="relative w-full rounded-lg bg-black/10 p-1">
                                                        <img src={backgroundPreview} alt="BG preview" className="h-32 w-full rounded-md object-cover brightness-90 shadow-sm" />
                                                    </div>
                                                ) : (
                                                    <ImageIcon className="h-16 w-16 text-indigo-300" />
                                                )}
                                                <div className="mt-6 flex flex-col items-center gap-3">
                                                    <Label htmlFor="bg-upload" className="cursor-pointer">
                                                        <div className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            {backgroundPreview ? 'Cambiar Fondo' : 'Cargar Fondo Login'}
                                                        </div>
                                                        <Input id="bg-upload" type="file" className="hidden" accept="image/*" onChange={handleBackgroundChange} />
                                                    </Label>
                                                    {errors.background && <p className="text-xs text-red-500">{errors.background}</p>}
                                                    <p className="text-xs font-medium text-muted-foreground italic">Recomendamos imágenes HD (1920x1080px)</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Preview Card */}
                                <div className="h-full">
                                    <Card className="flex h-full flex-col overflow-hidden border-indigo-100 bg-neutral-50 shadow-xl">
                                        <CardHeader className="bg-white border-b border-indigo-50 pb-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg text-indigo-900">Previsualización en Vivo</CardTitle>
                                                    <CardDescription>Simulación de la pantalla de acceso</CardDescription>
                                                </div>
                                                <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
                                                    <Eye className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex flex-1 flex-col p-0">
                                            <div
                                                className="relative flex flex-1 min-h-[400px] w-full items-center justify-center bg-neutral-900 bg-cover bg-center transition-all duration-700"
                                                style={{ backgroundImage: backgroundPreview ? `url(${backgroundPreview})` : 'none' }}
                                            >
                                                <div className="absolute inset-0 bg-black/40" />
                                                <div className="relative w-72 transform rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-xl border border-white/20 transition-all hover:scale-[1.02]">
                                                    {logoPreview ? (
                                                        <div className="mx-auto mb-8 size-16 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md shadow-lg transition-transform hover:scale-110">
                                                            <img src={logoPreview} alt="Logo" className="h-full w-full rounded-full object-contain drop-shadow-md" />
                                                        </div>
                                                    ) : (
                                                        <div className="mx-auto mb-8 h-12 w-12 animate-pulse rounded-full bg-white/20" />
                                                    )}
                                                    <div className="space-y-4">
                                                        <div className="h-9 w-full rounded-md bg-white/10" />
                                                        <div className="h-9 w-full rounded-md bg-white/10" />
                                                        <div className="mt-6 h-10 w-full rounded-md bg-indigo-500 shadow-lg shadow-indigo-500/30" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-white border-t border-indigo-50">
                                                <Button 
                                                    type="submit"
                                                    disabled={processing}
                                                    className="w-full h-12 bg-indigo-600 text-base font-bold shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl transition-all"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                            Guardando...
                                                        </>
                                                    ) : (
                                                        'Aplicar Cambios a Toda la Institución'
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
