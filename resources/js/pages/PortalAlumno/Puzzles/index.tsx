import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Trophy, Clock, Play, HelpCircle } from 'lucide-react';

interface Puzzle {
    actividad_id: number;
    nombre_actividad: string;
    descripcion_corta: string;
    imagen: string;
    tiempo?: string;
    intentos?: number;
    ayuda?: string;
}

interface Props {
    puzzles: Puzzle[];
}

const PuzzleIndex = ({ puzzles }: Props) => {
    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <Head title="Mis Rompecabezas" />
            
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">🧩 Mis Rompecabezas</h1>
                    <p className="text-gray-600">Mejora tus tiempos y conviértete en un experto resolviendo desafíos.</p>
                </header>

                {puzzles.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="text-indigo-600 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay rompecabezas asignados</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Parece que aún no tienes actividades de rompecabezas asignadas a tus cursos actuales.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {puzzles.map((puzzle) => (
                            <div key={puzzle.actividad_id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group">
                                <div className="relative h-48 overflow-hidden bg-gray-200">
                                    <img 
                                        src={puzzle.imagen ? `/storage/${puzzle.imagen}` : '/images/placeholder-puzzle.jpg'} 
                                        alt={puzzle.nombre_actividad}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Link 
                                            href={`/alumno/puzzles/${puzzle.actividad_id}`}
                                            className="bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg hover:bg-indigo-50 transition-colors"
                                        >
                                            <Play size={18} /> Jugar ahora
                                        </Link>
                                    </div>
                                </div>
                                
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                                        {puzzle.nombre_actividad}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 italic">
                                        {puzzle.descripcion_corta || 'Resuelve este rompecabezas lo más rápido posible.'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock size={16} className="text-indigo-500" />
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400">Mejor Tiempo</p>
                                                <p className="font-mono">{puzzle.tiempo || '--:--'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Trophy size={16} className="text-amber-500" />
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400">Intentos</p>
                                                <p className="font-mono">{puzzle.intentos || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PuzzleIndex;
