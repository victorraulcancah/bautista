import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Shield, Save, Plus, Trash2, Key, Eye, PlusCircle, 
    Pencil, ChevronDown, ChevronRight, Lock, Layout, 
    FileText, Image as ImageIcon, MessageSquare, ListCheck,
    Building2, Newspaper, Search
} from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import api from '@/lib/api';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { cn } from '@/lib/utils';

type Permission = {
    id: number;
    name: string;
};

type Role = {
    id: number;
    name: string;
    permissions: Permission[];
};

interface PermissionNode {
    name: string;
    fullName: string;
    permission: Permission | null;
    children: PermissionNode[];
}

export default function AccessControlManager() {
    const { can } = usePermission();
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    const [isCreating, setIsCreating] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['institucion', 'matriculas']));
    const [searchQuery, setSearchQuery] = useState('');
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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
        
        // Poblar editedPermissions con los permisos reales Y todos sus ancestros para la UI
        const permsSet = new Set<string>();
        role.permissions.forEach(p => {
            const parts = p.name.split('.');
            let current = '';
            parts.forEach(part => {
                current = current ? `${current}.${part}` : part;
                permsSet.add(current);
            });
        });
        
        setEditedPermissions(Array.from(permsSet));
    };

    // --- Lógica de árbol ---
    const permissionTree = useMemo(() => {
        const root: PermissionNode[] = [];

        allPermissions.forEach(p => {
            const parts = p.name.split('.');
            let currentLevel = root;
            let currentFullName = '';

            parts.forEach((part, index) => {
                currentFullName = currentFullName ? `${currentFullName}.${part}` : part;
                let node = currentLevel.find(n => n.name === part);

                if (!node) {
                    node = {
                        name: part,
                        fullName: currentFullName,
                        permission: null,
                        children: []
                    };
                    currentLevel.push(node);
                }

                if (index === parts.length - 1) {
                    node.permission = p;
                }

                currentLevel = node.children;
            });
        });

        // Ordenar: poner los nodos con permiso 'ver' primero o agrupar por lógica
        if (!searchQuery.trim()) return root;

        const query = searchQuery.toLowerCase();
        const filterNode = (node: PermissionNode): PermissionNode | null => {
            const matches = node.fullName.toLowerCase().includes(query) || node.name.replace('_', ' ').toLowerCase().includes(query);
            const filteredChildren = node.children.map(filterNode).filter(Boolean) as PermissionNode[];
            if (matches || filteredChildren.length > 0) {
                return { ...node, children: filteredChildren };
            }
            return null;
        };

        return root.map(filterNode).filter(Boolean) as PermissionNode[];
    }, [allPermissions, searchQuery]);

    const togglePermission = (name: string, checked: boolean) => {
        setEditedPermissions(prev => {
            let next = new Set(prev);

            if (checked) {
                // REGLA 1: Marcar este permiso y todos sus ANCESTROS (padres)
                const parts = name.split('.');
                let current = '';
                parts.forEach(part => {
                    current = current ? `${current}.${part}` : part;
                    next.add(current);
                });
            } else {
                // REGLA 2: Desmarcar este permiso y todos sus DESCENDIENTES (hijos)
                next.delete(name);
                Array.from(next).forEach(p => {
                    if (p.startsWith(`${name}.`)) {
                        next.delete(p);
                    }
                });
            }

            return Array.from(next);
        });
    };

    const toggleExpand = (fullName: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(fullName)) next.delete(fullName);
            else next.add(fullName);
            return next;
        });
    };

    // --- CRUD ---
    const handleSavePermissions = () => setShowConfirmModal(true);

    const confirmSavePermissions = async () => {
        if (!selectedRole) return;
        setProcessing(true);
        try {
            // Filtrar solo los permisos que REALMENTE existen en la DB (para no enviar nodos intermedios que no tienen ID)
            const validPerms = editedPermissions.filter(name => 
                allPermissions.some(ap => ap.name === name)
            );

            await api.put(`/seguridad/roles/${selectedRole.id}`, {
                name: selectedRole.name,
                permissions: validPerms
            });
            await loadData();
            setShowConfirmModal(false);
        } catch (e) {
            console.error(e);
            alert('Error al guardar');
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
            console.error(e);
            alert('Error al crear rol');
        } finally {
            setProcessing(false);
        }
    };

    const getIcon = (name: string, isGroup: boolean) => {
        if (isGroup) {
            if (name === 'institucion') return <Building2 className="size-4" />;
            if (name === 'noticias') return <Newspaper className="size-4" />;
            if (name === 'galeria') return <ImageIcon className="size-4" />;
            if (name === 'datos' || name === 'datos_basicos') return <FileText className="size-4" />;
            if (name === 'matriculas') return <ListCheck className="size-4" />;
            return <Layout className="size-4" />;
        }
        if (name.includes('ver')) return <Eye className="size-3.5" />;
        if (name.includes('crear')) return <PlusCircle className="size-3.5" />;
        if (name.includes('editar')) return <Pencil className="size-3.5" />;
        if (name.includes('eliminar') || name.includes('borrar')) return <Trash2 className="size-3.5" />;
        if (name.includes('comentar')) return <MessageSquare className="size-3.5" />;
        return <Key className="size-3.5" />;
    };

    // --- Componente de Nodo ---
    const PermissionNodeComponent = ({ node, level = 0 }: { node: PermissionNode, level?: number }) => {
        const isSearching = searchQuery.trim().length > 0;
        const isExpanded = isSearching || expandedNodes.has(node.fullName);
        const isChecked = editedPermissions.includes(node.fullName);
        const hasChildren = node.children.length > 0;
        const isAction = !hasChildren && level > 0;

        return (
            <div className="flex flex-col">
                <div className={cn(
                    "group flex items-center justify-between py-3 px-4 rounded-2xl transition-all duration-200 mb-1",
                    isChecked ? "bg-indigo-50/40 border border-indigo-100/50" : "bg-transparent border border-transparent hover:bg-gray-50/80"
                )}>
                    <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <Checkbox 
                            id={`node-${node.fullName}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => togglePermission(node.fullName, !!checked)}
                            className="size-5 rounded-lg border-2 border-gray-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        />

                        {/* Icono y Texto */}
                        <div 
                            className="flex items-center gap-3 cursor-pointer select-none"
                            onClick={() => hasChildren ? toggleExpand(node.fullName) : togglePermission(node.fullName, !isChecked)}
                        >
                            <div className={cn(
                                "p-2 rounded-xl transition-colors",
                                isChecked ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"
                            )}>
                                {getIcon(node.name, hasChildren)}
                            </div>
                            <div>
                                <h4 className={cn(
                                    "text-[11px] font-black uppercase tracking-widest",
                                    isChecked ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                                )}>
                                    {node.name.replace('_', ' ')}
                                </h4>
                                {hasChildren && (
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Módulo / Sección</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botón de Expansión */}
                    {hasChildren && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleExpand(node.fullName)}
                            className={cn(
                                "size-8 rounded-xl transition-all",
                                isExpanded ? "bg-indigo-50 text-indigo-600 rotate-90" : "text-gray-400"
                            )}
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    )}
                </div>

                {/* Hijos */}
                {hasChildren && isExpanded && (
                    <div className="ml-8 pl-4 border-l-2 border-dashed border-gray-100 mt-1 mb-4 flex flex-col gap-1">
                        {node.children.map(child => (
                            <PermissionNodeComponent key={child.fullName} node={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-gray-400">Cargando configuración de seguridad avanzada...</div>;

    return (
        <>
            <ConfirmModal
                open={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmSavePermissions}
                title="Confirmar cambios jerárquicos"
                message={`¿Estás seguro de que deseas actualizar los permisos del rol "${selectedRole?.name.replace('_', ' ')}"? Los cambios afectarán la visibilidad de vistas completas y sus acciones asociadas.`}
                processing={processing}
                confirmText="Sincronizar Permisos"
                variant="warning"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar de Roles */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-gray-900">
                                        <Shield className="size-4 text-indigo-600" /> Niveles de Acceso
                                    </CardTitle>
                                    <CardDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter font-mono">
                                        Roles definidos en sistema
                                    </CardDescription>
                                </div>
                                {can('seguridad.roles.crear') && (
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className={cn(
                                            "size-10 rounded-2xl transition-all duration-300",
                                            isCreating ? "rotate-45 bg-red-50 text-red-500 border-red-100" : "hover:bg-indigo-50 hover:text-indigo-600 border-gray-200"
                                        )}
                                        onClick={() => setIsCreating(!isCreating)}
                                    >
                                        <Plus className="size-5" />
                                    </Button>
                                )}
                            </div>
                            {isCreating && (
                                <div className="mt-6 flex gap-2 animate-in slide-in-from-top-2 duration-300">
                                    <input 
                                        autoFocus
                                        className="flex-1 text-xs font-bold border-2 border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all bg-white" 
                                        placeholder="NOMBRE DEL ROL..." 
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateRole()}
                                    />
                                    <Button size="icon" onClick={handleCreateRole} disabled={processing} className="bg-indigo-600 h-11 w-11 rounded-2xl shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
                                        <Plus className="size-5 text-white" />
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            {roles.map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => handleSelectRole(role)}
                                    className={cn(
                                        "w-full text-left px-5 py-4 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 group",
                                        selectedRole?.id === role.id 
                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1" 
                                        : "bg-transparent text-gray-500 hover:bg-gray-50/80"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="truncate mr-2">{role.name.replace('_', ' ')}</span>
                                        <Badge className={cn(
                                            "text-[9px] font-black tracking-normal px-2 rounded-lg",
                                            selectedRole?.id === role.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                                        )}>
                                            {role.permissions.length} PERMS
                                        </Badge>
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 space-y-3 relative overflow-hidden group">
                        <div className="absolute top-[-20px] right-[-20px] size-24 bg-indigo-100/30 rounded-full blur-3xl group-hover:bg-indigo-200/50 transition-all duration-500" />
                        <div className="flex items-center gap-2 text-indigo-600 relative z-10">
                            <Lock className="size-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Auditoría Activa</span>
                        </div>
                        <p className="text-[11px] text-indigo-900/60 font-bold leading-relaxed relative z-10 uppercase tracking-tight">
                            La lógica de selección es recursiva. Al desmarcar un módulo se desmarcan sus acciones automáticamente.
                        </p>
                    </div>
                </div>

                {/* Editor Jerárquico */}
                <div className="lg:col-span-8">
                    {selectedRole ? (
                        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="border-b border-gray-50 bg-white sticky top-0 z-20 px-4 py-8 md:px-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">
                                                Matriz: <span className="text-indigo-600 underline decoration-indigo-200 decoration-8 underline-offset-[-2px]">{selectedRole.name.replace('_', ' ')}</span>
                                            </CardTitle>
                                        </div>
                                        <CardDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] font-mono">
                                            Jerarquía de Accesos Recursiva
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className="relative flex-1 md:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                            <input 
                                                className="w-full text-xs font-bold border-2 border-gray-100 rounded-2xl pl-10 pr-4 h-14 outline-none focus:border-indigo-500 transition-all bg-gray-50/50" 
                                                placeholder="BUSCAR PERMISO..." 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        {can('seguridad.roles.editar') && (
                                            <Button 
                                                onClick={handleSavePermissions} 
                                                disabled={processing}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[11px] tracking-[0.15em] px-8 h-14 rounded-2xl shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
                                            >
                                                <Save className="size-4 mr-2" /> {processing ? 'Procesando...' : 'Guardar Cambios'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-4 md:p-10">
                                <div className="flex flex-col gap-2">
                                    {permissionTree.map(node => (
                                        <PermissionNodeComponent key={node.fullName} node={node} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-[600px] flex flex-col items-center justify-center text-center p-20 bg-gray-50/30 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <div className="size-24 rounded-[3rem] bg-gray-100 flex items-center justify-center mb-8 animate-bounce">
                                <Shield className="size-12 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Selecciona un Rol</h3>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-3 max-w-xs leading-relaxed">
                                Debes elegir un nivel de acceso del panel izquierdo para auditar la jerarquía.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
