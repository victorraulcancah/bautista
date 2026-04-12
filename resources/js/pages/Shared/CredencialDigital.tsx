import { Head } from '@inertiajs/react';
import { ScanLine, ShieldCheck, Clock, Download, User as UserIcon, Building } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Panel', href: '/dashboard' },
    { title: 'Credencial Digital', href: '/credencial' },
];

export default function CredencialDigital() {
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

    const handleDownloadPDF = () => {
        window.open('/mi-fotocheck', '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Credencial Digital" />
            
            <div className="flex flex-col gap-8 p-6 lg:p-12 items-center min-h-[calc(100vh-64px)] bg-[#F8FAFC]">
                <PageHeader
                    icon={ScanLine}
                    title="Mi Credencial Digital"
                    subtitle="Identificación institucional oficial para acceso y registro de asistencia."
                    iconColor="bg-emerald-600"
                />

                <div className="w-full max-w-sm">
                    {loading ? (
                        <div className="aspect-[3/4.5] flex flex-col items-center justify-center rounded-[3rem] bg-white p-12 shadow-2xl ring-1 ring-gray-100 animate-pulse">
                            <div className="size-48 rounded-3xl bg-gray-100" />
                        </div>
                    ) : (
                        <div className="group relative aspect-[3/4.6] flex flex-col items-center justify-between overflow-hidden rounded-[3rem] bg-white p-10 pb-12 shadow-2xl ring-1 ring-gray-100 transition-all hover:shadow-emerald-200/40">
                            {/* ID Card Aesthetic Elements */}
                            <div className="absolute top-0 h-40 w-full bg-emerald-600 opacity-[0.03]" />
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-600 opacity-[0.02]" />
                            <div className="absolute -left-10 bottom-20 h-32 w-32 rounded-full bg-emerald-600 opacity-[1%]" />

                            {/* Header / User Info */}
                            <div className="z-10 flex flex-col items-center text-center w-full">
                                <div className="mb-4 flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 ring-1 ring-emerald-100">
                                    <ShieldCheck className="size-3" />
                                    Acceso Autorizado
                                </div>
                                <div className="relative mb-4">
                                    <div className="size-20 rounded-[2rem] bg-emerald-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                                        {user?.avatar ? (
                                            <img src={user.avatar} className="size-full object-cover" />
                                        ) : (
                                            <UserIcon className="size-10 text-emerald-200" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 size-7 bg-white rounded-xl shadow-md flex items-center justify-center">
                                        <Building className="size-4 text-emerald-600" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-black text-gray-900 leading-tight mb-1 uppercase tracking-tight">
                                    {user?.name || 'Personal'}
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg">
                                    {user?.rol_name || user?.roles?.[0]?.name || 'Miembro'}
                                </p>
                            </div>

                            {/* QR Code Frame */}
                            <div className="relative p-5 rounded-[2.5rem] bg-white shadow-inner ring-1 ring-gray-100 transition-transform group-hover:scale-105 duration-500 my-4">
                                <div className="absolute inset-0 p-1">
                                    <div className="h-full w-full rounded-[2.2rem] border-2 border-dashed border-emerald-100" />
                                </div>
                                
                                {user && (
                                    <QRCodeSVG 
                                        value={user.id.toString()} 
                                        size={160} 
                                        level="H"
                                        includeMargin={false}
                                        className="relative z-10 transition-all duration-700"
                                    />
                                )}
                                
                                {/* Corner Guards */}
                                <div className="absolute -left-1 -top-1 size-8 border-l-4 border-t-4 border-emerald-600 rounded-tl-xl" />
                                <div className="absolute -right-1 -top-1 size-8 border-r-4 border-t-4 border-emerald-600 rounded-tr-xl" />
                                <div className="absolute -bottom-1 -left-1 size-8 border-b-4 border-l-4 border-emerald-600 rounded-bl-xl" />
                                <div className="absolute -bottom-1 -right-1 size-8 border-b-4 border-r-4 border-emerald-600 rounded-br-xl" />
                            </div>

                            {/* Action Button */}
                            <div className="flex flex-col items-center gap-4 w-full">
                                <Button 
                                    onClick={handleDownloadPDF}
                                    className="w-full h-12 rounded-2xl bg-gray-900 text-white hover:bg-black font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl active:scale-95 transition-all"
                                >
                                    <Download className="size-4" /> Descargar Carnet PDF
                                </Button>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Clock className="size-3" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">Vence: Dic {new Date().getFullYear()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-sm text-gray-400 flex items-center gap-2 font-medium">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Identificación Institucional - Bautista La Pascana
                </p>
            </div>
        </AppLayout>
    );
}
