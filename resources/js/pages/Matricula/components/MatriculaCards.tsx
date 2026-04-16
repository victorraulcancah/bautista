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

export default function MatriculaCards({ matriculas, toggling, onToggleBloqueo, onEdit, onHistorial, onReset, onFotocheck, onDelete }: Props) {
    return (
        <div className="md:hidden divide-y divide-neutral-100 overflow-y-auto max-h-[70vh]">
            {matriculas.map((m, idx) => {
                const student = m.estudiante;
                const bloqueado = student?.estado_user === '5';
                return (
                    <div key={m.matricula_id} className={`p-4 flex flex-col gap-3 transition-colors ${bloqueado ? 'bg-red-50' : 'bg-white'}`}>
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className="bg-neutral-100 text-neutral-500 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-neutral-900 capitalize leading-tight">{student?.primer_nombre} {student?.apellido_paterno}</h3>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        <span className="font-bold text-emerald-600 uppercase">{m.seccion?.grado?.nombre_grado ?? '—'}</span>
                                        {' • '}Sección {m.seccion?.nombre ?? '—'}
                                    </p>
                                </div>
                            </div>
                            {student?.user_id && (
                                <Button size="sm" variant="ghost"
                                    className={`h-9 w-9 p-0 rounded-full border ${bloqueado ? 'border-red-200 bg-red-100 text-red-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`}
                                    onClick={() => onToggleBloqueo(m)} disabled={toggling === m.matricula_id}
                                >
                                    {bloqueado ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-neutral-400">DNI</span>
                                <span className="text-neutral-700 font-mono">{student?.doc_numero ?? '—'}</span>
                            </div>
                            <div className="w-px h-6 bg-neutral-200" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-neutral-400">F. Matrícula</span>
                                <span className="text-neutral-700">{m.fecha_matricula ?? '—'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-2 mt-1">
                            {[
                                { icon: <Printer className="h-3.5 w-3.5" />, label: 'Foto', cls: 'border-emerald-100 bg-emerald-50 text-emerald-600', action: () => onFotocheck(m), disabled: false },
                                { icon: <Pencil className="h-3.5 w-3.5" />, label: 'Editar', cls: 'border-neutral-200 text-neutral-600', action: () => onEdit(m), disabled: !student?.estu_id },
                                { icon: <History className="h-3.5 w-3.5" />, label: 'Acceso', cls: 'border-cyan-100 text-cyan-600', action: () => onHistorial(m), disabled: !student?.user_id },
                                { icon: <KeyRound className="h-3.5 w-3.5" />, label: 'Clave', cls: 'border-amber-100 text-amber-600', action: () => onReset(m), disabled: !student?.user_id },
                                { icon: <Trash2 className="h-3.5 w-3.5" />, label: 'Anular', cls: 'border-red-100 text-red-500', action: () => onDelete(m.matricula_id), disabled: false },
                            ].map(({ icon, label, cls, action, disabled }) => (
                                <Button key={label} variant="outline" size="sm" disabled={disabled}
                                    className={`h-10 ${cls} p-0 flex flex-col items-center justify-center`}
                                    onClick={action}
                                >
                                    {icon}
                                    <span className="text-[9px] font-bold">{label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
