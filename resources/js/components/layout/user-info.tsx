import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

const ROLES_ES: Record<string, string> = {
    administrador: 'Administrador',
    docente: 'Docente',
    estudiante: 'Estudiante',
    padre_familia: 'Padre de Familia',
    madre_familia: 'Madre de Familia',
    apoderado: 'Apoderado',
    psicologo: 'Psicólogo',
};

export function UserInfo({
    user,
    showEmail = false,
    hideText = false,
}: {
    user: User;
    showEmail?: boolean;
    hideText?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar || undefined} alt={user.nombre_completo || user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.nombre_completo || user.name)}
                </AvatarFallback>
            </Avatar>
            {!hideText && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold text-white capitalize">
                        {(() => {
                            const rolName = typeof user.rol === 'string'
                                ? user.rol
                                : user.rol?.name;
                            return rolName
                                ? (ROLES_ES[rolName] ?? rolName.replace('_', ' '))
                                : 'Usuario';
                        })()}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground opacity-70">
                        {user.nombre_completo || user.name}
                    </span>
                    {showEmail && (
                        <span className="truncate text-xs text-muted-foreground">
                            {user.email}
                        </span>
                    )}
                </div>
            )}
        </>
    );
}
