import { router } from '@inertiajs/react';
import { Calendar, User as UserIcon, MessageSquare, ArrowRight, Clock, MapPin, ChevronRight, Newspaper as NewspaperIcon } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import type {Noticia} from '../hooks/useNoticias';

interface Props {
    noticias: Noticia[];
}


export default function NoticiasPortada({ noticias }: Props) {
    if (!noticias || noticias.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 px-6 bg-white border border-neutral-200 text-neutral-400">
                <MessageSquare className="w-10 h-10 mb-4 opacity-10" />
                <p className="text-lg font-medium tracking-tight">No hay noticias publicadas en esta sección.</p>
                <p className="text-[10px] mt-2 uppercase tracking-[0.3em] opacity-40 italic">Archivo El Bautista</p>
            </div>
        );
    }

    const featured = noticias[0];
    const secondary = noticias.slice(1);

    const navigateToDetail = (id: number) => {
        router.visit(`/institucion/noticias/diario/${id}`);
    };

    return (
        <div className="space-y-16 animate-in fade-in duration-700 pb-20">
            {/* Noticia Principal (Cabecera de Portada) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b-2 border-neutral-900 pb-16">
                <div className="lg:col-span-8 group cursor-pointer" onClick={() => navigateToDetail(featured.not_id)}>
                    <div className="relative aspect-[16/9] overflow-hidden border border-neutral-200 shadow-sm transition-all duration-500">
                        {featured.url ? (
                            <img 
                                src={featured.url} 
                                alt={featured.not_titulo}
                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-neutral-50 flex items-center justify-center text-neutral-200">
                                <NewspaperIcon className="w-16 h-16 opacity-10" />
                            </div>
                        )}
                        <div className="absolute top-6 left-6 bg-black text-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] z-10">
                            Nota de Tapa
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col justify-start space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#00a65a]">
                            <span>Editorial</span>
                            <span className="text-neutral-200">|</span>
                            <span className="text-neutral-400 font-medium flex items-center gap-1.5">{featured.not_fecha}</span>
                        </div>
                        <h2 
                            className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] text-neutral-900 tracking-tighter group-hover:text-[#00a65a] transition-colors cursor-pointer"
                            onClick={() => navigateToDetail(featured.not_id)}
                        >
                            {featured.not_titulo}
                        </h2>
                        {featured.not_resumen && (
                            <p className="text-base text-neutral-600 font-medium leading-relaxed line-clamp-4 italic border-l-2 border-[#00a65a] pl-6 pt-1">
                                {featured.not_resumen}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                        <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-900">
                            {featured.autor || 'Redacción Central'}
                        </div>
                    </div>

                    <Button 
                        onClick={() => navigateToDetail(featured.not_id)}
                        variant="link"
                        className="p-0 h-auto text-[#00a65a] font-bold uppercase tracking-[0.2em] text-[10px] group w-fit"
                    >
                        Leer noticia completa
                        <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </section>

            {/* Parrilla de Noticias Secundarias */}
            {secondary.length > 0 && (
                <section>
                    <div className="flex items-center gap-4 mb-10">
                        <h3 className="text-xl font-black text-neutral-900 uppercase tracking-widest">Crónicas Recientes</h3>
                        <div className="h-px flex-1 bg-neutral-200"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                        {secondary.map(n => (
                            <article 
                                key={n.not_id} 
                                className="group cursor-pointer flex flex-col space-y-4" 
                                onClick={() => navigateToDetail(n.not_id)}
                            >
                                <div className="relative aspect-[4/3] overflow-hidden border border-neutral-100 transition-all duration-300">
                                    {n.url ? (
                                        <img 
                                            src={n.url} 
                                            alt={n.not_titulo}
                                            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-50 flex items-center justify-center">
                                            <NewspaperIcon className="w-10 h-10 text-neutral-100" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#00a65a]">
                                        <span>{n.not_fecha}</span>
                                        {n.not_lugar_evento && (
                                            <>
                                                <span className="text-neutral-200">|</span>
                                                <span className="text-neutral-400 truncate">{n.not_lugar_evento}</span>
                                            </>
                                        )}
                                    </div>
                                    <h4 className="text-xl font-bold leading-tight text-neutral-900 group-hover:text-[#00a65a] transition-colors line-clamp-2 tracking-tight">
                                        {n.not_titulo}
                                    </h4>
                                    <p className="text-sm text-neutral-500 line-clamp-3 leading-relaxed">
                                        {n.not_resumen}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}


