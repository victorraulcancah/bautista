import { Head } from '@inertiajs/react';
import { GraduationCap, Mail, Phone, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Portal Familia', href: '/padre/dashboard' },
    { title: 'Profesores', href: '#' },
];

// ── Modal de contacto ─────────────────────────────────────────────────────────
function ContactoModal({ prof, onClose }: { prof: any; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 space-y-6 animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 size-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <X size={14} className="text-gray-500" />
                </button>

                {/* Avatar + nombre */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="size-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-2xl">
                        {prof.nombre?.charAt(0) ?? 'P'}
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-lg">{prof.nombre} {prof.apellido}</p>
                        <p className="text-sm text-indigo-500 font-semibold">{prof.curso}</p>
                    </div>
                </div>

                {/* Datos de contacto */}
                <div className="space-y-3">
                    {prof.email && prof.email !== '—' && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                            <div className="size-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <Mail size={16} className="text-indigo-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Correo</p>
                                <p className="text-sm font-semibold text-gray-800 truncate">{prof.email}</p>
                            </div>
                        </div>
                    )}
                    {prof.telefono && prof.telefono !== '—' && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                            <div className="size-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Phone size={16} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teléfono</p>
                                <p className="text-sm font-semibold text-gray-800">{prof.telefono}</p>
                            </div>
                        </div>
                    )}
                    {(!prof.email || prof.email === '—') && (!prof.telefono || prof.telefono === '—') && (
                        <p className="text-center text-sm text-gray-400 italic py-2">Sin datos de contacto registrados.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProfesoresPage() {
    const [hijos, setHijos] = useState<any[]>([]);
    const [profsPorHijo, setProfsPorHijo] = useState<Record<number, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [profContacto, setProfContacto] = useState<any | null>(null);

    useEffect(() => {
        api.get('/padre/hijos').then(async res => {
            const hijosData = res.data;
            setHijos(hijosData);
            if (hijosData.length > 0) setExpanded(hijosData[0].estu_id);

            const profsMap: Record<number, any[]> = {};
            await Promise.all(hijosData.map(async (h: any) => {
                try {
                    const r = await api.get(`/padre/hijo/${h.estu_id}/profesores`);
                    profsMap[h.estu_id] = r.data ?? [];
                } catch { profsMap[h.estu_id] = []; }
            }));
            setProfsPorHijo(profsMap);
        }).finally(() => setLoading(false));
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profesores" />
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                        <GraduationCap className="size-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Profesores</h1>
                        <p className="text-sm text-gray-500">Docentes de tus hijos</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {hijos.map(hijo => (
                            <div key={hijo.estu_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpanded(expanded === hijo.estu_id ? null : hijo.estu_id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">
                                            {hijo.perfil?.primer_nombre?.charAt(0) ?? '?'}
                                        </div>
                                        <span className="font-bold text-gray-900 capitalize">
                                            {hijo.perfil?.primer_nombre} {hijo.perfil?.apellido_paterno}
                                        </span>
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {profsPorHijo[hijo.estu_id]?.length ?? 0} profesores
                                        </span>
                                    </div>
                                    {expanded === hijo.estu_id
                                        ? <ChevronUp className="size-4 text-gray-400" />
                                        : <ChevronDown className="size-4 text-gray-400" />}
                                </button>

                                {expanded === hijo.estu_id && (
                                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                                        {(profsPorHijo[hijo.estu_id] ?? []).length === 0 ? (
                                            <p className="px-5 py-6 text-sm text-gray-400 italic">Sin profesores registrados.</p>
                                        ) : (
                                            (profsPorHijo[hijo.estu_id] ?? []).map((prof: any, i: number) => (
                                                <div key={i} className="px-5 py-4 flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-sm">
                                                        {prof.nombre?.charAt(0) ?? 'P'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-800 text-sm">{prof.nombre} {prof.apellido}</p>
                                                        <p className="text-xs text-indigo-500 font-medium">{prof.curso}</p>
                                                    </div>
                                                    {/* Botón único de contacto */}
                                                    <button
                                                        onClick={() => setProfContacto(prof)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-xs font-bold"
                                                    >
                                                        <Mail className="size-3.5" />
                                                        Contacto
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {profContacto && (
                <ContactoModal prof={profContacto} onClose={() => setProfContacto(null)} />
            )}
        </AppLayout>
    );
}
