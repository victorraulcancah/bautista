import { Folder, Download, Trash2, Image, Film, Music, File, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Medio } from '../hooks/useMedios';
import { getIconType, getIconColor, getTypeColor } from '../utils/fileHelpers';

type Props = {
    medios: Medio[];
    loading: boolean;
    search: string;
    onItemClick: (medio: Medio) => void;
    onDownload: (medio: Medio) => void;
    onEdit: (medio: Medio) => void;
    onDelete: (id: number, esCarpeta: boolean) => void;
};

const getIcon = (tipo: string) => {
    const iconType = getIconType(tipo);
    const color = getIconColor(iconType);
    const className = `w-8 h-8 ${color}`;

    switch (iconType) {
        case 'image':
            return <Image className={className} />;
        case 'video':
            return <Film className={className} />;
        case 'audio':
            return <Music className={className} />;
        default:
            return <File className={className} />;
    }
};

export default function MediosGrid({ medios, loading, search, onItemClick, onDownload, onEdit, onDelete }: Props) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-400 font-bold">Cargando...</p>
                </div>
            </div>
        );
    }

    if (medios.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-neutral-200 p-20 text-center">
                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Folder className="w-10 h-10 text-neutral-300" />
                </div>
                <p className="text-neutral-500 font-medium">
                    {search ? 'No se encontraron elementos' : 'Esta carpeta está vacía'}
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Vista Desktop - Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {medios.map((medio) => (
                    <div 
                        key={medio.id_medio}
                        className="group relative bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
                        onClick={() => onItemClick(medio)}
                    >
                        {/* Icono del archivo o carpeta */}
                        <div className={`w-16 h-16 ${getTypeColor(medio.tipo, medio.es_carpeta)} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                            {medio.es_carpeta ? (
                                <Folder className="w-8 h-8" />
                            ) : (
                                getIcon(medio.tipo)
                            )}
                        </div>

                        {/* Nombre */}
                        <p className="text-xs font-bold text-neutral-900 text-center line-clamp-2 mb-2">
                            {medio.nombre}
                        </p>

                        {/* Tipo */}
                        {!medio.es_carpeta && (
                            <p className="text-[10px] font-bold text-neutral-400 uppercase text-center">
                                {medio.tipo}
                            </p>
                        )}

                        {/* Botones de acción */}
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {medio.es_carpeta ? (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(medio);
                                    }}
                                    className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDownload(medio);
                                    }}
                                    className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(medio.id_medio, medio.es_carpeta);
                                }}
                                className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden flex flex-col gap-3">
                {medios.map((medio) => (
                    <div 
                        key={medio.id_medio}
                        className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-4"
                        onClick={() => onItemClick(medio)}
                    >
                        {/* Icono */}
                        <div className={`w-12 h-12 ${getTypeColor(medio.tipo, medio.es_carpeta)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            {medio.es_carpeta ? (
                                <Folder className="w-6 h-6" />
                            ) : (
                                getIcon(medio.tipo)
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-neutral-900 truncate">
                                {medio.nombre}
                            </p>
                            {!medio.es_carpeta && (
                                <p className="text-xs font-medium text-neutral-400 uppercase">
                                    {medio.tipo}
                                </p>
                            )}
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-1 flex-shrink-0">
                            {medio.es_carpeta ? (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(medio);
                                    }}
                                    className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDownload(medio);
                                    }}
                                    className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(medio.id_medio, medio.es_carpeta);
                                }}
                                className="h-9 w-9 rounded-lg bg-rose-50 text-rose-600"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
