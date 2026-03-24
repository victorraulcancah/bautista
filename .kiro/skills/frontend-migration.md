# Skill: Migración de Frontend

## Objetivo
Migrar vistas y assets del proyecto antiguo al nuevo stack React + Inertia.

## Vistas
**Origen**: `bautistalapascana/views/`
**Destino**: `bautista/resources/js/pages/`

### Proceso
1. Analizar cada vista PHP
2. Convertir a componentes React
3. Usar Inertia para comunicación con backend
4. Integrar con Tailwind CSS

### Ejemplo de Conversión
```php
// Antiguo: bautistalapascana/views/dashboard.php
// Nuevo: bautista/resources/js/pages/dashboard.tsx
```

## Assets
**Origen**: `bautistalapascana/assets/` y `bautistalapascana/assets2/`
**Destino**: `bautista/resources/`

### CSS
- Migrar a Tailwind CSS
- Ubicación: `bautista/resources/css/`

### JavaScript
- Convertir a TypeScript/React
- Ubicación: `bautista/resources/js/`

### Imágenes
- Copiar a: `bautista/public/images/`

## Componentes Reutilizables
**Ubicación**: `bautista/resources/js/components/`

Crear componentes para:
- Formularios
- Tablas
- Modales
- Alertas
- Navegación

## Validación
- [ ] Todas las vistas convertidas
- [ ] Assets integrados
- [ ] Estilos aplicados correctamente
- [ ] Funcionalidad JavaScript funcionando
- [ ] Responsive design verificado
