import { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

type Voucher = {
    id: number;
    pag_id: number;
    estado: 'pendiente' | 'validado' | 'rechazado';
    comentario: string | null;
    archivo_url: string;
    usuario: { id: number; username: string } | null;
    created_at: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    pagId: number | null;
};

const ESTADO_BADGE: Record<Voucher['estado'], { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    pendiente:  { label: 'Pendiente',  variant: 'secondary' },
    validado:   { label: 'Validado',   variant: 'default' },
    rechazado:  { label: 'Rechazado',  variant: 'destructive' },
};

const ESTADO_ICON: Record<Voucher['estado'], React.ReactNode> = {
    pendiente:  <Clock className="h-4 w-4 text-yellow-500" />,
    validado:   <CheckCircle className="h-4 w-4 text-green-600" />,
    rechazado:  <XCircle className="h-4 w-4 text-red-500" />,
};

export default function VoucherModal({ open, onClose, pagId }: Props) {
    const [vouchers, setVouchers]       = useState<Voucher[]>([]);
    const [loading, setLoading]         = useState(false);
    const [comentario, setComentario]   = useState('');
    const [procesando, setProcesando]   = useState<number | null>(null);

    useEffect(() => {
        if (!open || !pagId) return;
        setLoading(true);
        axios.get(`/api/pagos/${pagId}/vouchers`)
            .then(r => setVouchers(r.data.data ?? r.data))
            .finally(() => setLoading(false));
    }, [open, pagId]);

    const validar = async (notificaId: number, estado: 'validado' | 'rechazado') => {
        setProcesando(notificaId);
        try {
            const { data } = await axios.patch(`/api/pagos/vouchers/${notificaId}/estado`, {
                estado,
                comentario: comentario || null,
            });
            setVouchers(prev => prev.map(v => v.id === notificaId ? data.data ?? data : v));
            setComentario('');
        } finally {
            setProcesando(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Comprobantes de pago</DialogTitle>
                </DialogHeader>

                {loading && <p className="text-sm text-muted-foreground py-4 text-center">Cargando...</p>}

                {!loading && vouchers.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                        No hay comprobantes subidos para este pago.
                    </p>
                )}

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {vouchers.map(v => (
                        <div key={v.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {ESTADO_ICON[v.estado]}
                                    <Badge variant={ESTADO_BADGE[v.estado].variant}>
                                        {ESTADO_BADGE[v.estado].label}
                                    </Badge>
                                </div>
                                <a
                                    href={v.archivo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                >
                                    Ver comprobante <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Subido por <span className="font-medium">{v.usuario?.username ?? '—'}</span>{' '}
                                el {new Date(v.created_at).toLocaleDateString('es-PE')}
                            </p>

                            {v.comentario && (
                                <p className="text-sm bg-muted rounded p-2">{v.comentario}</p>
                            )}

                            {v.estado === 'pendiente' && (
                                <div className="space-y-2 pt-1">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Comentario (opcional)</Label>
                                        <Textarea
                                            rows={2}
                                            value={comentario}
                                            onChange={e => setComentario(e.target.value)}
                                            placeholder="Observación al validar o rechazar..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            disabled={procesando === v.id}
                                            onClick={() => validar(v.id, 'validado')}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Validar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            disabled={procesando === v.id}
                                            onClick={() => validar(v.id, 'rechazado')}
                                        >
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Rechazar
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
