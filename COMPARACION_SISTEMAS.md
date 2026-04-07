# 🔄 Comparación: Sistema Antiguo vs Sistema Nuevo

## 📊 Resumen Ejecutivo

Este documento compara la implementación actual del sistema nuevo (Laravel + React) con el análisis profundo del sistema antiguo (PHP) para identificar las diferencias y ajustes necesarios.

---

## ✅ Aspectos Correctamente Implementados

### 1. Jerarquía de Entidades
**Estado:** ✅ CORRECTO

Ambos sistemas coinciden en la estructura básica:
```
INSTITUCIÓN → NIVELES → GRADOS → SECCIONES
                  └─→ CURSOS (pool)
```

**DOCS_LOGICA_ACADEMICA.md:**
> "La estructura sigue un modelo de cascada desde lo general a lo específico"

**ANALISIS_SISTEMA_ANTIGUO.md:**
> Confirma la misma jerarquía con evidencia de código y base de datos

### 2. Concepto de "Pool de Cursos"
**Estado:** ✅ CORRECTO

**DOCS_LOGICA_ACADEMICA.md:**
> "El nivel Secundaria tiene un 'pool' de cursos (Matemática, Comunicación, etc.)"

**ANALISIS_SISTEMA_ANTIGUO.md:**
> Confirma: "Los cursos pertenecen PRINCIPALMENTE al nivel"
> SQL: `SELECT * FROM cursos WHERE nivel_academico_id='$idnil'`

### 3. Layout del Modal de Cursos
**Estado:** ✅ CORRECTO

**DOCS_LOGICA_ACADEMICA.md:**
> "Layout: 2 columnas (Imagen izquierda, Formulario derecha)"

**ANALISIS_SISTEMA_ANTIGUO.md:**
> Confirma el mismo layout con código HTML del sistema antiguo

### 4. Campo de Nivel Bloqueado
**Estado:** ✅ CORRECTO

**DOCS_LOGICA_ACADEMICA.md:**
> "Nivel: Bloqueado según el contexto"

**ANALISIS_SISTEMA_ANTIGUO.md:**
> Confirma: "Campo de nivel BLOQUEADO (readonly) con el nivel actual"

---

## ⚠️ Aspectos Parcialmente Implementados

### 1. Navegación Contextual
**Estado:** ⚠️ NECESITA AJUSTE

**DOCS_LOGICA_ACADEMICA.md:**
```
URL: /cursos?nivel_id=XX
Acción: Muestra directamente la lista de cursos del nivel
```

**ANALISIS_SISTEMA_ANTIGUO.md:**
```javascript
// Sistema antiguo usa carga dinámica
$('#opciones').load('views/Nivel/V_Detalles.php', { 
    "form": "cursos",
    "idniv": idniv,
    "ninom": ninom
});
```

**Diferencia:**
- El documento sugiere usar query params: `/cursos?nivel_id=XX`
- El sistema antiguo usa carga dinámica de vistas sin cambiar URL
- Ambos enfoques son válidos, pero el nuevo es más RESTful

**Recomendación:**
```
Opción 1 (RESTful): /niveles/{nivel_id}/cursos
Opción 2 (Query):   /cursos?nivel_id=XX
Opción 3 (Estado):  Componente condicional con estado local
```

### 2. Botón "Gestionar Cursos"
**Estado:** ⚠️ NECESITA IMPLEMENTACIÓN

**DOCS_LOGICA_ACADEMICA.md:**
> "Botón 'Gestionar Cursos': Muestra directamente la lista de cursos del nivel"

**ANALISIS_SISTEMA_ANTIGUO.md:**
```javascript
// Botón en tabla de niveles
{"defaultContent": "btnCur"}  // Botón CURSOS

$(document).on("click", ".btnCur", function(){
    // Captura nivel_id y nombre_nivel
    // Oculta tabla principal
    // Carga vista de cursos del nivel
});
```

**Falta implementar:**
- Botón "CURSOS" en la tabla de niveles
- Lógica de navegación al hacer clic
- Vista de cursos filtrada por nivel

---

## ❌ Aspectos Faltantes Críticos

### 1. Tabla Pivote `grados_cursos`
**Estado:** ❌ NO IMPLEMENTADO

**DOCS_LOGICA_ACADEMICA.md:**
> No menciona explícitamente la tabla pivote

**ANALISIS_SISTEMA_ANTIGUO.md:**
```sql
CREATE TABLE `grados_cursos` (
  `grac_id` int NOT NULL AUTO_INCREMENT,
  `id_grado` int NULL DEFAULT NULL,
  `id_curso` int NULL DEFAULT NULL,
  `grac_estado` int NULL DEFAULT NULL,
  PRIMARY KEY (`grac_id`)
)
```

**Impacto:**
- Sin esta tabla, no se pueden asignar cursos específicos a grados
- Los horarios por grado no funcionarán correctamente
- Falta la funcionalidad de "Cursos del Grado"

**Acción requerida:**
```php
// Crear migración
Schema::create('grados_cursos', function (Blueprint $table) {
    $table->id('grac_id');
    $table->foreignId('id_grado')->constrained('grados')->onDelete('cascade');
    $table->foreignId('id_curso')->constrained('cursos')->onDelete('cascade');
    $table->tinyInteger('grac_estado')->default(1);
    $table->timestamps();
});
```

