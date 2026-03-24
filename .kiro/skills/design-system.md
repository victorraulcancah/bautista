# Skill: Sistema de Diseño - Colores y Tonalidades

## Objetivo
Documentar y mantener consistencia en el patrón de diseño, colores y tonalidades del proyecto Bautista.

## Paleta de Colores Principal

### Colores Base
```
Primario:     #3B82F6 (Azul)
Secundario:   #10B981 (Verde)
Acento:       #F59E0B (Ámbar)
Peligro:      #EF4444 (Rojo)
Advertencia:  #F97316 (Naranja)
Éxito:        #22C55E (Verde Claro)
Info:         #06B6D4 (Cian)
```

### Escala de Grises
```
Gray-50:      #F9FAFB
Gray-100:     #F3F4F6
Gray-200:     #E5E7EB
Gray-300:     #D1D5DB
Gray-400:     #9CA3AF
Gray-500:     #6B7280
Gray-600:     #4B5563
Gray-700:     #374151
Gray-800:     #1F2937
Gray-900:     #111827
```

## Tonalidades por Color

### Azul Primario (#3B82F6)
```
50:   #EFF6FF
100:  #DBEAFE
200:  #BFDBFE
300:  #93C5FD
400:  #60A5FA
500:  #3B82F6 (Base)
600:  #2563EB
700:  #1D4ED8
800:  #1E40AF
900:  #1E3A8A
```

### Verde Secundario (#10B981)
```
50:   #F0FDF4
100:  #DCFCE7
200:  #BBFBCF
300:  #86EFAC
400:  #4ADE80
500:  #22C55E
600:  #16A34A
700:  #15803D
800:  #166534
900:  #134E4A
```

### Ámbar Acento (#F59E0B)
```
50:   #FFFBEB
100:  #FEF3C7
200:  #FDE68A
300:  #FCD34D
400:  #FBBF24
500:  #F59E0B (Base)
600:  #D97706
700:  #B45309
800:  #92400E
900:  #78350F
```

### Rojo Peligro (#EF4444)
```
50:   #FEF2F2
100:  #FEE2E2
200:  #FECACA
300:  #FCA5A5
400:  #F87171
500:  #EF4444 (Base)
600:  #DC2626
700:  #B91C1C
800:  #991B1B
900:  #7F1D1D
```

## Tipografía

### Fuentes
```
Primaria:     Inter, system-ui, sans-serif
Monoespaciada: Fira Code, monospace
```

### Tamaños
```
xs:   12px (0.75rem)
sm:   14px (0.875rem)
base: 16px (1rem)
lg:   18px (1.125rem)
xl:   20px (1.25rem)
2xl:  24px (1.5rem)
3xl:  30px (1.875rem)
4xl:  36px (2.25rem)
```

### Pesos
```
Light:       300
Regular:     400
Medium:      500
Semibold:    600
Bold:        700
```

## Espaciado

```
xs:   4px   (0.25rem)
sm:   8px   (0.5rem)
md:   16px  (1rem)
lg:   24px  (1.5rem)
xl:   32px  (2rem)
2xl:  48px  (3rem)
3xl:  64px  (4rem)
```

## Bordes y Radios

### Border Radius
```
none:   0px
sm:     2px
base:   4px
md:     6px
lg:     8px
xl:     12px
2xl:    16px
full:   9999px
```

### Border Width
```
thin:   1px
base:   2px
thick:  4px
```

## Sombras

### Sombras Estándar
```
sm:     0 1px 2px 0 rgba(0, 0, 0, 0.05)
base:   0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
md:     0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
lg:     0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
xl:     0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
```

## Componentes y Colores

### Botones
```
Primario:     Fondo Azul-600, Texto Blanco
Secundario:   Fondo Gris-200, Texto Gris-900
Éxito:        Fondo Verde-600, Texto Blanco
Peligro:      Fondo Rojo-600, Texto Blanco
Outline:      Borde Azul-600, Fondo Transparente, Texto Azul-600
```

### Alertas
```
Éxito:        Fondo Verde-50, Borde Verde-200, Texto Verde-800
Advertencia:  Fondo Ámbar-50, Borde Ámbar-200, Texto Ámbar-800
Error:        Fondo Rojo-50, Borde Rojo-200, Texto Rojo-800
Info:         Fondo Azul-50, Borde Azul-200, Texto Azul-800
```

### Inputs
```
Borde:        Gris-300
Foco:         Azul-500 (borde), Azul-50 (fondo)
Deshabilitado: Gris-100 (fondo), Gris-400 (texto)
Error:        Rojo-500 (borde), Rojo-50 (fondo)
```

### Tarjetas
```
Fondo:        Blanco
Borde:        Gris-200
Sombra:       md
Hover:        Sombra lg, Gris-50 (fondo)
```

## Modo Oscuro (Dark Mode)

### Colores Oscuros
```
Fondo Primario:   #111827 (Gray-900)
Fondo Secundario: #1F2937 (Gray-800)
Texto Primario:   #F9FAFB (Gray-50)
Texto Secundario: #D1D5DB (Gray-300)
Borde:            #374151 (Gray-700)
```

## Configuración en Tailwind

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      danger: '#EF4444',
      warning: '#F97316',
      success: '#22C55E',
      info: '#06B6D4',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px',
      '3xl': '64px',
    },
    borderRadius: {
      sm: '2px',
      base: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      '2xl': '16px',
      full: '9999px',
    },
  },
}
```

## Checklist de Implementación
- [ ] Colores configurados en Tailwind
- [ ] Componentes usando paleta
- [ ] Tipografía consistente
- [ ] Espaciado uniforme
- [ ] Sombras aplicadas correctamente
- [ ] Dark mode implementado
- [ ] Validación en todos los navegadores
- [ ] Accesibilidad de contraste verificada
