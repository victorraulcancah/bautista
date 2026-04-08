export const getIconType = (tipo: string): 'image' | 'video' | 'audio' | 'pdf' | 'doc' | 'excel' | 'file' => {
    const t = tipo?.toLowerCase() || '';

    if (['jpg', 'png', 'jpeg', 'gif', 'svg', 'webp'].includes(t)) {
        return 'image';
    }

    if (['mp4', 'mov', 'avi', 'mkv'].includes(t)) {
        return 'video';
    }

    if (['mp3', 'wav', 'ogg'].includes(t)) {
        return 'audio';
    }

    if (['pdf'].includes(t)) {
        return 'pdf';
    }

    if (['doc', 'docx'].includes(t)) {
        return 'doc';
    }

    if (['xls', 'xlsx'].includes(t)) {
        return 'excel';
    }

    return 'file';
};

export const getIconColor = (iconType: string): string => {
    switch (iconType) {
        case 'image':
            return 'text-emerald-600';
        case 'video':
            return 'text-indigo-600';
        case 'audio':
            return 'text-rose-600';
        case 'pdf':
            return 'text-red-600';
        case 'doc':
            return 'text-blue-600';
        case 'excel':
            return 'text-green-600';
        default:
            return 'text-amber-600';
    }
};

export const getTypeColor = (tipo: string, esCarpeta: boolean): string => {
    if (esCarpeta) {
        return 'bg-amber-50 text-amber-600';
    }

    const iconType = getIconType(tipo);

    switch (iconType) {
        case 'image':
            return 'bg-emerald-50 text-emerald-600';
        case 'video':
            return 'bg-indigo-50 text-indigo-600';
        case 'audio':
            return 'bg-rose-50 text-rose-600';
        case 'pdf':
            return 'bg-red-50 text-red-600';
        case 'doc':
            return 'bg-blue-50 text-blue-600';
        case 'excel':
            return 'bg-green-50 text-green-600';
        default:
            return 'bg-amber-50 text-amber-600';
    }
};

export const handleDownload = async (ruta: string, nombre: string) => {
    try {
        const response = await fetch(ruta);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombre;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al descargar archivo:', error);
    }
};
