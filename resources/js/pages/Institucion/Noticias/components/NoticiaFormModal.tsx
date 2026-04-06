import { useEffect, useRef, useState } from 'react';
import { Newspaper, Calendar, Type, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormField from '@/components/shared/FormField';
import TitleForm from '@/components/TitleForm';
import type { Noticia, NoticiaFormData } from '../hooks/useNoticias';
import { defaultForm } from '../hooks/useNoticias';


type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     Noticia | null;
    onSave:      (data: FormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function NoticiaFormModal({ open, onClose, editing, onSave, apiErrors, clearErrors }: Props) {
    const [form, setForm]               = useState<NoticiaFormData>(defaultForm);
    const [imagenFile, setImagenFile]   = useState<File | null>(null);
    const [processing, setProcessing]   = useState(false);
    const fileInputRef                  = useRef<HTMLInputElement>(null);

    useEffect(() => {
        clearErrors();
        setImagenFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setForm(editing
            ? {
                not_titulo:            editing.not_titulo            ?? '',
                not_resumen:           editing.not_resumen           ?? '',
                not_mensaje:           editing.not_mensaje           ?? '',
                not_contenido_html:    editing.not_contenido_html    ?? '',
                not_cita_autoridad:    editing.not_cita_autoridad    ?? '',
                not_cita_estudiante:   editing.not_cita_estudiante   ?? '',
                not_lugar_evento:      editing.not_lugar_evento      ?? '',
                not_fecha_evento:      editing.not_fecha_evento      ?? '',
                not_fecha_publicacion: editing.not_fecha_publicacion ?? '',
                not_fecha_expiracion:  editing.not_fecha_expiracion  ?? '',
                autor:                 editing.autor                 ?? '',
            }
            : defaultForm,
        );
    }, [editing, open]);

    const set = (key: keyof NoticiaFormData, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const err = (key: string) => apiErrors[key]?.[0];

    const imgPreview = imagenFile
        ? URL.createObjectURL(imagenFile)
        : editing?.url ?? null;

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const fd = new FormData();
            fd.append('not_titulo',            form.not_titulo);
            fd.append('not_resumen',           form.not_resumen);
            fd.append('not_mensaje',           form.not_mensaje);
            fd.append('not_contenido_html',    form.not_contenido_html);
            fd.append('not_cita_autoridad',    form.not_cita_autoridad);
            fd.append('not_cita_estudiante',   form.not_cita_estudiante);
            fd.append('not_lugar_evento',      form.not_lugar_evento);
            fd.append('not_fecha_evento',      form.not_fecha_evento);
            fd.append('not_fecha_publicacion', form.not_fecha_publicacion);
            fd.append('not_fecha_expiracion',  form.not_fecha_expiracion);
            fd.append('autor',                 form.autor);
            
            if (imagenFile) fd.append('imagen', imagenFile);
            
            await onSave(fd);
            onClose();
        } catch {
            // apiErrors manejados por useResource
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                <DialogHeader className="px-8 py-6 border-b bg-white">
                    <DialogTitle className="text-2xl font-black text-neutral-900 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <Newspaper className="w-6 h-6 text-[#00a65a]" />
                        </div>
                        {editing ? 'Edición Editorial' : 'Mesa de Redacción'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-white">
                    <div className="p-8 space-y-8">
                        {/* Cabecera Editorial: Título y Resumen */}
                        <div className="space-y-6 bg-neutral-50/50 p-6 rounded-[2rem] border border-neutral-100">
                            <FormField
                                label="Titular de la Crónica *"
                                value={form.not_titulo}
                                onChange={(v) => set('not_titulo', v)}
                                error={err('not_titulo')}
                                placeholder="Escriba un titular impactante..."
                            />

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                    <Type className="w-3 h-3" />
                                    Bajada o Resumen (Estilo Periodístico)
                                </label>
                                <textarea
                                    value={form.not_resumen}
                                    onChange={(e) => set('not_resumen', e.target.value)}
                                    rows={2}
                                    placeholder="Breve párrafo introductorio que resume la noticia..."
                                    className="w-full rounded-2xl border-2 border-neutral-100 bg-white px-4 py-3 text-sm transition-all focus:border-[#00a65a]/30 focus:ring-4 focus:ring-[#00a65a]/5 placeholder:text-neutral-400 italic"
                                />
                                {err('not_resumen') && <p className="text-xs text-rose-600 font-medium">{err('not_resumen')}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Cuerpo de la Noticia */}
                            <div className="lg:col-span-7 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                        Cuerpo Principal (Contenido HTML)
                                    </label>
                                    <textarea
                                        value={form.not_contenido_html}
                                        onChange={(e) => set('not_contenido_html', e.target.value)}
                                        rows={15}
                                        placeholder="Escriba aquí el desarrollo completo de la crónica..."
                                        className="w-full rounded-2xl border-2 border-neutral-100 bg-white px-5 py-4 text-sm transition-all focus:border-[#00a65a]/30 focus:ring-4 focus:ring-[#00a65a]/5 placeholder:text-neutral-400 font-serif leading-relaxed"
                                    />
                                    <p className="text-[10px] text-neutral-400 italic">Puede utilizar etiquetas HTML para el formato.</p>
                                    {err('not_contenido_html') && <p className="text-xs text-rose-600 font-medium">{err('not_contenido_html')}</p>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6 p-6 bg-neutral-50 rounded-[2rem] border border-neutral-100">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Cita Autoridad</label>
                                        <textarea
                                            value={form.not_cita_autoridad}
                                            onChange={(e) => set('not_cita_autoridad', e.target.value)}
                                            rows={3}
                                            placeholder="Palabras de Directivos..."
                                            className="w-full rounded-xl border-none bg-white px-4 py-3 text-xs shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Cita Estudiante</label>
                                        <textarea
                                            value={form.not_cita_estudiante}
                                            onChange={(e) => set('not_cita_estudiante', e.target.value)}
                                            rows={3}
                                            placeholder="Testimonio de alumno..."
                                            className="w-full rounded-xl border-none bg-white px-4 py-3 text-xs shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar de Metadatos */}
                            <div className="lg:col-span-5 space-y-8">
                                {/* Imagen */}
                                <div className="relative group overflow-hidden rounded-[2rem] border-2 border-neutral-100 aspect-video flex items-center justify-center bg-neutral-50 shadow-inner">
                                    {imgPreview ? (
                                        <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-neutral-300 gap-2">
                                            <ImageIcon className="w-10 h-10 opacity-20" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Sin Imagen de Portada</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setImagenFile(e.target.files?.[0] ?? null)}
                                        />
                                        <Button 
                                            type="button" 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="font-black text-[10px] uppercase tracking-widest rounded-full px-6"
                                        >
                                            Cambiar Imagen
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-2">
                                    <FormField
                                        label="Autor del Texto"
                                        value={form.autor}
                                        onChange={(v) => set('autor', v)}
                                        placeholder="Nombre del redactor"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            label="Lugar del Evento"
                                            value={form.not_lugar_evento}
                                            onChange={(v) => set('not_lugar_evento', v)}
                                        />
                                        <FormField
                                            label="Fecha del Evento"
                                            type="date"
                                            value={form.not_fecha_evento}
                                            onChange={(v) => set('not_fecha_evento', v)}
                                        />
                                    </div>

                                    <div className="p-6 bg-neutral-900 rounded-[2rem] text-white space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-[#00a65a]" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Programación</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-neutral-500 uppercase">Inicio de Publicación</label>
                                                <input 
                                                    type="datetime-local" 
                                                    value={form.not_fecha_publicacion}
                                                    onChange={(e) => set('not_fecha_publicacion', e.target.value)}
                                                    className="w-full bg-neutral-800 border-none rounded-xl px-4 py-2 text-xs text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-neutral-500 uppercase">Fin de Publicación</label>
                                                <input 
                                                    type="datetime-local" 
                                                    value={form.not_fecha_expiracion}
                                                    onChange={(e) => set('not_fecha_expiracion', e.target.value)}
                                                    className="w-full bg-neutral-800 border-none rounded-xl px-4 py-2 text-xs text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <DialogFooter className="px-8 py-6 border-t bg-white">
                    <Button type="button" variant="ghost" onClick={onClose} className="font-bold text-neutral-400 rounded-xl px-8">
                        Descartar
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={processing} 
                        onClick={handleSubmit}
                        className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-12 rounded-2xl font-black shadow-xl shadow-[#00a65a]/20 h-14 uppercase tracking-widest text-xs"
                    >
                        {processing ? 'Enviando a Prensa...' : (editing ? 'Actualizar Crónica' : 'Lanzar Publicación')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
