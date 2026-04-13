import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    CalendarDays,
    ChevronRight,
    ClipboardList,
    CreditCard,
    GraduationCap,
    LayoutDashboard,
    MessageSquare,
    Settings,
    UserCheck,
    Library,
    Newspaper,
    Users,
    Folder,
    Gamepad2,
    QrCode,
    Bell,
    Calendar,
    LogOut,
    FileText,
    Shield
} from 'lucide-react';
import { useState, useMemo } from 'react';
import AppLogo from '@/components/layout/app-logo';
import { NavUser } from '@/components/layout/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';

type NavChild = { 
    title: string; 
    href: string;
    permission?: string;
};

type NavItem = { 
    type: 'section'; 
    label: string; 
    permission?: string;
} | { 
    type: 'link'; 
    title: string; 
    icon: React.ElementType; 
    href: string; 
    permission?: string;
} | { 
    type: 'group'; 
    title: string; 
    icon: React.ElementType; 
    children: NavChild[]; 
    permission?: string;
};

const navigation: NavItem[] = [
    // ── Menú de Navegación ──────────────────────────────────────────────
    { type: 'section', label: 'MENÚ DE NAVEGACIÓN' },
    { type: 'link', title: 'Inicio',           icon: LayoutDashboard, href: '/dashboard', permission: 'dashboard.ver' },
    { type: 'link', title: 'Mi Credencial',    icon: QrCode,          href: '/credencial', permission: 'perfil.ver_credencial' },
    { type: 'group', title: 'Institución', icon: Building2, children: [
        { title: 'Datos Básicos', href: '/institucion', permission: 'institucion.ver' },
        { title: 'Galería',       href: '/institucion/galeria', permission: 'institucion.ver' },
        { title: 'Noticias',      href: '/institucion/noticias', permission: 'institucion.ver' },
    ]},
    { type: 'link', title: 'Comunicados',     icon: Newspaper,       href: '/comunicados', permission: 'comunicados.ver' },
    { type: 'link', title: 'Pagos',           icon: CreditCard,      href: '/pagos', permission: 'pagos.ver' },

    // ── Información Académica (Admin/Personal) ────────────────────────
    { type: 'section', label: 'GESTIÓN ACADÉMICA' },
    { type: 'group', title: 'Niveles Académicos', icon: BookOpen, children: [
        { title: 'Niveles',            href: '/niveles', permission: 'niveles.ver' },
        { title: 'Grados / Cursos',    href: '/cursos', permission: 'cursos.ver' },
        { title: 'Grados / Secciones', href: '/secciones', permission: 'secciones.ver' },
    ]},
    { type: 'link', title: 'Gestión de Docentes',  icon: UserCheck, href: '/docentes', permission: 'docentes.ver' },
    { type: 'link', title: 'Gestión de Alumnos', icon: GraduationCap, href: '/estudiantes', permission: 'estudiantes.ver' },

    // ── Portal Docente ───────────────────────────────────────────────
    { type: 'section', label: 'PORTAL DOCENTE' },
    { type: 'link', title: 'Mis Cursos', icon: BookOpen, href: '/docente/mis-cursos', permission: 'dashboard.cursos.asignados' },
    { type: 'link', title: 'Mis Alumnos', icon: Users, href: '/docente/mis-alumnos', permission: 'portal.docente.alumnos' },

    // ── Portal Estudiante ─────────────────────────────────────────────
    { type: 'section', label: 'PORTAL ESTUDIANTE' },
    { type: 'group', title: 'Mi Académico', icon: BookOpen, children: [
        { title: 'CALENDARIO',        href: '/dashboard',     permission: 'dashboard.resumen.academico' },
        { title: 'HORARIO DE CLASES', href: '/horarios',      permission: 'dashboard.resumen.academico' },
        { title: 'ROL DE EXAMENES',  href: '/alumno/notas',  permission: 'dashboard.resumen.academico' },
    ]},
    { type: 'link', title: 'Mis Cursos',      icon: BookOpen,      href: '/alumno/cursos', permission: 'dashboard.resumen.academico' },
    { type: 'link', title: 'Mi Asistencia', icon: Calendar,    href: '/alumno/asistencia', permission: 'portal.alumno.asistencia' },
    { type: 'link', title: 'Mis Notas',   icon: ClipboardList, href: '/alumno/notas',    permission: 'dashboard.resumen.academico' },
    { type: 'link', title: 'Rompecabezas', icon: Gamepad2,     href: '/alumno/puzzles',  permission: 'dashboard.resumen.academico' },

    // ── Módulo Padre ─────────────────────────────────────────────────
    { type: 'section', label: 'PORTAL FAMILIA' },
    { type: 'link', title: 'Mis Hijos', icon: Users, href: '/padre/dashboard', permission: 'dashboard.resumen.familiar' },

    // ── Procedimientos Administrativos ───────────────────────────────
    { type: 'section', label: 'PROCEDIMIENTOS' },
    { type: 'group', title: 'Matrícula', icon: ClipboardList, children: [
        { title: 'Aperturas / Cierre', href: '/matriculas', permission: 'matriculas.ver' },
        { title: 'Nuevos Ingresos',    href: '/matriculas/gestion', permission: 'matriculas.crear' },
    ]},
    { type: 'group', title: 'Asistencia', icon: CalendarDays, children: [
        { title: 'Gestión / Reportes', href: '/asistencia', permission: 'asistencia.ver' },
        { title: 'Escáner QR',        href: '/asistencia/scanner', permission: 'asistencia.escanear' },
    ]},

    // ── Recursos ─────────────────────────────────────────────────────
    { type: 'section', label: 'RECURSOS' },
    { type: 'link', title: 'Biblioteca', icon: Library, href: '/biblioteca', permission: 'biblioteca.ver' },
    { type: 'link', title: 'Mensajes Privados', icon: MessageSquare, href: '/mensajeria', permission: 'mensajeria.ver' },

    // ── Configuración ──────────────────────────────────────────────── 
    { type: 'section', label: 'CONFIGURACIÓN' },
    { type: 'group', title: 'Gestión de Usuarios', icon: Settings, children: [
        { title: 'Usuarios', href: '/usuarios', permission: 'usuarios.ver' },
        { title: 'Perfil',   href: '/settings/profile' },
    ]},

    // ── Seguridad ────────────────────────────────────────────────────
    { type: 'section', label: 'SEGURIDAD' },
    { type: 'group', title: 'Seguridad', icon: Shield, children: [
        { title: 'Roles y Permisos', href: '/roles-permisos', permission: 'roles.editar' },
        { title: 'Diseño de Fotochecks', href: '/seguridad/fotocheck', permission: 'configuracion.fotocheck' },
    ]},
];

