# Skill: Análisis de Migración - Bautista La Pascana

## Objetivo
Analizar la estructura actual del proyecto `bautistalapascana` y documentar todos los componentes necesarios para una migración exitosa al nuevo proyecto `bautista`.

## Componentes a Analizar

### 1. Base de Datos
- **Ubicación**: `bautistalapascana/edu_ingenierosjunior.sql`
- **Tarea**: Exportar esquema y datos
- **Validación**: Verificar integridad de relaciones

### 2. Configuración
- **Ubicación**: `bautistalapascana/config/`
- **Tarea**: Mapear variables de entorno
- **Validación**: Asegurar compatibilidad con Laravel

### 3. Autenticación
- **Ubicación**: `bautistalapascana/auth/`
- **Tarea**: Documentar lógica de autenticación
- **Validación**: Migrar a Laravel Fortify

### 4. Modelos de Datos
- **Ubicación**: `bautistalapascana/app/`
- **Tarea**: Identificar entidades principales
- **Validación**: Crear Eloquent Models

### 5. Funcionalidades
- **Ubicación**: `bautistalapascana/funcionalidades/`
- **Tarea**: Listar todas las características
- **Validación**: Mapear a Controllers/Services

### 6. Vistas
- **Ubicación**: `bautistalapascana/views/`
- **Tarea**: Convertir a Blade templates
- **Validación**: Verificar compatibilidad con React/Inertia

### 7. Assets
- **Ubicación**: `bautistalapascana/assets/` y `bautistalapascana/assets2/`
- **Tarea**: Migrar CSS/JS
- **Validación**: Integrar con Vite

### 8. Rutas
- **Ubicación**: `bautistalapascana/rutas/`
- **Tarea**: Documentar endpoints
- **Validación**: Crear rutas en Laravel

## Checklist de Migración
- [ ] Exportar base de datos
- [ ] Documentar configuración
- [ ] Mapear autenticación
- [ ] Crear Eloquent Models
- [ ] Convertir funcionalidades a Services
- [ ] Migrar vistas a Blade/React
- [ ] Integrar assets
- [ ] Crear rutas
- [ ] Testing
- [ ] Validación en producción
