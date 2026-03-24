# Skill: Migración de Rutas y API

## Objetivo
Documentar y migrar todas las rutas del proyecto antiguo al nuevo sistema de rutas Laravel.

## Análisis de Rutas Actuales
**Origen**: `bautistalapascana/rutas/`

### Pasos
1. Listar todas las rutas existentes
2. Identificar métodos HTTP (GET, POST, PUT, DELETE)
3. Documentar parámetros y respuestas
4. Mapear a nuevas rutas Laravel

## Estructura de Rutas en Laravel
**Ubicación**: `bautista/routes/`

```php
// routes/web.php - Rutas con Inertia
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

// routes/api.php - API REST
Route::middleware('api')->group(function () {
    Route::apiResource('users', UserController::class);
});
```

## Mapeo de Rutas

### Autenticación
- POST `/login` → AuthController@login
- POST `/logout` → AuthController@logout
- POST `/register` → AuthController@register

### Usuarios
- GET `/users` → UserController@index
- POST `/users` → UserController@store
- GET `/users/{id}` → UserController@show
- PUT `/users/{id}` → UserController@update
- DELETE `/users/{id}` → UserController@destroy

### Módulos (según análisis)
- Mapear cada módulo a su controlador

## Middleware
- Autenticación
- Autorización (roles/permisos)
- CORS (si es API)
- Rate limiting

## Validación
- [ ] Todas las rutas documentadas
- [ ] Métodos HTTP correctos
- [ ] Parámetros validados
- [ ] Respuestas consistentes
- [ ] Errores manejados
