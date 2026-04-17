# Documentación de Permisos por Rol

Carpeta generada automáticamente desde la BD real.
Cada archivo documenta los permisos actuales de un rol.

## Archivos

| Archivo | Rol | Permisos |
|---|---|---|
| `administrador.md` | administrador | 112 |
| `docente.md` | docente | 18 |
| `estudiante.md` | estudiante | 18 |
| `usuario.md` | usuario | 3 |

> Los roles `padre_familia`, `madre_familia` y `apoderado` comparten los mismos 11 permisos
> y están documentados directamente en `RolesAndPermissionsSeeder.php` como `$familiaPermissions`.

## Roles sin permisos (en BD)
- `psicologo` — 0 permisos (rol creado pero sin asignar)
- `vi` — 0 permisos (rol creado pero sin asignar)

## Fuente de verdad
El seeder principal es:
`database/seeders/RolesAndPermissionsSeeder.php`

Para re-aplicar todos los permisos:
```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
```
