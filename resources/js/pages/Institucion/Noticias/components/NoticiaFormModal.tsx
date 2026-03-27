import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormField from '@/components/shared/FormField';
import FormSection from '@/components/shared/FormSection';
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
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Noticia' : 'Nueva Noticia'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormSection title="Contenido" cols={1}>
                        <FormField
                            label="Título *"
                            value={form.not_titulo}
                            onChange={(v) => set('not_titulo', v)}
                            error={err('not_titulo')}
                            placeholder="Ej: CIERRE DE INSCRIPCIONES"
                            className="uppercase"
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Contenido</label>
                            <textarea
                                value={form.not_mensaje}
                                onChange={(e) => set('not_mensaje', e.target.value)}
                                rows={4}
                                placeholder="Detalle del mensaje..."
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                            />
                            {err('not_mensaje') && <p className="text-xs text-red-500">{err('not_mensaje')}</p>}
                        </div>
                        <FormField
                            label="Fecha"
                            type="date"
                            value={form.not_fecha}
                            onChange={(v) => set('not_fecha', v)}
                            error={err('not_fecha')}
                        />
                    </FormSection>

                    <section>
                        <p className="mb-2 text-xs font-semibold uppercase text-gray-400 tracking-wider">Imagen (opcional)</p>
                        <div className="flex items-start gap-4">
                            {imgPreview && (
                                <img
                                    src={imgPreview}
                                    alt="Preview"
                                    className="h-20 w-28 rounded-lg object-cover border border-gray-200"
                                />
                            )}
                            <div className="space-y-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="block text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-gray-200"
                                    onChange={(e) => setImagenFile(e.target.files?.[0] ?? null)}
                                />
                                {err('imagen') && <p className="text-xs text-red-500">{err('imagen')}</p>}
                                <p className="text-xs text-gray-400">PNG, JPG o GIF · máx 10 MB</p>
                            </div>
                        </div>
                    </section>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing} className="bg-[#00a65a] hover:bg-[#008d4c] text-white">
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
