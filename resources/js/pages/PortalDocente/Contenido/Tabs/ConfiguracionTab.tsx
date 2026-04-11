import { useState, useEffect } from 'react';
import { Settings, Palette, Image as ImageIcon, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';

interface Props {
    docenteCursoId: number;
    courseData: any;
    onRefresh: () => void;
}

interface CourseSettings {
    nombre?: string;
    descripcion?: string;
    color?: string;
    banner?: string;
}

const PRESET_COLORS = [
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Pink', value: '#ec4899' },
];

export default function ConfiguracionTab({ docenteCursoId, courseData, onRefresh }: Props) {
    const [settings, setSettings] = useState<CourseSettings>({
        nombre: courseData?.curso?.nombre || '',
        descripcion: courseData?.curso?.descripcion || '',
        color: courseData?.curso?.color || '#10b981',
        banner: courseData?.curso?.banner || '',
    });
    const [saving, setSaving] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [previewBanner, setPreviewBanner] = useState<string | null>(null);

    useEffect(() => {
        if (courseData?.curso) {
            setSettings({
                nombre: courseData.curso.nombre || '',
                descripcion: courseData.curso.descripcion || '',
                color: courseData.curso.color || '#10b981',
                banner: courseData.curso.banner || '',
            });
        }
    }, [courseData]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/docente/curso/${docenteCursoId}/settings`, settings);
            onRefresh();
            alert('Configuración guardada correctamente');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es demasiado grande. Máximo 5MB.');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Solo se permiten archivos de imagen.');
            return;
        }

        setUploadingBanner(true);
        try {
            const formData = new FormData();
            formData.append('banner', file);

            const res = await api.post(`/docente/curso/${docenteCursoId}/upload-banner`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSettings(prev => ({ ...prev, banner: res.data.banner }));
            setPreviewBanner(URL.createObjectURL(file));
        } catch (error) {
            console.error('Error uploading banner:', error);
            alert('Error al subir el banner');
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleReset = () => {
        if (confirm('¿Estás seguro de que deseas restaurar la configuración predeterminada?')) {
            setSettings({
                nombre: courseData?.curso?.nombre || '',
                descripcion: courseData?.curso?.descripcion || '',
                color: '#10b981',
                banner: '',
            });
            setPreviewBanner(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Configuración del Curso</h2>
                    <p className="text-gray-500 text-sm">Personaliza la apariencia y configuración general del curso.</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        onClick={handleReset}
                        variant="outline"
                        className="rounded-2xl h-12 px-6 font-bold text-[10px] uppercase tracking-widest gap-2"
                    >
                        <RotateCcw size={16} /> Restaurar
                    </Button>
                    <Button 
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-2xl h-12 px-6 bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-emerald-100"
                    >
                        <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Settings */}
                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                <Settings size={20} className="text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg text-gray-900">Configuración General</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Información básica del curso</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    Nombre del Curso
                                </label>
                                <Input 
                                    value={settings.nombre}
                                    onChange={(e) => setSettings(prev => ({ ...prev, nombre: e.target.value }))}
                                    placeholder="Ej: Matemática Avanzada"
                                    className="rounded-xl h-12 border-gray-200 font-medium text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    Descripción
                                </label>
                                <Textarea 
                                    value={settings.descripcion}
                                    onChange={(e) => setSettings(prev => ({ ...prev, descripcion: e.target.value }))}
                                    placeholder="Describe brevemente el contenido y objetivos del curso..."
                                    className="rounded-xl min-h-[120px] border-gray-200 font-medium resize-none"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Appearance Settings */}
                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                                <Palette size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg text-gray-900">Personalización Visual</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Colores y apariencia</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    Color del Curso
                                </label>
                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => setSettings(prev => ({ ...prev, color: color.value }))}
                                            className={`size-12 rounded-2xl transition-all hover:scale-110 ${
                                                settings.color === color.value 
                                                    ? 'ring-4 ring-offset-2 ring-gray-300 scale-110' 
                                                    : 'hover:ring-2 hover:ring-gray-200'
                                            }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <Input 
                                        type="color"
                                        value={settings.color}
                                        onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                                        className="w-20 h-12 rounded-xl cursor-pointer"
                                    />
                                    <Input 
                                        type="text"
                                        value={settings.color}
                                        onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                                        placeholder="#10b981"
                                        className="flex-1 rounded-xl h-12 border-gray-200 font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    Banner del Curso
                                </label>
                                <div className="relative">
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBannerUpload}
                                        className="hidden"
                                        id="banner-upload"
                                        disabled={uploadingBanner}
                                    />
                                    <label 
                                        htmlFor="banner-upload"
                                        className="flex flex-col items-center justify-center h-40 rounded-3xl border-2 border-dashed border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer bg-gray-50 hover:bg-emerald-50/30 group"
                                    >
                                        {uploadingBanner ? (
                                            <div className="text-center">
                                                <div className="size-12 mx-auto mb-3 rounded-2xl bg-emerald-100 flex items-center justify-center animate-pulse">
                                                    <ImageIcon size={24} className="text-emerald-600" />
                                                </div>
                                                <p className="text-xs font-bold text-emerald-600">Subiendo...</p>
                                            </div>
                                        ) : previewBanner || settings.banner ? (
                                            <div className="relative w-full h-full rounded-3xl overflow-hidden">
                                                <img 
                                                    src={previewBanner || `/storage/${settings.banner}`} 
                                                    alt="Banner" 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-white font-bold text-sm">Cambiar Banner</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="size-12 mx-auto mb-3 rounded-2xl bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                                    <ImageIcon size={24} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-600 group-hover:text-emerald-600 transition-colors">
                                                    Click para subir banner
                                                </p>
                                                <p className="text-[9px] font-bold text-gray-400 mt-1">
                                                    JPG, PNG o WebP • Máx. 5MB
                                                </p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Preview */}
                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-sm p-6 bg-white sticky top-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Vista Previa</p>
                                <div className="rounded-3xl overflow-hidden border border-gray-100">
                                    {/* Banner Preview */}
                                    <div 
                                        className="h-32 flex items-center justify-center text-white font-black text-lg relative overflow-hidden"
                                        style={{ backgroundColor: settings.color }}
                                    >
                                        {previewBanner || settings.banner ? (
                                            <img 
                                                src={previewBanner || `/storage/${settings.banner}`} 
                                                alt="Banner Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="relative z-10">{settings.nombre || 'Nombre del Curso'}</span>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                    </div>
                                    
                                    {/* Content Preview */}
                                    <div className="p-6 space-y-3">
                                        <h4 className="font-black text-gray-900 text-lg leading-tight">
                                            {settings.nombre || 'Nombre del Curso'}
                                        </h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            {settings.descripcion || 'La descripción del curso aparecerá aquí...'}
                                        </p>
                                        
                                        {/* Sample Button */}
                                        <button 
                                            className="w-full h-10 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-white transition-all"
                                            style={{ backgroundColor: settings.color }}
                                        >
                                            Botón de Ejemplo
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                <p className="text-[9px] font-bold text-blue-700 leading-relaxed">
                                    💡 Los cambios se aplicarán a todo el curso después de guardar.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