function NavLinkItem({ item }: { item: Extract<NavItem, { type: 'link' }> }) {
    const page = usePage();
    const path = page.url;
    const isActive = path.startsWith(item.href);
    const { state, isMobile } = useSidebar();

    const btnClass = cn(
        'transition-colors',
        isActive
            ? state === 'collapsed' && !isMobile 
                ? 'bg-sidebar-accent text-white' 
                : 'border-l-2 border-[#00a65a] bg-sidebar-accent text-white pl-[10px]'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
    );

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={item.title} className={btnClass}>
                <Link href={item.href} className={cn(state === 'collapsed' && !isMobile && '!justify-center !p-0')}>
                    <item.icon className="size-4" />
                    {(state === 'expanded' || isMobile) && (
                        <span className="text-xs font-semibold uppercase tracking-tight">{item.title}</span>
                    )}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function NavGroupItem({ item }: { item: Extract<NavItem, { type: 'group' }> }) {
    const page = usePage();
    const path = page.url;
    const { state, isMobile } = useSidebar();
    const [open, setOpen] = useState(() =>
        item.children.some((c) => path.startsWith(c.href)),
    );
    const isGroupActive = item.children.some((c) => path.startsWith(c.href));

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                onClick={() => setOpen(!open)}
                tooltip={item.title}
                className={cn(
                    'cursor-pointer transition-colors',
                    state === 'collapsed' && !isMobile && '!justify-center !p-0',
                    isGroupActive
                        ? state === 'collapsed' && !isMobile
                            ? 'bg-sidebar-accent text-white'
                            : 'border-l-2 border-[#00a65a] bg-sidebar-accent text-white pl-[10px]'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
                )}
            >
                <item.icon className="size-4" />
                {(state === 'expanded' || isMobile) && (
                    <>
                        <span className="flex-1 text-xs font-black uppercase tracking-tighter">{item.title}</span>
                        <ChevronRight className={cn('size-3.5 transition-transform duration-200', open && 'rotate-90')} />
                    </>
                )}
            </SidebarMenuButton>

            {open && (state === 'expanded' || isMobile) && (
                <div className="ml-6 mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
                    {item.children.map((child) => (
                        <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                                'rounded-md px-2 py-1.5 text-xs font-bold uppercase tracking-tight transition-colors',
                                path === child.href
                                    ? 'font-medium text-white'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white',
                            )}
                        >
                            {child.title}
                        </Link>
                    ))}
                </div>
            )}
        </SidebarMenuItem>
    );
}

