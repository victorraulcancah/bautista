import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Timer, Send, RefreshCw, Star, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Props {
    puzzle: {
        actividad_id: number;
        nombre_actividad: string;
        descripcion_corta: string;
        imagen: string;
    }
}

const PuzzleVer = ({ puzzle }: Props) => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        let interval: any = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds((seconds) => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        setIsActive(true);
        setIsFinished(false);
    };

    const handleFinish = () => {
        setIsActive(false);
        setIsFinished(true);
        // Aquí se enviaría la API para guardar el récord
    };

    return (
        <AppSidebarLayout>
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <Head title={`Resolviendo: ${puzzle.nombre_actividad}`} />
            
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Link 
                        href="/alumno/puzzles" 
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                    >
                        <ArrowLeft size={20} /> Volver al listado
                    </Link>
                    
                    <div className="flex items-center gap-3 bg-white px-6 py-2 rounded-2xl shadow-sm border border-slate-100">
                        <Timer size={20} className={isActive ? "text-indigo-600 animate-pulse" : "text-slate-400"} />
                        <span className="text-2xl font-mono font-bold text-slate-800">{formatTime(seconds)}</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                        <h1 className="text-2xl font-extrabold text-slate-900">{puzzle.nombre_actividad}</h1>
                        <p className="text-slate-500">{puzzle.descripcion_corta || 'Completa la imagen lo antes posible.'}</p>
                    </div>

                    <div className="p-8 md:p-12 text-center">
                        <div className="relative inline-block group">
                            <div className={`transition-all duration-700 ${isActive ? 'p-1 bg-indigo-100 rounded-lg shadow-inner' : ''}`}>
                                <img 
                                    src={`/storage/${puzzle.imagen}`} 
                                    alt="Puzzle" 
                                    className={`max-w-full h-auto rounded-lg shadow-lg border-4 border-white transition-all duration-500 ${!isActive ? 'grayscale blur-sm' : ''}`}
                                    style={{ maxHeight: '500px' }}
                                />
                            </div>
                            
                            {!isActive && !isFinished && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Button 
                                        onClick={handleStart}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-xl rounded-2xl shadow-2xl hover:scale-105 transition-transform"
                                    >
                                        <Play size={24} className="mr-3" /> Comenzar Desafío
                                    </Button>
                                </div>
                            )}

                            {isFinished && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 text-center animate-in zoom-in duration-300">
                                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Star className="text-yellow-600 w-10 h-10 fill-current" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 mb-2">¡Completado!</h3>
                                        <p className="text-slate-600 mb-8">Tu tiempo final fue de <span className="font-bold text-indigo-600">{formatTime(seconds)}</span></p>
                                        <div className="flex gap-4 justify-center">
                                            <Button onClick={() => window.location.href = '/alumno/puzzles'} variant="outline" className="rounded-xl px-8">
                                                Cerrar
                                            </Button>
                                            <Button onClick={handleStart} className="rounded-xl px-8 bg-indigo-600">
                                                <RefreshCw size={18} className="mr-2" /> Reintentar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {isActive && (
                        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-center">
                            <Button 
                                onClick={handleFinish}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-6 text-lg rounded-2xl shadow-lg hover:shadow-emerald-200 transition-all font-bold"
                            >
                                <Send size={20} className="mr-3" /> ¡He terminado el rompecabezas!
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </AppSidebarLayout>
    );
};

export default PuzzleVer;