### 2. Campo `grado_academico` Nullable en Cursos
**Estado:** ❌ PROBABLEMENTE NO NULLABLE

**DOCS_LOGICA_ACADEMICA.md:**
> "Grado Opcional: Un curso puede o no estar asignado a un grado específico"

**ANALISIS_SISTEMA_ANTIGUO.md:**
```sql
CREATE TABLE `cursos` (
  ...
  `nivel_academico_id` int NULL DEFAULT NULL,
  `grado_academico` int NULL DEFAULT NULL,  -- ← NULLABLE
  ...
)
```

```php
// Al insertar curso nuevo
$sql2 = "INSERT INTO cursos VALUES 
    ('0','8',UPPER('$curnom'),UPPER('$curdesc'),'$nomfoto','$idniv',null)";
    //                                                                  ↑
    //                                                            grado = NULL
```

**Verificar en migración actual:**
```php
// ¿Está así?
$table->foreignId('grado_academico')->nullable()->constrained('grados');

// ¿O así? (INCORRECTO)
$table->foreignId('grado_academico')->constrained('grados');
```

### 3. Funcionalidad de Asignación de Cursos a Grados
**Estado:** ❌ NO IMPLEMENTADO

**DOCS_LOGICA_ACADEMICA.md:**
> "Módulo Grados/Secciones: Permite ver los cursos específicos asignados a ese grado"

**ANALISIS_SISTEMA_ANTIGUO.md:**
```php
// Caso 4: Ver cursos asignados a un grado
case '4':
    $sql = "SELECT g.grac_id, g.id_curso, c.nombre, c.descripcion
            FROM grados_cursos g, cursos c
            WHERE c.curso_id = g.id_curso 
              AND g.id_grado ='$graid' 
              AND g.grac_estado='1'";

// Caso 5: Asignar curso a grado
case '5':
    $sql2 = "INSERT INTO grados_cursos VALUES ('0','$graid','$cur_id','1')";

// Caso 7: Desasignar curso (soft delete)
case '7':
    $sql0 = "UPDATE grados_cursos SET grac_estado='0' WHERE grac_id='$ebid'";
```

**Falta implementar:**
- Vista de cursos asignados a un grado
- Botón para asignar cursos del pool del nivel
- Botón para desasignar cursos
- Endpoints API correspondientes

### 4. Botón "Regresar" en Vista de Cursos
**Estado:** ❌ NO IMPLEMENTADO

**DOCS_LOGICA_ACADEMICA.md:**
> No menciona explícitamente el botón regresar

**ANALISIS_SISTEMA_ANTIGUO.md:**
```javascript
// Botón "Regresar"
$("#btnRegre").click(function() {
    $('#detalle').hide();      // Oculta vista de detalles
    $('#principal').show();    // Muestra tabla principal
});
```

**Falta implementar:**
- Botón "Regresar" en la vista de cursos por nivel
- Lógica de navegación hacia atrás
- Preservar estado de la tabla de niveles

---

## 📋 Diferencias en Implementación

### 1. Gestión de Imágenes

**Sistema Antiguo:**
```php
// Ruta: images/Institucion/Cursos/
// Nombre: {nombre_curso}_{nivel_id}.{extension}
$nomfoto = trim($curnom) . '_' . $idniv . $extension;
$destino = "../../../images/Institucion/Cursos/" . $nomfoto;
```

**DOCS_LOGICA_ACADEMICA.md:**
```
Ruta: storage/app/public/cursos/logos
```

**Diferencia:**
- Sistema antiguo: `images/Institucion/Cursos/`
- Sistema nuevo: `storage/app/public/cursos/logos`
- Ambos son válidos, pero deben ser consistentes

### 2. Método de Actualización con Imagen

**Sistema Antiguo:**
```php
// Usa POST directo con FormData
$.ajax({
    url: "functions/Nivel/Nivel.php",
    type: "POST",
    data: formData,
    contentType: false,
    processData: false
});
```

**DOCS_LOGICA_ACADEMICA.md:**
> "Las actualizaciones de cursos con imagen deben usar el método POST con _method=PUT"

**Diferencia:**
- Sistema antiguo: POST directo
- Sistema nuevo: POST con `_method=PUT` (Laravel method spoofing)
- El nuevo es más RESTful y correcto

### 3. Soft Delete vs Hard Delete

**Sistema Antiguo:**
```php
// Soft delete en grados_cursos
UPDATE grados_cursos SET grac_estado='0' WHERE grac_id='$ebid'

// Hard delete en niveles
DELETE FROM niveles_educativos WHERE nivel_id = '{$_POST['nivel']}'
```

**Sistema Nuevo:**
- Probablemente usa soft deletes de Laravel en todas las tablas
- Más consistente y seguro

---

## 🎯 Plan de Acción Prioritario

### Prioridad ALTA (Bloqueantes)

1. **Crear tabla pivote `grados_cursos`**
   - [ ] Crear migración
   - [ ] Agregar relaciones en modelos Grado y Curso
   - [ ] Crear seeders de prueba

