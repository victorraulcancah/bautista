# Estado Actual del Manejo de Horarios

## Resumen Ejecutivo

El sistema actual maneja horarios de **3 formas diferentes** con propósitos distintos:

1. **Horarios de Asistencia** - Configuración de turnos y validación de entrada/salida
2. **Horarios de Sección** - Archivos/imágenes del horario de clases por sección
3. **Horarios de Docente** - Archivos/imágenes del horario personal del docente

---

## 1. Horarios de Asistencia (`horarios_asistencia`)

### Propósito
Definir los rangos horarios válidos para marcar asistencia de estudiantes y docentes.

### Estructura de Base de Datos
```sql
CREATE TABLE horarios_asistencia (
    horario_id BIGINT PRIMARY KEY,
    insti_id BIGINT NOT NULL,           -- Institución
    nivel_id BIGINT NULL,               -- Nivel educativo (opcional)
    tipo_usuario CHAR(1),               -- 'E'=estudiante, 'D'=docente
    turno CHAR(1),                      -- 'M'=mañana, 'T'=tarde
    hora_ingreso TIME,                  -- Ej: 07:00:00
    hora_salida TIME,                   -- Ej: 13:00:00
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Modelo Laravel
- **Archivo**: `app/Models/HorarioAsistencia.php`
- **Relaciones**:
  - `belongsTo(NivelEducativo)` - Nivel educativo
  - `belongsTo(InstitucionEducativa)` - Institución

### API Endpoints
```
GET    /api/horarios-asistencia          - Listar todos
POST   /api/horarios-asistencia          - Crear nuevo
GET    /api/horarios-asistencia/{id}     - Ver uno
PUT    /api/horarios-asistencia/{id}     - Actualizar
DELETE /api/horarios-asistencia/{id}     - Eliminar

