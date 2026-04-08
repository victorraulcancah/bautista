import { School, Phone, User, Image as ImageIcon } from 'lucide-react';
import FormField from '@/components/shared/FormField';
import TitleForm from '@/components/TitleForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Institucion, InstitucionFormData } from '../hooks/useInstitucion';
import { useInstitucionForm } from '../hooks/useInstitucionForm';


type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     Institucion | null;
    onSave:      (data: FormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function InstitucionFormModal({ open, onClose, editing, onSave, apiErrors, clearErrors }: Props) {
    const { form, set, logoFile, setLogoFile, fileInputRef, processing, handleSubmit } =
        useInstitucionForm({ editing, open, onSave, onClose, clearErrors });

    const err = (key: keyof InstitucionFormData | 'logo') => apiErrors[key]?.[0];

    const logoPreview = logoFile
        ? URL.createObjectURL(logoFile)
        : editing?.insti_logo ?? null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-5 border-b">
                    <DialogTitle className="text-xl font-black text-neutral-900 flex items-center gap-2">
                        <School className="w-5 h-5 text-emerald-600" />
                        {editing ? 'Editar Institución' : 'Nueva Institución'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Sección: Identificación */}
                    <div className="space-y-4">
                        <TitleForm className="border-b border-neutral-100">
                            Datos de Identificación
                        </TitleForm>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                label="Razón Social *"
                                value={form.insti_razon_social}
                                onChange={(v) => set('insti_razon_social', v)}
                                error={err('insti_razon_social')}
                                placeholder="Ej: IEP BAUTISTA LA PASCANA"
                            />
                            <FormField
                                label="RUC"
                                value={form.insti_ruc}
                                onChange={(v) => set('insti_ruc', v)}
                                error={err('insti_ruc')}
                                placeholder="Ej: 20123456789"
                            />
                            <div className="col-span-2">
                                <FormField
                                    label="Dirección"
                                    value={form.insti_direccion}
                                    onChange={(v) => set('insti_direccion', v)}
                                    error={err('insti_direccion')}
                                    placeholder="Ej: Jr. Abraham Valdelomar 496, Comas"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Contacto */}
                    <div className="space-y-4">
                        <TitleForm className="border-b border-neutral-100">
                            Contacto Directo
                        </TitleForm>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                label="Teléfono 1"
                                value={form.insti_telefono1}
                                onChange={(v) => set('insti_telefono1', v)}
                                error={err('insti_telefono1')}
                                placeholder="Ej: 933 862 652"
                            />
                            <FormField
                                label="Teléfono 2"
                                value={form.insti_telefono2}
                                onChange={(v) => set('insti_telefono2', v)}
                                error={err('insti_telefono2')}
                                placeholder="Ej: 01 5551234"
                            />
                            <div className="col-span-2">
                                <FormField
                                    label="Correo Electrónico"
                                    value={form.insti_email}
                                    onChange={(v) => set('insti_email', v)}
                                    error={err('insti_email')}
                                    type="email"
                                    placeholder="Ej: contacto@colegio.edu.pe"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Director */}
                    <div className="space-y-4">
                        <TitleForm className="border-b border-neutral-100">
                            Información del Director
                        </TitleForm>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                label="Nombre del Director"
                                value={form.insti_director}
                                onChange={(v) => set('insti_director', v)}
                                error={err('insti_director')}
                                placeholder="Ej: Lic. Elizabeth Llactarimay"
                            />
                            <FormField
                                label="DNI del Director"
                                value={form.insti_ndni}
                                onChange={(v) => set('insti_ndni', v)}
                                error={err('insti_ndni')}
                                placeholder="Ej: 12345678"
                            />
                        </div>
                    </div>

                    {/* Sección: Logo */}
                    <div className="space-y-4 pb-4">
                        <TitleForm className="border-b border-neutral-100">
                            Logotipo Institución
                        </TitleForm>
                        <div className="flex items-center gap-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <div className="relative group">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Logo"
                                        className="h-24 w-24 rounded-xl object-contain bg-white border border-neutral-200 p-2 shadow-sm transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="h-24 w-24 rounded-xl bg-white border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400">
                                        <ImageIcon className="w-8 h-8 opacity-20" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="block">
                                    <span className="sr-only">Elegir logo</span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer transition-colors"
                                        onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                                    />
                                </label>
                                {err('logo') && <p className="text-xs text-rose-600 font-medium">{err('logo')}</p>}
                                <p className="text-[11px] text-neutral-400 font-medium">PNG, JPG o GIF. Recomendado: 512x512px (Máx. 5 MB)</p>
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
                        onClick={(e) => {
                            e.preventDefault();
                            handleSubmit(e as any);
                        }}
                        className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20"
                    >
                        {processing ? 'Guardando...' : 'Guardar Información'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

