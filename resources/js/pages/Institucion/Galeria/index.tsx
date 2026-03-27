import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Images, Trash2, Upload } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/shared/PageHeader';
import SectionCard from '@/components/shared/SectionCard';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

type Foto = {
    gal_id:       number;
    gal_nombre:   string | null;
    gal_posicion: number;
    gal_estatus:  number;
    url:          string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard',   href: '/dashboard' },
    { title: 'Institución', href: '/institucion' },
    { title: 'Galería',     href: '/institucion/galeria' },
];

export default function GaleriaPage() {
    const [fotos, setFotos]       = useState<Foto[]>([]);
    const [loading, setLoading]   = useState(true);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess]   = useState('');
    const fileInputRef            = useRef<HTMLInputElement>(null);

    const load = () => {
        setLoading(true);
        api.get('/galeria').then(({ data }) => {
            setFotos(data.data ?? []);
        }).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fd = new FormData();
        fd.append('imagen', file);

        setUploading(true);
        try {
            await api.post('/galeria', fd);
            setSuccess('Foto subida correctamente.');
            setTimeout(() => setSuccess(''), 3000);
            load();
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (foto: Foto) => {
        if (!confirm(`¿Eliminar la foto en posición ${foto.gal_posicion}?`)) return;
        await api.delete(`/galeria/${foto.gal_id}`);
        setSuccess('Foto eliminada.');
        setTimeout(() => setSuccess(''), 3000);
        load();
    };

    const handleReplaceImage = async (foto: Foto, file: File) => {
        const fd = new FormData();
        fd.append('imagen', file);
        await api.post(`/galeria/${foto.gal_id}?_method=PUT`, fd);
        setSuccess('Foto actualizada.');
        setTimeout(() => setSuccess(''), 3000);
        load();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Galería" />

            <div className="flex flex-col gap-6 p-6">
                <PageHeader
                    icon={Images}
                    title="Galería de Imágenes"
                    subtitle="Fotos de la institución"
                    iconColor="bg-purple-500"
                />

                <SectionCard title="Imágenes">
                    <div className="flex flex-col gap-4">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">{fotos.length} foto{fotos.length !== 1 ? 's' : ''}</p>
                            <div className="flex items-center gap-3">
                                {success && <span className="text-sm text-green-600 font-medium">{success}</span>}
                                <label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleUpload}
                                        disabled={uploading}
                                    />
                                    <Button
                                        type="button"
                                        disabled={uploading}
                                        className="bg-[#00a65a] hover:bg-[#008d4c] text-white cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="mr-2 size-4" />
                                        {uploading ? 'Subiendo...' : 'Agregar foto'}
                                    </Button>
                                </label>
                            </div>
                        </div>

                        {/* Grid de fotos */}
                        {loading ? (
                            <p className="py-8 text-center text-sm text-gray-400">Cargando...</p>
                        ) : fotos.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
                                <Images className="size-10" />
                                <p className="text-sm">No hay fotos aún. Sube la primera.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                                {fotos.map((foto) => (
                                    <FotoCard
                                        key={foto.gal_id}
                                        foto={foto}
                                        onDelete={() => handleDelete(foto)}
                                        onReplace={(file) => handleReplaceImage(foto, file)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </SectionCard>
            </div>
        </AppLayout>
    );
}

function FotoCard({ foto, onDelete, onReplace }: {
    foto:      Foto;
    onDelete:  () => void;
    onReplace: (file: File) => void;
}) {
    const replaceRef = useRef<HTMLInputElement>(null);

    return (
        <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            {foto.url ? (
                <img
                    src={foto.url}
                    alt={`Foto ${foto.gal_posicion}`}
                    className="h-36 w-full object-cover"
                />
            ) : (
                <div className="flex h-36 items-center justify-center text-gray-300">
                    <Images className="size-10" />
                </div>
            )}

            {/* Overlay con acciones */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <label title="Reemplazar imagen">
                    <input
                        ref={replaceRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onReplace(f);
                            if (replaceRef.current) replaceRef.current.value = '';
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => replaceRef.current?.click()}
                        className="rounded bg-white/20 p-1.5 text-white hover:bg-white/40"
                    >
                        <Upload className="size-4" />
                    </button>
                </label>
                <button
                    type="button"
                    onClick={onDelete}
                    className="rounded bg-white/20 p-1.5 text-white hover:bg-red-500/80"
                    title="Eliminar"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>

            <div className="px-2 py-1 text-center text-xs text-gray-500 dark:text-gray-400">
                Posición {foto.gal_posicion}
            </div>
        </div>
    );
}
