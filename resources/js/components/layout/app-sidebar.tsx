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
    Gamepad2
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
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

type NavChild = { title: string; href: string };
type NavItem = { 
    type: 'section'; 
    label: string; 
    roles?: string[] 
} | { 
    type: 'link'; 
    title: string; 
    icon: React.ElementType; 
    href: string; 
    roles?: string[] 
} | { 
    type: 'group'; 
    title: string; 
    icon: React.ElementType; 
    children: NavChild[]; 
    roles?: string[] 
};

const navigation: NavItem[] = [
    // ── Menú de Navegación ──────────────────────────────────────────────
    { type: 'section', label: 'MENÚ DE NAVEGACIÓN' },
    { type: 'link', title: 'Inicio',          icon: LayoutDashboard, href: '/dashboard' },
    { type: 'group', title: 'Institución', icon: Building2, roles: ['administrador'], children: [
        { title: 'Datos Básicos', href: '/institucion' },
        { title: 'Galería',       href: '/institucion/galeria' },
        { title: 'Noticias',      href: '/institucion/noticias' },
    ]},
    { type: 'link', title: 'Comunicados',     icon: Newspaper,       href: '/comunicados', roles: ['administrador', 'docente'] },
    { type: 'link', title: 'Pagos',           icon: CreditCard,      href: '/pagos', roles: ['administrador'] },

    // ── Información Académica ────────────────────────────────────────
    { type: 'section', label: 'INFORMACIÓN ACADÉMICA', roles: ['administrador', 'docente'] },
    { type: 'group', title: 'Niveles Académicos', icon: BookOpen, roles: ['administrador'], children: [
        { title: 'Niveles',            href: '/niveles' },
        { title: 'Grados / Cursos',    href: '/cursos' },
        { title: 'Grados / Secciones', href: '/secciones' },
    ]},
    { type: 'link', title: 'Mis Cursos', icon: BookOpen, href: '/docente/mis-cursos', roles: ['docente'] },
    { type: 'link', title: 'Mis Alumnos', icon: Users, href: '/docente/mis-alumnos', roles: ['docente'] },
    { type: 'link', title: 'Gestión de Docentes',  icon: UserCheck, href: '/docentes', roles: ['administrador'] },
    { type: 'link', title: 'Gestión de Alumnos', icon: GraduationCap, href: '/estudiantes', roles: ['administrador'] },

    // ── Procedimientos Administrativos ───────────────────────────────
    { type: 'section', label: 'PROCEDIMIENTOS ADMINISTRATIVOS', roles: ['administrador', 'docente', 'estudiante'] },
    { type: 'group', title: 'Matrícula', icon: ClipboardList, roles: ['administrador'], children: [
        { title: 'Aperturas / Cierre', href: '/matriculas' },
        { title: 'Nuevos Ingresos',    href: '/matriculas/gestion' },
    ]},
    { type: 'group', title: 'Asistencia', icon: CalendarDays, roles: ['administrador', 'docente'], children: [
        { title: 'Gestión / Reportes', href: '/asistencia' },
        { title: 'Escáner QR',        href: '/asistencia/scanner' },
    ]},
    { type: 'link', title: 'Mis Notas',   icon: ClipboardList, href: '/alumno/notas', roles: ['estudiante'] },
    { type: 'link', title: 'Mis Cursos',  icon: BookOpen,      href: '/alumno/cursos', roles: ['estudiante'] },
    { type: 'link', title: 'Rompecabezas', icon: Gamepad2,     href: '/alumno/puzzles', roles: ['estudiante'] },

    // ── Módulo Padre ─────────────────────────────────────────────────
    { type: 'section', label: 'FAMILIA', roles: ['padre_familia', 'madre_familia', 'apoderado'] },
    { type: 'link', title: 'Mis Hijos', icon: Users, href: '/padre/dashboard', roles: ['padre_familia', 'madre_familia', 'apoderado'] },

    // ── Recursos Compartidos ─────────────────────────────────────────
    { type: 'section', label: 'RECURSOS' },
    { type: 'link', title: 'Biblioteca', icon: Library, href: '/biblioteca' },
    { type: 'link', title: 'Mensajes Privados', icon: MessageSquare, href: '/mensajeria' },

    // ── Información de Usuarios ──────────────────────────────────────
    { type: 'section', label: 'INFORMACIÓN DE USUARIOS', roles: ['administrador', 'docente'] },
    { type: 'group', title: 'Configuración', icon: Settings, roles: ['administrador'], children: [
        { title: 'Usuarios', href: '/usuarios' },
        { title: 'Perfil',   href: '/settings/profile' },
    ]},
    { type: 'link', title: 'Mi Perfil', icon: Settings, href: '/settings/profile', roles: ['docente'] },
];

function NavLinkItem({ item }: { item: Extract<NavItem, { type: 'link' }> }) {
    const page = usePage();
    const path = page.url;
    const isActive = path.startsWith(item.href);

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
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function NavGroupItem({ item }: { item: Extract<NavItem, { type: 'group' }> }) {
    const page = usePage();
    const path = page.url;
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
                <span className="flex-1">{item.title}</span>
                <ChevronRight className={cn('size-3.5 transition-transform duration-200', open && 'rotate-90')} />
            </SidebarMenuButton>

            {open ? (
                <div className="ml-6 mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
                    {item.children.map((child) => (
                        <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                                'rounded-md px-2 py-1.5 text-xs transition-colors',
                                path === child.href
                                    ? 'font-medium text-white'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white',
                            )}
                        >
                            {child.title}
                        </Link>
                    ))}
                </div>
            ) : null}
        </SidebarMenuItem>
    );
}

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const rolName = typeof auth.user?.rol === 'string' ? auth.user.rol : auth.user?.rol?.name;
    const userRoles = rolName ? [rolName] : [];

    const filteredNavigation = useMemo(() => {
        return navigation.filter(item => {
            if (!item.roles) return true;
            return item.roles.some(role => userRoles.includes(role));
        });
    }, [userRoles]);

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
                <SidebarMenu className="px-2 py-4 gap-1">
                    {filteredNavigation.map((item, i) => {
                        if (item.type === 'section') {
                            return (
                                <li key={i} className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-wider text-sidebar-foreground/40 uppercase select-none">
                                    {item.label}
                                </li>
                            );
                        }
                        if (item.type === 'group') {
                            return <NavGroupItem key={item.title} item={item} />;
                        }
                        return <NavLinkItem key={item.href} item={item} />;
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar-accent/5">
                <AppLogo variant="sidebar" />
            </SidebarFooter>
        </Sidebar>
    );
}
