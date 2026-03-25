import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import InputError from '@/components/shared/input-error';
import PasswordInput from '@/components/shared/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/api';
import { setAuthToken } from '@/plugins/inertia-token-plugin';
import { request } from '@/routes/password';

const SPLASH_DURATION = 3000; // ms que dura el splash

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [showSplash, setShowSplash] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({ username: '', password: '', remember: false });

    useEffect(() => {
        // Solo mostrar splash en cliente
        setShowSplash(true);
        const fadeTimer = setTimeout(() => setFadeOut(true), SPLASH_DURATION - 600);
        const hideTimer = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await api.post('/auth/login', {
                username: formData.username,
                password: formData.password,
                device_name: 'web',
            });

            // Store token and set axios Authorization header for Inertia requests
            const token = response.data.token;
            setAuthToken(token);

            // Redirect to dashboard — pass header explicitly for reliability
            router.visit('/dashboard', {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else {
                setErrors({ general: 'Error al iniciar sesión' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            {/* SPLASH SCREEN */}
            {showSplash && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-white"
                    style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.6s ease' }}
                >
                    <img
                        src="/anima_4.gif"
                        alt="Cargando..."
                        className="w-auto h-auto max-w-full max-h-full object-contain"
                        style={{ imageRendering: 'auto' }}
                    />
                </div>
            )}

            {/* LOGIN */}
            <div
                className="min-h-screen w-full flex flex-col items-center justify-center relative"
                style={{
                    backgroundImage: "url('/school.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative z-10 w-full max-w-sm px-4 flex flex-col items-center gap-4">

                    {/* Card login */}
                    <div className="w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden">

                        {/* Logo institución */}
                        <div className="flex justify-center pt-8 pb-3">
                            <img
                                src="/esama-bg.png"
                                alt="IEP Bautista La Pascana"
                                className="h-24 w-auto drop-shadow-lg"
                            />
                        </div>

                        <div className="text-center px-8 pb-5">
                            <h1 className="text-xl font-bold text-white">IEP Bautista La Pascana</h1>
                            <p className="text-xs text-white/70 mt-1">Sistema de Gestión Educativa</p>
                        </div>

                        <div className="px-8 pb-8">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="username" className="text-white/90 text-sm">
                                        Usuario / DNI
                                    </Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="username"
                                        placeholder="Ingresa tu DNI o usuario"
                                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-white"
                                    />
                                    {errors.username && <InputError message={errors.username} />}
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="password" className="text-white/90 text-sm">
                                        Contraseña
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Contraseña"
                                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-white"
                                    />
                                    {errors.password && <InputError message={errors.password} />}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="remember"
                                            checked={formData.remember}
                                            onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
                                            tabIndex={3}
                                            className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                        />
                                        <Label htmlFor="remember" className="text-white/80 text-xs cursor-pointer">
                                            Recordarme
                                        </Label>
                                    </div>
                                    {canResetPassword && (
                                        <a
                                            href={request().url}
                                            tabIndex={5}
                                            className="text-xs text-white/70 hover:text-white transition-colors"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </a>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    tabIndex={4}
                                    disabled={loading}
                                    className="w-full bg-white text-black hover:bg-white/90 font-semibold mt-1"
                                >
                                    {loading && <Spinner />}
                                    Ingresar
                                </Button>

                                {errors.general && (
                                    <p className="text-center text-sm font-medium text-red-400">
                                        {errors.general}
                                    </p>
                                )}

                                {status && (
                                    <p className="text-center text-sm font-medium text-green-400">
                                        {status}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* esama.png debajo del card */}
                    <img
                        src="/esama.png"
                        alt="Esama"
                        className="h-10 w-auto opacity-80"
                    />
                </div>
            </div>
        </>
    );
}