2. **Verificar campo `grado_academico` nullable**
   - [ ] Revisar migración de cursos
   - [ ] Modificar si es necesario
   - [ ] Actualizar modelo Curso

3. **Implementar botón "Cursos" en tabla de Niveles**
   - [ ] Agregar columna en tabla de niveles
   - [ ] Implementar navegación a vista de cursos
   - [ ] Crear ruta `/niveles/{nivel}/cursos`

### Prioridad MEDIA (Funcionalidad)

4. **Crear vista de cursos por nivel**
   - [ ] Componente `CursosDelNivel.tsx`
   - [ ] Filtrar cursos por `nivel_academico_id`
   - [ ] Botón "Regresar" a niveles

5. **Implementar asignación de cursos a grados**
   - [ ] Vista de cursos asignados a un grado
   - [ ] Modal para asignar cursos del pool
   - [ ] Botón para desasignar cursos
   - [ ] Endpoints API

### Prioridad BAJA (Mejoras)

6. **Ajustar modal de cursos**
   - [ ] Verificar layout de 2 columnas
   - [ ] Campo de nivel bloqueado
   - [ ] Preview de imagen

7. **Documentación**
   - [ ] Actualizar DOCS_LOGICA_ACADEMICA.md con tabla pivote
   - [ ] Agregar diagramas de flujo
   - [ ] Documentar endpoints API

---

## 📊 Tabla Comparativa Detallada

| Aspecto | Sistema Antiguo | DOCS_LOGICA_ACADEMICA | Estado |
|---------|----------------|----------------------|--------|
| Jerarquía básica | ✅ Niveles → Grados → Secciones | ✅ Documentado | ✅ OK |
| Pool de cursos | ✅ Por nivel | ✅ Documentado | ✅ OK |
| Tabla `grados_cursos` | ✅ Existe | ❌ No mencionada | ❌ FALTA |
| Campo `grado_academico` NULL | ✅ Nullable | ✅ Mencionado como opcional | ⚠️ VERIFICAR |
| Botón "Cursos" en Niveles | ✅ Implementado | ✅ Documentado | ❌ FALTA |
| Vista cursos por nivel | ✅ V_Detalles.php | ✅ Documentado | ❌ FALTA |
| Modal 2 columnas | ✅ Implementado | ✅ Documentado | ⚠️ VERIFICAR |
| Campo nivel bloqueado | ✅ Readonly | ✅ Documentado | ⚠️ VERIFICAR |
| Asignar curso a grado | ✅ Caso 5 en PHP | ❌ No documentado | ❌ FALTA |
| Desasignar curso | ✅ Caso 7 (soft delete) | ❌ No documentado | ❌ FALTA |
| Botón "Regresar" | ✅ Implementado | ❌ No documentado | ❌ FALTA |
| Gestión de imágenes | ✅ FormData + upload | ✅ Documentado | ✅ OK |
| Método PUT con imagen | ❌ POST directo | ✅ POST + _method=PUT | ✅ MEJOR |

---

## 🔍 Hallazgos Importantes

### 1. El documento DOCS_LOGICA_ACADEMICA.md es correcto pero incompleto

**Lo que tiene bien:**
- Jerarquía de entidades ✅
- Concepto de pool de cursos ✅
- Layout del modal ✅
- Flujo de navegación básico ✅

**Lo que le falta:**
- Tabla pivote `grados_cursos` ❌
- Funcionalidad de asignación de cursos a grados ❌
- Botón "Regresar" ❌
- Detalles de implementación del frontend ❌

### 2. El sistema antiguo es más completo de lo documentado

El análisis profundo reveló:
- Sistema de asignación de cursos a grados mediante tabla pivote
- Soft delete en asignaciones (permite recuperación)
- Navegación contextual con carga dinámica
- Gestión de estado entre vistas

### 3. Diferencias arquitectónicas

**Sistema Antiguo:**
- Carga dinámica de vistas (AJAX)
- Ocultar/mostrar divs
- Estado en campos ocultos

**Sistema Nuevo (Recomendado):**
- Navegación con rutas (Inertia)
- Componentes condicionales
- Estado en props/hooks

---

## ✅ Conclusión

El documento `DOCS_LOGICA_ACADEMICA.md` captura correctamente la **esencia** del sistema antiguo, pero le faltan **detalles críticos de implementación**:

1. **Tabla pivote `grados_cursos`** - CRÍTICO
2. **Funcionalidad de asignación** - CRÍTICO
3. **Navegación completa** - IMPORTANTE
4. **Detalles de UI/UX** - IMPORTANTE

**Recomendación:** Usar `ANALISIS_SISTEMA_ANTIGUO.md` como referencia técnica completa y actualizar `DOCS_LOGICA_ACADEMICA.md` con los aspectos faltantes.

---

**Fecha de comparación:** 2026-04-07  
**Documentos comparados:**
- `DOCS_LOGICA_ACADEMICA.md` (Especificación del sistema nuevo)
- `ANALISIS_SISTEMA_ANTIGUO.md` (Análisis profundo del sistema antiguo)
