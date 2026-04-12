import React from 'react';
import { Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TareaConfig } from '../../hooks/useTareaConfig';

interface Props {
    config: TareaConfig;
    onUpdateMaxFileSize: (size: string) => void;
    onUpdateMaxAttempts: (attempts: string) => void;
    onToggleFormat: (format: string) => void;
}

const AVAILABLE_FORMATS = ['pdf', 'docx', 'zip', 'jpg', 'png', 'xlsx'];

export default function TareaConfigForm({ config, onUpdateMaxFileSize, onUpdateMaxAttempts, onToggleFormat }: Props) {
    return (
        <div className="space-y-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2">
                <Upload size={16} className="text-blue-600" />
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Configuración de Entrega</p>
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
