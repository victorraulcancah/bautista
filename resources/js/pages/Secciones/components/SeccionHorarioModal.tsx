import { useEffect, useRef, useState } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';

type Archivo = {
    horario_archivo_id: number;
    nombre: string;
    tipo: string | null;
    tamanio: number | null;
    url: string;
};

type Props = {
    open:      boolean;
    seccionId: number | null;
    onClose:   () => void;
};

export default function SeccionHorarioModal({ open, seccionId, onClose }: Props) {
    const [archivos, setArchivos]   = useState<Archivo[]>([]);
    const [uploading, setUploading] = useState(false);
    const inputRef                  = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open && seccionId) {
            api.get(`/secciones/${seccionId}/horarios`)
                .then((r) => setArchivos(r.data))
                .catch(() => setArchivos([]));
        } else {
            setArchivos([]);
        }
    }, [open, seccionId]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !seccionId) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('archivo', file);
            const r = await api.post(`/secciones/${seccionId}/horarios`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setArchivos((prev) => [r.data, ...prev]);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleDelete = async (id: number) => {
        await api.delete(`/secciones/horarios/${id}`);
        setArchivos((prev) => prev.filter((a) => a.horario_archivo_id !== id));
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Horario de Clases</DialogTitle>
                </DialogHeader>

                <label className="flex items-center justify-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded-md cursor-pointer text-sm w-full">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Subiendo...' : 'Agregar Imagen / Archivo'}
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/gif,.csv,application/vnd.ms-excel,.xlsx,.pdf"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>

                {archivos.length > 0 && (
                    <table className="w-full text-sm mt-2">
                        <thead>
                            <tr className="bg-[#00a65a] text-white">
                                <th className="px-3 py-2 text-left">#</th>
                                <th className="px-3 py-2 text-left">Archivo</th>
                                <th className="px-3 py-2 text-center">Descargar</th>
                                <th className="px-3 py-2 text-center">Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {archivos.map((a, i) => (
                                <tr key={a.horario_archivo_id} className="border-b border-gray-100">
                                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                                    <td className="px-3 py-2 truncate max-w-[160px]" title={a.nombre}>{a.nombre}</td>
                                    <td className="px-3 py-2 text-center">
                                        <a href={a.url} target="_blank" rel="noreferrer">
                                            <Button size="icon" variant="ghost" className="size-7 text-blue-500 hover:bg-blue-50">
                                                <Download className="size-3.5" />
                                            </Button>
                                        </a>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <Button size="icon" variant="ghost"
                                            className="size-7 text-red-500 hover:bg-red-50"
                                            onClick={() => handleDelete(a.horario_archivo_id)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {archivos.length === 0 && !uploading && (
                    <p className="text-center text-sm text-gray-400 py-4">No hay archivos subidos.</p>
                )}
            </DialogContent>
        </Dialog>
    );
}
