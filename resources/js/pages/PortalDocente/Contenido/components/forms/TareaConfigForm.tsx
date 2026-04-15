import React, { useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TareaConfig } from '../../hooks/useTareaConfig';

interface Props {
    config: TareaConfig;
    onUpdateMaxFileSize: (size: string) => void;
    onUpdateMaxAttempts: (attempts: string) => void;
    onToggleFormat: (format: string) => void;
    onAddFile: (file: File) => void;
    onRemoveFile: (index: number) => void;
}

const AVAILABLE_FORMATS = ['pdf', 'docx', 'zip', 'jpg', 'png', 'xlsx'];

export default function TareaConfigForm({ config, onUpdateMaxFileSize, onUpdateMaxAttempts, onToggleFormat, onAddFile, onRemoveFile }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <ImageIcon size={14} className="text-indigo-500" />;
        return <FileText size={14} className="text-blue-500" />;
    };

    return (
        <div className="space-y-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2">
                <Upload size={16} className="text-blue-600" />
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Configuración de Entrega</p>
            </div>

            {/* Archivos del docente */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Archivos para el Alumno (enunciado, imagen, PDF...)</Label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-blue-200 rounded-xl bg-white cursor-pointer hover:bg-blue-50 transition-colors"
                >
                    <Upload size={20} className="text-blue-400" />
                    <p className="text-xs font-bold text-blue-500">Haz clic para adjuntar archivos</p>
                    <p className="text-[10px] text-gray-400">PDF, imágenes, Word, etc.</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.xlsx,.zip"
                        onChange={(e) => {
                            Array.from(e.target.files || []).forEach(onAddFile);
                            e.target.value = '';
                        }}
                    />
                </div>

                {config.attachments.length > 0 && (
                    <div className="space-y-2 mt-2">
                        {config.attachments.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-blue-100">
                                {getFileIcon(file)}
                                <span className="flex-1 text-xs font-semibold text-gray-700 truncate">{file.name}</span>
                                <span className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(0)} KB</span>
                                <button type="button" onClick={() => onRemoveFile(i)} className="text-gray-300 hover:text-rose-500 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Tamaño Máximo de Archivo</Label>
                    <select 
                        value={config.max_file_size}
                        onChange={(e) => onUpdateMaxFileSize(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="10">10 MB</option>
                        <option value="50">50 MB</option>
                        <option value="100">100 MB</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Número de Intentos</Label>
                    <Input 
                        type="number"
                        value={config.max_attempts}
                        onChange={(e) => onUpdateMaxAttempts(e.target.value)}
                        className="h-10 rounded-xl font-bold"
                        min="1"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Formatos Permitidos</Label>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_FORMATS.map(format => (
                        <label key={format} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors">
                            <input 
                                type="checkbox"
                                checked={config.allowed_formats.includes(format)}
                                onChange={() => onToggleFormat(format)}
                                className="size-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-gray-700 uppercase">{format}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