export function AppSidebar() {
    const { can } = usePermission();
    const { state, isMobile } = useSidebar();

    const filteredNavigation = useMemo(() => {
        return navigation.map(item => {
            // Caso 1: Link simple
            if (item.type === 'link') {
                if (item.permission && !can(item.permission)) return null;
                return item;
            }

            // Caso 2: Grupo con hijos
            if (item.type === 'group') {
                // Filtrar hijos individualmente
                const visibleChildren = item.children.filter(child => {
                    if (child.permission) return can(child.permission);
                    return true;
                });

                // Si no hay hijos visibles Y el grupo no tiene su propio permiso habilitado -> ocultar grupo
                const groupPermissionMet = item.permission ? can(item.permission) : false;
                
                if (visibleChildren.length === 0 && !groupPermissionMet) return null;

                // Retornar grupo solo con sus hijos visibles
                return { ...item, children: visibleChildren };
            }

            // Caso 3: Sección
            if (item.type === 'section') {
                if (item.permission && !can(item.permission)) return null;
                return item;
            }

            return item;
        }).filter(Boolean) as NavItem[];
    }, [can]);

    // Grouping logic for SidebarGroup
    const groups = useMemo(() => {
        interface NavSection {
            section?: string;
            items: NavItem[];
        }
        
        const result: NavSection[] = [];
        let currentGroup: NavSection | null = null;

        for (const item of filteredNavigation) {
            if (item.type === 'section') {
                if (currentGroup && currentGroup.items.length > 0) {
                    result.push(currentGroup);
                }
                currentGroup = { section: item.label, items: [] };
            } else {
                if (!currentGroup) {
                    currentGroup = { items: [] };
                }
                currentGroup.items.push(item);
            }
        }

        if (currentGroup && currentGroup.items.length > 0) {
            result.push(currentGroup);
        }

        return result;
    }, [filteredNavigation]);

    const isCollapsed = state === 'collapsed' && !isMobile;

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className={cn(
                "border-b border-sidebar-border bg-sidebar-accent/50 transition-all duration-200",
                isCollapsed ? "p-2" : "p-4"
            )}>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <NavUser />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="overflow-y-auto">
                <div className="flex flex-col gap-0">
                    {groups.map((group, idx) => (
                        <SidebarGroup key={idx}>
                            {group.section && <SidebarGroupLabel>{group.section}</SidebarGroupLabel>}
                            <SidebarGroupContent>
                                <SidebarMenu className={cn(
                                    "gap-1 transition-all duration-200",
                                    isCollapsed ? "px-0 py-2" : "px-2 py-2"
                                )}>
                                    {group.items.map((item) => {
                                        if (item.type === 'group') {
                                            return <NavGroupItem key={item.title} item={item} />;
                                        }

                                        if (item.type === 'link') {
                                            return <NavLinkItem key={item.href} item={item} />;
                                        }

                                        return null;
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))}
                </div>
            </SidebarContent>

            <SidebarFooter className={cn(
                "border-t border-sidebar-border bg-sidebar-accent/5 transition-all duration-200",
                isCollapsed ? "p-2" : "p-4"
            )}>
                <AppLogo variant="sidebar" />
            </SidebarFooter>
        </Sidebar>
    );
}
