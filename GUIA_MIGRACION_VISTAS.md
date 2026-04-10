# 🗺️ Guía de Migración de Vistas y Permisos

Este archivo es la referencia oficial para el proceso de refactorización. **NO BORRAR** hasta que la migración se complete al 100%.

## 🛡️ LO QUE SE MANTIENE (CORE)
Estos elementos NO se borran, solo se adaptan al sistema de permisos:
- [ ] **Login**: `resources/js/pages/auth/login.tsx` (Flujo de entrada).
- [ ] **Sidebar**: `resources/js/components/layout/app-sidebar.tsx` (Se adaptará para usar `can()` en lugar de roles hardcodeados).
- [ ] **Layouts**: `resources/js/layouts/app-layout.tsx` y `auth-layout.tsx`.

## 🏛️ VISTAS MAESTRAS (A MANTENER Y ADAPTAR)
Estas vistas (actualmente de Admin) serán las únicas que existirán:
- `resources/js/pages/Dashboard/index.tsx`
- `resources/js/pages/GestionAlumnos/*`
- `resources/js/pages/GestionDocentes/*`
- `resources/js/pages/Cursos/*`
- `resources/js/pages/Asistencia/*`
- `resources/js/pages/Pagos/*`
- `resources/js/pages/Matricula/*`
- `resources/js/pages/Usuarios/*`
- `resources/js/pages/Comunicados/*`
- `resources/js/pages/Medios/*` (Biblioteca)
- `resources/js/pages/MensajesPrivados/*`

## 🗑️ VISTAS DUPLICADAS (A ELIMINAR PROGRESIVAMENTE)
Una vez que la lógica se mueva a las vistas maestras, estas carpetas se borrarán:
- [ ] `resources/js/pages/PortalAlumno`
- [ ] `resources/js/pages/PortalDocente`
- [ ] `resources/js/pages/PortalPadre`

## 🚀 PASOS DE EJECUCIÓN
1. **Fase 1 (Backend)**: Instalar Spatie, migrar `User.php` y crear Seeder de permisos.
2. **Fase 2 (Sidebar)**: Adaptar navegación a permisos.
3. **Fase 3 (Unificación)**: Refactorizar Dashboard y Cursos como pilotos.
4. **Fase 4 (Limpieza)**: Borrar carpetas duplicadas.
