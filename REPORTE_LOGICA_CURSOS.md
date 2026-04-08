# Reporte: Diferencias de Lógica - Gestión de Cursos

## Fecha: 2026-04-07

---

## 1. SISTEMA ANTIGUO (bautistalapascana)

### Flujo de Navegación:
```
/niveles (lista de niveles)
  └─> Click en "Gestión de Cursos" de un nivel específico
      └─> /admin/index.php?menu=2&nivel_id=X
          └─> Muestra directamente los CURSOS del nivel seleccionado
          └─> Título: "Cursos [NOMBRE_NIVEL]" (ej: "Cursos INICIAL")
          └─> Modal: "Agregar Curso" para ese nivel específico
```

### Características:
- **Vista directa**: Al hacer clic en "Gestión de Cursos" desde un nivel, va directo a los cursos
- **Filtrado automático**: Solo muestra cursos del nivel seleccionado
- **Contexto claro**: El título indica el nivel actual
- **Modal contextual**: El formulario ya sabe a qué nivel pertenece el curso

### Funcionalidad del Modal "Agregar Curso":

**Campos del formulario:**
1. **Foto del Curso** (opcional)
   - Preview de imagen (100% x 150px)
   - Acepta: PNG, JPG, GIF
   - Tamaño máximo: 50MB
   - Nombre del archivo: `[NOMBRE_CURSO]_[NIVEL_ID].[ext]`
   - Ruta: `/images/Institucion/Cursos/`

2. **Nivel Académico** (solo lectura)
   - Muestra el nombre del nivel seleccionado
   - Campo deshabilitado (viene del contexto)

3. **Nombre del Curso** (requerido)
   - Input text en mayúsculas
   - Pattern: `[A-z0-9 ].{1,}`
   - Placeholder: "NOMBRE"
   - Ejemplo: "MATEMÁTICA", "COMUNICACIÓN"

4. **Descripción** (requerido)
   - Textarea de 3 filas en mayúsculas
   - Pattern: `^([a-zA-Z ])[a-zA-Z0-9-_–\. ]+{1,60}$`
   - Placeholder: "Ingrese descripcion"

**Proceso de guardado:**
```sql
INSERT INTO cursos VALUES (
  '0',                    -- curso_id (auto)
  '8',                    -- grado_academico (hardcoded)
  UPPER('$curnom'),       -- nombre
  UPPER('$curdesc'),      -- descripcion
  '$nomfoto',             -- logo (opcional)
  '$idniv',               -- nivel_academico_id
  null                    -- campo adicional
)
```

**Nota importante:** 
- El campo `grado_academico` se inserta con valor fijo '8'
- El `nivel_academico_id` viene del contexto (nivel seleccionado)
- La relación es: Nivel → Curso (sin capa intermedia de Grado)

### Estructura de datos:
```
Nivel (INICIAL, PRIMARIA, SECUNDARIA)
  └─> Cursos (MATEMÁTICA, COMUNICACIÓN, etc.)
      - curso_id
      - grado_academico (valor fijo: 8)
      - nombre
      - descripcion
      - logo
      - nivel_academico_id
```

---

## 2. SISTEMA NUEVO (bautista)

### Flujo de Navegación Actual:
```
/niveles (lista de niveles)
  └─> Click en "Gestión de Cursos" de un nivel específico
      └─> /cursos?nivel_id=34
          └─> Muestra TODOS los GRADOS de TODOS los niveles ❌
          └─> Título: "Cursos" (genérico)
          └─> Tabla: Lista de Grados (no cursos)
          └─> Click en un grado específico
              └─> Muestra los cursos de ese grado
```

### Características:
- **Vista indirecta**: Requiere dos pasos (seleccionar grado, luego ver cursos)
- **Sin filtrado**: Ignora el parámetro `nivel_id` de la URL
- **Contexto perdido**: No se sabe de qué nivel venimos
- **Navegación extra**: Necesitas hacer clic adicional para ver cursos

### Funcionalidad del Modal "Agregar Curso":

