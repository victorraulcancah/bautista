import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface TipoActividad {
    tipo_id: number;
    nombre: string;
}

interface ActivityFormData {
    id_curso: number;
    id_clase_curso: number;
    id_tipo_actividad: string;
    nombre_actividad: string;
    descripcion_corta: string;
    descripcion_larga: string;
    fecha_inicio: string;
    fecha_cierre: string;
    nota_actividad: string;
    es_calificado: string;
    nota_visible: string;
    ocultar_actividad: string;
    estado: string;
    peso_porcentaje: string;
    puntos_maximos: string;
}

export function useActivityForm(cursoId: number, claseId: number) {
    const [tipos, setTipos] = useState<TipoActividad[]>([]);
    const [selectedTipo, setSelectedTipo] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ActivityFormData>({
        id_curso: cursoId,
        id_clase_curso: claseId,
        id_tipo_actividad: '',
        nombre_actividad: '',
        descripcion_corta: '',
        descripcion_larga: '',
        fecha_inicio: '',
        fecha_cierre: '',
        nota_actividad: '20',
        es_calificado: '1',
        nota_visible: '1',
        ocultar_actividad: '0',
        estado: '1',
        peso_porcentaje: '0',
        puntos_maximos: '20'
    });

    useEffect(() => {
        loadTipos();
    }, []);

    const loadTipos = async () => {
        try {
            const response = await api.get('/actividades/tipos');
            setTipos(response.data);
            if (response.data.length > 0) {
                const firstTipo = response.data[0];
                setFormData(prev => ({ ...prev, id_tipo_actividad: firstTipo.tipo_id.toString() }));
                setSelectedTipo(firstTipo.nombre);
            }
        } catch (error) {
            console.error('Error loading activity types:', error);
        }
    };

    const handleTipoChange = (tipoId: string) => {
        const tipo = tipos.find(t => t.tipo_id.toString() === tipoId);
        setFormData(prev => ({ ...prev, id_tipo_actividad: tipoId }));
        setSelectedTipo(tipo?.nombre || '');
    };

    const handleChange = (field: keyof ActivityFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const submitActivity = async (config: any) => {
        setLoading(true);
        try {
            const attachments: File[] = config?.attachments ?? [];
            const configWithoutFiles = config ? { ...config, attachments: undefined } : config;

            const payload = { ...formData, config: configWithoutFiles };
            const res = await api.post('/actividades', payload);
            const actividadId = res.data?.data?.actividad_id;

            // Upload docente attachments if any
            if (actividadId && attachments.length > 0) {
                for (const file of attachments) {
                    const fd = new FormData();
                    fd.append('file', file);
                    await api.post(`/docente/actividades/${actividadId}/archivos`, fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                }
            }

            return true;
        } catch (error) {
            console.error('Error creating activity:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        tipos,
        selectedTipo,
        formData,
        loading,
        handleTipoChange,
        handleChange,
        submitActivity
    };
}
