import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Usuario, HistorialAsistencia } from './useAsistencia';

export function useHistorialAsistencia(tipo: 'E' | 'D') {
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [history, setHistory] = useState<HistorialAsistencia[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));

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

    const openHistory = (user: Usuario) => {
        setSelectedUser(user);
        setShowModal(true);
        const userId = user.estu_id || user.docente_id;
        if (userId) {
            loadHistory(userId, selectedMonth);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    useEffect(() => {
        if (selectedUser) {
            const userId = selectedUser.estu_id || selectedUser.docente_id;
            if (userId) {
                loadHistory(userId, selectedMonth);
            }
        }
    }, [selectedMonth]);

    return {
        showModal,
        selectedUser,
        history,
        historyLoading,
        selectedMonth,
        setSelectedMonth,
        openHistory,
        closeModal,
    };
}
