import { Lock, Unlock, Pencil, Printer, History, Trash2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Matricula } from '../hooks/useMatricula';

interface Props {
    matriculas: Matricula[];
    toggling: number | null;
    onToggleBloqueo: (m: Matricula) => void;
    onEdit: (m: Matricula) => void;
    onHistorial: (m: Matricula) => void;
    onReset: (m: Matricula) => void;
    onFotocheck: (m: Matricula) => void;
    onDelete: (id: number) => void;
}

export default function MatriculaTable({ matriculas, toggling, onToggleBloqueo, onEdit, onHistorial, onReset, onFotocheck, onDelete }: Props) {
    return (
        <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[60vh]">
            <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                    <tr className="bg-[#00a65a]">
                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">#</th>
                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Grado / Sección</th>
                        <th className="px-4 py-3 text-left text-white text-xs font-semibold uppercase">Nombre Completo</th>
                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">DNI</th>
                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase hidden lg:table-cell">Matriculado</th>
                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase">Estado</th>
                        <th className="px-4 py-3 text-center text-white text-xs font-semibold uppercase w-[220px]">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {matriculas.map((m, idx) => {
                        const bloqueado = m.estudiante?.estado_user === '5';
                        const student = m.estudiante;
                        const nombreCompleto = [
                            student?.primer_nombre,
                            student?.segundo_nombre,
                            student?.apellido_paterno,
                            student?.apellido_materno,
                        ].filter(Boolean).join(' ');

                        return (
                            <tr key={m.matricula_id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${bloqueado ? 'bg-red-50' : ''}`}>
                                <td className="px-4 py-4 text-center text-neutral-400 font-mono text-xs">{idx + 1}</td>
                                <td className="px-4 py-4 text-center">
                                    {m.seccion ? (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-neutral-900 leading-tight">{m.seccion.grado?.nombre_grado ?? '—'}</span>
                                            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full inline-block mt-1 mx-auto">Secc. {m.seccion.nombre}</span>
                                        </div>
                                    ) : <span className="italic text-neutral-400 text-xs">Sin sección</span>}
                                </td>
                                <td className="px-4 py-4 text-left">
                                    <span className="font-semibold text-neutral-900 capitalize">{nombreCompleto || '—'}</span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className="font-mono text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{student?.doc_numero ?? '—'}</span>
                                </td>
                                <td className="px-4 py-4 text-center text-xs text-neutral-500 hidden lg:table-cell">{m.fecha_matricula ?? '—'}</td>
                                <td className="px-4 py-4 text-center">
                                    {student?.user_id ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Button size="sm" variant="ghost"
                                                className={`h-9 w-9 p-0 rounded-full ${bloqueado ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-emerald-600 hover:bg-emerald-100'}`}
                                                onClick={() => onToggleBloqueo(m)} disabled={toggling === m.matricula_id}
                                                title={bloqueado ? 'Desbloquear' : 'Bloquear'}
                                            >
                                                {bloqueado ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                            </Button>
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${bloqueado ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {bloqueado ? 'Cerrado' : 'Activo'}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] bg-neutral-100 text-neutral-400 px-2 py-1 rounded-full uppercase font-bold">Sin cuenta</span>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50" title="Fotocheck" onClick={() => onFotocheck(m)}><Printer className="h-3.5 w-3.5" /></Button>
                                        <div className="w-px h-4 bg-neutral-200 mx-1" />
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-indigo-500 hover:bg-indigo-50" title="Editar" onClick={() => onEdit(m)} disabled={!student?.estu_id}><Pencil className="h-3.5 w-3.5" /></Button>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-cyan-600 hover:bg-cyan-50" title="Historial" onClick={() => onHistorial(m)} disabled={!student?.user_id}><History className="h-3.5 w-3.5" /></Button>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50" title="Reset Clave" onClick={() => onReset(m)} disabled={!student?.user_id}><KeyRound className="h-3.5 w-3.5" /></Button>
                                        <div className="w-px h-4 bg-neutral-200 mx-1" />
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50" title="Anular" onClick={() => onDelete(m.matricula_id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
