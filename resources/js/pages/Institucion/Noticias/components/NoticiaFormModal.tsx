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
                not_titulo:  editing.not_titulo  ?? '',
                not_mensaje: editing.not_mensaje ?? '',
                not_fecha:   editing.not_fecha   ?? '',
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
            fd.append('not_titulo',  form.not_titulo);
            if (form.not_mensaje) fd.append('not_mensaje', form.not_mensaje);
            if (form.not_fecha)   fd.append('not_fecha',   form.not_fecha);
            if (imagenFile)       fd.append('imagen',      imagenFile);
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
            <DialogContent className="max-w-xl max-h-[92vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-5 border-b">
                    <DialogTitle className="text-xl font-black text-neutral-900 flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-emerald-600" />
                        {editing ? 'Editar Noticia' : 'Publicar Nueva Noticia'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Sección: Contenido Principal */}
                    <div className="space-y-4">
                        <TitleForm className="border-b border-neutral-100">
                            Contenido de la Noticia
                        </TitleForm>
                        
                        <div className="space-y-4">
                            <FormField
                                label="Título de la Noticia *"
                                value={form.not_titulo}
                                onChange={(v) => set('not_titulo', v)}
                                error={err('not_titulo')}
                                placeholder="EJ: COMUNICADO SOBRE EL INICIO DE CLASES"
                            />


                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                                    <Type className="w-4 h-4 text-neutral-400" />
                                    Cuerpo del Mensaje
                                </label>
                                <textarea
                                    value={form.not_mensaje}
                                    onChange={(e) => set('not_mensaje', e.target.value)}
                                    rows={5}
                                    placeholder="Escribe el detalle de la noticia aquí..."
                                    className="w-full rounded-xl border-2 border-neutral-100 bg-neutral-50/30 px-4 py-3 text-sm transition-all focus:border-emerald-500/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 placeholder:text-neutral-400"
                                />
                                {err('not_mensaje') && <p className="text-xs text-rose-600 font-medium">{err('not_mensaje')}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    label="Fecha de Publicación"
                                    type="date"
                                    value={form.not_fecha}
                                    onChange={(v) => set('not_fecha', v)}
                                    error={err('not_fecha')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Imagen Portada */}
                    <div className="space-y-4 pb-4">
                        <TitleForm className="border-b border-neutral-100">
                            Imagen de Portada
                        </TitleForm>
                        
                        <div className="flex flex-col gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <div className="flex items-center gap-6">
                                <div className="relative group shrink-0">
                                    {imgPreview ? (
                                        <img
                                            src={imgPreview}
                                            alt="Preview"
                                            className="h-24 w-36 rounded-xl object-cover bg-white border border-neutral-200 shadow-sm transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="h-24 w-36 rounded-xl bg-white border border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-400 gap-1">
                                            <ImageIcon className="w-8 h-8 opacity-20" />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Sin Imagen</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 space-y-2">
                                    <label className="block">
                                        <span className="sr-only">Elegir imagen</span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer transition-colors"
                                            onChange={(e) => setImagenFile(e.target.files?.[0] ?? null)}
                                        />
                                    </label>
                                    {err('imagen') && <p className="text-xs text-rose-600 font-medium">{err('imagen')}</p>}
                                    <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-tight">Formatos: PNG, JPG o GIF. Máx. 10 MB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <DialogFooter className="p-6 border-t bg-neutral-50/50">
                    <Button type="button" variant="ghost" onClick={onClose} className="font-bold text-neutral-500 hover:text-neutral-700">
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={processing} 
                        onClick={handleSubmit}
                        className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20"
                    >
                        {processing ? 'Publicando...' : (editing ? 'Guardar Cambios' : 'Publicar Noticia')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

