import { History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';

type HistorialEntry = {
    id:         number;
    fecha:      string;
    hora:       string;
    tipo:       string;
    ip_address: string;
    device:     string;
    isp:        string;
};

type Props = {
    open:     boolean;
    onClose:  () => void;
    userId:   number | null;
    nombre:   string;
};

export default function HistorialModal({ open, onClose, userId, nombre }: Props) {
    const [rows, setRows]       = useState<HistorialEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !userId) {
return;
}

        setLoading(true);
        api.get(`/usuarios/${userId}/historial`)
            .then(r => setRows(r.data ?? []))
            .finally(() => setLoading(false));
    }, [open, userId]);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-emerald-600" />
                        Historial de accesos — {nombre}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <p className="py-8 text-center text-sm text-neutral-400">Cargando…</p>
                    ) : rows.length === 0 ? (
                        <p className="py-8 text-center text-sm text-neutral-400">Sin registros de acceso.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="sticky top-0">
                                <tr className="bg-[#00a65a]">
                                    <th className="px-3 py-2 text-left text-white text-xs font-semibold uppercase">#</th>
                                    <th className="px-3 py-2 text-left text-white text-xs font-semibold uppercase">Fecha</th>
                                    <th className="px-3 py-2 text-left text-white text-xs font-semibold uppercase">Hora</th>
                                    <th className="px-3 py-2 text-left text-white text-xs font-semibold uppercase">Tipo</th>
                                    <th className="px-3 py-2 text-left text-white text-xs font-semibold uppercase">IP</th>
                                    <th className="px-3 py-2 text-left text-white text-xs font-semibold uppercase">Dispositivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, idx) => (
                                    <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                                        <td className="px-3 py-2 text-neutral-400">{idx + 1}</td>
                                        <td className="px-3 py-2">{r.fecha}</td>
                                        <td className="px-3 py-2 text-neutral-500">{r.hora}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                r.tipo === 'Login'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-neutral-100 text-neutral-600'
                                            }`}>
                                                {r.tipo}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 font-mono text-xs text-neutral-500">{r.ip_address}</td>
                                        <td className="px-3 py-2 text-neutral-500 capitalize">{r.device}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
