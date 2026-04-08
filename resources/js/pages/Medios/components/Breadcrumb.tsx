import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import type { BreadcrumbPath } from '../hooks/useMedios';

type Props = {
    breadcrumbPath: BreadcrumbPath[];
    onNavigate: (folderId: number | null) => void;
};

export default function Breadcrumb({ breadcrumbPath, onNavigate }: Props) {
    if (breadcrumbPath.length === 0) return null;

    return (
        <div className="mb-4 flex items-center gap-2 text-sm flex-wrap bg-neutral-50 p-3 rounded-xl border border-neutral-200">
            <button
                onClick={() => onNavigate(null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white transition-colors text-neutral-600 hover:text-neutral-900"
            >
                <Home className="h-4 w-4" />
                <span className="font-medium">Inicio</span>
            </button>
            
            {breadcrumbPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                    <button
                        onClick={() => onNavigate(folder.id)}
                        className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                            index === breadcrumbPath.length - 1
                                ? 'bg-indigo-600 text-white'
                                : 'text-neutral-600 hover:bg-white hover:text-neutral-900'
                        }`}
                    >
                        {folder.nombre}
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
}
