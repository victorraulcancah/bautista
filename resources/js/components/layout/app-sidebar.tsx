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

type NavChild = { title: string; href: string };
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
    { type: 'link', title: 'QR',               icon: QrCode,          href: '/alumno/qr', permission: 'portal.alumno.qr' },
    { type: 'link', title: 'Inicio',           icon: LayoutDashboard, href: '/dashboard', permission: 'dashboard.ver' },
    { type: 'group', title: 'Institución', icon: Building2, permission: 'institucion.ver', children: [
        { title: 'Datos Básicos', href: '/institucion' },
        { title: 'Galería',       href: '/institucion/galeria' },
        { title: 'Noticias',      href: '/institucion/noticias' },
    ]},
    { type: 'link', title: 'Comunicados',     icon: Newspaper,       href: '/comunicados', permission: 'comunicados.ver' },
    { type: 'link', title: 'Pagos',           icon: CreditCard,      href: '/pagos', permission: 'pagos.ver' },

    // ── Información Académica (Admin/Personal) ────────────────────────
    { type: 'section', label: 'GESTIÓN ACADÉMICA', permission: 'niveles.ver' },
    { type: 'group', title: 'Niveles Académicos', icon: BookOpen, permission: 'niveles.ver', children: [
        { title: 'Niveles',            href: '/niveles' },
        { title: 'Grados / Cursos',    href: '/cursos' },
        { title: 'Grados / Secciones', href: '/secciones' },
    ]},
    { type: 'link', title: 'Gestión de Docentes',  icon: UserCheck, href: '/docentes', permission: 'docentes.gestionar' },
    { type: 'link', title: 'Gestión de Alumnos', icon: GraduationCap, href: '/estudiantes', permission: 'estudiantes.gestionar' },

    // ── Portal Docente ───────────────────────────────────────────────
    { type: 'section', label: 'PORTAL DOCENTE', permission: 'dashboard.cursos.asignados' },
    { type: 'link', title: 'Mis Cursos', icon: BookOpen, href: '/docente/mis-cursos', permission: 'dashboard.cursos.asignados' },
    { type: 'link', title: 'Mis Alumnos', icon: Users, href: '/docente/mis-alumnos', permission: 'portal.docente.alumnos' },

    // ── Portal Estudiante ─────────────────────────────────────────────
    { type: 'section', label: 'PORTAL ESTUDIANTE', permission: 'dashboard.resumen.academico' },
    { type: 'group', title: 'Mi Académico', icon: BookOpen, permission: 'dashboard.resumen.academico', children: [
        { title: 'CALENDARIO',        href: '/dashboard' },
        { title: 'HORARIO DE CLASES', href: '/horarios' },
        { title: 'ROL DE EXAMENES',  href: '/alumno/notas' },
    ]},
    { type: 'link', title: 'Mis Cursos',      icon: BookOpen,      href: '/alumno/cursos', permission: 'dashboard.resumen.academico' },
    { type: 'link', title: 'Mi Asistencia', icon: Calendar,    href: '/alumno/asistencia', permission: 'portal.alumno.asistencia' },
    { type: 'link', title: 'Mis Notas',   icon: ClipboardList, href: '/alumno/notas',    permission: 'dashboard.resumen.academico' },
    { type: 'link', title: 'Rompecabezas', icon: Gamepad2,     href: '/alumno/puzzles',  permission: 'dashboard.resumen.academico' },

    // ── Módulo Padre ─────────────────────────────────────────────────
    { type: 'section', label: 'PORTAL FAMILIA', permission: 'dashboard.resumen.familiar' },
    { type: 'link', title: 'Mis Hijos', icon: Users, href: '/padre/dashboard', permission: 'dashboard.resumen.familiar' },

    // ── Procedimientos Administrativos ───────────────────────────────
    { type: 'section', label: 'PROCEDIMIENTOS', permission: 'asistencia.ver' },
    { type: 'group', title: 'Matrícula', icon: ClipboardList, permission: 'matriculas.ver', children: [
        { title: 'Aperturas / Cierre', href: '/matriculas' },
        { title: 'Nuevos Ingresos',    href: '/matriculas/gestion' },
    ]},
    { type: 'group', title: 'Asistencia', icon: CalendarDays, permission: 'asistencia.ver', children: [
        { title: 'Gestión / Reportes', href: '/asistencia' },
        { title: 'Escáner QR',        href: '/asistencia/scanner' },
    ]},

    // ── Recursos ─────────────────────────────────────────────────────
    { type: 'section', label: 'RECURSOS', permission: 'biblioteca.ver' },
    { type: 'link', title: 'Biblioteca', icon: Library, href: '/biblioteca', permission: 'biblioteca.ver' },
    { type: 'link', title: 'Mensajes Privados', icon: MessageSquare, href: '/mensajeria', permission: 'mensajeria.ver' },

    // ── Configuración ──────────────────────────────────────────────── 
    { type: 'section', label: 'CONFIGURACIÓN', permission: 'usuarios.gestionar' },
    { type: 'group', title: 'Gestión de Usuarios', icon: Settings, permission: 'usuarios.gestionar', children: [
        { title: 'Usuarios', href: '/usuarios' },
        { title: 'Perfil',   href: '/settings/profile' },
    ]},

    // ── Seguridad ────────────────────────────────────────────────────
    { type: 'section', label: 'SEGURIDAD', permission: 'roles.gestionar' },
    { type: 'group', title: 'Seguridad', icon: Shield, permission: 'roles.gestionar', children: [
        { title: 'Roles y Permisos', href: '/roles-permisos' },
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
            ? 'border-l-2 border-[#00a65a] bg-sidebar-accent text-white pl-[10px]'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
    );

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={item.title} className={btnClass}>
                <Link href={item.href}>
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
                    isGroupActive
                        ? 'border-l-2 border-[#00a65a] bg-sidebar-accent text-white pl-[10px]'
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

    const filteredNavigation = useMemo(() => {
        return navigation.filter(item => {
            // Si tiene permiso específico, verificarlo
            if (item.permission) {
                return can(item.permission);
            }

            // Si no tiene definición de permiso, es público
            return true;
        });
    }, [can]);

    // Grouping logic for SidebarGroup
    const groups = useMemo(() => {
        const result: { section?: string; items: NavItem[] }[] = [];
        let currentGroup: { section?: string; items: NavItem[] } | null = null;

        filteredNavigation.forEach((item) => {
            if (item.type === 'section') {
                if (currentGroup) {
                    result.push(currentGroup);
                }

                currentGroup = { section: item.label, items: [] };
            } else {
                if (!currentGroup) {
                    currentGroup = { items: [] };
                }

                currentGroup.items.push(item);
            }
        });

        if (currentGroup) {
            result.push(currentGroup);
        }

        return result;
    }, [filteredNavigation]);

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="border-b border-sidebar-border bg-sidebar-accent/50 p-4">
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
                                <SidebarMenu className="px-2 py-2 gap-1">
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

            <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar-accent/5">
                <AppLogo variant="sidebar" />
            </SidebarFooter>
        </Sidebar>
    );
}
