import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

type Props = {
    open:    boolean;
    onClose: () => void;
    userId:  number | null;
    nombre:  string;
};

export default function ResetUserModal({ open, onClose, userId, nombre }: Props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState('');

    const handleClose = () => {
        setUsername('');
        setPassword('');
        setError('');
        onClose();
    };

    const handleSave = async () => {
        if (!userId) {
return;
}

        if (!username.trim()) {
 setError('El usuario es requerido.');

 return; 
}

        if (password.length < 6) {
 setError('La contraseña debe tener al menos 6 caracteres.');

 return; 
}

        setSaving(true);
        setError('');

        try {
            await api.patch(`/usuarios/${userId}/credenciales`, { username, password });
            handleClose();
        } catch (e: any) {
            const msg = e?.response?.data?.message
                ?? e?.response?.data?.errors?.username?.[0]
                ?? 'Error al guardar.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-amber-500" />
                        Resetear credenciales
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-neutral-500 -mt-1">
                    Cambia el usuario y contraseña de <span className="font-semibold text-neutral-700">{nombre}</span>.
                </p>

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="reset-username">Nuevo usuario</Label>
                        <Input
                            id="reset-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="usuario123"
                            autoComplete="off"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="reset-password">Nueva contraseña</Label>
                        <Input
                            id="reset-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="mínimo 6 caracteres"
                            autoComplete="new-password"
                        />
                    </div>
                    {error && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                        {saving ? 'Guardando…' : 'Guardar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