**Campos del formulario:**
1. **Foto del Curso** (opcional)
   - Preview de imagen (aspecto cuadrado)
   - Acepta: image/*
   - Tamaño recomendado: 512x512px
   - Upload mediante input file oculto

2. **Nivel Académico** (solo lectura)
   - Muestra el nombre del nivel
   - Campo deshabilitado con fondo gris
   - Valor viene del grado seleccionado

3. **Nombre del Curso** (requerido)
   - FormField reutilizable
   - Placeholder: "Ej: MATEMÁTICA, COMUNICACIÓN..."
   - Validación en backend

4. **Descripción** (opcional)
   - Textarea con altura mínima
   - Placeholder: "Ingrese una descripción breve del curso..."
   - Sin validación de patrón

**Proceso de guardado:**
```typescript
// POST /cursos
{
  grado_academico: selectedGrado.grado_id,
  nivel_academico_id: selectedGrado.nivel_id,
  nombre: form.nombre,
  descripcion: form.descripcion,
  logo: file (FormData)
}
```

**Diferencias clave:**
- El `grado_academico` es dinámico (viene del grado seleccionado)
- El `nivel_academico_id` viene del grado seleccionado
- La relación es: Nivel → Grado → Curso (con capa intermedia)
- Usa componentes reutilizables (FormField, FormSection, Dialog)

### Estructura de datos:
```
Nivel (INICIAL, PRIMARIA, SECUNDARIA)
  └─> Grados (1ER GRADO, 2DO GRADO, 5 AÑOS, etc.)
      └─> Cursos (MATEMÁTICA, COMUNICACIÓN, etc.)
          - curso_id
          - grado_academico (FK a grados)
          - nombre
          - descripcion
          - logo
          - nivel_academico_id (FK a niveles)
          - estado
```

---

## 3. PROBLEMA IDENTIFICADO

### El sistema nuevo tiene una capa adicional (Grados):

**Sistema Antiguo:**
```
Nivel → Cursos
(Grado es un campo fijo con valor '8')
```

**Sistema Nuevo:**
```
Nivel → Grados → Cursos
(Grado es una entidad completa con relaciones)
```

### Diferencias en el modelo de datos:

| Aspecto | Sistema Antiguo | Sistema Nuevo |
|---------|----------------|---------------|
| **Relación** | Nivel → Curso (directa) | Nivel → Grado → Curso (indirecta) |
| **Campo grado_academico** | Valor fijo: '8' | FK dinámica a tabla grados |
| **Navegación** | 1 paso (ver cursos) | 2 pasos (seleccionar grado → ver cursos) |
| **Contexto** | Nivel siempre visible | Nivel se pierde en la navegación |
| **Filtrado** | Automático por nivel | Manual por grado |

### Cuando llegas a `/cursos?nivel_id=34`:

**Comportamiento esperado (según sistema antiguo):**
- Mostrar los cursos del nivel 34 directamente
- Título: "Cursos INICIAL"
- Modal pre-configurado para nivel INICIAL

**Comportamiento actual:**
- Mostrar TODOS los grados de TODOS los niveles ❌
- Ignorar el parámetro `nivel_id` ❌
- Requerir selección manual de un grado ❌
- Título genérico: "Cursos" ❌

---

## 4. ANÁLISIS DE CÓDIGO

### Archivo: `bautista/resources/js/pages/Cursos/index.tsx`

#### Problema 1: No lee el parámetro `nivel_id` de la URL
```typescript
// ❌ FALTA: Leer nivel_id de la URL
// const searchParams = new URLSearchParams(window.location.search);
// const nivelId = searchParams.get('nivel_id');
```

#### Problema 2: Carga TODOS los grados sin filtrar
```typescript
useEffect(() => {
    setLoadingG(true);
    api.get('/grados', { params: { per_page: 500 } })  // ❌ Sin filtro por nivel
        .then((res) => setGrados(res.data.data ?? []))
        .finally(() => setLoadingG(false));
}, []);
```

#### Problema 3: Vista principal muestra grados en lugar de cursos
```typescript
{!selectedGrado ? (
    // ❌ Muestra tabla de GRADOS
    <table>...</table>
) : (
    // ✓ Muestra tabla de CURSOS (solo después de seleccionar grado)
    <table>...</table>
)}
```

---

## 5. SOLUCIONES PROPUESTAS

### Opción A: Mantener la estructura actual (Nivel → Grado → Curso)
**Ventajas:**
- Más granular y organizado
- Permite gestión por grado

**Cambios necesarios:**
1. Leer `nivel_id` de la URL
2. Filtrar grados para mostrar solo los del nivel seleccionado
3. Cambiar título a "Cursos - [NOMBRE_NIVEL]"
4. Pre-seleccionar automáticamente si el nivel solo tiene un grado

### Opción B: Simplificar a estructura antigua (Nivel → Curso)
**Ventajas:**
- Más directo y simple
- Coincide con el sistema antiguo

**Cambios necesarios:**
1. Eliminar la capa de grados de la vista
2. Mostrar cursos directamente al llegar desde niveles
3. Asociar cursos directamente a niveles (cambio en BD)

### Opción C: Híbrida (Recomendada)
**Ventajas:**
- Mantiene la estructura de grados
- Comportamiento similar al sistema antiguo

**Cambios necesarios:**
1. Cuando llegas con `nivel_id`:
   - Filtrar grados del nivel
   - Si hay solo 1 grado: auto-seleccionarlo y mostrar cursos
   - Si hay múltiples grados: mostrar lista filtrada
2. Actualizar título con contexto del nivel
3. Breadcrumb: Dashboard → Niveles → [Nivel] → Cursos

---

## 6. IMPACTO EN OTROS MÓDULOS

### Página de Niveles (`/niveles`)
- El botón "Gestión de Cursos" envía a `/cursos?nivel_id=X`
- Espera que se muestren los cursos de ese nivel

### Base de Datos
- Tabla `cursos` tiene relación con `grados`
- Tabla `grados` tiene relación con `niveles`
- Estructura: `niveles` → `grados` → `cursos`

---

## 7. RECOMENDACIÓN FINAL

**Implementar Opción C (Híbrida)** porque:

1. ✅ Mantiene la estructura de datos actual (no requiere migración)
2. ✅ Proporciona experiencia similar al sistema antiguo
3. ✅ Permite flexibilidad para niveles con múltiples grados
4. ✅ Mejora la UX con auto-selección inteligente

### Pasos de implementación:
1. Agregar hook para leer `nivel_id` de URL
2. Filtrar grados por `nivel_id` cuando esté presente
3. Auto-seleccionar grado si solo hay uno
4. Actualizar título y breadcrumbs con contexto
5. Mantener funcionalidad actual cuando se accede sin `nivel_id`

---

## 8. CÓDIGO DE EJEMPLO (Solución Propuesta)

```typescript
// Leer nivel_id de la URL
const [nivelIdFromUrl, setNivelIdFromUrl] = useState<string | null>(null);

useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nivel = params.get('nivel_id');
    setNivelIdFromUrl(nivel);
}, []);

// Cargar grados filtrados por nivel si viene de URL
useEffect(() => {
    setLoadingG(true);
    const params = nivelIdFromUrl 
        ? { nivel_id: nivelIdFromUrl, per_page: 500 }
        : { per_page: 500 };
    
    api.get('/grados', { params })
        .then((res) => {
            const gradosData = res.data.data ?? [];
            setGrados(gradosData);
            
            // Auto-seleccionar si solo hay un grado
            if (nivelIdFromUrl && gradosData.length === 1) {
                handleSelectGrado(gradosData[0]);
            }
        })
        .finally(() => setLoadingG(false));
}, [nivelIdFromUrl]);
```

---

## CONCLUSIÓN

El sistema nuevo tiene una arquitectura más compleja (Nivel → Grado → Curso) vs el antiguo (Nivel → Curso), lo que causa confusión en la navegación. La solución recomendada es implementar filtrado inteligente y auto-selección para mantener la experiencia del usuario similar al sistema antiguo, mientras se preserva la estructura de datos actual.


---

## 9. COMPARACIÓN DE MODALES

### Modal "Agregar Curso" - Sistema Antiguo

**Ventajas:**
- ✅ Contexto claro (muestra el nivel)
- ✅ Campos simples y directos
- ✅ Preview de imagen integrado
- ✅ Validación con patterns HTML5
- ✅ Transformación automática a mayúsculas

**Desventajas:**
- ❌ Código duplicado (M_Curso.php y E_Curso.php muy similares)
- ❌ Sin componentes reutilizables
- ❌ Validación solo en frontend
- ❌ Manejo de archivos en PHP puro
- ❌ SQL injection vulnerable

### Modal "Agregar Curso" - Sistema Nuevo

**Ventajas:**
- ✅ Componentes reutilizables (FormField, FormSection, Dialog)
- ✅ Validación en backend (Laravel)
- ✅ TypeScript para type safety
- ✅ Manejo seguro de archivos
- ✅ Diseño responsivo (móvil y desktop)
- ✅ Estados de carga (processing)
- ✅ Manejo de errores de API

**Desventajas:**
- ❌ Contexto menos claro (depende del grado seleccionado)
- ❌ Requiere navegación previa (seleccionar grado)
- ❌ Sin transformación automática a mayúsculas
- ❌ Sin validación de patterns en frontend

---

## 10. RECOMENDACIONES ADICIONALES

### Para el Modal:

1. **Agregar transformación a mayúsculas:**
```typescript
<Input
  value={form.nombre}
  onChange={(e) => set('nombre', e.target.value.toUpperCase())}
  className="uppercase"
/>
```

2. **Agregar validación de patterns:**
```typescript
<Input
  pattern="[A-Za-z0-9 ]{2,}"
  title="Solo letras, números y espacios"
/>
```

3. **Mejorar el contexto visual:**
```typescript
<DialogTitle>
  Agregar Curso - {selectedGrado.nivel?.nombre_nivel}
</DialogTitle>
```

4. **Agregar breadcrumb en el modal:**
```typescript
<p className="text-sm text-gray-500">
  {selectedGrado.nivel?.nombre_nivel} → {selectedGrado.nombre_grado}
</p>
```

### Para la navegación:

1. **Implementar filtrado por nivel_id**
2. **Auto-seleccionar grado único**
3. **Actualizar título con contexto**
4. **Agregar breadcrumb completo**

---

## CONCLUSIÓN FINAL

El sistema nuevo tiene mejor arquitectura técnica (componentes reutilizables, TypeScript, validación backend), pero peor UX debido a la navegación indirecta. La solución ideal es:

1. **Mantener** la arquitectura técnica del sistema nuevo
2. **Implementar** el filtrado inteligente por nivel
3. **Mejorar** el contexto visual en modales y títulos
4. **Agregar** auto-selección para simplificar la navegación

Esto dará como resultado: **Mejor código + Mejor UX = Sistema óptimo**
