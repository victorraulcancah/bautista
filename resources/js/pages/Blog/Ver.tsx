import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Calendar, User, Share2, Facebook, Twitter, MessageCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

export default function BlogVer({ postId }: { postId: number }) {
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Comunicados', href: '/comunicados' },
        { title: post?.blo_titulo || 'Artículo', href: '#' },
    ];

    useEffect(() => {
        api.get(`/blog/${postId}`)
            .then(res => setPost(res.data))
            .finally(() => setLoading(false));
    }, [postId]);

    if (loading) {
return (
        <AppLayout breadcrumbs={[{ title: 'Comunicados', href: '/comunicados' }]}>
            <div className="p-10 text-center font-black animate-pulse text-rose-600 uppercase tracking-widest text-lg">Cargando artículo...</div>
        </AppLayout>
    );
}

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={post.blo_titulo} />
            <div className="bg-white font-sans pb-32">

            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-50 px-6 py-4 flex items-center justify-between">
                <Link href="/comunicados">
                    <Button variant="ghost" className="rounded-xl h-10 px-4 font-bold text-gray-500 hover:bg-gray-50">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Volver al Blog
                    </Button>
                </Link>
                <div className="flex space-x-2">
                    <Button variant="ghost" className="rounded-xl h-10 w-10 text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Facebook className="w-4 h-4" /></Button>
                    <Button variant="ghost" className="rounded-xl h-10 w-10 text-gray-400 hover:text-sky-500 hover:bg-sky-50"><Twitter className="w-4 h-4" /></Button>
                    <Button className="rounded-xl h-10 bg-indigo-600 font-bold px-6 shadow-lg shadow-indigo-100">Compartir</Button>
                </div>
            </div>

            {/* Hero Section */}
            <article className="max-w-4xl mx-auto mt-16 px-6">
                <header className="space-y-8 mb-16">
                    <div className="flex items-center space-x-4">
                        <Badge className="bg-rose-600 text-white border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                            Institucional
                        </Badge>
                        <span className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <Clock className="w-3 h-3 mr-2" /> 5 MIN READ
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
                        {post.blo_titulo}
                    </h1>

                    <div className="flex items-center space-x-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gray-100 rounded-[1.2rem] flex items-center justify-center font-black text-gray-400 text-lg border border-gray-200">
                                {post.autor?.perfil?.primer_nombre?.[0]}
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 tracking-tight">{post.autor?.perfil?.primer_nombre} {post.autor?.perfil?.apellido_paterno}</p>
                                <p className="text-xs font-medium text-gray-400">Autor Institucional</p>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-gray-100" />
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Publicado el</p>
                            <p className="text-xs font-black text-gray-900">{post.blo_fecha}</p>
                        </div>
                    </div>
                </header>

                <div className="rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] mb-20 aspect-video group">
                    <img 
                        src={post.blo_imagen || 'https://images.unsplash.com/photo-1546410531-bb4caa1b424d?q=80&w=2071&auto=format&fit=crop'} 
                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                        alt={post.blo_titulo}
                    />
                </div>

                {/* Content */}
                <div 
                    className="prose prose-xl prose-rose max-w-none text-gray-700 leading-relaxed font-serif"
                    dangerouslySetInnerHTML={{ __html: post.blo_contenido }}
                />

                <footer className="mt-20 pt-10 border-t border-gray-100 flex flex-col items-center space-y-8">
                    <div className="flex items-center space-x-2 text-gray-300">
                        <MessageCircle className="w-8 h-8" />
                        <span className="font-black italic">Fin del artículo</span>
                    </div>
                    <div className="flex space-x-4">
                        <Link href="/comunicados">
                            <Button variant="outline" className="rounded-2xl h-14 px-10 border-gray-200 font-black text-xs uppercase tracking-widest hover:bg-gray-50">
                                Volver al Listado
                            </Button>
                        </Link>
                    </div>
                </footer>
            </article>
            </div>
        </AppLayout>
    );
}
