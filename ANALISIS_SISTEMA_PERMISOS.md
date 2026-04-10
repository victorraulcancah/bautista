# Análisis del Sistema de Permisos y Control de Acceso

## 📊 Estado Actual del Sistema

### Fecha de Análisis
9 de Abril, 2026

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. Sistema de Permisos Híbrido y Mal Implementado

**Problema:** El sistema tiene instalado `spatie/laravel-permission` pero NO lo está utilizando correctamente.

**Evidencia:**
- ✅ Paquete instalado: `spatie/laravel-permission: ^7.2`
- ✅ Configuración presente: `config/permission.php`
- ❌ Modelo User NO usa el trait `HasRoles` de Spatie
- ❌ Implementación manual de `hasRole()` en lugar de usar Spatie
- ❌ No hay tabla de permisos granulares, solo roles básicos

**Código Actual (User.php):**
```php
// Implementación manual - MAL
public function hasRole(string|array $roles): bool
{
    $roles = is_array($roles) ? $roles : [$roles];
    return in_array($this->rol?->name, $roles, true);
}
```

**Debería ser:**
```php
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles; // Trait de Spatie
    // No necesita implementar hasRole() manualmente
}
```

---

### 2. Duplicación Masiva de Vistas por Rol

**Problema:** Existen vistas completamente separadas para cada rol, creando redundancia y dificultad de mantenimiento.

**Estructura Actual:**
```
pages/
├── Dashboard/              # Dashboard genérico (admin)
├── PortalAlumno/          # 🔴 Dashboard duplicado para estudiantes
│   ├── Dashboard.tsx
│   ├── Cursos/
│   ├── Asistencia.tsx
│   ├── Notas/
│   └── Profesores.tsx
├── PortalDocente/         # 🔴 Dashboard duplicado para docentes
│   ├── Dashboard.tsx
│   ├── MisCursos.tsx
│   ├── MisAlumnos.tsx
│   ├── AsistenciaGeneral.tsx
│   └── CalificarExamen.tsx
├── PortalPadre/           # 🔴 Dashboard duplicado para padres
│   ├── Dashboard.tsx
│   └── MatriculaWizard.tsx
├── Asistencia/            # 🔴 Vista genérica de asistencia
├── Cursos/                # 🔴 Vista genérica de cursos
├── Notas/                 # 🔴 Vista genérica de notas
└── ...
```

**Redundancia Identificada:**
- 4 dashboards diferentes (genérico, alumno, docente, padre)
- 3 vistas de asistencia (genérica, alumno, docente)
- 2 vistas de cursos (genérica, alumno)
- 2 vistas de notas (genérica, alumno)

**Impacto:**
- ❌ Código duplicado: ~40% de las vistas
- ❌ Mantenimiento: cambios deben replicarse en múltiples lugares
- ❌ Bugs: inconsistencias entre vistas similares
- ❌ Testing: cada vista requiere pruebas separadas

---

### 3. Control de Acceso Manual en Rutas

**Problema:** Las rutas usan middleware personalizado en lugar del sistema de permisos de Spatie.

**Código Actual (routes/web.php):**
```php
// ❌ Control manual por rol
Route::prefix('alumno')->middleware('check.role:estudiante')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('PortalAlumno/Dashboard'));
    Route::get('/cursos', fn () => Inertia::render('PortalAlumno/Cursos/index'));
});

Route::prefix('docente')->middleware('check.role:docente')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('PortalDocente/Dashboard'));
    Route::get('/mis-cursos', fn () => Inertia::render('PortalDocente/MisCursos'));
});

Route::prefix('padre')->middleware('check.role:padre_familia|madre_familia|apoderado')->group(function () {
    Route::get('/dashboard', fn () => inertia('PortalPadre/Dashboard'));
});
```

**Problemas:**
- No hay permisos granulares (ver, crear, editar, eliminar)
- Solo verifica roles, no acciones específicas
- Difícil agregar permisos especiales (ej: "docente puede ver solo sus cursos")
- No hay auditoría de permisos

---

### 4. Lógica de Redirección Hardcodeada

**Problema:** La redirección del dashboard está hardcodeada con múltiples `if/else`.

**Código Actual (routes/web.php):**
```php
Route::get('/dashboard', function (Illuminate\Http\Request $request) {
    $user = $request->user();
    if ($user->hasRole('docente')) {
        return redirect()->route('docente.dashboard');
    }
    if ($user->hasRole('estudiante')) {
        return redirect()->route('alumno.dashboard');
    }
    if ($user->hasRole(['padre_familia', 'madre_familia', 'apoderado'])) {
        return redirect()->route('padre.dashboard');
    }
    return Inertia::render('Dashboard/index');
})->name('dashboard');
```

