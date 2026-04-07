import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import type { MatriculaFormData, SeccionOption, GradoOption } from '../hooks/useMatricula';
import { defaultMatriculaForm } from '../hooks/useMatricula';
import { defaultAlumno, defaultContacto, mapContacto } from './matricular/types';
import type { AlumnoForm, ContactoForm } from './matricular/types';
import AlumnoTab from './matricular/AlumnoTab';
import ContactoTab from './matricular/ContactoTab';

// ── Props ──────────────────────────────────────────────────────────────────────

type Props = {
    open:        boolean;
    onClose:     () => void;
    aperturaId:  number;
    nivelId?:    number | null;
    anio:        number;
    secciones:   SeccionOption[];
    grados:      GradoOption[];
    onSave:      (data: MatriculaFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    estudiantes?: any[];  // kept for API compatibility, not used internally
};

const TAB_CLS = 'rounded-none border-b-2 border-transparent data-[state=active]:border-[#00a65a] data-[state=active]:bg-transparent data-[state=active]:text-[#00a65a] data-[state=active]:shadow-none px-4 py-2 text-sm font-medium';

// ── Component ──────────────────────────────────────────────────────────────────

export default function MatricularModal({
    open, onClose, aperturaId, nivelId, anio,
    secciones, grados, onSave, clearErrors,
}: Props) {
    const [matricula, setMatricula]   = useState<MatriculaFormData>(defaultMatriculaForm);
    const [alumno, setAlumno]         = useState<AlumnoForm>(defaultAlumno());
    const [padre, setPadre]           = useState<ContactoForm>(defaultContacto());
    const [madre, setMadre]           = useState<ContactoForm>(defaultContacto());
    const [apoderado, setApoderado]   = useState<ContactoForm>(defaultContacto());
    const [searching, setSearching]   = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors]         = useState<Record<string, string>>({});
    const [dniSearch, setDniSearch]   = useState('');
    const [selectedGrado, setSelectedGrado] = useState('');

    // reset on open/close
    useEffect(() => {
        clearErrors();
        setMatricula({ ...defaultMatriculaForm, apertura_id: aperturaId.toString(), anio: anio.toString() });
        setAlumno(defaultAlumno());
        setPadre(defaultContacto());
        setMadre(defaultContacto());
        setApoderado(defaultContacto());
        setErrors({});
        setDniSearch('');
        setSelectedGrado('');
    }, [open]);

    // auto-load contacts when an existing student is found by DNI
    useEffect(() => {
        if (!alumno.estu_id) return;
        api.get(`/estudiantes/${alumno.estu_id}/contactos`)
            .then(r => {
                const d = r.data;
                if (d.padre)     setPadre(mapContacto(d.padre));
                if (d.madre)     setMadre(mapContacto(d.madre));
                if (d.apoderado) setApoderado(mapContacto(d.apoderado));
            })
            .catch(() => {});
    }, [alumno.estu_id]);

    // ── DNI search ─────────────────────────────────────────────────────────────
    const handleDniSearch = async () => {
        if (!dniSearch.trim()) return;
        setSearching(true);
        try {
            const res = await api.get('/estudiantes', { params: { search: dniSearch.trim(), per_page: 5 } });
            const found = (res.data.data ?? [])[0];
            if (found) {
                setAlumno({
                    estu_id:             found.estu_id,
                    username:            found.user?.username ?? found.perfil?.doc_numero ?? '',
                    email:               found.user?.email ?? '',
                    primer_nombre:       found.perfil?.primer_nombre ?? '',
                    segundo_nombre:      found.perfil?.segundo_nombre ?? '',
                    apellido_paterno:    found.perfil?.apellido_paterno ?? '',
                    apellido_materno:    found.perfil?.apellido_materno ?? '',
                    genero:              found.perfil?.genero ?? '',
                    fecha_nacimiento:    found.perfil?.fecha_nacimiento ?? '',
                    edad:                found.edad?.toString() ?? '',
                    talla:               found.talla ?? '',
                    peso:                found.peso ?? '',
                    telefono:            found.perfil?.telefono ?? '',
                    direccion:           found.perfil?.direccion ?? '',
                    colegio:             found.colegio ?? '',
                    neurodivergencia:    found.neurodivergencia ?? '',
                    terapia_ocupacional: found.terapia_ocupacional ?? '',
                    seguro:              found.seguro ?? '',
                    seguro_privado:      found.seguro_privado ?? '',
                    mensualidad:         found.mensualidad ?? '',
                    fecha_ingreso:       found.fecha_ingreso ?? '',
                    fecha_pago:          found.fecha_pago ?? '',
                    foto:                null,
                });
                setMatricula(prev => ({ ...prev, estu_id: found.estu_id.toString() }));
            } else {
                // Si no existe localmente, buscar en RENIEC via APIPeru
                try {
                    const reniecRes = await api.get(`/reniec/dni/${dniSearch.trim()}`);
                    if (reniecRes.data.success) {
                        const d = reniecRes.data.data;
                        setAlumno({
                            ...defaultAlumno(),
                            username:         d.dni,
                            primer_nombre:    d.nombres,
                            apellido_paterno: d.apellidoPaterno,
                            apellido_materno: d.apellidoMaterno,
                        });
                        setMatricula(prev => ({ ...prev, estu_id: '' }));
                    } else {
                        setAlumno({ ...defaultAlumno(), username: dniSearch.trim() });
                        setMatricula(prev => ({ ...prev, estu_id: '' }));
                    }
                } catch (e) {
                    setAlumno({ ...defaultAlumno(), username: dniSearch.trim() });
                    setMatricula(prev => ({ ...prev, estu_id: '' }));
                }
            }
        } finally {
            setSearching(false);
        }
    };

    const handleContactoSearch = async (tipo: 'padre' | 'madre' | 'apoderado', dni: string) => {
        if (!dni.trim()) return;
        setSearching(true);
        try {
            const res = await api.get(`/reniec/dni/${dni.trim()}`);
            if (res.data.success) {
                const d = res.data.data;
                const fn = tipo === 'padre' ? setPadre : tipo === 'madre' ? setMadre : setApoderado;
                fn(prev => ({
                    ...prev,
                    nombres:   d.nombres,
                    apellidos: `${d.apellidoPaterno} ${d.apellidoMaterno}`.trim(),
                    numero_doc: d.dni
                }));
            }
        } finally {
            setSearching(false);
        }
    };

    // ── Helpers ────────────────────────────────────────────────────────────────
    const setM = (k: keyof MatriculaFormData, v: string) =>
        setMatricula(prev => ({ ...prev, [k]: v }));

    const setC = (tipo: 'padre' | 'madre' | 'apoderado', k: keyof ContactoForm, v: string | boolean) => {
        const fn = tipo === 'padre' ? setPadre : tipo === 'madre' ? setMadre : setApoderado;
        fn(prev => ({ ...prev, [k]: v }));
    };

    const buildAlumnoPayload = () => ({
        username: alumno.username, email: alumno.email,
        primer_nombre: alumno.primer_nombre, segundo_nombre: alumno.segundo_nombre,
        apellido_paterno: alumno.apellido_paterno, apellido_materno: alumno.apellido_materno,
        genero: alumno.genero, fecha_nacimiento: alumno.fecha_nacimiento,
        edad: alumno.edad, talla: alumno.talla, peso: alumno.peso,
        telefono: alumno.telefono, direccion: alumno.direccion,
        colegio: alumno.colegio, neurodivergencia: alumno.neurodivergencia,
        terapia_ocupacional: alumno.terapia_ocupacional, seguro: alumno.seguro,
        seguro_privado: alumno.seguro_privado, mensualidad: alumno.mensualidad,
        fecha_ingreso: alumno.fecha_ingreso, fecha_pago: alumno.fecha_pago,
    });

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const errs: Record<string, string> = {};
        if (!alumno.username.trim())         errs.username         = 'El DNI es requerido';
        if (!alumno.primer_nombre.trim())    errs.primer_nombre    = 'Requerido';
        if (!alumno.apellido_paterno.trim()) errs.apellido_paterno = 'Requerido';
        if (!matricula.seccion_id)           errs.seccion_id       = 'Requerido';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setProcessing(true);
        try {
            let estudianteId = alumno.estu_id;
            if (estudianteId) {
                await api.put(`/estudiantes/${estudianteId}`, buildAlumnoPayload());
            } else {
                const res = await api.post('/estudiantes', buildAlumnoPayload());
                estudianteId = res.data.data?.estu_id ?? res.data.estu_id;
            }

            await onSave({ ...matricula, estu_id: String(estudianteId) });

            await Promise.allSettled(
                [
                    { tipo: 'padre',     data: padre },
                    { tipo: 'madre',     data: madre },
                    { tipo: 'apoderado', data: apoderado },
                ]
                .filter(c => c.data.nombres.trim() || c.data.apellidos.trim())
                .map(c => api.post(`/estudiantes/${estudianteId}/contactos`, {
                    parentesco:     c.tipo,
                    nombres:        c.data.nombres,
                    apellidos:      c.data.apellidos,
                    email_contacto: c.data.email_contacto,
                    tipo_doc:       c.data.tipo_doc,
                    numero_doc:     c.data.numero_doc,
                    telefono_1:     c.data.telefono_1,
                    telefono_2:     c.data.telefono_2,
                    estado_civil:   c.data.estado_civil,
                    direccion:      c.data.direccion,
                    departamento:   c.data.departamento,
                    provincia:      c.data.provincia,
                    distrito:       c.data.distrito,
                    es_pagador:     c.data.es_pagador ? 'si' : 'no',
                }))
            );

            onClose();
        } catch (e: any) {
            const flat: Record<string, string> = {};
            for (const [k, v] of Object.entries(e?.response?.data?.errors ?? {})) {
                flat[k] = Array.isArray(v) ? (v as string[])[0] : String(v);
            }
            setErrors(flat);
        } finally {
            setProcessing(false);
        }
    };

    // ── JSX ────────────────────────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 pt-5 pb-3 border-b">
                    <DialogTitle className="text-lg font-bold">Matricular Estudiante</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <Tabs defaultValue="alumno" className="flex flex-col flex-1 overflow-hidden">
                        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 px-4">
                            <TabsTrigger value="alumno"    className={TAB_CLS}>Alumno</TabsTrigger>
                            <TabsTrigger value="padre"     className={TAB_CLS}>Padre</TabsTrigger>
                            <TabsTrigger value="madre"     className={TAB_CLS}>Madre</TabsTrigger>
                            <TabsTrigger value="apoderado" className={TAB_CLS}>Apoderado</TabsTrigger>
                        </TabsList>

                        <TabsContent value="alumno" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                            <AlumnoTab
                                alumno={alumno} setAlumno={setAlumno}
                                matricula={matricula} setM={setM}
                                grados={grados} secciones={secciones} nivelId={nivelId}
                                selectedGrado={selectedGrado} setSelectedGrado={setSelectedGrado}
                                dniSearch={dniSearch} setDniSearch={setDniSearch}
                                onDniSearch={handleDniSearch} searching={searching}
                                errors={errors}
                            />
                        </TabsContent>

                        {(['padre', 'madre', 'apoderado'] as const).map(tipo => {
                            const data = tipo === 'padre' ? padre : tipo === 'madre' ? madre : apoderado;
                            return (
                                <TabsContent key={tipo} value={tipo} className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                                    <ContactoTab
                                        tipo={tipo}
                                        data={data}
                                        onChange={(k, v) => setC(tipo, k, v)}
                                        onSearch={(dni: string) => handleContactoSearch(tipo, dni)}
                                        searching={searching}
                                    />
                                </TabsContent>
                            );
                        })}
                    </Tabs>

                    <DialogFooter className="px-6 py-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-[#00a65a] hover:bg-[#008d4c] text-white"
                        >
                            {processing ? 'Guardando…' : 'Guardar Matrícula'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
