import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Save, Plus, Trash2, Key, Eye, PlusCircle, Pencil, ChevronDown, ChevronRight, Lock } from 'lucide-react';
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

type GroupedModule = {
    name: string;
    parent: Permission | null;
    actions: Permission[];
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
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

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
        setEditedPermissions((prev: string[]) => {
            const isChecked = prev.includes(permName);
            const [module, action] = permName.split('.');
            let next = [...prev];

            if (isChecked) {
                // Si es el permiso de "ver", al quitarlo quitamos todas las acciones del modulo
                if (action === 'ver') {
                    next = next.filter(p => !p.startsWith(`${module}.`));
                } else {
                    next = next.filter(p => p !== permName);
                }
            } else {
                // Si marcamos una acción (ej. crear), forzamos marcar "ver"
                if (action !== 'ver') {
                    const viewPerm = `${module}.ver`;
                    if (!next.includes(viewPerm)) {
                        next.push(viewPerm);
                    }
                }
                next.push(permName);
            }
            return Array.from(new Set(next));
        });
    };

    const toggleModule = (moduleName: string) => {
        setExpandedModules(prev => 
            prev.includes(moduleName) 
                ? prev.filter(m => m !== moduleName) 
                : [...prev, moduleName]
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

    // Group permissions by module and hierarchy
    const groupedModules = allPermissions.reduce((acc, p) => {
        const [module, action] = p.name.split('.');
        const moduleKey = module || 'Otros';
        
        if (!acc[moduleKey]) {
            acc[moduleKey] = { name: moduleKey, parent: null, actions: [] };
        }

        if (action === 'ver') {
            acc[moduleKey].parent = p;
        } else {
            acc[moduleKey].actions.push(p);
        }

        return acc;
    }, {} as Record<string, GroupedModule>);

    const getActionIcon = (name: string) => {
        if (name.includes('crear')) return <PlusCircle className="size-3.5" />;
        if (name.includes('editar')) return <Pencil className="size-3.5" />;
        if (name.includes('borrar') || name.includes('eliminar')) return <Trash2 className="size-3.5" />;
        return <Key className="size-3.5" />;
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-gray-400">Cargando configuración de seguridad...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar de Roles */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-gray-900">
                                    <Shield className="size-4 text-indigo-600" /> Roles
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                    Jerarquía de usuarios
                                </CardDescription>
                            </div>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className={`size-10 rounded-2xl transition-all duration-300 ${isCreating ? 'rotate-45 bg-red-50 text-red-500 border-red-100' : 'hover:bg-indigo-50 hover:text-indigo-600 border-gray-200'}`}
                                onClick={() => setIsCreating(!isCreating)}
                            >
                                <Plus className="size-5" />
                            </Button>
                        </div>
                        {isCreating && (
                            <div className="mt-6 flex gap-2 animate-in slide-in-from-top-2 duration-300">
                                <input 
                                    autoFocus
                                    className="flex-1 text-xs font-bold border-2 border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all bg-white" 
                                    placeholder="NUEVO ROL..." 
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateRole()}
                                />
                                <Button size="icon" onClick={handleCreateRole} disabled={processing} className="bg-indigo-600 h-11 w-11 rounded-2xl shadow-lg shadow-indigo-100">
                                    {processing ? '...' : <Plus className="size-5" />}
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => handleSelectRole(role)}
                                className={`w-full text-left px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 group ${
                                    selectedRole?.id === role.id 
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-x-1' 
                                    : 'bg-transparent text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{role.name.replace('_', ' ')}</span>
                                    <Badge className={`text-[9px] font-black tracking-normal px-2 ${selectedRole?.id === role.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {role.permissions.length} PERMS
                                    </Badge>
                                </div>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Lock className="size-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Seguridade Avanzada</span>
                    </div>
                    <p className="text-[11px] text-indigo-900/60 font-medium leading-relaxed">
                        Los cambios en los permisos se aplican de forma inmediata tras el guardado. Los usuarios deberán recargar su sesión en algunos casos.
                    </p>
                </div>
            </div>

            {/* Editor de Permisos */}
            <div className="lg:col-span-8">
                {selectedRole ? (
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="border-b border-gray-50 bg-white sticky top-0 z-20 px-8 py-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">
                                            Matriz de: <span className="text-indigo-600 underline decoration-indigo-200 decoration-8 underline-offset-[-2px]">{selectedRole.name.replace('_', ' ')}</span>
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                                        Jerarquía de Accesos y Acciones CRUD
                                    </CardDescription>
                                </div>
                                <Button 
                                    onClick={handleSavePermissions} 
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[11px] tracking-widest px-8 h-12 rounded-2xl shadow-xl shadow-indigo-100 transition-all hover:scale-105"
                                >
                                    <Save className="size-4 mr-2" /> {processing ? 'Procesando...' : 'Aplicar Cambios'}
                                </Button>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {Object.values(groupedModules).map((mod) => (
                                    <div 
                                        key={mod.name} 
                                        className={`border-2 rounded-3xl transition-all duration-300 ${
                                            expandedModules.includes(mod.name) 
                                            ? 'border-indigo-50 bg-white shadow-lg' 
                                            : 'border-gray-50 bg-gray-50/10'
                                        }`}
                                    >
                                        {/* Cabecera del Módulo (Permiso Principal) */}
                                        <div className="p-5 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {mod.parent ? (
                                                    <Checkbox 
                                                        id={`perm-${mod.parent.id}`} 
                                                        checked={editedPermissions.includes(mod.parent.name)}
                                                        onCheckedChange={() => togglePermission(mod.parent!.name)}
                                                        className="size-6 rounded-lg border-2 border-gray-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                    />
                                                ) : <div className="size-6" />}
                                                
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl transition-colors ${editedPermissions.includes(mod.parent?.name || '') ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Eye className="size-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-xs font-black uppercase tracking-[0.15em] transition-colors ${editedPermissions.includes(mod.parent?.name || '') ? 'text-gray-900' : 'text-gray-400'}`}>
                                                            {mod.name.replace('_', ' ')}
                                                        </h4>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Vista Principal</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {mod.actions.length > 0 && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => toggleModule(mod.name)}
                                                    className={`h-9 items-center gap-2 rounded-xl px-4 font-black uppercase text-[9px] tracking-widest ${expandedModules.includes(mod.name) ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}
                                                >
                                                    {expandedModules.includes(mod.name) ? (
                                                        <>OCULTAR ACCIONES <ChevronDown className="size-3" /></>
                                                    ) : (
                                                        <>VER {mod.actions.length} ACCIONES <ChevronRight className="size-3" /></>
                                                    )}
                                                </Button>
                                            )}
                                        </div>

                                        {/* Acciones CRUD (Desplegable) */}
                                        {mod.actions.length > 0 && expandedModules.includes(mod.name) && (
                                            <div className="px-5 pb-5 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {mod.actions.map(action => (
                                                    <div 
                                                        key={action.id} 
                                                        className={`flex items-center space-x-3 p-3 rounded-2xl border-2 transition-all ${
                                                            editedPermissions.includes(action.name) 
                                                            ? 'border-indigo-100 bg-indigo-50/30' 
                                                            : 'border-transparent bg-gray-50/50 grayscale opacity-60'
                                                        }`}
                                                    >
                                                        <Checkbox 
                                                            id={`perm-${action.id}`} 
                                                            checked={editedPermissions.includes(action.name)}
                                                            onCheckedChange={() => togglePermission(action.name)}
                                                            className="size-4 rounded-md border-2 border-gray-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                        />
                                                        <label 
                                                            htmlFor={`perm-${action.id}`}
                                                            className="flex-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-700 cursor-pointer select-none"
                                                        >
                                                            {getActionIcon(action.name)}
                                                            {action.name.split('.').slice(1).join(' ') || action.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-[600px] flex flex-col items-center justify-center text-center p-20 bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100">
                        <div className="size-20 rounded-[2.5rem] bg-gray-100 flex items-center justify-center mb-6">
                            <Shield className="size-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter italic">Selecciona un Rol</h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2 max-w-xs">
                            Debes elegir un nivel de acceso el panel izquierdo para comenzar la auditoría de permisos.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