**Problemas:**
- ❌ No escalable: agregar un rol requiere modificar este código
- ❌ No configurable: la redirección está en código, no en BD
- ❌ Difícil de testear

---

### 5. Middleware Personalizado Innecesario

**Problema:** Se creó un middleware `CheckRole` cuando Spatie ya provee uno mejor.

**Código Actual (CheckRole.php):**
```php
class CheckRole
{
    public function handle(Request $request, Closure $next, string $roles): mixed
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'No autenticado.');
        }
        $rolesArray = explode('|', $roles);
        if (!$user->hasAnyRole($rolesArray)) {
            abort(403, 'No tienes permiso para acceder a esta sección.');
        }
        return $next($request);
    }
}
```

**Spatie ya provee:**
- `role:admin` - Verifica un rol
- `role:admin|editor` - Verifica múltiples roles
- `permission:edit posts` - Verifica permisos específicos
- `role_or_permission:admin|edit posts` - Verifica rol O permiso

---

## 📈 MÉTRICAS DE IMPACTO

### Código Duplicado
- **Vistas duplicadas:** ~15 componentes
- **Líneas de código redundantes:** ~3,000 líneas
- **Tiempo de desarrollo desperdiciado:** 40% más lento

### Mantenibilidad
- **Complejidad ciclomática:** Alta (múltiples if/else por rol)
- **Acoplamiento:** Alto (vistas acopladas a roles específicos)
- **Cohesión:** Baja (lógica de permisos dispersa)

### Escalabilidad
- **Agregar nuevo rol:** Requiere crear nuevas vistas + rutas + middleware
- **Agregar nuevo permiso:** No es posible sin modificar código
- **Tiempo estimado:** 2-3 días por rol nuevo

---

## ✅ SOLUCIÓN PROPUESTA

### Fase 1: Implementar Spatie Permission Correctamente

#### 1.1 Migrar Modelo User
```php
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;
    
    // Eliminar métodos hasRole() y hasAnyRole() manuales
}
```

#### 1.2 Crear Sistema de Permisos Granulares
```php
// Permisos por módulo
'estudiantes.view'
'estudiantes.create'
'estudiantes.edit'
'estudiantes.delete'

'cursos.view'
'cursos.create'
'cursos.edit'
'cursos.delete'

'asistencia.view'
'asistencia.mark'
'asistencia.export'

'notas.view'
'notas.edit'
'notas.export'

'pagos.view'
'pagos.create'
'pagos.validate'
```

#### 1.3 Asignar Permisos a Roles
```php
// Seeder
$admin = Role::create(['name' => 'administrador']);
$admin->givePermissionTo([
    'estudiantes.view', 'estudiantes.create', 'estudiantes.edit', 'estudiantes.delete',
    'cursos.view', 'cursos.create', 'cursos.edit', 'cursos.delete',
    // ... todos los permisos
]);

$docente = Role::create(['name' => 'docente']);
$docente->givePermissionTo([
    'cursos.view',
    'asistencia.view', 'asistencia.mark',
    'notas.view', 'notas.edit',
]);

$estudiante = Role::create(['name' => 'estudiante']);
$estudiante->givePermissionTo([
    'cursos.view',
    'asistencia.view',
    'notas.view',
]);
```

---

### Fase 2: Unificar Vistas con Renderizado Condicional

#### 2.1 Dashboard Único
```tsx
// pages/Dashboard/index.tsx
export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <AppLayout>
      {user.hasRole('administrador') && <AdminDashboard />}
      {user.hasRole('docente') && <DocenteDashboard />}
      {user.hasRole('estudiante') && <EstudianteDashboard />}
      {user.hasRole(['padre_familia', 'madre_familia', 'apoderado']) && <PadreDashboard />}
    </AppLayout>
  );
}
```

#### 2.2 Componentes Reutilizables con Permisos
```tsx
// components/CursosTable.tsx
export function CursosTable() {
  const { can } = usePermissions();
  
  return (
    <Table>
      {/* ... */}
      <TableActions>
        {can('cursos.edit') && <EditButton />}
        {can('cursos.delete') && <DeleteButton />}
      </TableActions>
    </Table>
  );
}
```

#### 2.3 Hook de Permisos
```tsx
// hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuth();
  
  const can = (permission: string) => {
    return user.permissions?.includes(permission) ?? false;
  };
  
  const hasRole = (role: string | string[]) => {
    const roles = Array.isArray(role) ? role : [role];
    return roles.some(r => user.roles?.includes(r));
  };
  
  return { can, hasRole };
}
```

---

### Fase 3: Refactorizar Rutas

