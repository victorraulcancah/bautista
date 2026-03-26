import { useCallback, useEffect, useState } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';
import type { Matricula, MatriculaApertura, EstudianteDisponible, SeccionOption, MatriculaFormData } from '../hooks/useMatricula';
import MatricularModal from './MatricularModal';

type Props = {
    open:     boolean;
    onClose:  () => void;
    apertura: MatriculaApertura | null;
    secciones: SeccionOption[];
};

export default function MatriculasDrawer({ open, onClose, apertura, secciones }: Props) {
    const [matriculas, setMatriculas]       = useState<Matricula[]>([]);
    const [disponibles, setDisponibles]     = useState<EstudianteDisponible[]>([]);
    const [loading, setLoading]             = useState(false);
    const [modalOpen, setModalOpen]         = useState(false);
    const [apiErrors, setApiErrors]         = useState<Record<string, string[]>>({});

    const cargar = useCallback(async () => {
        if (!apertura) return;
        setLoading(true);
        try {
            const [matRes, dispRes] = await Promise.all([
                api.get(`/matriculas/aperturas/${apertura.apertura_id}/estudiantes`, { params: { per_page: 100 } }),
                api.get(`/matriculas/aperturas/${apertura.apertura_id}/disponibles`),
            ]);
            setMatriculas(matRes.data.data ?? []);
            setDisponibles(dispRes.data);
        } finally {
            setLoading(false);
        }
    }, [apertura]);

    useEffect(() => {
        if (open && apertura) cargar();
    }, [open, apertura, cargar]);

    const handleMatricular = async (data: MatriculaFormData) => {
        setApiErrors({});
        await api.post('/matriculas/', data);
        await cargar();
    };

    const handleAnular = async (matriculaId: number) => {
        if (!confirm('¿Anular esta matrícula?')) return;
        await api.delete(`/matriculas/${matriculaId}`);
        await cargar();
    };

    if (!apertura) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Matriculados — {apertura.nombre}</span>
                            <Button
                                size="sm"
                                className="bg-[#00a65a] hover:bg-[#008d4c] text-white"
                                onClick={() => setModalOpen(true)}
                                disabled={disponibles.length === 0}
                            >
                                <UserPlus className="mr-1 h-4 w-4" />
                                Matricular
                            </Button>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto">
                        {loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}

                        {!loading && matriculas.length === 0 && (
                            <p className="py-8 text-center text-sm text-gray-400">
                                No hay estudiantes matriculados aún.
                            </p>
                        )}

                        {!loading && matriculas.length > 0 && (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-gray-500">
                                        <th className="py-2 pr-4">Estudiante</th>
                                        <th className="py-2 pr-4">DNI</th>
                                        <th className="py-2 pr-4">Sección</th>
                                        <th className="py-2 pr-4">Estado</th>
                                        <th className="py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matriculas.map((m) => (
                                        <tr key={m.matricula_id} className="border-b hover:bg-gray-50">
                                            <td className="py-2 pr-4 font-medium">
                                                {m.estudiante?.nombre_completo ?? '—'}
                                            </td>
                                            <td className="py-2 pr-4 text-gray-500">
                                                {m.estudiante?.doc_numero ?? '—'}
                                            </td>
                                            <td className="py-2 pr-4 text-gray-500">
                                                {m.seccion?.nombre ?? <span className="italic text-gray-400">Sin sección</span>}
                                            </td>
                                            <td className="py-2 pr-4">
                                                <Badge variant={m.estado === '1' ? 'default' : 'secondary'}>
                                                    {m.estado === '1' ? 'Activo' : 'Anulado'}
                                                </Badge>
                                            </td>
                                            <td className="py-2 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleAnular(m.matricula_id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <MatricularModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aperturaId={apertura.apertura_id}
                anio={apertura.anio}
                estudiantes={disponibles}
                secciones={secciones}
                onSave={handleMatricular}
                apiErrors={apiErrors}
                clearErrors={() => setApiErrors({})}
            />
        </>
    );
}
