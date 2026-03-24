# Skill: Patrones de Componentes UI

## Objetivo
Documentar patrones de diseño y componentes reutilizables para mantener consistencia visual.

## Componentes Base

### 1. Botones

#### Variantes
```
- Primary (Azul)
- Secondary (Gris)
- Success (Verde)
- Danger (Rojo)
- Warning (Ámbar)
- Outline
- Ghost
```

#### Tamaños
```
- sm: 8px padding, 12px font
- md: 12px padding, 14px font (default)
- lg: 16px padding, 16px font
```

#### Estados
```
- Default
- Hover (sombra aumentada)
- Active (escala 0.95)
- Disabled (opacidad 0.5)
- Loading (spinner)
```

### 2. Inputs

#### Tipos
```
- Text
- Email
- Password
- Number
- Textarea
- Select
- Checkbox
- Radio
```

#### Estados
```
- Default
- Focus (borde azul, fondo azul-50)
- Error (borde rojo, fondo rojo-50)
- Disabled (gris-100, cursor not-allowed)
- Success (borde verde)
```

#### Validación
```
- Requerido (*)
- Mensaje de error en rojo
- Mensaje de éxito en verde
- Hint text en gris-500
```

### 3. Tarjetas

#### Estructura
```
- Header (opcional)
- Body (contenido principal)
- Footer (opcional)
```

#### Estilos
```
- Fondo: Blanco
- Borde: Gris-200
- Sombra: md
- Border-radius: lg
- Padding: md
```

#### Variantes
```
- Elevated (sombra lg)
- Outlined (borde más visible)
- Flat (sin sombra)
```

### 4. Alertas

#### Tipos
```
- Success (Verde)
- Error (Rojo)
- Warning (Ámbar)
- Info (Azul)
```

#### Estructura
```
- Icono
- Título
- Mensaje
- Botón de cerrar (opcional)
```

#### Colores por Tipo
```
Success:  Fondo Verde-50, Borde Verde-200, Icono Verde-600
Error:    Fondo Rojo-50, Borde Rojo-200, Icono Rojo-600
Warning:  Fondo Ámbar-50, Borde Ámbar-200, Icono Ámbar-600
Info:     Fondo Azul-50, Borde Azul-200, Icono Azul-600
```

### 5. Modales

#### Estructura
```
- Overlay (fondo oscuro semi-transparente)
- Modal Container
  - Header (título + cerrar)
  - Body (contenido)
  - Footer (botones de acción)
```

#### Animación
```
- Entrada: fade-in + scale-up (200ms)
- Salida: fade-out + scale-down (150ms)
```

### 6. Navegación

#### Navbar
```
- Logo/Marca
- Links principales
- User menu (derecha)
- Mobile hamburger
```

#### Sidebar
```
- Logo
- Menu items
- Collapse/Expand
- User info (footer)
```

#### Breadcrumbs
```
- Separador: /
- Último item: sin link
- Hover: subrayado
```

### 7. Tablas

#### Estructura
```
- Header (encabezados)
- Body (filas)
- Footer (paginación, opcional)
```

#### Características
```
- Striped rows (gris-50 alternado)
- Hover effect (gris-100)
- Sortable headers
- Selectable rows (checkbox)
- Responsive (scroll en mobile)
```

### 8. Formularios

#### Layout
```
- Vertical (default)
- Horizontal (label + input lado a lado)
- Inline (en una línea)
```

#### Validación
```
- Real-time
- On blur
- On submit
- Mostrar errores debajo del input
```

### 9. Paginación

#### Elementos
```
- Botón anterior
- Números de página
- Botón siguiente
- Info: "Página X de Y"
```

#### Estados
```
- Activa (Azul-600)
- Inactiva (Gris-300)
- Deshabilitada (Gris-200, cursor not-allowed)
```

### 10. Badges

#### Variantes
```
- Solid (fondo sólido)
- Outline (solo borde)
- Soft (fondo claro)
```

#### Colores
```
- Primary (Azul)
- Secondary (Gris)
- Success (Verde)
- Danger (Rojo)
- Warning (Ámbar)
```

## Patrones de Interacción

### Feedback Visual
```
- Hover: cambio de color/sombra
- Active: escala 0.95
- Focus: outline azul
- Disabled: opacidad 0.5
```

### Transiciones
```
- Rápidas: 150ms (hover, focus)
- Normales: 200ms (modales, alertas)
- Lentas: 300ms (animaciones complejas)
```

### Espaciado Consistente
```
- Entre elementos: md (16px)
- Dentro de componentes: sm (8px)
- Márgenes de sección: lg (24px)
```

## Accesibilidad

### Contraste
```
- Texto sobre fondo: mínimo 4.5:1
- Componentes interactivos: mínimo 3:1
```

### Navegación por Teclado
```
- Tab order lógico
- Focus visible
- Enter/Space para activar
- Escape para cerrar modales
```

### ARIA Labels
```
- Botones: aria-label
- Inputs: aria-label o label asociado
- Alertas: role="alert"
- Modales: role="dialog"
```

## Checklist de Implementación
- [ ] Todos los componentes creados
- [ ] Colores consistentes
- [ ] Espaciado uniforme
- [ ] Transiciones suaves
- [ ] Estados visuales claros
- [ ] Accesibilidad verificada
- [ ] Responsive en todos los tamaños
- [ ] Dark mode compatible