GET    /api/docentes/{id}/horario        - Horarios de asistencia para docente
```

### Controlador
- **Archivo**: `app/Http/Controllers/Api/HorarioAsistenciaApiController.php`
- **Métodos**: CRUD completo (index, store, show, update, destroy)

### Frontend
- **Página**: `resources/js/pages/Horarios/index.tsx`
- **Ruta**: `/horarios`
- **Permiso**: `portal.estudiante.horario`

### Características UI
- Tabla con columnas: Nombre, Entrada, Salida, Tolerancia
- Modal para crear/editar con campos:
  - Nombre del horario
  - Hora de entrada (time picker)
  - Hora de salida (time picker)
  - Tolerancia en minutos

### Uso en el Sistema
- **Validación de asistencia**: Se usa para determinar si un estudiante/docente llegó a tiempo, tarde o faltó
- **Sistema antiguo**: Tenía lógica hardcodeada para validar horarios (6:30-7:30 mañana, 13:30-14:30 tarde)
- **Sistema nuevo**: Flexible, permite configurar múltiples horarios por institución y nivel

---

## 2. Horarios de Sección (`seccion_horarios`)

### Propósito
Almacenar archivos (principalmente imágenes) del horario de clases de cada sección.

### Estructura de Base de Datos
```sql
CREATE TABLE seccion_horarios (
    horario_archivo_id BIGINT PRIMARY KEY,
    seccion_id BIGINT NOT NULL,         -- FK a secciones
    nombre VARCHAR(255),                -- Nombre del archivo
    path VARCHAR(500),                  -- Ruta en storage
    tipo VARCHAR(100) NULL,             -- MIME type
    tamanio BIGINT NULL,                -- Tamaño en bytes
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Modelo Laravel
- **Archivo**: `app/Models/SeccionHorario.php`
- **Relaciones**:
  - `belongsTo(Seccion)` - Sección a la que pertenece

### API Endpoints
```
GET    /api/secciones/{seccionId}/horarios     - Listar archivos de horario
POST   /api/secciones/{seccionId}/horarios     - Subir nuevo archivo
DELETE /api/secciones/horarios/{id}            - Eliminar archivo
```

### Controlador
- **Archivo**: `app/Http/Controllers/Api/SeccionHorarioApiController.php`
- **Métodos**: index, store, destroy
- **Storage**: `storage/app/public/secciones/{seccionId}/horarios/`

### Frontend
- **Página**: `resources/js/pages/Secciones/HorariosPage.tsx`
- **Ruta**: `/secciones/{id}/horarios`
- **Permiso**: `academico.horarios.ver`

### Características UI
- Tabla con vista previa de imágenes
- Botón para descargar archivo
- Modal para subir nuevos archivos
- Visor de imágenes en pantalla completa
- Soporta: imágenes (jpg, png, gif, svg), PDF, Excel, CSV

### Integración
- **Modelo Seccion**: Tiene campo `horario` (VARCHAR) que almacena nombre de archivo legacy
- **Portal Alumno**: Los horarios se muestran en el dashboard del estudiante
- **Migración**: Script Python migra archivos del sistema antiguo

---

## 3. Horarios de Docente (`docente_horarios`)

### Propósito
Almacenar archivos (principalmente imágenes) del horario personal de cada docente.

### Estructura de Base de Datos
```sql
CREATE TABLE docente_horarios (
    horario_archivo_id BIGINT PRIMARY KEY,
    docente_id BIGINT NOT NULL,         -- FK a docentes
    nombre VARCHAR(255),                -- Nombre del archivo
    path VARCHAR(500),                  -- Ruta en storage
    tipo VARCHAR(100) NULL,             -- MIME type
    tamanio BIGINT NULL,                -- Tamaño en bytes
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Modelo Laravel
- **Archivo**: `app/Models/DocenteHorario.php`
- **Relaciones**:
  - `belongsTo(Docente)` - Docente al que pertenece

### API Endpoints
```
GET    /api/docentes/{docenteId}/horarios      - Listar archivos de horario
POST   /api/docentes/{docenteId}/horarios      - Subir nuevo archivo
DELETE /api/docentes/horarios/{id}             - Eliminar archivo
```

### Controlador
- **Archivo**: `app/Http/Controllers/Api/DocenteHorarioApiController.php`
- **Métodos**: index, store, destroy
- **Storage**: `storage/app/public/docentes/{docenteId}/horarios/`

### Frontend
- **Componente**: `resources/js/pages/GestionDocentes/components/HorarioModal.tsx`
- **Acceso**: Desde la página de Gestión de Docentes, botón con ícono de reloj
- **Permiso**: `academico.horarios.ver`

### Características UI
- Modal con tabs: "Lista" y "Agregar"
- Tab Lista:
  - Tabla con vista previa de imágenes
  - Botón para descargar
  - Botón para eliminar
- Tab Agregar:
  - Área de drag & drop para subir archivos
  - Soporta: imágenes, PDF, Excel, CSV
- Visor de imágenes en pantalla completa

### Integración
- **Portal Docente**: El docente puede ver su horario en el dashboard
- **Sistema antiguo**: Tabla `docente_horario` con campo `doh_archivo`

---

## Diferencias Clave entre los 3 Tipos

| Aspecto | Horarios Asistencia | Horarios Sección | Horarios Docente |
|---------|-------------------|------------------|------------------|
| **Tipo de dato** | Registros estructurados | Archivos/imágenes | Archivos/imágenes |
| **Propósito** | Validación de asistencia | Información para alumnos | Información para docente |
| **Campos** | hora_ingreso, hora_salida, turno | archivo (path, nombre, tipo) | archivo (path, nombre, tipo) |
| **Alcance** | Por institución/nivel | Por sección | Por docente |
| **Editable** | Sí (CRUD completo) | Solo agregar/eliminar | Solo agregar/eliminar |
| **Múltiples** | Sí (varios turnos) | Sí (varios archivos) | Sí (varios archivos) |

---

## Modelo de Sección - Campo Legacy

### Campo `horario` en tabla `secciones`
```sql
ALTER TABLE secciones ADD COLUMN horario VARCHAR(255) NULL;
```

- **Propósito**: Compatibilidad con sistema antiguo
- **Uso actual**: Se migra a `seccion_horarios` pero el campo permanece
- **Frontend**: El formulario de sección tiene campo "Horario" (texto libre)
- **Archivo**: `resources/js/pages/Secciones/components/SeccionFormModal.tsx`

---

## Sistema Antiguo vs Nuevo

### Sistema Antiguo (bautistalapascana)
```php
// Horarios hardcodeados en código
function validarHorario($hora) {
    // Mañana: 6:30-7:30
    if ($horaNumerica >= 630 && $horaNumerica <= 730) {
        return 'A'; // A tiempo
    }
    // Tarde: 13:30-14:30
    if ($horaNumerica >= 1330 && $horaNumerica <= 1430) {
        return 'A';
    }
    // Tardanza...
}

// Consulta directa a tabla horarios_asistencia
$sqlHorarios = "SELECT * FROM horarios_asistencia 
                WHERE tipo_usuario = $tipo";
```

### Sistema Nuevo (bautista)
- **Configuración flexible**: Admin puede crear múltiples horarios
- **Por nivel educativo**: Diferentes horarios para primaria, secundaria, etc.
- **API REST**: Endpoints bien definidos
- **Validación en backend**: Lógica centralizada en servicios
- **UI moderna**: React + TypeScript con modales y tablas

---

## Archivos de Migración

### Script Python
- **Archivo**: `scripts/migration/modules/horarios.py`
- **Funciones**:
  - `migrate_seccion_horarios()` - Migra archivos de horario de secciones
  - `migrate_docente_horarios()` - Migra archivos de horario de docentes
- **Nota**: Los horarios de asistencia se migran en `enrollment.migrate_enrollment()`

### Rutas de archivos migrados
```
storage/app/public/
├── horarios/                    # Horarios de sección (legacy)
├── docente_horarios/            # Horarios de docente (legacy)
├── secciones/{id}/horarios/     # Horarios de sección (nuevo)
└── docentes/{id}/horarios/      # Horarios de docente (nuevo)
```

---

## Permisos Relacionados

```php
// Horarios de asistencia
'portal.estudiante.horario'      // Ver página de horarios

// Horarios de sección y docente
'academico.horarios.ver'         // Ver horarios en secciones/docentes
```

---

## Problemas Identificados

### 1. Duplicidad de Conceptos
- El campo `horario` en `secciones` y la tabla `seccion_horarios` causan confusión
- No está claro cuándo usar uno u otro

### 2. Falta de Relación
- `horarios_asistencia` no se relaciona directamente con secciones o cursos
- La validación de asistencia debe buscar el horario apropiado manualmente

### 3. Archivos vs Datos Estructurados
- Los horarios de clase son imágenes, no datos estructurados
- No se puede hacer búsquedas, filtros o reportes sobre el contenido

### 4. Sin Horario Semanal Estructurado
- No hay tabla para definir horarios por día/hora/materia
- Ejemplo: "Lunes 8:00-9:00 Matemáticas, Aula 201"

---

## Recomendaciones para Mejora

### Opción A: Mantener Sistema Actual (Archivos)
**Pros**: Simple, rápido de implementar, flexible
**Contras**: No estructurado, difícil de consultar

### Opción B: Sistema Híbrido
- Mantener archivos para visualización rápida
- Agregar tabla estructurada para horarios semanales
- Permitir generar imagen desde datos estructurados

### Opción C: Sistema Completamente Estructurado
- Crear tabla `horario_clases` con:
  - día_semana (1-7)
  - hora_inicio, hora_fin
  - curso_id, docente_id, aula
  - seccion_id o grado_id
- Generar vista de horario dinámicamente
- Exportar a PDF/imagen si se necesita

---

## Conclusión

El sistema actual maneja horarios de forma **funcional pero fragmentada**:

✅ **Funciona bien para**:
- Validar asistencia con horarios configurables
- Almacenar imágenes de horarios para consulta rápida
- Migrar datos del sistema antiguo

⚠️ **Limitaciones**:
- No hay horario semanal estructurado (día/hora/materia)
- Difícil hacer reportes o análisis sobre horarios
- Confusión entre campo `horario` y tabla `seccion_horarios`
- No se puede validar conflictos de horario automáticamente

💡 **Siguiente paso**: Definir si se necesita un sistema de horarios más robusto o si el actual es suficiente para las necesidades del colegio.
