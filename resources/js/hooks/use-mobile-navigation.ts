import { useEffect } from 'react';

export type CleanupFn = () => void;

export function useMobileNavigation(): CleanupFn {
    useEffect(() => {
        return () => {
            // Limpiar estilos cuando el componente se desmonta
            if (document.body) {
                document.body.style.removeProperty('pointer-events');
            }
        };
    }, []);

    // Retornar una función que puede ser llamada manualmente si es necesario
    return () => {
        if (document.body) {
            document.body.style.removeProperty('pointer-events');
        }
    };
}
