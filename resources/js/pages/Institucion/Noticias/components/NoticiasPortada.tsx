import React from 'react';
import { router } from '@inertiajs/react';
import { Calendar, User as UserIcon, MessageSquare, ArrowRight, Clock, MapPin, ChevronRight, Newspaper as NewspaperIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Noticia } from '../hooks/useNoticias';

interface Props {
    noticias: Noticia[];
}


export default function NoticiasPortada({ noticias }: Props) {
    if (!noticias || noticias.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 px-6 bg-white rounded-[3rem] border-2 border-dashed border-neutral-100 italic text-neutral-400 font-serif">
                <MessageSquare className="w-16 h-16 mb-6 opacity-5" />
                <p className="text-xl">No hay crónicas redactadas en esta edición.</p>
                <p className="text-sm mt-2 font-sans font-black uppercase tracking-widest opacity-30">Diario El Bautista</p>
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
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b-4 border-black pb-12">
                <div className="lg:col-span-8 group cursor-pointer" onClick={() => navigateToDetail(featured.not_id)}>
                    <div className="relative aspect-video overflow-hidden rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] transition-all group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                        {featured.url ? (
                            <img 
                                src={featured.url} 
                                alt={featured.not_titulo}
                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300">
                                Sin Imagen de Portada
                            </div>
                        )}
                        <div className="absolute top-8 left-8 bg-black text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl z-10">
                            <Clock className="w-3.5 h-3.5 text-[#00a65a]" /> Edición de Hoy
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col justify-center space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#00a65a]">
                            <span className="bg-emerald-50 px-4 py-1.5 rounded-full">Crónica Principal</span>
                            <span className="text-neutral-200">/</span>
                            <span className="text-neutral-400">{featured.not_fecha}</span>
                        </div>
                        <h2 
                            className="text-4xl md:text-5xl font-black leading-[1.1] text-neutral-900 tracking-tight group-hover:text-[#00a65a] transition-colors font-serif cursor-pointer"
                            onClick={() => navigateToDetail(featured.not_id)}
                        >
                            {featured.not_titulo}
                        </h2>
                        {featured.not_resumen && (
                            <p className="text-xl text-neutral-500 font-medium leading-relaxed italic border-l-4 border-emerald-100 pl-8 py-2">
                                {featured.not_resumen}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4 py-8 border-y border-neutral-100">
                        <div className="p-4 bg-neutral-900 text-white rounded-full shadow-lg">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#00a65a]">Corresponsal</p>
                            <p className="text-base font-black text-neutral-900 tracking-tight">{featured.autor || 'Redacción El Bautista'}</p>
                        </div>
                    </div>

                    <Button 
                        onClick={() => navigateToDetail(featured.not_id)}
                        className="w-full bg-black hover:bg-neutral-800 text-white rounded-[1.5rem] h-16 font-black shadow-2xl flex items-center justify-center gap-3 group transition-all uppercase tracking-widest text-xs"
                    >
                        LEER CRÓNICA COMPLETA
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform text-[#00a65a]" />
                    </Button>
                </div>
            </section>

            {/* Parrilla de Crónicas Secundarias */}
            {secondary.length > 0 && (
                <section>
                    <div className="flex items-center gap-4 mb-16 px-2">
                        <div className="p-3 bg-neutral-900 rounded-2xl">
                             <NewspaperIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-3xl font-black text-neutral-900 tracking-tighter">Otras Crónicas</h3>
                        <div className="h-0.5 flex-1 bg-neutral-100 rounded-full mt-2"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                        {secondary.map(n => (
                            <article 
                                key={n.not_id} 
                                className="group cursor-pointer space-y-6" 
                                onClick={() => navigateToDetail(n.not_id)}
                            >
                                <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] border-2 border-neutral-100 group-hover:border-black transition-all duration-500 shadow-sm group-hover:shadow-2xl">
                                    {n.url ? (
                                        <img 
                                            src={n.url} 
                                            alt={n.not_titulo}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-50 flex items-center justify-center">
                                            <ArrowRight className="w-12 h-12 text-neutral-100" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                                         <p className="text-white text-[10px] font-black uppercase tracking-widest mb-1">El Bautista</p>
                                         <p className="text-emerald-400 text-xs font-bold">Ver Crónica <ChevronRight className="inline-block w-4 h-4 ml-1" /></p>
                                    </div>
                                </div>
                                <div className="space-y-4 px-4">
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-[#00a65a]">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{n.not_fecha}</span>
                                        {n.not_lugar_evento && (
                                            <>
                                                <span className="text-neutral-200">•</span>
                                                <span className="text-neutral-400 flex items-center gap-1.5 shrink-0">
                                                    <MapPin className="w-3.5 h-3.5" /> {n.not_lugar_evento}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <h4 className="text-2xl font-black leading-[1.2] text-neutral-900 group-hover:text-[#00a65a] transition-colors line-clamp-3 font-serif tracking-tight">
                                        {n.not_titulo}
                                    </h4>
                                    <div className="w-12 h-1 bg-neutral-100 group-hover:w-24 group-hover:bg-[#00a65a] transition-all duration-500"></div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
