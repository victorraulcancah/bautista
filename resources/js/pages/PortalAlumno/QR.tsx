import { Head } from '@inertiajs/react';
import { ScanLine, ShieldCheck, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/shared/PageHeader';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Portal', href: '/alumno/dashboard' },
    { title: 'Credencial Digital', href: '/alumno/qr' },
];

export default function QR() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/auth/me')
            .then(res => {
                const userData = res.data.data || res.data;
                setUser(userData);
            })
            .catch(err => console.error("Error fetching user for QR:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Credencial Digital" />
            
            <div className="flex flex-col gap-8 p-6 lg:p-12 items-center">
                <PageHeader
                    icon={ScanLine}
                    title="Mi Credencial Digital"
                    subtitle="Utiliza este código para registrar tu asistencia diaria en el plantel"
                    iconColor="bg-indigo-600"
                />

                <div className="w-full max-w-sm">
                    {loading ? (
                        <div className="aspect-[3/4] flex flex-col items-center justify-center rounded-[3rem] bg-white p-12 shadow-2xl ring-1 ring-gray-100 animate-pulse">
                            <div className="size-48 rounded-3xl bg-gray-100" />
                        </div>
                    ) : (
                        <div className="group relative aspect-[3/4.2] flex flex-col items-center justify-between overflow-hidden rounded-[3rem] bg-white p-10 pb-12 shadow-2xl ring-1 ring-gray-100 transition-all hover:shadow-indigo-200/40">
                            {/* ID Card Aesthetic Elements */}
                            <div className="absolute top-0 h-32 w-full bg-indigo-600 opacity-[0.03]" />
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-600 opacity-[0.02]" />
                            <div className="absolute -left-10 bottom-20 h-32 w-32 rounded-full bg-indigo-600 opacity-[1%]" />

                            {/* Header / Student Info */}
                            <div className="z-10 flex flex-col items-center text-center">
                                <div className="mb-4 flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 ring-1 ring-indigo-100">
                                    <ShieldCheck className="size-3" />
                                    Acceso Autorizado
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 leading-tight mb-1">{user?.name || 'Estudiante'}</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">ID: {user?.username}</p>
                            </div>

                            {/* QR Code Frame */}
                            <div className="relative p-5 rounded-[2rem] bg-white shadow-inner ring-1 ring-gray-100 transition-transform group-hover:scale-105 duration-500">
                                <div className="absolute inset-0 p-1">
                                    <div className="h-full w-full rounded-[1.8rem] border-2 border-dashed border-indigo-100" />
                                </div>
                                
                                {user && (
                                    <QRCodeSVG 
                                        value={user.id.toString()} 
                                        size={176} // Equivalent to size-44
                                        level="H"
                                        includeMargin={false}
                                        className="relative z-10 transition-all duration-700 group-hover:grayscale-0 grayscale"
                                    />
                                )}
                                
                                {/* Corner Guards */}
                                <div className="absolute -left-1 -top-1 size-8 border-l-4 border-t-4 border-indigo-600 rounded-tl-xl" />
                                <div className="absolute -right-1 -top-1 size-8 border-r-4 border-t-4 border-indigo-600 rounded-tr-xl" />
                                <div className="absolute -bottom-1 -left-1 size-8 border-b-4 border-l-4 border-indigo-600 rounded-bl-xl" />
                                <div className="absolute -bottom-1 -right-1 size-8 border-b-4 border-r-4 border-indigo-600 rounded-br-xl" />
                            </div>

                            {/* Footer / Instructions */}
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Clock className="size-3" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">Vence: Dic 2026</span>
                                </div>
                                <p className="max-w-[220px] text-[10px] font-medium leading-relaxed text-gray-400 uppercase tracking-[0.2em]">
                                    Escanea frente al lector oficial bautista
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-sm text-gray-400 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Generación Local de Seguridad
                </p>
            </div>
        </AppLayout>
    );
}
