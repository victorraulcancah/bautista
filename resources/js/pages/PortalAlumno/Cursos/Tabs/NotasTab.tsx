import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';

interface NotasTabProps {
    cursoId: number;
}

export default function NotasTab({ cursoId }: NotasTabProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, [cursoId]);

    const loadData = () => {
        api.get(`/alumno/curso/${cursoId}`).then(res => {
            setData(res.data);
            setLoading(false);
        });
    };

    const handleUpload = async (actividadId: number, file: File) => {
        setUploading(actividadId);
        const formData = new FormData();
        formData.append('archivo', file);
        try {
            await api.post(`/alumno/actividad/${actividadId}/entregar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Tarea entregada con éxito');
            loadData();
        } catch (error) {
            alert('Error al subir la tarea');
        } finally {
            setUploading(null);
        }
    };

    if (loading) {
        return <div className="p-20 text-center animate-pulse font-black text-blue-400 uppercase text-xs">Calculando promedio...</div>;
    }

    const actividades = data.unidades.flatMap((u: any) => 
        u.clases.flatMap((c: any) => 
            c.actividades.map((a: any) => ({ ...a, clase_titulo: c.titulo }))
        )
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Mi Historial de Notas</h2>
                    <p className="text-gray-500 text-sm font-bold italic">Revisa tus actividades y entrega tus tareas pendientes.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {actividades.map((act: any, idx: number) => (
                    <Card key={`${act.actividad_id || 'act'}-${idx}`} className="rounded-[2.5rem] border-none shadow-sm p-8 flex items-center justify-between bg-white group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900">{act.nombre}</h4>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                    {act.tipoActividad?.nombre || act.tipo_actividad?.nombre} • {act.clase_titulo}
                                </p>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-6">
                            {act.entregado ? (
                                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
                                    ✅ Entregado {act.fecha_entrega && `(${new Date(act.fecha_entrega).toLocaleDateString()})`}
                                </div>
                            ) : (
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">⏳ Pendiente</span>
                                    {act.tipo_actividad_id === 1 && (
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                id={`file-${act.actividad_id}`}
                                                className="hidden" 
                                                onChange={(e) => e.target.files?.[0] && handleUpload(act.actividad_id, e.target.files[0])}
                                            />
                                            <Button 
                                                disabled={uploading === act.actividad_id}
                                                onClick={() => document.getElementById(`file-${act.actividad_id}`)?.click()}
                                                className="h-8 rounded-xl bg-indigo-600 text-[10px] font-bold uppercase px-4"
                                            >
                                                {uploading === act.actividad_id ? 'Subiendo...' : 'Subir Tarea'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="text-center min-w-[60px]">
                                <div className={`text-3xl font-black ${act.nota ? (parseInt(act.nota) >= 11 ? 'text-emerald-600' : 'text-rose-600') : 'text-gray-200'}`}>
                                    {act.nota || '--'}
                                </div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nota</p>
                            </div>
                        </div>
                    </Card>
                ))}
                {actividades.length === 0 && (
                    <div className="py-20 text-center opacity-30">
                        <FileText size={64} className="mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">No hay actividades registradas</p>
                    </div>
                )}
            </div>
        </div>
    );
}
