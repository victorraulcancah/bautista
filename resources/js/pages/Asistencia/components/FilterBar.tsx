import { useState, useEffect } from 'react';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Filter, Search } from 'lucide-react';
import api from '@/lib/api';

interface Option {
    id: number;
    nombre: string;
}

interface FilterBarProps {
    search: string;
    onSearchChange: (v: string) => void;
    onFilterChange: (filters: {
        nivel_id?: string;
        grado_id?: string;
        seccion_id?: string;
        anio?: string;
    }) => void;
    active: boolean;
}

export default function FilterBar({ search, onSearchChange, onFilterChange, active }: FilterBarProps) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const [niveles, setNiveles] = useState<Option[]>([]);
    const [grados, setGrados] = useState<Option[]>([]);
    const [secciones, setSecciones] = useState<Option[]>([]);

    const [selectedAnio, setSelectedAnio] = useState<string>(String(currentYear));
    const [selectedLevel, setSelectedLevel] = useState<string>('all');
    const [selectedGrade, setSelectedGrade] = useState<string>('all');
    const [selectedSection, setSelectedSection] = useState<string>('all');

    useEffect(() => {
        if (active) {
            loadNiveles();
        }
    }, [active]);

    const loadNiveles = async () => {
        try {
            const res = await api.get('/niveles');
            const data = (res.data.data ?? res.data).map((n: any) => ({
                id: n.nivel_id,
                nombre: n.nombre_nivel
            }));
            setNiveles(data);
        } catch (e) {
            console.error('Error loading niveles', e);
        }
    };

    const loadGrados = async (nivelId: string) => {
        try {
            const res = await api.get('/grados', { params: { nivel_id: nivelId, per_page: 100 } });
            const data = (res.data.data ?? res.data).map((g: any) => ({
                id: g.grado_id,
                nombre: g.nombre_grado
            }));
            setGrados(data);
        } catch (e) {
            console.error('Error loading grados', e);
        }
    };

    const loadSecciones = async (gradoId: string) => {
        try {
            const secRes = await api.get('/secciones', { params: { grado_id: gradoId, per_page: 100 } });
            const secData = (secRes.data.data ?? secRes.data).map((s: any) => ({
                id: s.seccion_id,
                nombre: s.nombre
            }));
            setSecciones(secData);
        } catch (e) {
            console.error('Error loading secciones', e);
        }
    };

    const handleAnioChange = (val: string) => {
        setSelectedAnio(val);
        updateFilters(val, selectedLevel, selectedGrade, selectedSection);
    };

    const handleLevelChange = (val: string) => {
        setSelectedLevel(val);
        setSelectedGrade('all');
        setSelectedSection('all');
        setGrados([]);
        setSecciones([]);
        if (val !== 'all') loadGrados(val);
        updateFilters(selectedAnio, val, 'all', 'all');
    };

    const handleGradeChange = (val: string) => {
        setSelectedGrade(val);
        setSelectedSection('all');
        setSecciones([]);
        if (val !== 'all') loadSecciones(val);
        updateFilters(selectedAnio, selectedLevel, val, 'all');
    };

    const updateFilters = (ani: string, lvl: string, grd: string, sec: string) => {
        onFilterChange({
            anio: ani,
            nivel_id: lvl === 'all' ? undefined : lvl,
            grado_id: grd === 'all' ? undefined : grd,
            seccion_id: sec === 'all' ? undefined : sec,
        });
    };

    const reset = () => {
        setSelectedAnio(String(currentYear));
        setSelectedLevel('all');
        setSelectedGrade('all');
        setSelectedSection('all');
        setGrados([]);
        setSecciones([]);
        onFilterChange({ anio: String(currentYear) });
        onSearchChange('');
    };

    if (!active) return null;

    return (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
            {/* Buscador Integrado */}
            <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar por nombre o DNI..."
                    className="pl-9 h-10 rounded-xl bg-white border-neutral-200 text-sm font-medium"
                />
            </div>

            {/* Año selector */}
            <div className="flex flex-col gap-0.5">
                <Label className="text-[9px] font-black text-neutral-400 ml-1 uppercase tracking-widest">Año</Label>
                <Select value={selectedAnio} onValueChange={handleAnioChange}>
                    <SelectTrigger className="h-10 w-[90px] rounded-xl bg-white border-neutral-200 text-xs font-bold">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Nivel selector */}
            <div className="flex flex-col gap-0.5">
                <Label className="text-[9px] font-black text-neutral-400 ml-1 uppercase tracking-widest">Nivel</Label>
                <Select value={selectedLevel} onValueChange={handleLevelChange}>
                    <SelectTrigger className="h-10 w-[120px] rounded-xl bg-white border-neutral-200 text-xs font-bold">
                        <SelectValue placeholder="Nivel" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Cualquiera</SelectItem>
                        {niveles.map(n => <SelectItem key={n.id} value={String(n.id)}>{n.nombre}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Grado selector */}
            <div className="flex flex-col gap-0.5">
                <Label className="text-[9px] font-black text-neutral-400 ml-1 uppercase tracking-widest">Grado</Label>
                <Select value={selectedGrade} onValueChange={handleGradeChange} disabled={selectedLevel === 'all'}>
                    <SelectTrigger className="h-10 w-[120px] rounded-xl bg-white border-neutral-200 text-xs font-bold">
                        <SelectValue placeholder="Grado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Cualquiera</SelectItem>
                        {grados.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nombre}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Sección selector */}
            <div className="flex flex-col gap-0.5">
                <Label className="text-[9px] font-black text-neutral-400 ml-1 uppercase tracking-widest">Sección</Label>
                <Select value={selectedSection} onValueChange={(val) => {
                    setSelectedSection(val);
                    updateFilters(selectedAnio, selectedLevel, selectedGrade, val);
                }} disabled={selectedGrade === 'all'}>
                    <SelectTrigger className="h-10 w-[100px] rounded-xl bg-white border-neutral-200 text-xs font-bold">
                        <SelectValue placeholder="Secc." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {secciones.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <Button 
                variant="ghost" 
                size="icon"
                onClick={reset}
                className="h-10 w-10 mt-4 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                title="Limpiar filtros"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
