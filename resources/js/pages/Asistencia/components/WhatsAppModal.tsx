import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MessageCircle, Calendar, Phone, Check } from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Contacto {
    label: string;
    nombre: string;
    telefono: string;
}

interface UserInfo {
    nombre: string;
    contactos: Contacto[];
}

interface WhatsAppModalProps {
    open: boolean;
    onClose: () => void;
    userId: number | null;
    tipo: 'E' | 'D';
}

export default function WhatsAppModal({ open, onClose, userId, tipo }: WhatsAppModalProps) {
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [selectedPhone, setSelectedPhone] = useState<string>('');
    const [manualPhone, setManualPhone] = useState('');
    const [fechaInicio, setFechaInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [fechaFin, setFechaFin] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [soloHoy, setSoloHoy] = useState(true);

    useEffect(() => {
        if (open && userId) {
            loadUserInfo();
        } else {
            setUserInfo(null);
            setSelectedPhone('');
            setManualPhone('');
        }
    }, [open, userId]);

    const loadUserInfo = async () => {
        try {
            const res = await api.get(`/asistencia/usuario/${userId}/info`, {
                params: { tipo }
            });
            setUserInfo(res.data);
            if (res.data.contactos.length > 0) {
                setSelectedPhone(res.data.contactos[0].telefono);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSend = async () => {
        const phone = manualPhone.replace(/\D/g, '') || selectedPhone.replace(/\D/g, '');
        if (!phone) {
            return;
        }

        setLoading(true);
        try {
            // Obtener datos de asistencia para el rango
            const res = await api.get(`/asistencia/usuario/${userId}`, {
                params: { 
                    tipo, 
                    fecha_inicio: soloHoy ? format(new Date(), 'yyyy-MM-dd') : fechaInicio,
                    fecha_fin: soloHoy ? format(new Date(), 'yyyy-MM-dd') : fechaFin
                }
            });

            const logs = res.data || [];
            
            // Construir mensaje
            let message = `*Reporte de Asistencia*\n`;
            message += `*Institución:* Bautista La Pascana\n`;
            message += `*${tipo === 'E' ? 'Alumno' : 'Personal'}:* ${userInfo?.nombre}\n\n`;

            if (logs.length === 0) {
                message += `⚠️ *SIN REGISTRO:* No se encontró registro de asistencia para ${soloHoy ? 'el día de hoy' : 'el periodo seleccionado'}.\n\n`;
            } else {
                // Agrupar por fecha
                const grouped: Record<string, any[]> = {};
                logs.forEach((log: any) => {
                    const date = log.fecha.split('T')[0];
                    if (!grouped[date]) grouped[date] = [];
                    grouped[date].push(log);
                });

                Object.entries(grouped).forEach(([date, dayLogs]: [string, any[]]) => {
                    const formattedDate = format(new Date(date + 'T12:00:00'), 'eeee dd/MM', { locale: es });
                    message += `📅 *${formattedDate.toUpperCase()}*\n`;
                    
                    // Buscar entrada y salida representativa
                    const entrada = dayLogs.find(l => l.hora_entrada);
                    const salida = dayLogs.find(l => l.hora_salida);
                    
                    message += `   Entrada: ${entrada?.hora_entrada ? entrada.hora_entrada.substring(0, 5) : '--:--'}\n`;
                    message += `   Salida: ${salida?.hora_salida ? salida.hora_salida.substring(0, 5) : '--:--'}\n\n`;
                });
            }

            message += `_Enviado automáticamente desde el sistema escolar._`;

            // Abrir WhatsApp
            const cleanPhone = phone.length === 9 ? `51${phone}` : phone;
            const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-hidden p-0 border-none shadow-2xl">
                <DialogHeader className="bg-emerald-600 p-6 text-white pb-8">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        <MessageCircle className="h-7 w-7" />
                        Enviar por WhatsApp
                    </DialogTitle>
                    <p className="text-emerald-50/80 text-sm mt-1">
                        Reporte detallado para el acudiente
                    </p>
                </DialogHeader>

                <div className="p-6 space-y-6 bg-white -mt-4 rounded-t-3xl relative">
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 mb-2">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Destinatario</p>
                        <p className="text-neutral-900 font-bold text-lg">{userInfo?.nombre || 'Cargando...'}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-neutral-500 text-xs font-bold px-1">CONTACTO REGISTRADO</Label>
                            <Select value={selectedPhone} onValueChange={setSelectedPhone}>
                                <SelectTrigger className="rounded-xl border-neutral-200 h-12 bg-neutral-50/50">
                                    <SelectValue placeholder="Selecciona un contacto" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {userInfo?.contactos.map((c, i) => (
                                        <SelectItem key={i} value={c.telefono}>
                                            <div className="flex flex-col items-start py-0.5">
                                                <span className="font-bold text-sm">{c.nombre}</span>
                                                <span className="text-xs text-neutral-500">{c.label} • {c.telefono}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                    {userInfo?.contactos.length === 0 && (
                                        <div className="px-2 py-4 text-center text-xs text-neutral-400">
                                            No hay contactos con teléfono registrado.
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-neutral-500 text-xs font-bold px-1">O NÚMERO MANUAL</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input 
                                    placeholder="Ej: 987654321" 
                                    className="pl-10 rounded-xl border-neutral-200 h-12 focus-visible:ring-emerald-500"
                                    value={manualPhone}
                                    onChange={(e) => setManualPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Label className="text-neutral-500 text-xs font-bold px-1 mb-3 block uppercase">Periodo del Reporte</Label>
                            
                            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-2xl border border-neutral-200">
                                <button 
                                    onClick={() => setSoloHoy(true)}
                                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                        soloHoy ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                                    }`}
                                >
                                    <Check className={`h-3 w-3 ${soloHoy ? 'opacity-100' : 'opacity-0'}`} />
                                    Solo Hoy
                                </button>
                                <button 
                                    onClick={() => setSoloHoy(false)}
                                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                        !soloHoy ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                                    }`}
                                >
                                    <Calendar className={`h-3 w-3 ${!soloHoy ? 'opacity-100' : 'opacity-0'}`} />
                                    Personalizado
                                </button>
                            </div>

                            {!soloHoy && (
                                <div className="grid grid-cols-2 gap-4 mt-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-neutral-400 ml-1">DESDE</Label>
                                        <Input 
                                            type="date" 
                                            className="rounded-xl border-neutral-200" 
                                            value={fechaInicio}
                                            onChange={(e) => setFechaInicio(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-neutral-400 ml-1">HASTA</Label>
                                        <Input 
                                            type="date" 
                                            className="rounded-xl border-neutral-200" 
                                            value={fechaFin}
                                            onChange={(e) => setFechaFin(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-neutral-50 border-t border-neutral-100">
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="rounded-xl font-bold text-neutral-500 hover:bg-neutral-200"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSend}
                        disabled={loading || (!selectedPhone && !manualPhone)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-emerald-600/20 gap-2 min-w-[160px]"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <MessageCircle className="h-5 w-5" />
                                Abrir WhatsApp
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
