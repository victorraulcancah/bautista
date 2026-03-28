# Reporte de Bugs — Análisis Ampliado V2 (Resolución Bug #7)

**Fecha de análisis:** 2026-03-26
**Objetivo:** Auditar rigurosamente los módulos ERP y Exámenes (migrados mediante helpers genéricos) comparando columna a columna el *Dump SQL Original* versus las variables que el *Script Python* inserta en las nuevas tablas de Laravel.

---

## Bug #7 — Pérdida Masiva y Silenciosa de Datos en ERP y Exámenes (Helper Genérico)
### Severidad: 🔴 CRÍTICO / PÉRDIDA MASIVA DE DATOS

El equipo tenía razón al dudar del uso del helper `_migrate_generic()` en `erp.py`. Este helper hace un mapeo de inserción asumiendo que **las columnas en la tabla antigua se llaman exactamente igual que en la nueva**. 

Al extraer los verdaderos `CREATE TABLE` del dump de origen y contrastarlo contra lo que Python exige, encontramos diferencias fatales: Python pide columnas que no existen en el dump (insertando `NULL`), e ignora por completo las columnas donde de verdad están los datos.

### 🚫 ERP (`erp.py`)

#### 1. Tabla `empresas`
- **Lo que pide el script:** `id_empresa`, `nombre`
- **Lo que existe en el dump:** `id_empresa`, `ruc`, `razon_social`, `comercial`, `direccion`, `telefono`, y 17 columnas más. ¡La columna `nombre` **NO EXISTE** en el dump original!
- **Impacto:** El script lee `r.get("nombre")` y obtiene `NULL`. Todas las empresas migrarán sin nombre (o null), y se perderá su RUC, dirección, teléfono y correo por completo porque la nueva versión Laravel borró esas columnas y el script ni siquiera trata de copiarlas o reapearlas.

#### 2. Tabla `proveedores`
- **Lo que pide el script:** `proveedor_id`, `nombre`
- **Lo que existe en el dump:** `proveedor_id`, `ruc`, `razon_social`, `direccion`, `departamento`, `provincia`, `distrito`, `ubigeo`.
- **Impacto:** Ocurre exactamente lo mismo. El sistema antiguo utilizaba `razon_social` y `ruc`. El script pide ciegamente `nombre` -> inserta `NULL` para todos los proveedores. Además se pierde la data de ubicación.

#### 3. Tabla `documentos_sunat`
- **Lo que extrae el script:** `id_tido`, `nombre`
- **Columna omitida del dump original:** `cod_sunat`, `abreviatura`.
- **Impacto:** Se pierde el código oficial de SUNAT.

#### 4. Tabla `metodo_pago`
- Se pierde la columna `estado` (1=activo, etc.)

*(Nota positiva: Las tablas `ventas`, `compras`, `cotizaciones`, `clientes`, `caja_chica`, `caja_empresa` y `productos` sí coinciden 1:1 en el dump original con el script actual. Su migración es segura desde la perspectiva de estructura de datos).*

---

### 🚫 Exámenes (`examenes.py`)

#### 1. Pérdida del rastro de auditoría (Fechas de Creación)
- En el sistema antiguo, las tablas `actividad_curso` y `cuestionario` tenían el campo `fecha_creacion` indicando exactamente cuándo el docente armó el examen.
- **Lo que hace el script:** Python no recupera esa fecha original. En su lugar, el script *hardcodea* el valor actual (`NOW`) para los campos de Laravel `created_at` y `updated_at`.
- **Impacto:** Toda la historia de creación se borra, y todos los exámenes y preguntas parecerán haber sido creados en el instante de hacer la migración.

#### 2. Tabla `tipo_actividad`
- **Lo que extrae el script:** `tipo_id`, `nombre`
- **Lo que existe en el dump:** `tipo_id`, `nombre`, `descripcion`, `estado`.
- **Impacto:** Pérdida de la descripción y el estado original del tipo de evento.

---

## Cuadro Consolidado Final (Actualizado)

| # | Severidad | Bug | Fuente |
|---|-----------|-----|--------|
| 1 | 🔴 CRÍTICO | `estudiantes`: 16 columnas importantes no migradas | Módulo Usuarios |
| 2 | 🔴 CRÍTICO | Roles: `ROL_MAP` difiere del seeder → usuario admin sin acceso | Módulo Core |
| 3 | 🟠 ALTO | `remitente` en mensajería se cruza mal (busca INT en mapa de strings) | Módulo Mensajería |
| 4 | 🟡 MENOR | `pag_mes` entra como número ('01') en vez del string esperado ('ENERO') | Módulo Pagos |
| 5 | 🔴 CRÍTICO | Matrículas, asistencias y clases simplemente NO TIENEN CÓDIGO de migración | Auditoría Estructura (V2) |
| 6 | ℹ️ INFO | ERP y Exámenes SÍ se ejecutan en código (contrario al README) | Auditoría Estructura (V2) |
| 7 | 🔴 CRÍTICO | ERP/Exámenes `_generic` destruye `empresas`/`proveedores` buscando campo `"nombre"` inexistente | Auditoría Estructura (V2) |

---

### Recomendación de Acción Inmediata:
El script `main.py` **no debe correr en producción todavía**.
1. Detener el uso directo de `_migrate_generic()` en `empresas` y `proveedores` dentro de `erp.py`. Necesitan funciones dedicadas que mapeen `razon_social -> nombre`.
2. Incluir lógica en `examenes.py` para mapear `fecha_creacion` del viejo sistema hacia `created_at` en Laravel.
3. Abordar el Bug #5 escribiendo un archivo `modules/enrollment.py` que traslade las `matriculas` para que los estudiantes no queden en el limbo.
