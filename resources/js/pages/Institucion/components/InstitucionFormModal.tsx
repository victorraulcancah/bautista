import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormField from '@/components/shared/FormField';
import FormSection from '@/components/shared/FormSection';
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Institución' : 'Nueva Institución'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormSection title="Datos de Identificación" cols={2}>
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
                    </FormSection>

                    <FormSection title="Contacto" cols={2}>
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
                        <FormField
                            label="Correo Electrónico"
                            value={form.insti_email}
                            onChange={(v) => set('insti_email', v)}
                            error={err('insti_email')}
                            type="email"
                            placeholder="Ej: contacto@colegio.edu.pe"
                        />
                    </FormSection>

                    <FormSection title="Director" cols={2}>
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
                    </FormSection>

                    <section>
                        <p className="mb-2 text-xs font-semibold uppercase text-gray-400 tracking-wider">Logo</p>
                        <div className="flex items-center gap-4">
                            {logoPreview && (
                                <img
                                    src={logoPreview}
                                    alt="Logo"
                                    className="h-16 w-16 rounded-lg object-contain border border-gray-200"
                                />
                            )}
                            <div className="space-y-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="block text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-gray-200"
                                    onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                                />
                                {err('logo') && <p className="text-xs text-red-500">{err('logo')}</p>}
                                <p className="text-xs text-gray-400">PNG, JPG o GIF · máx 5 MB</p>
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
