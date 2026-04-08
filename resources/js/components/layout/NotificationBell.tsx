import { Link } from '@inertiajs/react';
import { Bell, Cake, CreditCard, X, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import type { NotificationItem, DashboardStats } from '@/pages/Dashboard/hooks/useDashboard';

export function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [open, setOpen] = useState(false);

    const fetchNotifications = () => {
        api.get<DashboardStats>('/dashboard/stats').then(({ data }) => {
            setNotifications(data.notificaciones || []);
        });
    };

    useEffect(() => {
        fetchNotifications();
        // Opcional: Polling cada 5 minutos
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.length;

    const getIcon = (id: string) => {
        if (id === 'pending_payments') {
return <CreditCard className="size-5 text-amber-600" />;
}

        if (id === 'birthdays')        {
return <Cake className="size-5 text-pink-600" />;
}

        return <Bell className="size-5 text-emerald-600" />;
    };

    const getBgColor = (type: string) => {
        if (type === 'success') {
return 'bg-green-50 border-green-100';
}

        if (type === 'warning') {
return 'bg-amber-50 border-amber-100';
}

        if (type === 'error')   {
return 'bg-red-50 border-red-100';
}

        return 'bg-blue-50 border-blue-100';
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="relative flex size-9 items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-emerald-600">
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-gray-900">
                        <Bell className="size-6 text-emerald-600" />
                        Notificaciones de hoy
                    </DialogTitle>
                </DialogHeader>
                
                <div className="mt-4 space-y-3">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                                <Bell className="size-6" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">No hay alertas para hoy.</p>
                        </div>
                    ) : (
                        notifications.map((item) => (
                            <div 
                                key={item.id} 
                                className={`flex items-center justify-between rounded-2xl border p-4 transition-all hover:shadow-md ${getBgColor(item.type)}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                                        {getIcon(item.id)}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">{item.title}</h4>
                                        <p className="max-w-[200px] text-[11px] font-medium text-gray-600">{item.message}</p>
                                    </div>
                                </div>
                                {item.link && (
                                    <Link 
                                        href={item.link} 
                                        onClick={() => setOpen(false)}
                                        className="flex size-8 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm ring-1 ring-black/5 transition-all hover:bg-gray-50 hover:text-emerald-600"
                                    >
                                        <ChevronRight className="size-4" />
                                    </Link>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 border-t pt-4">
                    <button 
                        onClick={() => setOpen(false)}
                        className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-black text-white uppercase tracking-widest transition-all hover:bg-gray-800"
                    >
                        Cerrar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
