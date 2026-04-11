import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Upload, Trash2, Info, BookOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import type { BreadcrumbItem } from '@/types';

interface ResourceFile {
    id: number;
    nombre: string;
    path: string;
    url?: string;
}

interface Props {
    title: string;
    subtitle: string;
    backUrl: string;
    breadcrumbs: BreadcrumbItem[];
    description: string;
    files: ResourceFile[];
    icon?: any;
    metadata: Array<{
        label: string;
        value: string;
        type?: 'default' | 'status' | 'date';
        statusVariant?: string;
    }>;
    actions?: React.ReactNode;
    onSaveDescription: (newDesc: string) => Promise<void>;
    onFileUpload: (file: File) => Promise<void>;
    onFileDelete: (fileId: number) => Promise<void>;
    canEdit?: boolean;
}

export default function ResourceDetailLayout({
    title,
    subtitle,
    backUrl,
    breadcrumbs,
    description,
    files,
    icon: Icon = BookOpen,
    metadata,
    actions,
    onSaveDescription,
    onFileUpload,
    onFileDelete,
    canEdit = true
}: Props) {
    const [editDesc, setEditDesc] = useState(false);
    const [tempDesc, setTempDesc] = useState(description);
    const [saving, setSaving] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<ResourceFile | null>(null);

    const handleSaveDesc = async () => {
        setSaving(true);
        try {
            await onSaveDescription(tempDesc);
            setEditDesc(false);
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        try {
            await onFileUpload(file);
        } finally {
            setSaving(false);
        }
    };

    const confirmDeleteFile = (file: ResourceFile) => {
        setFileToDelete(file);
        setDeleteModalOpen(true);
    };

    const handleDeleteFile = async () => {
        if (!fileToDelete) return;
        await onFileDelete(fileToDelete.id);
        setDeleteModalOpen(false);
        setFileToDelete(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <PageHeader 
                        icon={Icon} 
                        title={title} 
                        subtitle={subtitle}
                        iconColor="bg-emerald-600"
                    />
                    <Link href={backUrl}>
                        <Button variant="ghost" className="rounded-2xl font-bold bg-white shadow-sm border-none hover:bg-gray-50 uppercase text-[10px] tracking-widest h-11 px-6">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Descripción Card */}
                        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                            <div className="flex items-center justify-between p-10 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Info size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Descripción & Guía</h3>
                                </div>
                                {canEdit && (
                                    !editDesc ? (
                                        <Button
                                            onClick={() => { setTempDesc(description); setEditDesc(true); }}
                                            variant="outline"
                                            className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                                        >
                                            Editar
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setEditDesc(false)}
                                                className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4 h-10"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleSaveDesc}
                                                disabled={saving}
                                                className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10 bg-emerald-600 shadow-lg shadow-emerald-100 text-white"
                                            >
                                                {saving ? 'Guardando...' : 'Guardar'}
                                            </Button>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="px-10 pb-10">
                                {editDesc ? (
                                    <Textarea
                                        value={tempDesc}
                                        onChange={(e) => setTempDesc(e.target.value)}
                                        className="min-h-[300px] w-full p-6 border-none bg-gray-50 rounded-[2rem] focus:ring-4 focus:ring-emerald-100 transition-all text-sm font-bold text-gray-700 resize-none outline-none"
                                        placeholder="Escribe la descripción de este recurso..."
                                    />
                                ) : (
                                    <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100/50 min-h-[100px]">
                                        {description ? (
                                            <div
                                                className="prose prose-indigo max-w-none text-sm font-bold text-gray-600 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: description }}
                                            />
                                        ) : (
                                            <p className="text-gray-400 italic font-bold text-sm text-center py-10">No se ha redactado una guía para este recurso.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Archivos Card */}
                        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                            <div className="flex items-center justify-between p-10 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <FileText size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Material de Apoyo</h3>
                                </div>
                                {canEdit && (
                                    <label className="cursor-pointer">
                                        <div className="flex items-center gap-2 rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10 bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                                            <Upload size={14} /> Adjuntar
                                        </div>
                                        <input type="file" className="hidden" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>

                            <div className="px-10 pb-10 space-y-3">
                                {files.length === 0 ? (
                                    <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2rem] text-center">
                                        <p className="text-gray-400 italic font-bold text-sm uppercase tracking-widest">Sin recursos adjuntos</p>
                                    </div>
                                ) : (
                                    files.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-emerald-50/50 transition-all group border border-transparent hover:border-emerald-100"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="size-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm transition-transform group-hover:scale-110">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{file.nombre}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recurso Institucional</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={file.url || `/storage/${file.path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-xl font-black uppercase text-[9px] tracking-widest h-9 px-5 bg-white shadow-sm border border-gray-100 inline-flex items-center hover:bg-emerald-600 hover:text-white transition-all shadow-emerald-100"
                                                >
                                                    Ver
                                                </a>
                                                {canEdit && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => confirmDeleteFile(file)}
                                                        className="size-9 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* Actions Contextuales */}
                        {actions && (
                            <Card className="bg-emerald-600 p-10 rounded-[3rem] text-white shadow-xl shadow-emerald-200 relative overflow-hidden group border-none">
                                <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                                    <Plus size={120} />
                                </div>
                                <h3 className="text-2xl font-black mb-6 tracking-tight relative">Panel de Gestión</h3>
                                <div className="space-y-4 relative">
                                    {actions}
                                </div>
                            </Card>
                        )}

                        {/* Metadata Card */}
                        <Card className="bg-white p-8 rounded-[2.5rem] border-none shadow-sm space-y-6">
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                                <span className="size-2 rounded-full bg-emerald-600" /> Información del Recurso
                            </h4>
                            <div className="space-y-4">
                                {metadata.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{item.label}</span>
                                        {item.type === 'status' ? (
                                            <span className={`font-black uppercase text-[11px] flex items-center gap-2 ${item.statusVariant === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                <div className={`size-2 rounded-full ${item.statusVariant === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                {item.value}
                                            </span>
                                        ) : (
                                            <span className="font-bold text-gray-900 flex items-center gap-2">
                                                <Info size={14} className="text-emerald-600" /> {item.value}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal 
                open={deleteModalOpen} 
                onClose={() => setDeleteModalOpen(false)} 
                onConfirm={handleDeleteFile} 
                title="Eliminar Recurso"
                message={`¿Estás seguro de que deseas eliminar "${fileToDelete?.nombre}"? Esta acción no se puede deshacer.`}
            />
        </AppLayout>
    );
}
