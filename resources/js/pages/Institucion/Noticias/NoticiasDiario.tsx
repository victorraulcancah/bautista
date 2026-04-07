import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Newspaper, ArrowLeft, Printer, Share2 } from 'lucide-react';
import { useResource } from '@/hooks/useResource';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import NoticiasPortada from './components/NoticiasPortada';
import type { Noticia } from './hooks/useNoticias';
import type { BreadcrumbItem } from '@/types';

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

            <div className="min-h-screen bg-[#f8f7f2] pb-20">
                {/* Cabecera del Periódico */}
                <header className="bg-white border-b-8 border-[#00a65a] py-12 mb-12 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
                        <div className="w-full flex justify-between items-center mb-8">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                                Vol. XXIV • No. 142 • {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex gap-4">
                                <Button variant="ghost" size="icon" className="rounded-full"><Printer className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-full"><Share2 className="w-4 h-4" /></Button>
                            </div>
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black text-neutral-900 font-serif tracking-tighter mb-4 first-letter:text-[#00a65a]">
                            EL&nbsp;BAUTISTA
                        </h1>

                        <div className="w-full border-y-2 border-neutral-200 py-3 flex justify-center items-center gap-10">
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#00a65a]">Crónicas de Hoy</span>
                            <span className="size-1.5 rounded-full bg-neutral-300" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900 leading-none">Vida Escolar</span>
                            <span className="size-1.5 rounded-full bg-neutral-300" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900 leading-none">Comunidad</span>
                        </div>
                    </div>
                </header>

                {/* Contenido de la Portada */}
                <main className="max-w-7xl mx-auto px-6">
                    <div className="mb-10 flex justify-between items-center bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
                        <Link href="/institucion/noticias">
                            <Button variant="ghost" className="gap-2 text-neutral-500 hover:text-[#00a65a] font-black uppercase tracking-widest text-[10px]">
                                <ArrowLeft className="w-4 h-4" /> Mesa de Redacción
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-tighter text-neutral-300">
                            <span className="text-[#00a65a]">Ejemplar Gratuito</span>
                            <span>|</span>
                            <span>Colegio Bautista</span>
                        </div>
                    </div>

                    <NoticiasPortada noticias={noticias} />
                </main>
            </div>
        </AppLayout>
    );
}
