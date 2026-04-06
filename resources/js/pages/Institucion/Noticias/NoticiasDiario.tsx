import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Newspaper, ArrowLeft, Printer, Share2 } from 'lucide-react';
import { useResource } from '@/hooks/useResource';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import NoticiasPortada from './components/NoticiasPortada';
import NoticiaDetalleModal from './components/NoticiaDetalleModal';
import type { Noticia } from './hooks/useNoticias';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard',   href: '/dashboard' },
    { title: 'Noticias',    href: '/institucion/noticias' },
    { title: 'Edición Digital', href: '#' },
];

export default function NoticiasDiario() {
    const res = useResource<Noticia>('/noticias');
    const [noticiaView, setNoticiaView] = useState<Noticia | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Diario Escolar - Edición Digital" />

            <div className="min-h-screen bg-[#f8f7f2] pb-20">
                {/* Cabecera del Periódico */}
                <header className="bg-white border-b-8 border-[#00a65a] py-12 mb-12 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-8">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                                Vol. XXIV • No. 142 • {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex gap-4">
                                <Button variant="ghost" size="icon" className="rounded-full"><Printer className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-full"><Share2 className="w-4 h-4" /></Button>
                            </div>
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black text-neutral-900 font-serif tracking-tighter mb-4">
                            EL BAUTISTA
                        </h1>
                        
                        <div className="w-full border-y-2 border-neutral-200 py-3 flex justify-center items-center gap-10">
                            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700">Crónicas</span>
                            <span className="size-1.5 rounded-full bg-neutral-300" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900">Vida Escolar</span>
                            <span className="size-1.5 rounded-full bg-neutral-300" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900">Comunidad</span>
                        </div>
                    </div>
                </header>

                {/* Contenido de la Portada */}
                <main className="max-w-7xl mx-auto px-6">
                    <div className="mb-10">
                        <Link href="/institucion/noticias">
                            <Button variant="ghost" className="gap-2 text-neutral-500 hover:text-black font-black uppercase tracking-widest text-[10px]">
                                <ArrowLeft className="w-4 h-4" /> Volver a Redacción
                            </Button>
                        </Link>
                    </div>

                    {res.rows && (
                        <NoticiasPortada 
                            noticias={res.rows.data} 
                            onView={setNoticiaView} 
                        />
                    )}

                    {res.loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-neutral-400 italic">
                            <div className="animate-spin size-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
                            <p>Imprimiendo edición digital...</p>
                        </div>
                    )}
                </main>

                <NoticiaDetalleModal
                    noticia={noticiaView}
                    onClose={() => setNoticiaView(null)}
                />
            </div>
        </AppLayout>
    );
}
