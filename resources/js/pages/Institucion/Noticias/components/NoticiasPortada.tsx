import { Calendar, User, MapPin, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Noticia } from '../hooks/useNoticias';

type Props = {
    noticias: Noticia[];
    onView: (n: Noticia) => void;
};

export default function NoticiasPortada({ noticias, onView }: Props) {
    if (noticias.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-3xl border-2 border-dashed border-neutral-100 italic text-neutral-400">
                <p>No hay crónicas disponibles para esta edición.</p>
            </div>
        );
    }

    const featured = noticias[0];
    const others   = noticias.slice(1);

    return (
        <div className="space-y-12 pb-20">
            {/* Titular Principal (Headline) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b-4 border-black pb-12">
                <div className="lg:col-span-8 space-y-6">
                    <div className="relative aspect-video overflow-hidden rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
                        {featured.url ? (
                            <img 
                                src={featured.url} 
                                alt={featured.not_titulo} 
                                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700 cursor-pointer"
                                onClick={() => onView(featured)}
                            />
                        ) : (
                            <div className="w-full h-full bg-neutral-100 flex items-center justify-center font-black text-neutral-200 text-4xl">NO PHOTO</div>
                        )}
                        <div className="absolute top-6 left-6 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                            Principal
                        </div>
                    </div>
                </div>
                
                <div className="lg:col-span-4 flex flex-col justify-center space-y-6">
                    <h2 
                        className="text-4xl md:text-5xl font-black text-neutral-900 leading-[1.1] hover:text-emerald-700 cursor-pointer transition-colors font-serif"
                        onClick={() => onView(featured)}
                    >
                        {featured.not_titulo}
                    </h2>
                    
                    {featured.not_resumen && (
                        <p className="text-lg text-neutral-600 leading-relaxed italic border-l-4 border-emerald-500 pl-4">
                            "{featured.not_resumen}"
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg">
                            <User className="w-3 h-3" /> {featured.autor || 'Redacción'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> {featured.not_fecha}
                        </span>
                    </div>

                    <Button 
                        onClick={() => onView(featured)}
                        className="w-full bg-[#00a65a] hover:bg-[#008d4c] text-white rounded-2xl h-14 font-black shadow-2xl flex items-center gap-2 group transition-all shadow-[#00a65a]/20"
                    >
                        LEER CRÓNICA COMPLETA
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </section>

            {/* Secundarias (Columnas) */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {others.map((n) => (
                    <article key={n.not_id} className="group cursor-pointer space-y-4" onClick={() => onView(n)}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            {n.url ? (
                                <img 
                                    src={n.url} 
                                    alt={n.not_titulo} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-50 flex items-center justify-center font-black text-neutral-200">SIN IMAGEN</div>
                            )}
                        </div>
                        
                        <div className="space-y-3">
                            <h3 className="text-xl font-black text-neutral-900 leading-tight group-hover:text-emerald-700 transition-colors uppercase tracking-tight">
                                {n.not_titulo}
                            </h3>
                            
                            <p className="text-sm text-neutral-500 line-clamp-3 leading-relaxed">
                                {n.not_resumen || (n.not_mensaje ? n.not_mensaje.substring(0, 100) + '...' : 'Sin descripción.')}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" /> {n.not_fecha}
                                </span>
                                <span className="text-xs font-black text-emerald-600 flex items-center gap-1 hover:underline">
                                    LEER <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                        </div>
                    </article>
                ))}
            </section>
        </div>
    );
}
