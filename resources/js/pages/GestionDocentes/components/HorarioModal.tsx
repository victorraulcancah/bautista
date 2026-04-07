import { useEffect, useRef, useState } from 'react';
import { Download, ImagePlus, Plus, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourceTable, { Column } from '@/components/shared/ResourceTable';
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
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);

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
        <>
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="w-[95vw] sm:max-w-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-2">
                        <ImagePlus className="size-4 text-[#00a65a]" />
                        Horario — {docente ? nombreCompleto(docente) : ''}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="lista" className="p-6 pt-2">
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
                            <ResourceTable
                                rows={{
                                    data:         archivos,
                                    current_page: 1,
                                    last_page:    1,
                                    per_page:     archivos.length,
                                    total:        archivos.length,
                                    from:         1,
                                    to:           archivos.length,
                                }}
                                getKey={(a) => a.horario_archivo_id}
                                onDelete={(a) => handleDelete(a.horario_archivo_id)}
                                onPageChange={() => {}}
                                extraActions={(a) => (
                                    <a href={a.url} target="_blank" rel="noreferrer">
                                        <Button size="icon" variant="ghost" className="size-7 text-blue-500 hover:bg-blue-50">
                                            <Download className="size-3.5" />
                                        </Button>
                                    </a>
                                )}
                                columns={[
                                    { label: '#', className: 'w-10 text-center text-neutral-400', render: (_, i) => i + 1 },
                                    { label: 'Vista Previa', className: 'w-24 text-center', render: (a) => (
                                        <div className="flex justify-center">
                                            {isImage(a.url) ? (
                                                <button 
                                                    onClick={() => setViewingImage(a.url)}
                                                    className="group relative size-10 overflow-hidden rounded-md border border-neutral-100 bg-neutral-50 transition-all hover:border-[#00a65a]"
                                                >
                                                    <img src={a.url} alt={a.nombre} className="h-full w-full object-cover" />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100">
                                                        <ImagePlus className="size-3 text-white" />
                                                    </div>
                                                </button>
                                            ) : (
                                                <div className="flex size-10 items-center justify-center rounded-md border border-neutral-50 bg-neutral-50/50 text-neutral-300">
                                                    <ImagePlus className="size-3 opacity-30" />
                                                </div>
                                            )}
                                        </div>
                                    )},
                                    { label: 'Archivo', render: (a) => (
                                        <div className="flex flex-col text-left">
                                            <span className="font-medium text-neutral-900 truncate max-w-[120px] sm:max-w-[200px]" title={a.nombre}>{a.nombre}</span>
                                            <span className="text-[10px] text-neutral-400 capitalize">{a.created_at ?? 'Reciente'}</span>
                                        </div>
                                    )},
                                ]}
                            />
                        )}
                    </TabsContent>

                    {/* ── Tab Agregar ── */}
                    <TabsContent value="agregar" className="mt-3">
                        <div className="space-y-4">
                            <label className="flex items-center justify-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-8 rounded-xl border-2 border-dashed border-neutral-100/20 cursor-pointer transition-colors shadow-sm w-full uppercase font-bold text-xs">
                                <Upload className="h-5 w-5" />
                                {uploading ? 'Subiendo...' : 'Seleccionar Imagen / Archivo'}
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/gif,.csv,application/vnd.ms-excel,.xlsx,.pdf"
                                    className="hidden"
                                    onChange={handleUpload}
                                    disabled={uploading}
                                />
                            </label>
                            
                            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
                                    Cancelar
                                </Button>
                            </DialogFooter>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>

        {/* Visor de Imagen */}
        <Dialog open={!!viewingImage} onOpenChange={(v) => !v && setViewingImage(null)}>
            <DialogContent className="w-[95vw] sm:max-w-3xl overflow-hidden p-0 border-none bg-transparent shadow-none z-[100]">
                <DialogHeader className="sr-only">
                    <DialogTitle>Vista previa de horario</DialogTitle>
                </DialogHeader>
                <div className="relative flex items-center justify-center bg-black/95 p-4 rounded-2xl">
                    <img 
                        src={viewingImage || ''} 
                        alt="Vista previa" 
                        className="max-h-[85vh] w-auto rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                    />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 text-white hover:bg-white/20"
                        onClick={() => setViewingImage(null)}
                    >
                        <Plus className="rotate-45 size-6" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </>
    );
}
