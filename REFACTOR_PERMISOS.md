# Refactorización: Sistema de Permisos (Spatie)

Este documento detalla el estado actual, lo avanzado y lo que falta por completar en la migración de la gestión de accesos basada en roles (`rol_id`) a un sistema granular basado en permisos utilizando el paquete `spatie/laravel-permission`.

## 1. Estado de Avance

### Base de Datos e Infraestructura
- **Paquete Instalado**: Se utiliza `spatie/laravel-permission`.
- **Tablas**: Las tablas `permissions`, `roles`, `model_has_permissions`, etc., están creadas y migradas.
- **Seeder Core**: `database/seeders/RolesAndPermissionsSeeder.php` contiene la definición de permisos y roles actuales.
- **Migración de Datos**: El seeder incluye lógica para sincronizar usuarios existentes basados en la columna antigua `rol_id`.

### Backend (Laravel)
- **Modelo User**: Ya utiliza el trait `HasRoles`.
- **Compartición de Datos (Inertia)**: `HandleInertiaRequests.php` envía automáticamente los permisos y nombres de roles al frontend.
- **Middleware**: Algunas rutas en `web.php` ya utilizan `middleware('permission:nombre.permiso')`.

### Frontend (React / Inertia)
- **Hook de Acceso**: Se ha implementado `resources/js/hooks/usePermission.ts` que provee las funciones `can()` y `hasRole()`.
- **Sidebar**: `AppSidebar.tsx` está en un estado híbrido, priorizando permisos donde existen.

---

## 2. Pendientes Críticos

### A. Dashboard (`resources/js/pages/Dashboard/index.tsx`)
El dashboard todavía decide qué vista mostrar (Docente, Estudiante, Admin) basándose en nombres de roles fijos mediante `hasRole()`.
- **Acción**: Migrar estas condiciones a permisos granulares (ej: `dashboard.admin.view`, `dashboard.teacher.view`).

### B. Limpieza del Sidebar (`AppSidebar.tsx`)
Muchos elementos de la navegación aún dependen de la propiedad `roles`.
- **Acción**: Eliminar el uso de `roles` en la configuración de navegación y asegurar que cada módulo tenga su permiso correspondiente.

### C. Cobertura de Rutas (`web.php`)
Varias rutas de gestión (Niveles, Grados, Secciones, Usuarios) carecen de protección explícita mediante middleware de permisos.
- **Acción**: Aplicar el middleware de permisos a todos los grupos de rutas administrativos.

### D. Seguridad en Controladores
Falta asegurar que las peticiones API/Web sean validadas en el servidor antes de ejecutar acciones de escritura.
- **Acción**: Usar `$this->authorize()` o `Gate::authorize()` en los métodos de los controladores.

---

## 3. Guía de Uso del Hook `usePermission`

Para verificar permisos en componentes React:

```tsx
import { usePermission } from '@/hooks/usePermission';

const MyComponent = () => {
    const { can, hasRole } = usePermission();

    return (
        <>
            {can('usuarios.manage') && <Button>Eliminar Usuario</Button>}
            {hasRole('administrador') && <span>Eres Admin</span>}
        </>
    );
}
```

---

## 4. Próximos Pasos Recomendados

1. Ejecutar `php artisan db:seed --class=RolesAndPermissionsSeeder` para sincronizar cualquier cambio nuevo en los permisos.
2. Refactorizar el `Dashboard` para eliminar la dependencia de nombres de roles.
3. Completar la protección de rutas en `web.php`.
4. (Final) Eliminar la columna `rol_id` de la tabla `users` y el modelo/relación `rol()` antiguo.
