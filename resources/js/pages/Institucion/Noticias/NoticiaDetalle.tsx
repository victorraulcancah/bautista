import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock, MapPin, User as UserIcon, Calendar, Share2, Printer, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoticiaComentarios from './components/NoticiaComentarios';
import { type Noticia } from './hooks/useNoticias';

interface Props {
    noticia: Noticia & { comentarios: any[] };
    recientes: Noticia[];
}

export default function NoticiaDetalle({ noticia, recientes }: Props) {
    const { auth } = usePage().props as any;

    return (
        <div className="min-h-screen bg-[#f8f7f2] font-serif text-neutral-900 pb-20">
            <Head title={`${noticia.not_titulo} | Diario El Bautista`} />

            {/* Barra de Navegación Editorial */}
            <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 py-4 shadow-sm font-sans text-xs">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <Link 
                        href="/institucion/noticias/portada"
                        className="flex items-center gap-2 group text-neutral-500 hover:text-[#00a65a] transition-all font-black uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Regresar a Portada
                    </Link>
                    
                    <div className="flex items-center gap-6">
                        <button className="text-neutral-400 hover:text-neutral-900 transition-colors"><Share2 className="w-4 h-4" /></button>
                        <button className="text-neutral-400 hover:text-neutral-900 transition-colors" onClick={() => window.print()}><Printer className="w-4 h-4" /></button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 mt-12">
                <div className={`grid grid-cols-1 ${recientes.length > 0 ? 'lg:grid-cols-12' : ''} gap-12 justify-center`}>
                    
                    {/* Columna Izquierda: Artículo */}
                    <article className={`${recientes.length > 0 ? 'lg:col-span-8' : 'max-w-5xl mx-auto text-center'} bg-white p-10 lg:p-16 rounded-[1.5rem] shadow-sm border border-neutral-100 w-full`}>
                        
                        {/* Metadatos Superiores */}
                        <header className="space-y-8 mb-12">
                            <div className={`flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#00a65a] font-sans ${recientes.length === 0 ? 'justify-center' : ''}`}>
                                <span className="bg-emerald-50 px-3 py-1 rounded-full shrink-0">Crónica Institucional</span>
                                <span className="text-neutral-300">/</span>
                                <span className="flex items-center gap-1 shrink-0"><Clock className="w-4 h-4" /> {noticia.not_fecha}</span>
                                <span className="text-neutral-200 hidden sm:block">|</span>
                                <Button variant="ghost" size="sm" className="h-7 px-3 bg-white border border-emerald-100 text-emerald-700 hover:bg-emerald-50 rounded-full text-[9px] font-black gap-2 transition-all">
                                     <Download className="w-3 h-3" /> Digital Mural (PDF)
                                </Button>
                            </div>

                            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-neutral-900 tracking-tight ${recientes.length === 0 ? 'text-center' : ''}`}>
                                {noticia.not_titulo}
                            </h1>

                            {noticia.not_resumen && (
                                <p className={`text-xl lg:text-2xl text-neutral-500 font-medium leading-relaxed italic border-emerald-100 pl-8 py-2 ${recientes.length === 0 ? 'border-l-0 border-y py-6 text-center pl-0' : 'border-l-4'}`}>
                                    {noticia.not_resumen}
                                </p>
                            )}

                            <div className={`flex items-center justify-between py-6 border-y border-neutral-100 mt-10 ${recientes.length === 0 ? 'flex-col sm:flex-row gap-6' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-neutral-900 text-white rounded-full lg:rounded-[1.5rem]">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div className={recientes.length === 0 ? 'text-left' : ''}>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#00a65a] font-sans">Redactado por</p>
                                        <p className="text-sm font-bold text-neutral-900 font-sans">{noticia.autor || 'Redacción El Bautista'}</p>
                                    </div>
                                </div>
                                {(noticia.not_lugar_evento || noticia.not_fecha_evento) && (
                                    <div className={`${recientes.length === 0 ? 'text-center' : 'text-right'} hidden sm:block`}>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 font-sans">Datos del Evento</p>
                                        <p className="text-sm font-bold text-neutral-700 font-sans flex items-center justify-end gap-2">
                                            <MapPin className="w-3 h-3 text-[#00a65a]" /> {noticia.not_lugar_evento}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </header>

                        {/* Imagen de Portada */}
                        {noticia.url && (
                            <figure className="mb-12">
                                <div className="relative aspect-video overflow-hidden rounded-[2.5rem] shadow-2xl border-2 border-white">
                                    <img 
                                        src={noticia.url} 
                                        alt={noticia.not_titulo}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </figure>
                        )}

                        {/* Cuerpo del Artículo en Columnas */}
                        <div className={`prose prose-neutral max-w-none ${recientes.length === 0 ? 'text-left' : ''}`}>
                            <div className={`sm:columns-2 gap-10 text-neutral-700 leading-relaxed text-lg lg:text-xl text-justify font-normal first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-[#00a65a] first-letter:font-sans`}>
                               <div dangerouslySetInnerHTML={{ __html: noticia.not_contenido_html || '' }} />
                            </div>
                        </div>

                        {/* Citas Destacadas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 py-12 border-t border-neutral-100">
                            {noticia.not_cita_autoridad && (
                                <blockquote className="bg-emerald-900 text-white p-10 rounded-[3rem] relative overflow-hidden group shadow-xl text-left">
                                    <p className="text-xl font-medium italic relative z-10 mb-6 leading-relaxed">
                                        "{noticia.not_cita_autoridad}"
                                    </p>
                                    <cite className="block not-italic text-sm font-black uppercase tracking-[0.2em] text-emerald-300 font-sans">
                                        — Directivo Institucional
                                    </cite>
                                </blockquote>
                            )}
                            {noticia.not_cita_estudiante && (
                                <blockquote className="bg-white border-4 border-neutral-900 p-10 rounded-[3rem] relative group shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] text-left">
                                    <p className="text-xl font-medium text-neutral-900 relative z-10 mb-6 leading-relaxed">
                                        "{noticia.not_cita_estudiante}"
                                    </p>
                                    <cite className="block not-italic text-sm font-black uppercase tracking-[0.2em] text-neutral-400 font-sans">
                                        — Testimonio Estudiantil
                                    </cite>
                                </blockquote>
                            )}
                        </div>

                        {/* Comentarios */}
                        <div className="text-left mt-12">
                            <NoticiaComentarios 
                                noticiaId={noticia.not_id} 
                                comentarios={noticia.comentarios || []} 
                            />
                        </div>
                    </article>

                    {/* Columna Derecha: Sidebar */}
                    {recientes.length > 0 && (
                        <aside className="lg:col-span-4 space-y-12 font-sans">
                            {/* Crónicas Recientes */}
                            <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm sticky top-28">
                                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-8 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#00a65a] rounded-full"></span>
                                    Crónicas Recientes
                                </h3>
                                
                                <div className="space-y-8">
                                    {recientes.map(rec => (
                                        <Link 
                                            key={rec.not_id} 
                                            href={`/institucion/noticias/diario/${rec.not_id}`}
                                            className="group block space-y-3 text-left"
                                        >
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#00a65a] opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="w-3 h-3" /> Diario El Bautista
                                            </div>
                                            <h4 className="text-lg font-black leading-tight group-hover:text-[#00a65a] transition-colors">{rec.not_titulo}</h4>
                                            <div className="flex items-center gap-4 text-[10px] font-sans font-bold text-neutral-400">
                                                <span className="flex items-center gap-1 uppercase tracking-widest"><Calendar className="w-3 h-3" /> {rec.not_fecha}</span>
                                            </div>
                                            <div className="w-full h-px bg-neutral-50 mt-4"></div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </main>
        </div>
    );
}
