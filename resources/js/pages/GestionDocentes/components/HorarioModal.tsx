import { useEffect, useRef, useState } from 'react';
import { Download, ImagePlus, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import type { Docente } from '../hooks/useDocentes';
import { nombreCompleto } from '../hooks/useDocentes';

type Archivo = {
    horario_archivo_id: number;
    nombre:     string;
    url:        string;
    created_at: string | null;
};

type Props = {
    open:    boolean;
    onClose: () => void;
    docente: Docente | null;
};

export default function HorarioModal({ open, onClose, docente }: Props) {
    const [archivos,  setArchivos]  = useState<Archivo[]>([]);
    const [loading,   setLoading]   = useState(false);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open || !docente) return;
        setLoading(true);
        api.get(`/docentes/${docente.docente_id}/horarios`)
            .then(r => setArchivos(r.data))
            .catch(() => setArchivos([]))
            .finally(() => setLoading(false));
    }, [open, docente]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !docente) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('archivo', file);
            const r = await api.post(`/docentes/${docente.docente_id}/horarios`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setArchivos(prev => [r.data, ...prev]);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este archivo?')) return;
        await api.delete(`/docentes/horarios/${id}`);
        setArchivos(prev => prev.filter(a => a.horario_archivo_id !== id));
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ImagePlus className="size-4 text-[#00a65a]" />
                        Horario — {docente ? nombreCompleto(docente) : ''}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="lista">
                    <TabsList className="w-full">
                        <TabsTrigger value="lista"   className="flex-1">Lista</TabsTrigger>
                        <TabsTrigger value="agregar" className="flex-1">Agregar</TabsTrigger>
                    </TabsList>

                    {/* ── Tab Lista ── */}
                    <TabsContent value="lista" className="mt-3">
                        {loading ? (
                            <p className="py-8 text-center text-sm text-gray-400">Cargando...</p>
                        ) : archivos.length === 0 ? (
                            <p className="py-8 text-center text-sm text-gray-400">No hay archivos subidos.</p>
                        ) : (
                            <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#00a65a] text-white">
                                            <th className="px-3 py-2 text-center">#</th>
                                            <th className="px-3 py-2 text-left">Archivo</th>
                                            <th className="px-3 py-2 text-center">Fecha Registro</th>
                                            <th className="px-3 py-2 text-center">Descargar</th>
                                            <th className="px-3 py-2 text-center">Eliminar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {archivos.map((a, i) => (
                                            <tr key={a.horario_archivo_id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-3 py-2 text-center text-gray-400">{i + 1}</td>
                                                <td className="px-3 py-2 truncate max-w-[180px]" title={a.nombre}>{a.nombre}</td>
                                                <td className="px-3 py-2 text-center text-gray-500">{a.created_at ?? '—'}</td>
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
                            </div>
                        )}
                    </TabsContent>

                    {/* ── Tab Agregar ── */}
                    <TabsContent value="agregar" className="mt-3 space-y-3">
                        <label className="flex items-center justify-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded-md cursor-pointer text-sm w-full uppercase">
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
                        <Button type="button" variant="destructive" className="w-full" onClick={onClose}>
                            <X className="h-4 w-4 mr-2" />
                            Cerrar
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
