# Sistema de Permisos Jerárquico

## Problema Actual
El sistema de permisos actual está mal diseñado porque:
1. Los permisos son demasiado genéricos (ej: `institucion.ver`)
2. No hay jerarquía clara entre módulos, vistas y acciones
3. No se puede controlar granularmente qué puede hacer cada rol en cada vista

## Arquitectura Correcta

### Estructura Jerárquica
```
MÓDULO
  └── VISTA/PÁGINA
       └── ACCIÓN
```

### Nomenclatura
```
{modulo}.{vista}.{accion}
```

## Ejemplo: Módulo Institución

### Vista: Gestión de Instituciones (`/institucion`)

**Permisos:**
- `institucion.gestion.ver` - Ver la lista de instituciones
- `institucion.gestion.crear` - Crear nueva institución
- `institucion.gestion.editar` - Editar institución existente
- `institucion.gestion.eliminar` - Eliminar institución

### Vista: Galería (`/institucion/galeria`)

**Permisos:**
- `institucion.galeria.ver` - Ver galería
- `institucion.galeria.crear` - Subir imágenes
- `institucion.galeria.editar` - Editar imágenes
- `institucion.galeria.eliminar` - Eliminar imágenes

### Vista: Noticias (`/institucion/noticias`)

**Permisos:**
- `institucion.noticias.ver` - Ver noticias
- `institucion.noticias.crear` - Crear noticia
- `institucion.noticias.editar` - Editar noticia
- `institucion.noticias.eliminar` - Eliminar noticia
- `institucion.noticias.comentar` - Comentar en noticias

## Lógica de Control

### En el Backend (Rutas)
```php
// Vista principal - requiere permiso de ver
Route::get('/institucion', fn () => Inertia::render('Institucion/index'))
    ->middleware('permission:institucion.gestion.ver');

// API endpoints - cada uno con su permiso específico
Route::post('/api/instituciones', [InstitucionController::class, 'store'])
    ->middleware('permission:institucion.gestion.crear');

Route::put('/api/instituciones/{id}', [InstitucionController::class, 'update'])
    ->middleware('permission:institucion.gestion.editar');

Route::delete('/api/instituciones/{id}', [InstitucionController::class, 'destroy'])
    ->middleware('permission:institucion.gestion.eliminar');
```

### En el Frontend (UI)
```tsx
// Mostrar botón "Nueva Institución" solo si tiene permiso
{can('institucion.gestion.crear') && (
    <Button onClick={openCreate}>Nueva Institución</Button>
)}

// Mostrar botón "Editar" solo si tiene permiso
{can('institucion.gestion.editar') && (
    <Button onClick={() => openEdit(item)}>Editar</Button>
)}

// Mostrar botón "Eliminar" solo si tiene permiso
{can('institucion.gestion.eliminar') && (
    <Button onClick={() => setDeleting(item)}>Eliminar</Button>
)}
```

## Asignación por Roles

### Administrador
- Todos los permisos de todos los módulos

### Docente
- `institucion.galeria.ver` - Solo ver galería
- `institucion.noticias.ver` - Solo ver noticias
- `institucion.noticias.comentar` - Comentar noticias

### Estudiante
- `institucion.noticias.ver` - Solo ver noticias (sin comentar)

### Padre/Apoderado
- `institucion.galeria.ver` - Solo ver galería
- `institucion.noticias.ver` - Solo ver noticias

## Beneficios

1. **Granularidad**: Control fino sobre cada acción en cada vista
2. **Claridad**: Fácil entender qué hace cada permiso
3. **Escalabilidad**: Fácil agregar nuevas vistas y acciones
4. **Mantenibilidad**: Cambios en permisos no afectan otras áreas
5. **UI Dinámica**: La interfaz se adapta automáticamente a los permisos del usuario

## Migración

Para migrar el sistema actual:

1. Identificar todas las vistas y sus acciones
2. Crear permisos jerárquicos para cada acción
3. Actualizar rutas con permisos específicos
4. Actualizar componentes frontend con verificaciones de permisos
5. Reasignar permisos a roles según la nueva estructura
