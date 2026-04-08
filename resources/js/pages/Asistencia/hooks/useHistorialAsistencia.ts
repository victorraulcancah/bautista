import { useState } from 'react';
import type { Usuario } from './useAsistencia';

export function useHistorialAsistencia(tipo: 'E' | 'D') {
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

    const openHistory = (user: Usuario) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    return {
        showModal,
        selectedUser,
        openHistory,
        closeModal,
    };
}
