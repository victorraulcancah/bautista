import { Head, Link } from '@inertiajs/react';
import { Newspaper, ArrowLeft, Printer, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useResource } from '@/hooks/useResource';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import NoticiasPortada from './components/NoticiasPortada';
import type { Noticia } from './hooks/useNoticias';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Noticias', href: '/institucion/noticias' },
    { title: 'Edición Digital', href: '#' },
];

interface Props {
    noticias: Noticia[];
}


export default function NoticiasDiario({ noticias }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Diario Escolar - Edición Digital" />

            <div className="min-h-screen bg-[#fafafa] pb-20">
                {/* Cabecera Editorial Premium */}
                <header className="bg-white border-b border-neutral-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] mb-12">
                    <div className="max-w-7xl mx-auto px-6 pt-10 pb-8 flex flex-col items-center">
                        {/* Masthead */}
                        <div className="w-full flex justify-between items-center border-b border-neutral-100 pb-6 mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                            <div className="flex items-center gap-4">
                                <span>Volumen XXIV</span>
                                <span className="text-neutral-200">|</span>
                                <span>{new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[#00a65a] font-extrabold animate-pulse">En vivo</span>
                                <span className="text-neutral-200">|</span>
                                <span>Colegio Bautista</span>
                            </div>
                        </div>

                        <Link href="/institucion/noticias/portada" className="group">
                            <h1 className="text-6xl md:text-8xl font-black text-neutral-900 tracking-tighter mb-4 text-center group-hover:text-[#00a65a] transition-colors duration-500">
                                EL BAUTISTA
                            </h1>
                        </Link>
                        
                        <p className="text-neutral-500 font-medium tracking-[0.1em] uppercase text-[10px] mb-8">
                            Cronista de la Excelencia y la Fe
                        </p>

                        {/* Navigation Section bar */}
                        <div className="w-full border-y border-neutral-900/10 py-3 flex justify-center items-center gap-12">
                            {['Vida Escolar', 'Académico', 'Deportes', 'Cultura', 'Comunidad'].map((cat) => (
                                <span key={cat} className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-[#00a65a] cursor-pointer transition-colors">
                                    {cat}
                                </span>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Contenido de la Portada */}
                <main className="max-w-7xl mx-auto px-6">
                    <div className="mb-12 flex justify-between items-center bg-white border border-neutral-200 px-6 py-4 shadow-sm">
                        <Link href="/institucion/noticias">
                            <Button variant="ghost" className="gap-2 text-neutral-500 hover:text-black font-bold uppercase tracking-widest text-[9px] h-auto p-0 transition-colors">
                                <ArrowLeft className="w-3.5 h-3.5" /> Mesa de Redacción
                            </Button>
                        </Link>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                            Digital Edition • <span className="text-[#00a65a]">Premium Content</span>
                        </div>
                    </div>

                    <NoticiasPortada noticias={noticias} />
                </main>
            </div>
        </AppLayout>
    );
}
