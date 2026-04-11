import { Head, Link } from '@inertiajs/react';
import { Users, Search, ArrowLeft, Phone, MapPin, Calendar, IdCard } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import PageHeader from '@/components/shared/PageHeader';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel Docente', href: '/docente/dashboard' },
    { title: 'Mis Alumnos', href: '/docente/mis-alumnos' },
];

type Alumno = {
    estu_id: number;
    doc_numero: string | null;
    primer_nombre: string | null;
    segundo_nombre: string | null;
    apellido_paterno: string | null;
    apellido_materno: string | null;
    fecha_nacimiento: string | null;
    telefono: string | null;
    direccion: string | null;
    grado: string | null;
    seccion: string | null;
};

type Props = {
    alumnos: Alumno[];
};

export default function MisAlumnosPage({ alumnos }: Props) {
    const [search, setSearch] = useState('');

    const filtrados = alumnos.filter(a => {
        const q = search.toLowerCase();
        const nombre = `${a.primer_nombre} ${a.segundo_nombre} ${a.apellido_paterno} ${a.apellido_materno}`.toLowerCase();
        const dni = (a.doc_numero ?? '').toLowerCase();

        return nombre.includes(q) || dni.includes(q);
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Alumnos" />

            <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <PageHeader 
                        icon={Users} 
                        title="Directorio de Alumnos" 
                        subtitle="Gestión y consulta de información de contacto de tus estudiantes."
                        iconColor="bg-emerald-600"
                    />
                    <Link href="/docente/dashboard">
                        <Button variant="ghost" className="rounded-2xl font-bold bg-white shadow-sm border-none hover:bg-gray-50 uppercase text-[10px] tracking-widest h-11 px-6">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </Link>
                </div>

                {/* Filter and Stats Row */}
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <Card className="flex-1 p-4 rounded-[1.5rem] border-none shadow-sm bg-white w-full">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                            <Input
                                placeholder="Buscar por nombres, apellidos o DOI..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-14 h-14 rounded-2xl border-none bg-gray-50/50 font-bold focus:ring-4 focus:ring-emerald-100 transition-all"
                            />
                        </div>
                    </Card>
                    <div className="bg-emerald-600 px-10 h-20 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-emerald-100 whitespace-nowrap">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Estudiantes</p>
                            <p className="text-3xl font-black tabular-nums tracking-tighter">{alumnos.length}</p>
                        </div>
                    </div>
                </div>

                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400">#</th>
                                    <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Estudiante</th>
                                    <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Documento</th>
                                    <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Contacto</th>
                                    <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Grado / Sección</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <Users size={48} className="text-gray-300" />
                                                <p className="font-black uppercase tracking-widest text-sm text-gray-400">No se encontraron resultados</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtrados.map((a, i) => (
                                        <tr key={a.estu_id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6 font-bold text-gray-300 group-hover:text-emerald-600 transition-colors">
                                                {i + 1}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-11 rounded-2xl bg-emerald-50 flex items-center justify-center font-black text-emerald-600 text-[11px] uppercase shadow-sm border border-emerald-100/50">
                                                        {a.primer_nombre?.[0]}{a.apellido_paterno?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900 leading-none group-hover:text-emerald-600 transition-colors uppercase text-xs">
                                                            {a.primer_nombre} {a.segundo_nombre}
                                                        </div>
                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-tight mt-1">
                                                            {a.apellido_paterno} {a.apellido_materno}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="size-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <IdCard size={12} className="w-3 h-3" />
                                                    </span>
                                                    <span className="font-mono text-[13px] font-bold text-gray-600">{a.doc_numero ?? '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 space-y-1.5">
                                                <div className="flex items-center gap-2 text-gray-500 font-bold text-xs">
                                                    <Phone size={12} className="text-emerald-400" />
                                                    {a.telefono ?? 'No registrado'}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase truncate max-w-[200px]">
                                                    <MapPin size={12} className="text-gray-300 shrink-0" />
                                                    {a.direccion ?? 'Dirección no disponible'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Badge className="rounded-xl bg-emerald-50 text-emerald-700 border-none font-black uppercase text-[10px] px-4 py-2 shadow-none hover:bg-emerald-100 transition-colors">
                                                    {[a.grado, a.seccion].filter(Boolean).join(' — ')}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
