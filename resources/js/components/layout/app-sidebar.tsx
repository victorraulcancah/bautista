import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    Building2,
    CalendarDays,
    ChevronRight,
    ClipboardList,
    CreditCard,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
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
import api from '@/lib/api';

type NavChild = { title: string; href: string };
type NavItem = { type: 'section'; label: string } | { type: 'link'; title: string; icon: React.ElementType; href: string } | { type: 'group'; title: string; icon: React.ElementType; children: NavChild[] };

const navigation: NavItem[] = [
    // ── Menú principal ──────────────────────────────────────────────
    { type: 'section', label: 'MENÚ DE NAVEGACIÓN' },
    { type: 'link', title: 'Inicio',          icon: LayoutDashboard, href: '/dashboard' },
    { type: 'link', title: 'Institución',     icon: Building2,       href: '/institucion' },
    { type: 'link', title: 'Notificaciones',  icon: Bell,            href: '/notificaciones' },
    { type: 'link', title: 'Pagos',           icon: CreditCard,      href: '/pagos' },

    // ── Información Académica ────────────────────────────────────────
    { type: 'section', label: 'INFORMACIÓN ACADÉMICA' },
    { type: 'group', title: 'Niveles Académicos', icon: BookOpen, children: [
        { title: 'Niveles / Grados',   href: '/niveles' },
        { title: 'Grados / Cursos',    href: '/cursos' },
        { title: 'Grados / Secciones', href: '/secciones' },
    ]},
    { type: 'link', title: 'Estudiantes', icon: GraduationCap, href: '/estudiantes' },
    { type: 'link', title: 'Profesores',  icon: UserCheck,     href: '/docentes' },

    // ── Procedimientos Administrativos ───────────────────────────────
    { type: 'section', label: 'PROCEDIMIENTOS ADMINISTRATIVOS' },
    { type: 'link', title: 'Matrícula',   icon: ClipboardList, href: '/matriculas' },
    { type: 'link', title: 'Asistencia',  icon: CalendarDays,  href: '/asistencia' },
    { type: 'link', title: 'Notas',       icon: BookOpen,      href: '/notas' },
    { type: 'group', title: 'Mensajería', icon: MessageSquare, children: [
        { title: 'Mensajes',  href: '/mensajes' },
        { title: 'Circulares', href: '/circulares' },
    ]},

    // ── Información de Usuarios ──────────────────────────────────────
    { type: 'section', label: 'INFORMACIÓN DE USUARIOS' },
    { type: 'link', title: 'Usuarios',      icon: Users,   href: '/usuarios' },
    { type: 'link', title: 'Configuración', icon: Settings, href: '/settings/profile' },
    { type: 'link', title: 'Salir',         icon: LogOut,   href: '/logout' },
];

function NavLinkItem({ item }: { item: Extract<NavItem, { type: 'link' }> }) {
    const page = usePage();
    const path = page.url;
    const isActive = path.startsWith(item.href);
    const isLogout = item.href === '/logout';

    const btnClass = cn(
        'transition-colors',
        isActive && !isLogout
            ? 'border-l-2 border-[#00a65a] bg-sidebar-accent text-white pl-[10px]'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
        isLogout && 'text-red-400 hover:text-red-300',
    );

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
    };

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={item.title} className={btnClass}>
                {isLogout ? (
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                    </button>
                ) : (
                    <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                    </Link>
                )}
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

            {open && (
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
            )}
        </SidebarMenuItem>
    );
}

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="overflow-y-auto">
                <SidebarMenu className="px-2 py-2 gap-0.5">
                    {navigation.map((item, i) => {
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

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
