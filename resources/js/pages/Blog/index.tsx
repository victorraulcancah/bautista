import { Head, Link } from '@inertiajs/react';
import { Newspaper, Calendar, User, ChevronRight, Bookmark, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Comunicados', href: '/comunicados' },
];

export default function BlogIndex() {
    const [noticias, setNoticias] = useState<any[]>([]);
    const [posts, setPosts]       = useState<any[]>([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    useEffect(() => {
        api.get('/blog')
            .then(res => {
                setNoticias(res.data.noticias ?? []);
                setPosts(res.data.posts ?? []);
            })
            .catch(() => {
                setError('No se pudieron cargar los comunicados. Intenta más tarde.');
            })
            .finally(() => setLoading(false));
    }, []);


    if (loading) {
return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-10 text-center font-black animate-pulse text-rose-600 uppercase tracking-widest">Cargando noticias y blog...</div>
        </AppLayout>
    );
}

    if (error) {
return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-10 text-center text-sm text-neutral-500">{error}</div>
        </AppLayout>
    );
}

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comunicados e Institución" />
            <div className="bg-[#FDFDFF] font-sans pb-20">
                <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-16">
                
                {/* Header */}
                <div className="space-y-4 text-center max-w-3xl mx-auto">
                    <Badge className="bg-rose-50 text-rose-600 border-rose-100 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">
                        Centro de Noticias
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
                        Mantente Informado de la <span className="text-rose-600">Vida Escolar</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg italic">Noticias diarias, artículos de interés y comunicados oficiales en un solo lugar.</p>
                </div>

                {/* Noticias Destacadas (Quick Alerts) */}
                <div className="space-y-8">
                    <div className="flex items-center space-x-4">
                        <div className="h-px flex-1 bg-gray-100" />
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Últimas Noticias</h2>
                        <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {noticias.map((n: any) => (
                            <div key={n.not_id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col hover:-translate-y-2 transition-transform duration-300">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-gray-100 text-gray-500 border-none font-bold text-[8px] uppercase tracking-widest">{n.not_fecha}</Badge>
                                        <Bookmark className="w-4 h-4 text-gray-200" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-800 leading-tight line-clamp-2">{n.not_titulo}</h3>
                                    <p className="text-xs text-gray-500 font-medium line-clamp-3">{n.not_mensaje}</p>
                                </div>
                                <Button variant="ghost" className="mt-6 w-full rounded-2xl h-12 bg-gray-50 text-gray-400 font-black text-xs uppercase hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                    Leer Más
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Blog Posts (Long Form) */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Artículos del Blog</h2>
                        <Button variant="link" className="text-rose-600 font-black uppercase text-xs tracking-widest">Ver Todos</Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {posts.map((p: any) => (
                            <Link key={p.blo_id} href={`/comunicados/${p.blo_id}`} className="group">
                                <div className="bg-white rounded-[4rem] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/30 flex flex-col md:flex-row h-full">
                                    <div className="w-full md:w-2/5 relative h-64 md:h-auto overflow-hidden">
                                        <img 
                                            src={p.blo_imagen || 'https://images.unsplash.com/photo-1546410531-bb4caa1b424d?q=80&w=2071&auto=format&fit=crop'} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt={p.blo_titulo}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
                                    </div>
                                    <div className="flex-1 p-10 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                                <Calendar className="w-3 h-3" />
                                                <span>{p.blo_fecha}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-800 tracking-tighter leading-tight group-hover:text-rose-600 transition-colors">
                                                {p.blo_titulo}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium line-clamp-3 leading-relaxed">
                                                {p.blo_contenido.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-50">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-[10px] text-gray-400">
                                                    {p.autor?.perfil?.primer_nombre?.[0]}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{p.autor?.perfil?.primer_nombre} {p.autor?.perfil?.apellido_paterno}</span>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg text-gray-300 hover:text-rose-500"><Share2 className="w-4 h-4" /></Button>
                                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-rose-600 group-hover:text-white transition-all">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                </div>
            </div>
        </AppLayout>
    );
}
