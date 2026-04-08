import { Head, Link } from '@inertiajs/react';
import { User, ChevronRight, Heart, Bell, Calendar, GraduationCap, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function PadreDashboard() {
    const [hijos, setHijos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/padre/hijos')
            .then(res => setHijos(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
return <div className="p-10 text-center font-black animate-pulse text-rose-500 uppercase tracking-widest">Cargando Portal Familiar...</div>;
}

    return (
        <div className="min-h-screen bg-[#FFFBFB] p-4 md:p-10 space-y-10 font-sans selection:bg-rose-100">
            <Head title="Mi Portal Familiar" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center">
                        Mi Familia <Heart className="w-8 h-8 ml-3 text-rose-500 fill-rose-500" />
                    </h1>
                    <p className="text-gray-500 font-medium">Sigue el progreso académico y bienestar de tus hijos en tiempo real.</p>
                </div>
                <Button variant="outline" className="rounded-2xl h-12 border-gray-100 shadow-sm font-bold text-gray-500 relative">
                    <Bell className="w-5 h-5 mr-2" /> Notificaciones
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white" />
                </Button>
            </div>

            {/* Children Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {hijos.length === 0 ? (
                    <div className="col-span-full p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 italic text-gray-400 font-bold">
                        No se encontraron estudiantes asociados a tu cuenta.
                    </div>
                ) : (
                    hijos.map((h: any) => (
                        <div key={h.estu_id} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-2xl shadow-rose-100/30 hover:shadow-rose-200/50 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                            
                            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                <div className="w-32 h-32 bg-gray-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    <User className="w-full h-full p-6 text-gray-400" />
                                </div>
                                
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                        {h.perfil?.primer_nombre} <br /> {h.perfil?.apellido_paterno}
                                    </h3>
                                    <p className="text-rose-500 font-black text-[10px] uppercase tracking-widest mt-2 bg-rose-50 px-3 py-1 rounded-full inline-block">Estudiante Activo</p>
                                </div>

                                <div className="w-full grid grid-cols-3 gap-4 py-6 border-y border-gray-50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Promedio</p>
                                        <p className="text-lg font-black text-gray-800">16.4</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Asist.</p>
                                        <p className="text-lg font-black text-emerald-600">95%</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Pagos</p>
                                        <p className="text-lg font-black text-rose-500">Al Día</p>
                                    </div>
                                </div>

                                <Link href={`/padre/hijo/${h.estu_id}`} className="w-full">
                                    <Button className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-200">
                                        Ver Seguimiento <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Quick Summary Section */}
            <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-rose-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <h4 className="text-3xl font-black tracking-tighter">Resumen de Pagos y Mensualidades</h4>
                        <p className="text-white/80 font-medium max-w-xl">Recuerda que los pagos realizados después de las 4 PM se verán reflejados en tu portal al día siguiente.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="#">
                            <Button className="bg-white text-rose-600 hover:bg-gray-100 rounded-2xl h-14 px-10 font-black shadow-xl">
                                <CreditCard className="w-5 h-5 mr-3" /> Estado de Cuenta
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
