# Skill: Migración de Base de Datos

## Objetivo
Documentar y migrar la base de datos de `bautistalapascana` al nuevo proyecto `bautista`.

## Pasos

### 1. Exportar Base de Datos Actual
```bash
# Ubicación del archivo SQL
bautistalapascana/edu_ingenierosjunior.sql
```

### 2. Analizar Estructura
- Tablas principales
- Relaciones (Foreign Keys)
- Índices
- Triggers (si existen)

### 3. Crear Migraciones Laravel
```php
// Ubicación: bautista/database/migrations/
// Crear migraciones para cada tabla
```

### 4. Crear Seeders
```php
// Ubicación: bautista/database/seeders/
// Importar datos existentes
```

### 5. Crear Eloquent Models
```php
// Ubicación: bautista/app/Models/
// Un modelo por tabla principal
```

## Tablas Esperadas (basado en estructura)
- usuarios
- asistencia
- cursos
- modulos
- calificaciones
- (otras según análisis)

## Validación
- [ ] Todas las tablas creadas
- [ ] Relaciones funcionando
- [ ] Datos importados correctamente
- [ ] Integridad referencial verificada
