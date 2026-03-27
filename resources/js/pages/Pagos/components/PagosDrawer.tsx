import { useCallback, useEffect, useState } from 'react';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';
import type { Pagador, Pago, PagoFormData, PagoUpdateData } from '../hooks/usePago';
import PagoFormModal from './PagoFormModal';

type Props = {
    open:     boolean;
    onClose:  () => void;
    pagador:  Pagador | null;
};

export default function PagosDrawer({ open, onClose, pagador }: Props) {
    const [pagos, setPagos]           = useState<Pago[]>([]);
    const [loading, setLoading]       = useState(false);
    const [modalOpen, setModalOpen]   = useState(false);
    const [editPago, setEditPago]     = useState<Pago | null>(null);
    const [apiErrors, setApiErrors]   = useState<Record<string, string[]>>({});

    const cargar = useCallback(async () => {
        if (!pagador) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/pagos/contactos/${pagador.id_contacto}`);
            setPagos(data.data ?? data);
        } finally {
            setLoading(false);
        }
    }, [pagador]);

    useEffect(() => {
        if (open && pagador) cargar();
    }, [open, pagador, cargar]);

    const handleCreate = async (data: PagoFormData) => {
        setApiErrors({});
        try {
            await api.post('/pagos/', data);
            await cargar();
        } catch (err: unknown) {
            const e = err as { response?: { status?: number; data?: { errors?: Record<string, string[]> } } };
            if (e.response?.status === 422 && e.response.data?.errors) {
                setApiErrors(e.response.data.errors);
            }
            throw err;
        }
    };

    const handleUpdate = async (data: PagoUpdateData) => {
        if (!editPago) return;
        setApiErrors({});
        try {
            await api.put(`/pagos/${editPago.pag_id}`, data);
            await cargar();
        } catch (err: unknown) {
            const e = err as { response?: { status?: number; data?: { errors?: Record<string, string[]> } } };
            if (e.response?.status === 422 && e.response.data?.errors) {
                setApiErrors(e.response.data.errors);
            }
            throw err;
        }
    };

    const handleDelete = async (pagoId: number) => {
        if (!confirm('¿Eliminar este pago?')) return;
        await api.delete(`/pagos/${pagoId}`);
        await cargar();
    };

    const openCreate = () => { setEditPago(null); setModalOpen(true); };
    const openEdit   = (p: Pago) => { setEditPago(p); setModalOpen(true); };

    if (!pagador) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <div>
                                <span className="font-semibold">
                                    {pagador.nombres} {pagador.apellidos}
                                </span>
                                {pagador.mensualidad && (
                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                        Mensualidad:
                                        <span className="ml-1 text-green-600 font-medium">
                                            S/ {pagador.mensualidad}
                                        </span>
                                    </span>
                                )}
                            </div>
                            <Button
                                size="sm"
                                className="bg-[#00a65a] hover:bg-[#008d4c] text-white"
                                onClick={openCreate}
                            >
                                <PlusCircle className="mr-1 h-4 w-4" />
                                Nuevo Pago
                            </Button>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto">
                        {loading && (
                            <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>
                        )}

                        {!loading && pagos.length === 0 && (
                            <p className="py-8 text-center text-sm text-gray-400">
                                No hay pagos registrados aún.
                            </p>
                        )}

                        {!loading && pagos.length > 0 && (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-gray-500 uppercase">
                                        <th className="py-2 pr-3">Año</th>
                                        <th className="py-2 pr-3">Mes</th>
                                        <th className="py-2 pr-3 text-right">Mensualidad</th>
                                        <th className="py-2 pr-3 text-right">Uniforme</th>
                                        <th className="py-2 pr-3 text-right">Otros</th>
                                        <th className="py-2 pr-3 text-right font-semibold">Total</th>
                                        <th className="py-2 pr-3">Fecha</th>
                                        <th className="py-2 pr-3">Estado</th>
                                        <th className="py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagos.map((p) => (
                                        <tr key={p.pag_id} className="border-b hover:bg-gray-50">
                                            <td className="py-2 pr-3">{p.pag_anual}</td>
                                            <td className="py-2 pr-3">{p.pag_mes}</td>
                                            <td className="py-2 pr-3 text-right">
                                                S/ {Number(p.pag_monto).toFixed(2)}
                                            </td>
                                            <td className="py-2 pr-3 text-right text-gray-500">
                                                {Number(p.pag_otro1) > 0
                                                    ? `S/ ${Number(p.pag_otro1).toFixed(2)}`
                                                    : '—'}
                                            </td>
                                            <td className="py-2 pr-3 text-right text-gray-500">
                                                {Number(p.pag_otro2) > 0
                                                    ? `S/ ${Number(p.pag_otro2).toFixed(2)}`
                                                    : '—'}
                                            </td>
                                            <td className="py-2 pr-3 text-right font-semibold text-green-700">
                                                S/ {Number(p.total).toFixed(2)}
                                            </td>
                                            <td className="py-2 pr-3 text-gray-500">
                                                {p.pag_fecha ?? '—'}
                                            </td>
                                            <td className="py-2 pr-3">
                                                <Badge variant={p.estatus === 1 ? 'default' : 'secondary'}>
                                                    {p.estatus === 1 ? 'Pagado' : 'Pendiente'}
                                                </Badge>
                                            </td>
                                            <td className="py-2 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-blue-500 hover:text-blue-700 h-7 w-7 p-0"
                                                        onClick={() => openEdit(p)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-700 h-7 w-7 p-0"
                                                        onClick={() => handleDelete(p.pag_id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal crear */}
            {modalOpen && !editPago && (
                <PagoFormModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    contactoId={pagador.id_contacto}
                    estudianteId={pagador.estu_id}
                    mensualidad={pagador.mensualidad}
                    editing={null}
                    onSave={handleCreate}
                    apiErrors={apiErrors}
                    clearErrors={() => setApiErrors({})}
                />
            )}

            {/* Modal editar */}
            {modalOpen && editPago && (
                <PagoFormModal
                    open={modalOpen}
                    onClose={() => { setModalOpen(false); setEditPago(null); }}
                    contactoId={pagador.id_contacto}
                    estudianteId={pagador.estu_id}
                    mensualidad={pagador.mensualidad}
                    editing={editPago}
                    onSave={handleUpdate}
                    apiErrors={apiErrors}
                    clearErrors={() => setApiErrors({})}
                />
            )}
        </>
    );
}