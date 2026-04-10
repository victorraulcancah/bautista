import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Save, Plus, Trash2, Key } from 'lucide-react';
import api from '@/lib/api';

type Permission = {
    id: number;
    name: string;
};

type Role = {
    id: number;
    name: string;
    permissions: Permission[];
};

export default function AccessControlManager() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    // Create role state
    const [isCreating, setIsCreating] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    // State for local edits before saving
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [editedPermissions, setEditedPermissions] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([
                api.get('/seguridad/roles'),
                api.get('/seguridad/permisos')
            ]);
            setRoles(rolesRes.data);
            setAllPermissions(permsRes.data);
            
            if (rolesRes.data.length > 0 && !selectedRole) {
                handleSelectRole(rolesRes.data[0]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRole = (role: Role) => {
        setSelectedRole(role);
        setEditedPermissions(role.permissions.map(p => p.name));
    };

    const togglePermission = (permName: string) => {
        setEditedPermissions((prev: string[]) => 
            prev.includes(permName) 
                ? prev.filter((p: string) => p !== permName)
                : [...prev, permName]
        );
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        setProcessing(true);
        try {
            await api.put(`/seguridad/roles/${selectedRole.id}`, {
                name: selectedRole.name,
                permissions: editedPermissions
            });
            await loadData();
            alert('Permisos actualizados correctamente');
        } catch (e) {
            alert('Error al guardar permisos');
        } finally {
            setProcessing(false);
        }
    };

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) return;
        setProcessing(true);
        try {
            await api.post('/seguridad/roles', { name: newRoleName.toLowerCase().replace(' ', '_') });
            setNewRoleName('');
            setIsCreating(false);
            await loadData();
        } catch (e) {
            alert('Error al crear rol');
        } finally {
            setProcessing(false);
        }
    };

    // Group permissions by prefix for better UI
    const groupedPermissions = allPermissions.reduce((acc, p) => {
        const group = p.name.split('.')[0] || 'Otros';
        if (!acc[group]) acc[group] = [];
        acc[group].push(p);
        return acc;
    }, {} as Record<string, Permission[]>);

    if (loading) return <div className="p-10 text-center animate-pulse text-gray-400">Cargando configuración de seguridad...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar de Roles */}
            <Card className="lg:col-span-4 border-none shadow-sm bg-gray-50/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Shield className="size-4 text-indigo-600" /> Roles del Sistema
                        </CardTitle>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 hover:bg-indigo-50 hover:text-indigo-600"
                            onClick={() => setIsCreating(!isCreating)}
                        >
                            <Plus className="size-4" />
                        </Button>
                    </div>
                    {isCreating && (
                        <div className="mt-4 flex gap-2">
                            <input 
                                autoFocus
                                className="flex-1 text-xs border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                                placeholder="Nombre del rol..." 
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateRole()}
                            />
                            <Button size="sm" onClick={handleCreateRole} disabled={processing} className="bg-indigo-600">
                                {processing ? '...' : 'OK'}
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-1">
                    {roles.map(role => (
                        <button
                            key={role.id}
                            onClick={() => handleSelectRole(role)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                selectedRole?.id === role.id 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                : 'bg-white text-gray-600 hover:bg-white hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="capitalize">{role.name.replace('_', ' ')}</span>
                                <Badge variant={selectedRole?.id === role.id ? 'secondary' : 'outline'} className="text-[10px]">
                                    {role.permissions.length} perms
                                </Badge>
                            </div>
                        </button>
                    ))}
                </CardContent>
            </Card>

            {/* Editor de Permisos */}
            <Card className="lg:col-span-8 border-none shadow-sm h-fit">
                {selectedRole ? (
                    <>
                        <CardHeader className="border-b border-gray-50 bg-white sticky top-0 z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-black text-gray-900 uppercase tracking-tight italic">
                                        Permisos para: <span className="text-indigo-600">{selectedRole.name.replace('_', ' ')}</span>
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Define las acciones que este rol puede realizar en el sistema.
                                    </CardDescription>
                                </div>
                                <Button 
                                    onClick={handleSavePermissions} 
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest px-6"
                                >
                                    <Save className="size-3 mr-2" /> {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {Object.entries(groupedPermissions).map(([group, perms]) => (
                                    <div key={group} className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                            <Key className="size-3 text-indigo-400" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">{group}</h4>
                                        </div>
                                        <div className="space-y-3">
                                            {perms.map(p => (
                                                <div key={p.id} className="flex items-center space-x-3 group">
                                                    <Checkbox 
                                                        id={`perm-${p.id}`} 
                                                        checked={editedPermissions.includes(p.name)}
                                                        onCheckedChange={() => togglePermission(p.name)}
                                                        className="border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                    />
                                                    <label 
                                                        htmlFor={`perm-${p.id}`}
                                                        className="text-sm font-medium leading-none text-gray-600 cursor-pointer group-hover:text-indigo-600 transition-colors"
                                                    >
                                                        {p.name.split('.').slice(1).join(' ') || p.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </>
                ) : (
                    <div className="p-20 text-center text-gray-400 italic">
                        Selecciona un rol para gestionar sus permisos.
                    </div>
                )}
            </Card>
        </div>
    );
}
