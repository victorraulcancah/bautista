/**
 * useAsistenciaData — hook de datos para el módulo de asistencia.
 * Responsabilidad: cargar alumnos, clases, historial y manejar guardado.
 */
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { Alumno, Clase, SesionHistorial, RegistroHoy } from './types';

interface Stats {
    totalClases: number;
    totalEstudiantes: number;
    promedioAsistencia: number;
    totalFaltas: number;
}

export function useAsistenciaData(docenteCursoId: number) {
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [clases, setClases] = useState<Clase[]>([]);
    const [records, setRecords] = useState<SesionHistorial[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loadingInit, setLoadingInit] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const notify = (type: 'success' | 'error', msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3000);
    };

    // Cargar alumnos y clases al montar
    useEffect(() => {
        const load = async () => {
            setLoadingInit(true);
            try {
                const [contenidoRes, alumnosRes] = await Promise.all([
                    api.get(`/docente/curso/${docenteCursoId}/contenido`),
                    api.get(`/docente/curso/${docenteCursoId}/alumnos`),
                ]);

                // Flatten unidades → clases
                const clasesFlat: Clase[] = [];
                (contenidoRes.data || []).forEach((unidad: any) => {
                    (unidad.clases || []).forEach((clase: any) => {
                        clasesFlat.push({
                            clase_id: clase.clase_id,
                            titulo: clase.titulo,
                            unidad_titulo: unidad.titulo,
                        });
                    });
                });

                setClases(clasesFlat);
                // AlumnoMetricasResource::collection wraps in { data: [...] }
                const alumnosData = alumnosRes.data?.data ?? alumnosRes.data ?? [];
                setAlumnos(Array.isArray(alumnosData) ? alumnosData : []);
            } catch (e) {
                console.error('Error cargando datos de asistencia:', e);
            } finally {
                setLoadingInit(false);
            }
        };
        load();
    }, [docenteCursoId]);

    // Cargar historial
    const loadHistorial = useCallback(async (desde?: string, hasta?: string) => {
        setLoadingHistory(true);
        try {
            const res = await api.get(`/docente/curso/${docenteCursoId}/asistencia-matrix`, {
                params: { desde: desde || undefined, hasta: hasta || undefined },
            });
            setRecords(res.data.records || []);
            setStats(res.data.stats || null);
        } catch (e) {
            console.error('Error cargando historial:', e);
        } finally {
            setLoadingHistory(false);
        }
    }, [docenteCursoId]);

    // Guardar asistencia del día
    const guardarAsistencia = async (claseId: number, fecha: string, registros: RegistroHoy[]) => {
        setSaving(true);
        try {
            // 1. Iniciar sesión (firstOrCreate)
            const sesionRes = await api.post('/docente/asistencia/iniciar', {
                id_clase_curso: claseId,
                fecha,
            });
            const sessionId = sesionRes.data.id;

            // 2. Marcar asistencia — incluir docente_curso_id para que el middleware lo valide
            await api.post(`/docente/asistencia/${sessionId}/marcar`, {
                docente_curso_id: docenteCursoId,
                asistencias: registros.map(r => ({
                    id_estudiante: r.estu_id,
                    estado: r.estado,
                })),
            });

            notify('success', 'Asistencia guardada correctamente');
        } catch (e: any) {
            notify('error', 'Error al guardar la asistencia');
        } finally {
            setSaving(false);
        }
    };

    return {
        alumnos,
        clases,
        records,
        stats,
        loadingInit,
        loadingHistory,
        saving,
        feedback,
        loadHistorial,
        guardarAsistencia,
    };
}
