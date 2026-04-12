import React, { useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';

interface Props {
    open: boolean;
    onClose: () => void;
    claseId: number;
    onSuccess: () => void;
}

export default function UploadFileModal({ open, onClose, claseId, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        visible: '1'
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!formData.titulo) {
                setFormData(prev => ({ ...prev, titulo: file.name }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setLoading(true);
        try {
            const data = new FormData();
            data.append('archivo', selectedFile);
            data.append('titulo', formData.titulo);
            data.append('descripcion', formData.descripcion);
            data.append('visible', formData.visible);

            await api.post(`/contenido/clases/${claseId}/archivos`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ titulo: '', descripcion: '', visible: '1' });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                            <Upload size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Subir Archivo</h2>
                            <p className="text-xs text-gray-500 font-bold">Agrega material de estudio para tus alumnos</p>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleClose}
                        className="size-10 rounded-2xl hover:bg-gray-100"
                    >
                        <X size={18} />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* File Selector */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Archivo *</Label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                        >
                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileText size={24} className="text-blue-600" />
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-900">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm font-bold text-gray-600">Haz clic para seleccionar un archivo</p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint, imágenes, videos</p>
                                </div>
                            )}
                        </div>
                        <input 
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.avi,.mov,.jpg,.jpeg,.png,.zip,.rar"
                        />
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Título del Material *</Label>
                        <Input 
                            value={formData.titulo}
                            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                            placeholder="Ej: Guía de Estudio - Capítulo 3"
                            className="h-12 rounded-2xl font-bold"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Descripción / Comentarios</Label>
                        <Textarea 
                            value={formData.descripcion}
                            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                            placeholder="Describe el contenido del archivo, instrucciones de uso, etc."
                            className="rounded-2xl font-bold min-h-[100px]"
                            rows={4}
                        />
                    </div>

                    {/* Visibility */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Visibilidad</Label>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio"
                                    checked={formData.visible === '1'}
                                    onChange={() => setFormData(prev => ({ ...prev, visible: '1' }))}
                                    className="size-4 text-blue-600"
                                />
                                <span className="text-sm font-bold text-gray-700">Visible para estudiantes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio"
                                    checked={formData.visible === '0'}
                                    onChange={() => setFormData(prev => ({ ...prev, visible: '0' }))}
                                    className="size-4 text-blue-600"
                                />
                                <span className="text-sm font-bold text-gray-700">Oculto</span>
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={handleClose}
                        className="h-12 px-6 rounded-2xl font-bold"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={loading || !selectedFile}
                        className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold gap-2"
                    >
                        <Upload size={16} />
                        {loading ? 'Subiendo...' : 'Subir Archivo'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
