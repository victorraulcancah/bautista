import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Download, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ResourceTable, { Column } from '@/components/shared/ResourceTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type {BreadcrumbItem} from '@/types';

type Archivo = {
    horario_archivo_id: number;
    nombre: string;
    tipo: string | null;
    url: string;
};

type Props = { seccionId: number };

export default function HorariosPage({ seccionId }: Props) {
    const [archivos, setArchivos]     = useState<Archivo[]>([]);
    const [modalOpen, setModalOpen]   = useState(false);
    const [uploading, setUploading]   = useState(false);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const inputRef                    = useRef<HTMLInputElement>(null);

    const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard',  href: '/dashboard' },
        { title: 'Secciones',  href: '/secciones' },
        { title: 'Horarios',   href: '#' },
    ];

    useEffect(() => {
        api.get(`/secciones/${seccionId}/horarios`)
            .then((r) => setArchivos(r.data))
            .catch(() => setArchivos([]));
    }, [seccionId]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
return;
}

        setUploading(true);

        try {
            const fd = new FormData();
            fd.append('archivo', file);
            const r = await api.post(`/secciones/${seccionId}/horarios`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setArchivos((prev) => [r.data, ...prev]);
            setModalOpen(false);
        } finally {
            setUploading(false);

            if (inputRef.current) {
inputRef.current.value = '';
}
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este archivo?')) {
return;
}

        await api.delete(`/secciones/horarios/${id}`);
        setArchivos((prev) => prev.filter((a) => a.horario_archivo_id !== id));
    };

    return (
        <>
            <Head title="Horario de Clases" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" className="gap-1 text-neutral-500 shrink-0"
                                onClick={() => router.visit('/secciones')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Volver</span>
                            </Button>
                            <h1 className="text-xl sm:text-2xl font-black text-neutral-950 truncate">Horario de Clases</h1>
                        </div>
                        <Button className="bg-[#00a65a] hover:bg-[#008d4c] text-white gap-2 w-full sm:w-auto"
                            onClick={() => setModalOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Agregar
                        </Button>
                    </div>

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
                            { label: '#', className: 'w-12 text-center text-neutral-400', render: (_, i) => i + 1 },
                            { label: 'Vista Previa', className: 'w-24 text-center', render: (a) => (
                                <div className="flex justify-center">
                                    {isImage(a.url) ? (
                                        <button 
                                            onClick={() => setViewingImage(a.url)}
                                            className="group relative size-12 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 transition-all hover:border-[#00a65a] hover:shadow-md"
                                        >
                                            <img src={a.url} alt={a.nombre} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                                <ImagePlus className="size-4 text-white" />
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="flex size-12 items-center justify-center rounded-md border border-neutral-100 bg-neutral-50 text-neutral-400">
                                            <ImagePlus className="size-4 opacity-50" />
                                        </div>
                                    )}
                                </div>
                            )},
                            { label: 'Archivo', render: (a) => (
                                <div className="flex flex-col">
                                    <span className="font-medium text-neutral-900">{a.nombre}</span>
                                    {isImage(a.url) && <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Imagen de Horario</span>}
                                </div>
                            )},
                        ]}
                    />
                </div>
            </AppLayout>

            {/* Modal de Vista Previa de Imagen */}
            <Dialog open={!!viewingImage} onOpenChange={(v) => !v && setViewingImage(null)}>
                <DialogContent className="w-[95vw] sm:max-w-3xl overflow-hidden p-0 border-none bg-transparent shadow-none">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Vista previa de horario</DialogTitle>
                    </DialogHeader>
                    <div className="relative flex items-center justify-center bg-black/90 p-4 rounded-xl">
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

            {/* Modal simple: solo un archivo */}
            <Dialog open={modalOpen} onOpenChange={(v) => !v && setModalOpen(false)}>
                <DialogContent className="w-[95vw] sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ImagePlus className="h-5 w-5" />
                            Agregar Imagen / Archivo
                        </DialogTitle>
                    </DialogHeader>

                    <label className="flex items-center justify-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded-md cursor-pointer text-sm w-full uppercase">
                        Agregar Imagen / Archivo
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/gif,.csv,application/vnd.ms-excel,.xlsx,.pdf"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </label>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button type="button" variant="destructive" className="w-full sm:order-1" onClick={() => setModalOpen(false)}>
                            Cerrar
                        </Button>
                        <Button type="button" disabled={uploading} className="w-full bg-[#00a65a] hover:bg-[#008d4c] text-white sm:order-2"
                            onClick={() => inputRef.current?.click()}
                        >
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
