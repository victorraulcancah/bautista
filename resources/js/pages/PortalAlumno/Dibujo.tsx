import { Head, Link } from '@inertiajs/react';
import { Eraser, RefreshCw, Save, ArrowLeft, Paintbrush, Palette } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const COLORS = [
    '#0000ff', '#009fff', '#0fffff', '#bfffff', '#000000',
    '#333333', '#666666', '#999999', '#ffcc66', '#ffcc00',
    '#ffff00', '#ffff99', '#003300', '#555000', '#00ff00',
    '#99ff99', '#f00000', '#ff6600', '#ff9933', '#f5deb3',
    '#330000', '#663300', '#cc6600', '#deb887', '#aa0fff',
    '#cc66cc', '#ff66ff', '#ff99ff', '#e8c4e8', '#ffffff'
];

const BRUSH_SIZES = [1, 2, 3, 4, 5, 7];

export default function Dibujo({ actividad }: { actividad: any }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(2);
    const [isEraser, setIsEraser] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
return;
}

        const ctx = canvas.getContext('2d');

        if (!ctx) {
return;
}

        // Background white
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;

        if (!canvas) {
return;
}

        const ctx = canvas.getContext('2d');

        if (!ctx) {
return;
}

        const rect = canvas.getBoundingClientRect();
        const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
        const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = isEraser ? '#ffffff' : color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) {
return;
}

        const canvas = canvasRef.current;

        if (!canvas) {
return;
}

        const ctx = canvas.getContext('2d');

        if (!ctx) {
return;
}

        const rect = canvas.getBoundingClientRect();
        const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
        const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;

        if (!canvas) {
return;
}

        const ctx = canvas.getContext('2d');

        if (!ctx) {
return;
}

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const handleSave = async () => {
        const canvas = canvasRef.current;

        if (!canvas) {
return;
}
        
        setSaving(true);
        const dataUrl = canvas.toDataURL('image/png');
        
        try {
            await api.post(`/alumno/dibujo/guardar`, {
                actividad_id: actividad?.actividad_id,
                image: dataUrl
            });
            alert('¡Dibujo guardado con éxito!');
        } catch (error) {
            console.error('Error saving drawing:', error);
            alert('Error al guardar el dibujo.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8 space-y-6 select-none font-sans">
            <Head title="Lienzo de Dibujo" />

            <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50">
                <div className="flex items-center space-x-4">
                    <Link href={`/alumno/actividad/${actividad?.actividad_id}`} className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 leading-none">Lienzo para Dibujar</h1>
                        <p className="text-sm font-bold text-purple-600 uppercase tracking-widest">{actividad?.nombre_actividad || 'Actividad Libre'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={clearCanvas} className="rounded-2xl border-2 font-bold px-6 h-12">
                        <RefreshCw className="w-5 h-5 mr-2" /> Limpiar
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="rounded-2xl bg-indigo-600 hover:bg-black font-black uppercase tracking-widest px-8 h-12 shadow-lg shadow-indigo-200">
                        <Save className="w-5 h-5 mr-2" /> {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1">
                {/* Tools Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* Palette */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 space-y-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                            <Palette className="w-4 h-4 mr-2" /> Paleta de Colores
                        </h3>
                        <div className="grid grid-cols-6 gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => {
 setColor(c); setIsEraser(false); 
}}
                                    className={`w-10 h-10 rounded-xl border-4 transition-transform hover:scale-110 active:scale-95 ${color === c && !isEraser ? 'border-indigo-600 scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Brushes */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 space-y-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                            <Paintbrush className="w-4 h-4 mr-2" /> Grosor del Pincel
                        </h3>
                        <div className="flex items-center justify-between px-2">
                            {BRUSH_SIZES.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setBrushSize(size)}
                                    className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${brushSize === size ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                >
                                    <div 
                                        className="rounded-full bg-current" 
                                        style={{ width: size * 2, height: size * 2 }} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* eraser toggle */}
                    <button
                        onClick={() => setIsEraser(!isEraser)}
                        className={`w-full p-6 rounded-[2rem] shadow-xl transition-all flex items-center justify-center font-black uppercase tracking-widest ${isEraser ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-white text-gray-600 shadow-gray-200/50 hover:bg-gray-50'}`}
                    >
                        <Eraser className="w-6 h-6 mr-3" /> {isEraser ? 'Borrador Activado' : 'Usar Borrador'}
                    </button>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border-8 border-white overflow-hidden relative group">
                    <canvas
                        ref={canvasRef}
                        width={900}
                        height={600}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-full cursor-crosshair touch-none"
                    />
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="bg-black/80 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                            Área de Trabajo - 900x600
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
