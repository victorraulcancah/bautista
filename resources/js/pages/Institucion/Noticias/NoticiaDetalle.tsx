import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock, MapPin, User as UserIcon, Calendar, Share2, Printer, ChevronRight, Download, MessageCircle, FileText } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import NoticiaComentarios from './components/NoticiaComentarios';
import type {Noticia} from './hooks/useNoticias';

interface Props {
    noticia: Noticia & { comentarios: any[] };
    recientes: Noticia[];
}

export default function NoticiaDetalle({ noticia, recientes }: Props) {
    const { auth } = usePage().props as any;

    return (
        <div className="min-h-screen bg-[#fafafa] pb-20">
            <Head title={`${noticia.not_titulo} | El Bautista Editorial`} />

            {/* Barra de Navegación Refinada */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50 py-4">
                <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
                    <Link 
                        href="/institucion/noticias/portada"
                        className="flex items-center gap-2 text-neutral-400 hover:text-black transition-all font-bold uppercase tracking-[0.2em] text-[10px]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Edición Digital
                    </Link>
                    
                    <div className="flex items-center gap-6">
                        <button className="text-neutral-400 hover:text-black transition-colors" title="Compartir"><Share2 className="w-4 h-4" /></button>
                        <button className="text-neutral-400 hover:text-black transition-colors" onClick={() => window.print()} title="Imprimir"><Printer className="w-4 h-4" /></button>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 mt-16">
                <div className="flex flex-col items-center">
                    
                    {/* Encabezado del Artículo - Estilo New York Times */}
                    <header className="w-full mb-16 text-center space-y-8">
                        <div className="flex flex-wrap items-center justify-center gap-4 w-full text-[10px] font-bold uppercase tracking-[0.3em] text-[#00a65a]">
                            <span>Crónica Oficial</span>
                            <span className="text-neutral-200">|</span>
                            <span>{noticia.not_fecha}</span>
                            <span className="text-neutral-200">|</span>
                            <Button variant="link" size="sm" className="h-auto p-0 gap-2 text-[10px] font-bold text-neutral-400 hover:text-black transition-all uppercase tracking-[0.3em]">
                                <FileText className="w-3.5 h-3.5" /> PDF
                            </Button>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black leading-[1.05] text-neutral-900 tracking-tighter max-w-4xl mx-auto">
                            {noticia.not_titulo}
                        </h1>

                        {noticia.not_resumen && (
                            <p className="text-xl md:text-2xl text-neutral-500 font-medium leading-relaxed max-w-3xl mx-auto italic">
                                {noticia.not_resumen}
                            </p>
                        )}

                        <div className="flex items-center justify-center gap-6 pt-8 border-t border-neutral-100 max-w-xs mx-auto">
                            <div className="text-center">
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">Corresponsal</p>
                                <p className="text-sm font-bold text-neutral-900">{noticia.autor || 'Redacción Central'}</p>
                            </div>
                            {noticia.not_lugar_evento && (
                                <>
                                    <div className="w-px h-8 bg-neutral-100"></div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">Ubicación</p>
                                        <p className="text-sm font-bold text-neutral-700">{noticia.not_lugar_evento}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </header>

                    {/* Imagen Principal */}
                    {noticia.url && (
                        <figure className="w-full mb-16">
                            <div className="relative aspect-video overflow-hidden border border-neutral-200">
                                <img 
                                    src={noticia.url} 
                                    alt={noticia.not_titulo}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </figure>
                    )}

                    {/* Cuerpo del Artículo - Columnas Estilo Periódico */}
                    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-neutral-900 pt-12">
                        <div className="lg:col-span-12">
                            <div className="prose prose-neutral max-w-none">
                                <div 
                                    className="text-neutral-800 leading-[1.8] text-lg lg:text-xl text-justify font-serif md:columns-2 gap-16 first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-neutral-900"
                                    dangerouslySetInnerHTML={{ __html: noticia.not_contenido_html || '' }} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Citas y Testimonios - Elegante */}
                    {(noticia.not_cita_autoridad || noticia.not_cita_estudiante) && (
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 mt-20 py-16 border-y border-neutral-100">
                            {noticia.not_cita_autoridad && (
                                <div className="space-y-4">
                                    <p className="text-2xl font-serif italic text-neutral-900 leading-relaxed">
                                        "{noticia.not_cita_autoridad}"
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00a65a]">
                                        — Dirección Institucional
                                    </p>
                                </div>
                            )}
                            {noticia.not_cita_estudiante && (
                                <div className="space-y-4">
                                    <p className="text-2xl font-serif italic text-neutral-500 leading-relaxed">
                                        "{noticia.not_cita_estudiante}"
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                                        — Voz de la Comunidad
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer del Artículo: Noticias Relacionadas */}
                    {recientes.length > 0 && (
                        <section className="w-full mt-24">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-10 text-center">Más Crónicas de Hoy</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {recientes.map(rec => (
                                    <Link 
                                        key={rec.not_id} 
                                        href={`/institucion/noticias/diario/${rec.not_id}`}
                                        className="group space-y-3"
                                    >
                                        <div className="h-px w-full bg-neutral-200 group-hover:bg-black transition-colors mb-4"></div>
                                        <h4 className="text-base font-bold leading-tight group-hover:text-[#00a65a] transition-colors line-clamp-2">
                                            {rec.not_titulo}
                                        </h4>
                                        <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                                            {rec.not_fecha}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Comentarios Section - Minimalista */}
                    <div className="w-full mt-24 pt-16 border-t border-neutral-900/5 max-w-3xl mx-auto">
                        <div className="flex items-center justify-center gap-3 mb-12">
                            <div className="h-px w-12 bg-neutral-200"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900">Conversación</h3>
                            <div className="h-px w-12 bg-neutral-200"></div>
                        </div>
                        <NoticiaComentarios 
                            noticiaId={noticia.not_id} 
                            comentarios={noticia.comentarios || []} 
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
