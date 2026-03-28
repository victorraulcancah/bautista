import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { CalendarDays, QrCode, Search, Eye, Download, GraduationCap, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Asistencia', href: '/asistencia' },
];

export default function AsistenciaIndex() {
    const [tipo, setTipo] = useState<'E' | 'D'>('E');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    // Monthly history modal
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));

    useEffect(() => {
        loadUsers();
    }, [tipo, page, search]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/asistencia/usuarios', {
                params: { tipo, search, page }
            });
            setRows(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openHistory = async (user: any) => {
        setSelectedUser(user);
        setShowModal(true);
        loadHistory(user.estu_id || user.docente_id, selectedMonth);
    };

    const loadHistory = async (id: number, month: string) => {
        setHistoryLoading(true);
        try {
            const res = await api.get(`/asistencia/usuario/${id}`, {
                params: { tipo, mes: month }
            });
            setHistory(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (selectedUser) {
            loadHistory(selectedUser.estu_id || selectedUser.docente_id, selectedMonth);
        }
    }, [selectedMonth]);

    const months = [
        { v: '1', l: 'Enero' }, { v: '2', l: 'Febrero' }, { v: '3', l: 'Marzo' },
        { v: '4', l: 'Abril' }, { v: '5', l: 'Mayo' }, { v: '6', l: 'Junio' },
        { v: '7', l: 'Julio' }, { v: '8', l: 'Agosto' }, { v: '9', l: 'Septiembre' },
        { v: '10', l: 'Octubre' }, { v: '11', l: 'Noviembre' }, { v: '12', l: 'Diciembre' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Asistencia" />
            
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-neutral-950 tracking-tight flex items-center">
                            <CalendarDays className="mr-3 h-8 w-8 text-indigo-600" />
                            GESTIÓN <span className="ml-2 text-indigo-600">ASISTENCIA</span>
                        </h1>
                        <p className="text-sm text-neutral-400 font-medium">Administración y control de accesos institucionales.</p>
                    </div>

                    <Link href="/asistencia/scanner">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 gap-2">
                            <QrCode className="h-5 w-5" />
                            ABRIR SCANNER QR
                        </Button>
                    </Link>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-3xl border border-neutral-200 shadow-sm">
                    <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
                        <button 
                            onClick={() => { setTipo('E'); setPage(1); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${tipo === 'E' ? 'bg-indigo-600 text-white' : 'text-neutral-500 hover:text-white'}`}
                        >
                            <GraduationCap className="h-4 w-4" /> ESTUDIANTES
                        </button>
                        <button 
                            onClick={() => { setTipo('D'); setPage(1); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${tipo === 'D' ? 'bg-amber-600 text-white' : 'text-neutral-500 hover:text-white'}`}
                        >
                            <UserCheck className="h-4 w-4" /> DOCENTES
                        </button>
                    </div>

                    <div className="relative col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <Input 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, apellidos o DNI..."
                            className="w-full bg-neutral-50 border-neutral-200 pl-12 h-14 rounded-2xl text-sm focus:ring-indigo-500/20 focus:border-indigo-500/50"
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-neutral-50">
                            <TableRow className="hover:bg-transparent border-neutral-100">
                                <TableHead className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest pl-6">DNI</TableHead>
                                <TableHead className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest">Nombres y Apellidos</TableHead>
                                <TableHead className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest text-center">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-xs font-bold">CARGANDO REGISTROS...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : rows?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-64 text-center text-neutral-500">
                                        No se encontraron resultados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows?.data?.map((item: any) => (
                                    <TableRow key={item.estu_id || item.docente_id} className="border-neutral-50 hover:bg-neutral-50/50">
                                        <TableCell className="pl-6 font-mono text-indigo-600">{item.perfil?.doc_numero}</TableCell>
                                        <TableCell>
                                            <div className="font-bold text-neutral-900 uppercase text-sm tracking-tight">{item.perfil?.apellido_paterno} {item.perfil?.apellido_materno}, {item.perfil?.primer_nombre}</div>
                                            <div className="text-[10px] text-neutral-500 font-medium">{tipo === 'E' ? 'Estudiante Regular' : 'Personal Docente'}</div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button 
                                                onClick={() => openHistory(item)}
                                                variant="ghost" 
                                                className="h-10 w-10 p-0 rounded-xl hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {rows && rows.total > rows.per_page && (
                        <div className="p-6 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs text-neutral-500 font-medium">
                                Mostrando {rows.from} a {rows.to} de {rows.total} resultados
                            </span>
                            <div className="flex gap-2">
                                <Button 
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    variant="outline" size="icon" className="h-10 w-10 border-neutral-200 rounded-xl"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button 
                                    disabled={page === rows.last_page}
                                    onClick={() => setPage(page + 1)}
                                    variant="outline" size="icon" className="h-10 w-10 border-neutral-200 rounded-xl"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* History Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-2xl bg-white border-neutral-200 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-8 pb-4 border-b border-neutral-100 flex flex-row items-center justify-between bg-neutral-50">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-black text-neutral-950 tracking-tight uppercase">
                                Historial Mensual
                            </DialogTitle>
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">
                                {selectedUser?.perfil?.primer_nombre} {selectedUser?.perfil?.apellido_paterno}
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-32 bg-white border-neutral-200 h-10 rounded-xl text-xs font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-neutral-200">
                                    {months.map(m => (
                                        <SelectItem key={m.v} value={m.v} className="text-xs font-medium">{m.l}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button 
                                onClick={() => {
                                    const id = selectedUser.estu_id || selectedUser.docente_id;
                                    window.open(`/api/asistencia/usuario/${id}/export?tipo=${tipo}&mes=${selectedMonth}`, '_blank');
                                }}
                                variant="outline" 
                                className="h-10 border-white/10 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-400 gap-2 font-bold text-xs uppercase"
                            >
                                <Download className="h-4 w-4" /> CSV
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="p-8">
                        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-neutral-50/50">
                                    <TableRow className="border-neutral-100 hover:bg-transparent">
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-center">Fecha</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-center">Turno</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-center text-emerald-500">Entrada</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-center text-rose-500">Salida</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historyLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-48 text-center text-xs font-bold opacity-30 animate-pulse">CARGANDO...</TableCell>
                                        </TableRow>
                                    ) : history.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-48 text-center text-neutral-500 text-xs">No hay registros para este mes.</TableCell>
                                        </TableRow>
                                    ) : (
                                        history.map((log) => (
                                            <TableRow key={log.asistencia_id} className="border-white/5 hover:bg-white/[0.02]">
                                                <TableCell className="text-center font-mono text-sm text-neutral-400">{new Date(log.fecha).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={`bg-neutral-900 border-white/5 text-[9px] uppercase font-black px-2 ${log.turno === 'M' ? 'text-amber-500' : 'text-indigo-400'}`}>
                                                        {log.turno === 'M' ? 'Mañana' : 'Tarde'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center font-bold text-emerald-400">{log.hora_entrada?.substring(0, 5) || '—'}</TableCell>
                                                <TableCell className="text-center font-bold text-rose-400">{log.hora_salida?.substring(0, 5) || '—'}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
