import { Camera, Image as ImageIcon, Plus, Save } from 'lucide-react';
import { useEffect, useRef } from 'react';
import FormField from '@/components/shared/FormField';
import { FormLegend } from '@/components/shared/FormLabels';
import FormSection from '@/components/shared/FormSection';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCursoForm } from '../hooks/useCursoForm';
import type { Curso, CursoFormData, NivelOption } from '../hooks/useCursos';

type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     Curso | null;
    niveles:     NivelOption[];
    grados:      Array<{ grado_id: number; nombre_grado: string; nivel_id?: number }>;
    defaults?:   Partial<CursoFormData>;
    onSave:      (data: CursoFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function CursoFormModal({ open, onClose, editing, niveles, grados, defaults, onSave, apiErrors, clearErrors }: Props) {
    const { form, set, processing, handleSubmit, preview, handleFileChange } = useCursoForm({ editing, open, defaults, onSave, onClose, clearErrors });
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const nivelNombre = niveles.find(n => n.nivel_id.toString() === form.nivel_academico_id)?.nombre_nivel || '—';
    
    // Filtrar grados por el nivel seleccionado
    const gradosFiltrados = form.nivel_academico_id 
        ? grados.filter(g => g.nivel_id?.toString() === form.nivel_academico_id)
        : grados;
    
    // Auto-seleccionar el primer grado si viene de un nivel y no hay grado seleccionado
    useEffect(() => {
        if (form.nivel_academico_id && !form.grado_academico && gradosFiltrados.length > 0 && !editing) {
            set('grado_academico', gradosFiltrados[0].grado_id.toString());
        }
    }, [form.nivel_academico_id, gradosFiltrados, form.grado_academico, editing]);
    
    const err = (key: keyof CursoFormData) => apiErrors[key]?.[0];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[95vh] overflow-y-auto p-0">
                <DialogHeader className="p-4 sm:p-6 border-b bg-neutral-50/50">
                    <DialogTitle className="text-base sm:text-xl font-bold flex items-center gap-2">
                        <Plus className="size-4 sm:size-5 text-emerald-600" />
                        {editing ? 'Editar Curso' : 'Agregar Curso'}
                        {nivelNombre !== '—' && (
                            <span className="text-sm sm:text-base font-normal text-neutral-500">
                                · {nivelNombre}
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <FormLegend />

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8">
                        {/* Area de Imagen */}
                        <div className="md:col-span-4 space-y-3 sm:space-y-4">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Foto del Curso</label>
                            <div className="aspect-square w-full rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center relative overflow-hidden group">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                                        <ImageIcon className="size-10 sm:size-12 stroke-[1px]" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Sin Imagen</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button 
                                        type="button" 
                                        variant="secondary" 
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="gap-2 text-xs sm:text-sm h-8 sm:h-9"
                                    >
                                        <Camera className="size-3.5 sm:size-4" />
                                        Cambiar
                                    </Button>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <p className="text-[10px] text-neutral-400 text-center italic">
                                Tamaño recomendado: 512x512px (PNG/JPG)
                            </p>
                        </div>

                        {/* Datos del Curso */}
                        <div className="md:col-span-8 space-y-4 sm:space-y-6">
                            <FormSection title="Información General">
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-xs sm:text-sm font-medium text-neutral-700 uppercase">Nivel Académico</label>
                                    <div className="h-8 sm:h-10 w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 flex items-center text-xs sm:text-sm font-bold text-neutral-500 uppercase">
                                        {nivelNombre}
                                    </div>
                                </div>

                                <FormField 
                                    label="Nombre del Curso" 
                                    required={true} 
                                    value={form.nombre} 
                                    onChange={(v) => set('nombre', v.toUpperCase())} 
                                    error={err('nombre')} 
                                    placeholder="Ej: MATEMÁTICA, COMUNICACIÓN..."
                                />
                                
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-xs sm:text-sm font-medium text-neutral-700 uppercase">Descripción</label>
                                    <textarea
                                        className="flex min-h-[80px] sm:min-h-[100px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600/30 outline-none transition-all placeholder:text-neutral-300 uppercase"
                                        value={form.descripcion}
                                        onChange={(e) => set('descripcion', e.target.value.toUpperCase())}
                                        placeholder="Ingrese una descripción breve del curso..."
                                    />
                                    {err('descripcion') && <p className="text-xs text-red-500">{err('descripcion')}</p>}
                                </div>
                            </FormSection>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-2 sm:gap-3 pt-4 sm:pt-6 border-t">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose} 
                            className="w-full sm:w-auto px-6 sm:px-10 h-9 text-xs sm:text-sm"
                        >
                            Cerrar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="w-full sm:w-auto px-6 sm:px-10 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-100"
                        >
                            <Save className="size-3.5 sm:size-4 mr-2" />
                            {processing ? 'Guardando...' : 'Guardar Curso'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
