import { useCallback, useEffect, useState } from 'react';
import { PlusCircle, Pencil, Trash2, Calendar, FileText, X, AlertCircle, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import type { Pagador, Pago, PagoFormData, PagoUpdateData } from '../hooks/usePago';
import PagoFormModal from './PagoFormModal';
import VoucherModal from './VoucherModal';

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
    const [fecIni, setFecIni]         = useState('');
    const [fecFin, setFecFin]         = useState('');
    const [filteredPagos, setFilteredPagos] = useState<Pago[]>([]);
    const [confirmGenerar, setConfirmGenerar] = useState(false);
    const [generando, setGenerando]   = useState(false);
    const [voucherPagId, setVoucherPagId] = useState<number | null>(null);

    const cargar = useCallback(async () => {
        if (!pagador) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/pagos/contactos/${pagador.id_contacto}`);
            const pagosList = data.data ?? data;
            setPagos(pagosList);
            setFilteredPagos(pagosList);
        } finally {
            setLoading(false);
        }
    }, [pagador]);

    useEffect(() => {
        if (open && pagador) cargar();
    }, [open, pagador, cargar]);

    const handleFilter = () => {
        if (!fecIni || !fecFin) {
            setFilteredPagos(pagos);
            return;
        }
        const filtered = pagos.filter((p) => {
            if (!p.pag_fecha) return false;
            const fecha = new Date(p.pag_fecha);
            const inicio = new Date(fecIni);
            const fin = new Date(fecFin);
            return fecha >= inicio && fecha <= fin;
        });
        setFilteredPagos(filtered);
    };

    const handleClearFilter = () => {
        setFecIni('');
        setFecFin('');
        setFilteredPagos(pagos);
    };

    const handleGenerarMensualidad = async () => {
        if (!pagador) return;
        setGenerando(true);
        try {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const monthNames = [
                'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
            ];
            
            await api.post('/pagos/', {
                contacto_id: pagador.id_contacto.toString(),
                estudiante_id: pagador.estu_id.toString(),
                pag_anual: currentYear.toString(),
                pag_mes: monthNames[currentMonth - 1],
                pag_monto: '0',
                pag_nombre1: '',
                pag_otro1: '0',
                pag_nombre2: '',
                pag_otro2: '0',
                pag_notifica: 'NO',
                pag_fecha: new Date().toISOString().slice(0, 10),
            });
            await cargar();
            setConfirmGenerar(false);
        } catch (err) {
            console.error('Error al generar mensualidad:', err);
        } finally {
            setGenerando(false);
        }
    };

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
                <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
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
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                    onClick={() => setConfirmGenerar(true)}
                                >
                                    <Calendar className="mr-1 h-4 w-4" />
                                    Generar Mensualidad
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-[#00a65a] hover:bg-[#008d4c] text-white"
                                    onClick={openCreate}
                                >
                                    <PlusCircle className="mr-1 h-4 w-4" />
                                    Agregar Pago
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {/* Filtros por fecha */}
                    <div className="flex items-end gap-3 pb-4 border-b">
                        <div className="flex-1">
                            <Label className="text-xs">Fecha Inicio</Label>
                            <Input
                                type="date"
                                value={fecIni}
                                onChange={(e) => setFecIni(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="flex-1">
                            <Label className="text-xs">Fecha Fin</Label>
                            <Input
                                type="date"
                                value={fecFin}
                                onChange={(e) => setFecFin(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <Button
                            size="sm"
                            onClick={handleFilter}
                            className="bg-blue-500 hover:bg-blue-600 text-white h-9"
                        >
                            Buscar
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleClearFilter}
                            className="h-9"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Limpiar
                        </Button>
                        <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white h-9"
                            onClick={() => {
                                const params = new URLSearchParams({
                                    contacto_id: pagador.id_contacto.toString(),
                                    estudiante_id: pagador.estu_id.toString(),
                                    ...(fecIni && { fecha_inicio: fecIni }),
                                    ...(fecFin && { fecha_fin: fecFin }),
                                });
                                window.open(`/api/pagos/reporte-pdf?${params.toString()}`, '_blank');
                            }}
                        >
                            <FileText className="h-4 w-4 mr-1" />
                            PDF
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading && (
                            <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>
                        )}

                        {!loading && filteredPagos.length === 0 && (
                            <p className="py-8 text-center text-sm text-gray-400">
                                No hay pagos registrados aún.
                            </p>
                        )}

                        {!loading && filteredPagos.length > 0 && (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-gray-500 uppercase bg-gray-50">
                                        <th className="py-2 px-3">#</th>
                                        <th className="py-2 px-3">Año</th>
                                        <th className="py-2 px-3">Mes</th>
                                        <th className="py-2 px-3 text-right">Mensualidad</th>
                                        <th className="py-2 px-3 text-right">Uniforme</th>
                                        <th className="py-2 px-3 text-right">Otros</th>
                                        <th className="py-2 px-3 text-right font-semibold">Total</th>
                                        <th className="py-2 px-3">Fecha Reg.</th>
                                        <th className="py-2 px-3">Estatus</th>
                                        <th className="py-2 px-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPagos.map((p, idx) => (
                                        <tr key={p.pag_id} className="border-b hover:bg-gray-50">
                                            <td className="py-2 px-3 text-gray-500">{idx + 1}</td>
                                            <td className="py-2 px-3">{p.pag_anual}</td>
                                            <td className="py-2 px-3">{p.pag_mes}</td>
                                            <td className="py-2 px-3 text-right">
                                                S/ {Number(p.pag_monto).toFixed(2)}
                                            </td>
                                            <td className="py-2 px-3 text-right text-gray-500">
                                                {Number(p.pag_otro1) > 0
                                                    ? `S/ ${Number(p.pag_otro1).toFixed(2)}`
                                                    : '—'}
                                            </td>
                                            <td className="py-2 px-3 text-right text-gray-500">
                                                {Number(p.pag_otro2) > 0
                                                    ? `S/ ${Number(p.pag_otro2).toFixed(2)}`
                                                    : '—'}
                                            </td>
                                            <td className="py-2 px-3 text-right font-semibold text-green-700">
                                                S/ {Number(p.total).toFixed(2)}
                                            </td>
                                            <td className="py-2 px-3 text-gray-500">
                                                {p.pag_fecha ?? '—'}
                                            </td>
                                            <td className="py-2 px-3">
                                                <Badge 
                                                    variant={p.estatus === 1 ? 'default' : 'secondary'}
                                                    className={p.estatus === 1 ? 'bg-green-600' : 'bg-red-500'}
                                                >
                                                    {p.estatus === 1 ? 'Pagado' : 'Pendiente'}
                                                </Badge>
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        title="Ver comprobantes"
                                                        className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 h-7 w-7 p-0"
                                                        onClick={() => setVoucherPagId(p.pag_id)}
                                                    >
                                                        <Receipt className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-7 w-7 p-0"
                                                        onClick={() => openEdit(p)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
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

            {/* Modal de vouchers / comprobantes */}
            <VoucherModal
                open={voucherPagId !== null}
                onClose={() => setVoucherPagId(null)}
                pagId={voucherPagId}
            />

            {/* Modal de confirmación para generar mensualidad */}
            <Dialog open={confirmGenerar} onOpenChange={setConfirmGenerar}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-500" />
                            Generar Mensualidad
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            ¿Está seguro que desea generar una mensualidad automática para el mes actual?
                            <br />
                            <br />
                            Se creará un registro de pago con monto en S/ 0.00 que podrá editar posteriormente.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmGenerar(false)}
                            disabled={generando}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={handleGenerarMensualidad}
                            disabled={generando}
                        >
                            {generando ? 'Generando...' : 'Sí, Generar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}