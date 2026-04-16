/**
 * EstadoSelector — muestra los 4 opciones de estado para un alumno.
 * Responsabilidad: renderizar y manejar la selección de estado de asistencia.
 */
import { Check, Clock, X, Ban } from 'lucide-react';
import type { EstadoAsistencia } from './types';

interface Props {
    value: EstadoAsistencia;
    onChange: (estado: EstadoAsistencia) => void;
    disabled?: boolean;
}

const OPCIONES: { estado: EstadoAsistencia; icon: React.ReactNode; label: string }[] = [
    { estado: 'P', icon: <Check size={16} strokeWidth={2.5} />,  label: 'Presente' },
    { estado: 'T', icon: <Clock size={16} strokeWidth={2} />,    label: 'Atrasado' },
    { estado: 'F', icon: <X    size={16} strokeWidth={2.5} />,   label: 'Ausente' },
    { estado: 'J', icon: <Ban  size={16} strokeWidth={2} />,     label: 'Justificado' },
];

export function EstadoSelector({ value, onChange, disabled }: Props) {
    return (
        <div className="flex items-center justify-around w-full">
            {OPCIONES.map(({ estado, icon, label }) => {
                const isActive = value === estado;
                return (
                    <button
                        key={estado}
                        title={label}
                        disabled={disabled}
                        onClick={() => onChange(estado)}
                        className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-xs
                            ${isActive
                                ? estado === 'P' ? 'text-emerald-600 font-bold'
                                : estado === 'T' ? 'text-amber-500 font-bold'
                                : estado === 'F' ? 'text-rose-600 font-bold'
                                : 'text-blue-500 font-bold'
                                : 'text-gray-300 hover:text-gray-500'
                            }
                            ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {icon}
                    </button>
                );
            })}
        </div>
    );
}
