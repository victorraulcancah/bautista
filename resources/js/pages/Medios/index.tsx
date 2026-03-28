import { Head } from '@inertiajs/react';
import { Image, File, Film, Music, Upload, Trash2, Search, Filter, Folder, Grid, List as ListIcon, MoreVertical, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gestión de Medios', href: '/biblioteca' },
];

export default function MediosIndex() {
    const [medios, setMedios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadMedios();
    }, []);

    const loadMedios = () => {
        api.get('/medios')
            .then(res => setMedios(res.data))
            .finally(() => setLoading(false));
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('archivo', file);

        api.post('/medios/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(() => loadMedios());
    };

    const handleDelete = (id: number) => {
        if (!confirm("¿Seguro que deseas eliminar este archivo?")) return;
        api.delete(`/medios/${id}`).then(() => loadMedios());
    };

    const getIcon = (tipo: string) => {
        const t = tipo.toLowerCase();
        if (['jpg', 'png', 'jpeg', 'gif', 'svg'].includes(t)) return <Image className="w-6 h-6 text-emerald-500" />;
        if (['mp4', 'mov', 'avi'].includes(t)) return <Film className="w-6 h-6 text-indigo-500" />;
        if (['mp3', 'wav'].includes(t)) return <Music className="w-6 h-6 text-rose-500" />;
        return <File className="w-6 h-6 text-amber-500" />;
    };

    if (loading) return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-10 text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest">Abriendo tu Biblioteca...</div>
        </AppLayout>
    );

    const filtered = medios.filter(m => m.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Biblioteca de Medios" />
            <div className="bg-[#FDFDFF] font-sans pb-20">
                <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-10">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <Folder className="w-8 h-8 text-indigo-600" />
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Mis Medios</h1>
                        </div>
                        <p className="text-gray-500 font-medium italic">Tu espacio personal para materiales educativos y archivos multimedia.</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <label className="cursor-pointer">
                            <input type="file" className="hidden" onChange={handleUpload} />
                            <div className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95">
                                <Upload className="w-4 h-4 mr-3" /> Subir Archivo
                            </div>
                        </label>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar en tus archivos..." 
                            className="pl-11 h-12 rounded-2xl border-gray-100 focus:ring-indigo-100" 
                        />
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" className="rounded-xl h-12 px-6 border-gray-100 font-bold text-gray-500"><Filter className="w-4 h-4 mr-2" /> Todo</Button>
                        <div className="bg-gray-100 p-1 rounded-xl flex">
                            <Button variant="ghost" size="sm" className="bg-white shadow-sm rounded-lg h-10 w-10 p-0"><Grid className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 rounded-lg h-10 w-10 p-0"><ListIcon className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {filtered.length === 0 ? (
                        <div className="col-span-full py-32 text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                                <Plus className="w-10 h-10" />
                            </div>
                            <p className="text-gray-400 font-bold italic">No se encontraron archivos en tu biblioteca.</p>
                        </div>
                    ) : (
                        filtered.map((m: any) => (
                            <div key={m.id_medio} className="group relative bg-white rounded-[2rem] border border-gray-50 shadow-lg shadow-gray-100/50 flex flex-col items-center p-6 hover:-translate-y-2 transition-transform cursor-pointer">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
                                    {getIcon(m.tipo)}
                                </div>
                                <p className="text-[10px] font-black text-gray-800 text-center line-clamp-1 w-full uppercase tracking-tighter">
                                    {m.nombre}
                                </p>
                                <p className="text-[8px] font-black text-gray-400 uppercase mt-1">
                                    {m.tipo.toUpperCase()} • {new Date().toLocaleDateString()}
                                </p>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(m.id_medio); }}
                                    className="absolute top-3 right-3 p-2 bg-rose-50 text-rose-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                                
                                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-300"><MoreVertical className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                </div>
            </div>
        </AppLayout>
    );
}