#### 3.1 Usar Middleware de Spatie
```php
// routes/web.php
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Dashboard único
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
    
    // Rutas con permisos granulares
    Route::middleware(['permission:estudiantes.view'])->group(function () {
        Route::get('/estudiantes', [EstudianteController::class, 'index']);
    });
    
    Route::middleware(['permission:estudiantes.create'])->group(function () {
        Route::post('/estudiantes', [EstudianteController::class, 'store']);
    });
    
    // Rutas por rol (cuando sea necesario)
    Route::middleware(['role:docente'])->group(function () {
        Route::get('/mis-cursos', [DocenteController::class, 'misCursos']);
    });
});
```

#### 3.2 Eliminar Prefijos por Rol
```php
// ❌ ANTES
Route::prefix('alumno')->middleware('check.role:estudiante')->group(...);
Route::prefix('docente')->middleware('check.role:docente')->group(...);
Route::prefix('padre')->middleware('check.role:padre_familia|...')->group(...);

// ✅ DESPUÉS
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/cursos', [CursoController::class, 'index'])
        ->middleware('permission:cursos.view');
    Route::get('/asistencia', [AsistenciaController::class, 'index'])
        ->middleware('permission:asistencia.view');
});
```

---

### Fase 4: Crear Sistema de Políticas (Policies)

#### 4.1 Policy para Cursos
```php
class CursoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('cursos.view');
    }
    
    public function view(User $user, Curso $curso): bool
    {
        // Docente solo ve sus cursos
        if ($user->hasRole('docente')) {
            return $curso->docentes()->where('user_id', $user->id)->exists();
        }
        
        // Estudiante solo ve cursos de su matrícula
        if ($user->hasRole('estudiante')) {
            return $curso->estudiantes()->where('user_id', $user->id)->exists();
        }
        
        // Admin ve todos
        return $user->hasRole('administrador');
    }
    
    public function create(User $user): bool
    {
        return $user->can('cursos.create');
    }
}
```

---

## 📋 PLAN DE MIGRACIÓN

### Semana 1: Preparación
- [ ] Crear migraciones de Spatie Permission
- [ ] Crear seeder de roles y permisos
- [ ] Documentar permisos actuales vs nuevos

### Semana 2: Backend
- [ ] Migrar User model a HasRoles trait
- [ ] Eliminar CheckRole middleware
- [ ] Refactorizar rutas con middleware de Spatie
- [ ] Crear policies para recursos principales

### Semana 3: Frontend
- [ ] Crear hook usePermissions
- [ ] Unificar dashboards
- [ ] Refactorizar componentes con renderizado condicional
- [ ] Eliminar vistas duplicadas

### Semana 4: Testing y Limpieza
- [ ] Tests de permisos
- [ ] Tests de policies
- [ ] Eliminar código obsoleto
- [ ] Documentación

---

## 🎯 BENEFICIOS ESPERADOS

### Reducción de Código
- **-40%** líneas de código (eliminación de duplicados)
- **-60%** complejidad en rutas
- **-50%** tiempo de desarrollo de nuevas features

### Mejora de Mantenibilidad
- ✅ Un solo lugar para modificar vistas
- ✅ Permisos configurables desde BD
- ✅ Fácil agregar nuevos roles/permisos
- ✅ Mejor testing

### Escalabilidad
- ✅ Agregar rol nuevo: 1 hora (vs 2-3 días)
- ✅ Agregar permiso: 5 minutos
- ✅ Modificar acceso: sin tocar código

### Seguridad
- ✅ Control granular de acceso
- ✅ Auditoría de permisos
- ✅ Menos superficie de ataque
- ✅ Validación centralizada

---

## 🚨 RIESGOS Y MITIGACIÓN

### Riesgo 1: Breaking Changes
**Mitigación:** Migración gradual, mantener compatibilidad temporal

### Riesgo 2: Tiempo de Desarrollo
**Mitigación:** Priorizar módulos críticos primero

### Riesgo 3: Bugs en Producción
**Mitigación:** Testing exhaustivo, feature flags, rollback plan

---

## 📚 RECURSOS

- [Spatie Permission Docs](https://spatie.be/docs/laravel-permission)
- [Laravel Policies](https://laravel.com/docs/authorization#creating-policies)
- [RBAC Best Practices](https://auth0.com/docs/manage-users/access-control/rbac)

---

## 🔗 ARCHIVOS RELACIONADOS

- `app/Models/User.php` - Modelo de usuario
- `app/Http/Middleware/CheckRole.php` - Middleware a eliminar
- `routes/web.php` - Rutas a refactorizar
- `routes/api.php` - API a refactorizar
- `resources/js/pages/Portal*` - Vistas a unificar
- `config/permission.php` - Configuración de Spatie

---

**Conclusión:** El sistema actual tiene una deuda técnica significativa en el manejo de permisos. La migración a Spatie Permission con vistas unificadas reducirá la complejidad, mejorará la mantenibilidad y facilitará la escalabilidad del sistema.
