import { useEffect, useState } from 'react';
import { Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import ResourceTable, { Column } from '@/components/shared/ResourceTable';
import { ReqLabel } from '@/components/shared/FormLabels';
import http from '@/services/http';
import type { Docente } from '../hooks/useDocentes';
import { nombreCompleto } from '../hooks/useDocentes';

type RelItem = { id: number; nombre: string };

type Asignacion = {
    id:       number;
    apertura: RelItem | null;
    curso:    RelItem | null;
    nivel:    RelItem | null;
    grado:    RelItem | null;
    seccion:  RelItem | null;
};

type Props = {
    open:    boolean;
    onClose: () => void;
    docente: Docente | null;
};

export default function AsignarCursosModal({ open, onClose, docente }: Props) {
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [, setAperturas] = useState<RelItem[]>([]);
    const [niveles,      setNiveles]      = useState<RelItem[]>([]);
    const [grados,       setGrados]       = useState<RelItem[]>([]);
    const [gradosFilt,   setGradosFilt]   = useState<RelItem[]>([]);
    const [secciones,    setSecciones]    = useState<RelItem[]>([]);
    const [seccionesFilt,setSeccionesFilt]= useState<RelItem[]>([]);
    const [cursos,       setCursos]       = useState<RelItem[]>([]);
    const [cursosFilt,   setCursosFilt]   = useState<RelItem[]>([]);
    const [form, setForm] = useState({ apertura_id: '', nivel_id: '', grado_id: '', seccion_id: '', curso_id: '' });
    const [saving,  setSaving]  = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !docente) return;
        setLoading(true);
        Promise.all([
            http.get(`/docentes/${docente.docente_id}/cursos`),
            http.get('/matriculas/aperturas?per_page=500'),
            http.get('/niveles?per_page=500'),
            http.get('/grados?per_page=500'),
            http.get('/secciones?per_page=500'),
            http.get('/cursos?per_page=500'),
        ]).then(([asig, ap, niv, gr, sec, cur]) => {
            setAsignaciones(asig.data);
            setAperturas((ap.data?.data ?? ap.data).map((a: any) => ({ id: a.apertura_id, nombre: a.nombre })));
            setNiveles((niv.data?.data ?? niv.data).map((n: any) => ({ id: n.nivel_id, nombre: n.nombre_nivel })));
            const grList = (gr.data?.data ?? gr.data).map((g: any) => ({ id: g.grado_id, nombre: g.nombre_grado, nivel_id: g.nivel_id }));
            setGrados(grList);
            const secList = (sec.data?.data ?? sec.data).map((s: any) => ({ id: s.seccion_id, nombre: s.nombre, grado_id: s.id_grado }));
            setSecciones(secList);
            const curList = (cur.data?.data ?? cur.data).map((c: any) => ({ id: c.curso_id, nombre: c.nombre, nivel_id: c.nivel_academico_id, grado_id: c.grado_academico }));
            setCursos(curList);
        }).finally(() => setLoading(false));
        setForm({ apertura_id: '', nivel_id: '', grado_id: '', seccion_id: '', curso_id: '' });
    }, [open, docente]);

    const setF = (key: keyof typeof form, val: string) => {
        setForm(prev => {
            const next = { ...prev, [key]: val };
            if (key === 'nivel_id') {
                next.grado_id   = '';
                next.seccion_id = '';
                next.curso_id   = '';
                setGradosFilt((grados as any[]).filter(g => String(g.nivel_id) === val));
                setCursosFilt((cursos as any[]).filter(c => String(c.nivel_id) === val));
                setSeccionesFilt([]);
            }
            if (key === 'grado_id') {
                next.seccion_id = '';
                next.curso_id   = '';
                setSeccionesFilt((secciones as any[]).filter(s => String(s.grado_id) === val));
                // Ver cursos del nivel con o sin grado asignado (pool del nivel)
                setCursosFilt((cursos as any[]).filter(c => 
                    String(c.nivel_id) === next.nivel_id && 
                    (!c.grado_id || String(c.grado_id) === val)
                ));
            }
            return next;
        });
    };

    const handleAdd = async () => {
        if (!docente) return;
        setSaving(true);
        try {
            const payload: Record<string, number> = {};
            if (form.apertura_id) payload.apertura_id = Number(form.apertura_id);
            if (form.nivel_id)    payload.nivel_id    = Number(form.nivel_id);
            if (form.grado_id)    payload.grado_id    = Number(form.grado_id);
            if (form.seccion_id)  payload.seccion_id  = Number(form.seccion_id);
            if (form.curso_id)    payload.curso_id    = Number(form.curso_id);
            const res = await http.post(`/docentes/${docente.docente_id}/cursos`, payload);
            setAsignaciones(prev => [res.data, ...prev]);
            setForm({ apertura_id: '', nivel_id: '', grado_id: '', seccion_id: '', curso_id: '' });
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (asig: Asignacion) => {
        if (!docente || !confirm('¿Quitar esta asignación?')) return;
        await http.delete(`/docentes/${docente.docente_id}/cursos/${asig.id}`);
        setAsignaciones(prev => prev.filter(a => a.id !== asig.id));
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="w-[95vw] sm:max-w-3xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Asignar Cursos — {docente ? nombreCompleto(docente) : ''}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="lista" className="p-6 pt-2">
                    <TabsList className="w-full">
                        <TabsTrigger value="lista"   className="flex-1">Lista</TabsTrigger>
                        <TabsTrigger value="agregar" className="flex-1">Agregar</TabsTrigger>
                    </TabsList>

                    {/* ── Tab Lista ── */}
                    <TabsContent value="lista" className="mt-3">
                        {loading ? (
                            <p className="py-8 text-center text-sm text-gray-400">Cargando...</p>
                        ) : asignaciones.length === 0 ? (
                            <p className="py-8 text-center text-sm text-gray-400">Sin asignaciones registradas.</p>
                        ) : (
                            <ResourceTable
                                rows={{
                                    data:         asignaciones,
                                    current_page: 1,
                                    last_page:    1,
                                    per_page:     asignaciones.length,
                                    total:        asignaciones.length,
                                    from:         1,
                                    to:           asignaciones.length,
                                }}
                                getKey={(a) => a.id}
                                onDelete={(a) => handleRemove(a)}
                                onPageChange={() => {}}
                                columns={[
                                    { label: '#', className: 'w-10 text-center text-neutral-400', render: (_, i) => i + 1 },
                                    { label: 'Información Académica', render: (a) => (
                                        <div className="flex flex-col text-left space-y-0.5">
                                            <div className="flex flex-wrap gap-1">
                                                <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap font-medium">🏷️ {a.nivel?.nombre ?? '—'}</span>
                                                <span className="bg-[#00a65a]/10 text-[#00a65a] px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap font-bold">🏫 {a.grado?.nombre ?? '—'} - {a.seccion?.nombre ?? '—'}</span>
                                            </div>
                                            <span className="font-bold text-neutral-900 text-sm">{a.curso?.nombre ?? '—'}</span>
                                            {a.apertura && (
                                                <span className="text-[10px] text-neutral-400 italic">Periodicidad: {a.apertura.nombre}</span>
                                            )}
                                        </div>
                                    )},
                                ]}
                            />
                        )}
                    </TabsContent>

                    {/* ── Tab Agregar ── */}
                    <TabsContent value="agregar" className="mt-3">
                        <div className="rounded-lg border p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <ReqLabel>Nivel</ReqLabel>
                                    <Select value={form.nivel_id} onValueChange={(v) => setF('nivel_id', v)}>
                                        <SelectTrigger className="h-9"><SelectValue placeholder="-- Seleccionar --" /></SelectTrigger>
                                        <SelectContent>
                                            {niveles.map(n => <SelectItem key={n.id} value={String(n.id)}>{n.nombre}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <ReqLabel>Grado</ReqLabel>
                                    <Select value={form.grado_id} onValueChange={(v) => setF('grado_id', v)} disabled={!form.nivel_id}>
                                        <SelectTrigger className="h-9"><SelectValue placeholder="-- Seleccionar --" /></SelectTrigger>
                                        <SelectContent>
                                            {gradosFilt.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nombre}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <ReqLabel>Curso</ReqLabel>
                                    <Select value={form.curso_id} onValueChange={(v) => setF('curso_id', v)} disabled={!form.grado_id}>
                                        <SelectTrigger className="h-9"><SelectValue placeholder="-- Seleccionar --" /></SelectTrigger>
                                        <SelectContent>
                                            {cursosFilt.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <ReqLabel>Sección</ReqLabel>
                                    <Select value={form.seccion_id} onValueChange={(v) => setF('seccion_id', v)} disabled={!form.grado_id}>
                                        <SelectTrigger className="h-9"><SelectValue placeholder="-- Seleccionar --" /></SelectTrigger>
                                        <SelectContent>
                                            {seccionesFilt.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <Button
                                    className="flex-1 bg-[#00a65a] hover:bg-[#008d4c] text-white font-bold order-1 sm:order-2"
                                    disabled={saving || !form.curso_id}
                                    onClick={handleAdd}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? 'Guardando...' : 'Asignar Curso'}
                                </Button>
                                <Button type="button" variant="outline" className="flex-1 order-2 sm:order-1 font-bold" onClick={onClose}>
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
