import { Calendar, User, MapPin, X, Quote, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Noticia } from '../hooks/useNoticias';

type Props = {
    noticia: Noticia | null;
    onClose: () => void;
};

export default function NoticiaDetalleModal({ noticia, onClose }: Props) {
    if (!noticia) return null;

    return (
        <Dialog open={!!noticia} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-5xl max-h-[96vh] p-0 overflow-hidden bg-[#fdfcf8] border-none shadow-[24px_24px_0px_0px_rgba(0,0,0,0.1)]">
                
                {/* Header Accionado */}
                <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
                    <button 
                        onClick={onClose}
                        className="bg-black/5 hover:bg-black/10 backdrop-blur-md p-3 rounded-full transition-all group"
                    >
                        <X className="w-5 h-5 text-black/40 group-hover:text-black" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-16 sm:px-20 md:py-24">
                    
                    {/* Header: Editorial Style */}
                    <div className="max-w-3xl mx-auto space-y-10 mb-16">
                        <div className="space-y-4">
                            <span className="text-emerald-700 font-black text-[12px] uppercase tracking-[0.4em] border-b-2 border-emerald-700/20 pb-1">
                                Crónica Institucional
                            </span>
                            <h1 className="text-5xl md:text-6xl font-black text-neutral-900 leading-[1.05] font-serif tracking-tight">
                                {noticia.not_titulo}
                            </h1>
                        </div>

                        {noticia.not_resumen && (
                            <p className="text-2xl text-neutral-600 font-serif italic leading-relaxed border-l-4 border-neutral-200 pl-8">
                                {noticia.not_resumen}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-6 border-t border-neutral-200 text-sm font-bold text-neutral-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2 text-neutral-900">
                                <User className="w-4 h-4 text-emerald-600" />
                                <span>Por: <span className="font-black text-emerald-900 underline decoration-emerald-200 decoration-4 underline-offset-4">{noticia.autor || 'Redacción Web'}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{noticia.not_fecha}</span>
                            </div>
                            {noticia.not_lugar_evento && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-rose-500" />
                                    <span>{noticia.not_lugar_evento}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Featured Image */}
                    {noticia.url && (
                        <div className="w-full mb-20">
                            <figure className="relative rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl skew-y-[-1deg]">
                                <img 
                                    src={noticia.url} 
                                    alt={noticia.not_titulo} 
                                    className="w-full object-cover max-h-[500px]"
                                />
                                <figcaption className="absolute bottom-6 right-6 bg-white/95 backdrop-blur px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-500 shadow-xl">
                                    Fotografía de Archivo Institucional
                                </figcaption>
                            </figure>
                        </div>
                    )}

                    {/* Body Content in 2 Columns for Large Screens */}
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            
                            {/* Columna de Texto */}
                            <div className="space-y-8">
                                <div 
                                    className="prose prose-neutral max-w-none prose-p:text-lg prose-p:leading-[1.8] prose-p:text-neutral-700 prose-p:font-serif first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-emerald-700"
                                    dangerouslySetInnerHTML={{ __html: noticia.not_contenido_html || noticia.not_mensaje || '' }}
                                />
                            </div>

                            {/* Columna de Citas y Detalles */}
                            <div className="space-y-12">
                                
                                {noticia.not_cita_autoridad && (
                                    <div className="relative p-10 bg-emerald-900 text-emerald-50 rounded-[3rem] overflow-hidden shadow-2xl">
                                        <Quote className="absolute -top-4 -left-4 w-24 h-24 text-white opacity-10" />
                                        <p className="relative text-xl font-serif italic font-medium leading-relaxed mb-6">
                                            "{noticia.not_cita_autoridad}"
                                        </p>
                                        <div className="flex items-center gap-4 border-t border-emerald-700 pt-6">
                                            <div className="size-10 rounded-full bg-emerald-700 flex items-center justify-center font-black">DIR</div>
                                            <div className="text-xs font-black uppercase tracking-widest text-emerald-300">Mensaje de la Dirección</div>
                                        </div>
                                    </div>
                                )}

                                {noticia.not_cita_estudiante && (
                                    <div className="p-10 bg-amber-50 text-amber-900 rounded-[3rem] border-2 border-amber-200">
                                        <p className="text-xl font-serif italic mb-6">
                                            "{noticia.not_cita_estudiante}"
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-amber-500" /> Testimonio Estudiantil
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-4 pt-10 border-t-2 border-dashed border-neutral-200 italic text-neutral-400 text-sm">
                                    <p>Esta noticia forma parte de la edición digital de crónicas institucionales.</p>
                                    <p>© 2024 Mesa de Redacción - Todos los derechos reservados.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="max-w-4xl mx-auto pt-20 flex justify-center">
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            className="rounded-full px-10 h-14 font-black border-2 border-[#00a65a] text-[#00a65a] hover:bg-[#00a65a] hover:text-white transition-all flex items-center gap-3"
                        >
                            <ArrowLeft className="w-5 h-5" /> VOLVER AL LISTADO
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
