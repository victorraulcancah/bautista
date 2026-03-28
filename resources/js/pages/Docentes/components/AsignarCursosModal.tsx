import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
    const [aperturas,    setAperturas]    = useState<RelItem[]>([]);
    const [niveles,      setNiveles]      = useState<RelItem[]>([]);
    const [grados,       setGrados]       = useState<RelItem[]>([]);
    const [secciones,    setSecciones]    = useState<RelItem[]>([]);
    const [cursos,       setCursos]       = useState<RelItem[]>([]);

    const [form, setForm] = useState({ apertura_id: '', nivel_id: '', grado_id: '', seccion_id: '', curso_id: '' });
    const [saving,   setSaving]   = useState(false);
    const [loading,  setLoading]  = useState(false);

    useEffect(() => {
        if (!open || !docente) return;

        setLoading(true);
        Promise.all([
            http.get(`/docentes/${docente.docente_id}/cursos`),
            http.get('/matriculas/aperturas'),
            http.get('/niveles'),
            http.get('/grados'),
            http.get('/secciones'),
            http.get('/cursos'),
        ]).then(([asig, ap, niv, gr, sec, cur]) => {
            setAsignaciones(asig.data);
            const apData = ap.data?.data ?? ap.data;
            setAperturas(apData.map((a: any) => ({ id: a.apertura_id, nombre: a.nombre })));
            const nivData = niv.data?.data ?? niv.data;
            setNiveles(nivData.map((n: any) => ({ id: n.nivel_id, nombre: n.nombre_nivel })));
            const grData = gr.data?.data ?? gr.data;
            setGrados(grData.map((g: any) => ({ id: g.grado_id, nombre: g.nombre_grado })));
            const secData = sec.data?.data ?? sec.data;
            setSecciones(secData.map((s: any) => ({ id: s.seccion_id, nombre: s.nombre })));
            const curData = cur.data?.data ?? cur.data;
            setCursos(curData.map((c: any) => ({ id: c.curso_id, nombre: c.nombre })));
        }).finally(() => setLoading(false));

        setForm({ apertura_id: '', nivel_id: '', grado_id: '', seccion_id: '', curso_id: '' });
    }, [open, docente]);

    const handleAdd = async () => {
        if (!docente) return;
        setSaving(true);
        try {
            const payload: Record<string, number | undefined> = {};
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

    const setF = (key: keyof typeof form, val: string) => setForm(prev => ({ ...prev, [key]: val }));

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Asignar Cursos — {docente ? nombreCompleto(docente) : ''}</DialogTitle>
                </DialogHeader>

                {/* Form */}
                <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nueva asignación</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Apertura / Año</Label>
                            <Select value={form.apertura_id} onValueChange={(v) => setF('apertura_id', v)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    {aperturas.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nivel</Label>
                            <Select value={form.nivel_id} onValueChange={(v) => setF('nivel_id', v)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    {niveles.map(n => <SelectItem key={n.id} value={String(n.id)}>{n.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Grado</Label>
                            <Select value={form.grado_id} onValueChange={(v) => setF('grado_id', v)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    {grados.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Sección</Label>
                            <Select value={form.seccion_id} onValueChange={(v) => setF('seccion_id', v)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    {secciones.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Curso</Label>
                            <Select value={form.curso_id} onValueChange={(v) => setF('curso_id', v)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    {cursos.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                className="h-8 w-full text-xs bg-[#00a65a] hover:bg-[#008d4c] text-white"
                                disabled={saving || (!form.curso_id && !form.nivel_id)}
                                onClick={handleAdd}
                            >
                                {saving ? 'Agregando...' : 'Agregar'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border overflow-hidden">
                    {loading ? (
                        <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>
                    ) : asignaciones.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-400">Sin asignaciones registradas.</p>
                    ) : (
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-[#00a65a] text-white">
                                    <th className="px-3 py-2 text-left">Apertura</th>
                                    <th className="px-3 py-2 text-left">Nivel</th>
                                    <th className="px-3 py-2 text-left">Grado</th>
                                    <th className="px-3 py-2 text-left">Sección</th>
                                    <th className="px-3 py-2 text-left">Curso</th>
                                    <th className="px-3 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {asignaciones.map(a => (
                                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-3 py-2">{a.apertura?.nombre ?? '—'}</td>
                                        <td className="px-3 py-2">{a.nivel?.nombre ?? '—'}</td>
                                        <td className="px-3 py-2">{a.grado?.nombre ?? '—'}</td>
                                        <td className="px-3 py-2">{a.seccion?.nombre ?? '—'}</td>
                                        <td className="px-3 py-2">{a.curso?.nombre ?? '—'}</td>
                                        <td className="px-3 py-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-6 text-red-500 hover:bg-red-50"
                                                onClick={() => handleRemove(a)}
                                            >
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
