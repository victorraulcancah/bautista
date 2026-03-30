import { useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Download, ImagePlus, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type BreadcrumbItem } from '@/types';
import api from '@/lib/api';

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
    const inputRef                    = useRef<HTMLInputElement>(null);

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
        if (!file) return;
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
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este archivo?')) return;
        await api.delete(`/secciones/horarios/${id}`);
        setArchivos((prev) => prev.filter((a) => a.horario_archivo_id !== id));
    };

    return (
        <>
            <Head title="Horario de Clases" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" className="gap-1 text-neutral-500"
                                onClick={() => router.visit('/secciones')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Button>
                            <h1 className="text-2xl font-black text-neutral-950">Horario de Clases</h1>
                        </div>
                        <Button className="bg-[#00a65a] hover:bg-[#008d4c] text-white gap-2"
                            onClick={() => setModalOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Agregar
                        </Button>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#00a65a] text-white">
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">#</th>
                                    <th className="px-4 py-3 text-left   text-xs font-semibold uppercase">Archivo</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Descargar</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Eliminar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {archivos.map((a, i) => (
                                    <tr key={a.horario_archivo_id} className="border-b border-neutral-100 hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center text-neutral-400">{i + 1}</td>
                                        <td className="px-4 py-3 text-neutral-700">{a.nombre}</td>
                                        <td className="px-4 py-3 text-center">
                                            <a href={a.url} target="_blank" rel="noreferrer">
                                                <Button size="icon" variant="ghost" className="size-7 text-blue-500 hover:bg-blue-50">
                                                    <Download className="size-3.5" />
                                                </Button>
                                            </a>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Button size="icon" variant="ghost"
                                                className="size-7 text-red-500 hover:bg-red-50"
                                                onClick={() => handleDelete(a.horario_archivo_id)}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {archivos.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center text-sm text-neutral-400">
                                            No hay archivos subidos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </AppLayout>

            {/* Modal simple: solo un archivo */}
            <Dialog open={modalOpen} onOpenChange={(v) => !v && setModalOpen(false)}>
                <DialogContent className="max-w-sm">
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

                    <DialogFooter className="flex-col gap-2 sm:flex-col">
                        <Button type="button" disabled={uploading} className="w-full bg-[#00a65a] hover:bg-[#008d4c] text-white"
                            onClick={() => inputRef.current?.click()}
                        >
                            Guardar
                        </Button>
                        <Button type="button" variant="destructive" className="w-full" onClick={() => setModalOpen(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
