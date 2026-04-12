import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { UserInfo } from '@/components/layout/user-info';
import { UserMenuContent } from '@/components/layout/user-menu-content';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function NavUser() {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className={cn(
                                "group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent transition-all duration-200",
                                state === 'collapsed' && !isMobile && "!justify-center !p-0"
                            )}
                            data-test="sidebar-menu-button"
                        >
                            <UserInfo user={auth.user} hideText={state === 'collapsed' && !isMobile} />
                            {(state === 'expanded' || isMobile) && <ChevronsUpDown className="ml-auto size-4" />}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
