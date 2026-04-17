import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Copy, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import ClaseModal from '@/pages/HorarioClases/components/ClaseModal';
import ClonarHorarioModal from '@/pages/HorarioClases/components/ClonarHorarioModal';
import HorarioSemanal from '@/pages/HorarioClases/components/HorarioSemanal';

type Props = {
    seccionId: number;
    seccionNombre: string;
    gradoNombre?: string;
};

export default function HorariosPage({ seccionId, seccionNombre, gradoNombre }: Props) {
    const [horario, setHorario] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [claseModal, setClaseModal] = useState<{ open: boolean; clase?: any }>({ open: false });
    const [clonarModal, setClonarModal] = useState(false);

    const titulo = gradoNombre ? `${seccionNombre} - ${gradoNombre}` : seccionNombre;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Secciones', href: '/secciones' },
        { title: titulo, href: '#' },
    ];

    useEffect(() => {
        cargarHorario();
    }, [seccionId, anio]);

    const cargarHorario = async () => {
        setLoading(true);
        try {
            const r = await api.get(`/secciones/${seccionId}/horario`, { params: { anio } });
            setHorario(r.data);
        } catch {
            setHorario({});
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarClase = async (claseId: number) => {
        if (!confirm('¿Eliminar esta clase del horario?')) return;
        try {
            await api.delete(`/horario-clases/${claseId}`);
            cargarHorario();
        } catch {
            alert('Error al eliminar la clase');
        }
    };

    return (
        <>
            <Head title={`Horario - ${titulo}`} />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-neutral-500 shrink-0"
                                onClick={() => router.visit('/secciones')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Volver</span>
                            </Button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-neutral-950">{titulo}</h1>
                                <p className="text-sm text-neutral-500">Horario de clases</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Año:</label>
                                <select
                                    value={anio}
                                    onChange={(e) => setAnio(parseInt(e.target.value))}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    {[2024, 2025, 2026, 2027].map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => setClonarModal(true)}
                            >
                                <Copy className="h-4 w-4" />
                                Clonar
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-blue-600 hover:bg-blue-700"
                                onClick={() => setClaseModal({ open: true })}
                            >
                                <Plus className="h-4 w-4" />
                                Agregar Clase
                            </Button>
                        </div>
                    </div>

                    {/* Horario semanal */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <HorarioSemanal
                            horario={horario}
                            editable={true}
                            onEdit={(clase) => setClaseModal({ open: true, clase })}
                            onDelete={handleEliminarClase}
                            showDocente={true}
                            showSeccion={false}
                        />
                    )}
                </div>
            </AppLayout>

            <ClaseModal
                open={claseModal.open}
                onClose={() => setClaseModal({ open: false })}
                onSaved={() => { setClaseModal({ open: false }); cargarHorario(); }}
                seccionId={seccionId}
                anioEscolar={anio}
                clase={claseModal.clase}
            />

            <ClonarHorarioModal
                open={clonarModal}
                onClose={() => setClonarModal(false)}
                onCloned={cargarHorario}
                seccionId={seccionId}
                anioActual={anio}
            />
        </>
    );
}
