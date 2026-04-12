# Sistema LMS Estilo Blackboard - Documentación Completa

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura de Base de Datos](#estructura-de-base-de-datos)
4. [Flujo de Trabajo](#flujo-de-trabajo)
5. [Funcionalidades por Tab](#funcionalidades-por-tab)
6. [APIs Backend](#apis-backend)
7. [Componentes Frontend](#componentes-frontend)
8. [Permisos y Roles](#permisos-y-roles)
9. [Plan de Implementación](#plan-de-implementación)

---

## 🎯 Visión General

Sistema de gestión de aprendizaje (LMS) inspirado en Blackboard que permite a docentes crear y gestionar contenido educativo, y a estudiantes acceder y completar actividades académicas.

### Actores del Sistema
- **Administrador**: Gestiona cursos, docentes, estudiantes y configuración general
- **Docente**: Crea contenido, evalúa y gestiona su curso
- **Estudiante**: Consume contenido, realiza actividades y ve calificaciones
- **Padre/Apoderado**: Visualiza el progreso de sus hijos

---

## 🏗️ Arquitectura del Sistema

### Jerarquía de Contenido
```
Institución
  └─ Nivel Educativo (Inicial, Primaria, Secundaria)
      └─ Grado (1°, 2°, 3°, etc.)
          └─ Sección (A, B, C)
              └─ Curso (Matemática, Comunicación, etc.)
                  └─ Docente Asignado (docente_cursos)
                      └─ Unidad (Unidad 1, Unidad 2)
                          └─ Clase/Sesión (Clase 1, Clase 2)
                              ├─ Archivos (PDFs, videos, documentos)
                              └─ Actividades
                                  ├─ Tareas
                                  ├─ Exámenes/Cuestionarios
                                  └─ Foros (futuro)
```

### Relaciones Clave
- Un **Curso** puede tener múltiples **Docentes** asignados (tabla `docente_cursos`)
- Un **Docente** puede tener múltiples **Secciones** del mismo curso
- Una **Sección** tiene múltiples **Estudiantes** matriculados (tabla `matriculas`)
- El contenido se organiza por **Unidades** → **Clases** → **Actividades**

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales

#### 1. `cursos`
```sql
- curso_id (PK)
- id_insti
- nombre
- descripcion
- logo
- nivel_academico_id (FK → niveles_educativos)
- grado_academico (FK → grados) [NULLABLE]
- estado
```

#### 2. `docente_cursos` (Asignación Docente-Curso-Sección)
```sql
- docen_curso_id (PK)
- docente_id (FK → docentes)
- curso_id (FK → cursos)
- seccion_id (FK → secciones)
- apertura_id (FK → matricula_aperturas) [periodo académico]
- estado
```

#### 3. `unidades` (Módulos del Curso)
```sql
- unidad_id (PK)
- curso_id (FK → cursos)
- titulo
- descripcion
- orden
- estado
- timestamps
```

#### 4. `clases` (Sesiones/Lecciones)
```sql
- clase_id (PK)
- unidad_id (FK → unidades)
- titulo
- descripcion
- orden
- estado
- timestamps
```

#### 5. `archivos_clase` (Material de Estudio)
```sql
- archivo_id (PK)
- clase_id (FK → clases)
- nombre_archivo
- ruta_archivo
- tipo_archivo (pdf, video, doc, ppt, etc.)
- tamaño
- timestamps
```

#### 6. `actividad_curso` (Tareas y Exámenes)
```sql
- actividad_id (PK)
- id_clase_curso (FK → clases)
- nombre_actividad
- descripcion
- id_tipo_actividad (FK → tipo_actividad)
  - 1 = Tarea
  - 2 = Foro
  - 3 = Examen/Cuestionario
  - 4 = Encuesta
  - 5 = Dibujo
  - 6 = Rompecabezas
- fecha_apertura
- fecha_cierre
- puntos_maximos
- es_calificado (1=sí, 0=no)
- estado
- timestamps
```

#### 7. `cuestionario` (Exámenes)
```sql
- cuestionario_id (PK)
- id_actividad (FK → actividad_curso)
- titulo
- descripcion
- tiempo_limite (minutos)
- intentos_permitidos
- mostrar_respuestas (1=sí, 0=no)
- timestamps
```

#### 8. `pregunta_cuestionario`
```sql
- pregunta_id (PK)
- cuestionario_id (FK → cuestionario)
- texto_pregunta
- tipo_pregunta (multiple, verdadero_falso, abierta)
- puntos
- orden
```

#### 9. `alternativa_pregunta` (Opciones de Respuesta)
```sql
- alternativa_id (PK)
- pregunta_id (FK → pregunta_cuestionario)
- texto_alternativa
- es_correcta (1=sí, 0=no)
- orden
```

#### 10. `actividad_usuario` (Entregas de Estudiantes)
```sql
- id (PK)
- actividad_id (FK → actividad_curso)
- estu_id (FK → estudiantes)
- fecha_entrega
- archivo_entrega
- comentario
- estado (pendiente, entregado, calificado)
- timestamps
```

#### 11. `nota_actividad_estudiante` (Calificaciones)
```sql
- nota_activida_id (PK)
- id_actividad (FK → actividad_curso)
- id_estudiante (FK → estudiantes)
- calificacion
- fecha_calificada
- comentario_docente
- estado
- timestamps
```

#### 12. `anuncios` (Comunicados del Curso)
```sql
- id (PK)
- docente_curso_id (FK → docente_cursos)
- titulo
- contenido
- timestamps
```

#### 13. `asistencia_clases` (Sesiones de Asistencia)
```sql
- id (PK)
- id_clase_curso (FK → clases)
- fecha
- timestamps
```

#### 14. `asistencia_alumnos` (Registro Individual)
```sql
- id (PK)
- id_asistencia_clase (FK → asistencia_clases)
- id_estudiante (FK → estudiantes)
- estado (P=presente, F=falta, J=justificado, T=tardanza)
- observacion
- timestamps
```

---

## 🔄 Flujo de Trabajo

### Flujo Docente

#### 1. Acceso al Curso
```
1. Docente inicia sesión
2. Ve lista de cursos asignados (desde docente_cursos)
3. Selecciona un curso
4. Entra a la vista del curso con tabs
```

#### 2. Creación de Contenido (Tab: Contenido)
```
1. Crear Unidad
   POST /api/docente/unidad
   {
     "docente_curso_id": 123,
     "titulo": "Unidad 1: Introducción",
     "descripcion": "...",
     "orden": 1
   }

2. Crear Clase dentro de Unidad
   POST /api/docente/clase
   {
     "unidad_id": 456,
     "titulo": "Clase 1: Conceptos Básicos",
     "descripcion": "...",
     "orden": 1
   }

3. Subir Archivos a la Clase
   POST /api/docente/clase/{claseId}/archivo
   FormData: {
     "archivo": File,
     "nombre": "Material de Estudio.pdf"
   }

4. Crear Actividad (Tarea o Examen)
   POST /api/docente/actividad
   {
     "id_clase_curso": 789,
     "nombre_actividad": "Tarea 1",
     "id_tipo_actividad": 1,
     "fecha_cierre": "2026-04-20",
     "puntos_maximos": 20,
     "es_calificado": 1
   }
```

#### 3. Publicar Anuncios (Tab: Anuncios)
```
POST /api/docente/curso/{docenteCursoId}/anuncio
{
  "titulo": "Bienvenidos al curso",
  "contenido": "Este es el primer anuncio..."
}
```

#### 4. Calificar Actividades (Tab: Calificaciones)
```
1. Ver entregas pendientes
   GET /api/docente/curso/{docenteCursoId}/entregas-pendientes

2. Calificar una entrega
   POST /api/docente/actividad/{actividadId}/calificar
   {
     "estudiante_id": 123,
     "calificacion": 18,
     "comentario": "Buen trabajo"
   }
```

#### 5. Tomar Asistencia (Tab: Alumnos o desde sidebar)
```
1. Iniciar sesión de asistencia
   POST /api/docente/asistencia/iniciar
   {
     "clase_id": 789,
     "fecha": "2026-04-10"
   }

2. Marcar asistencia de alumnos
   POST /api/docente/asistencia/{sessionId}/marcar
   {
     "asistencias": [
       { "estudiante_id": 1, "estado": "P" },
       { "estudiante_id": 2, "estado": "F" },
       { "estudiante_id": 3, "estado": "T" }
     ]
   }
```

### Flujo Estudiante

#### 1. Acceso al Curso
```
1. Estudiante inicia sesión
2. Ve lista de cursos matriculados
3. Selecciona un curso
4. Entra a la vista del curso con tabs
```

#### 2. Consumir Contenido (Tab: Contenido)
```
1. Ver unidades y clases
   GET /api/alumno/curso/{cursoId}/contenido

2. Descargar archivo
   GET /api/alumno/archivo/{archivoId}/descargar

3. Marcar clase como vista (opcional)
   POST /api/alumno/clase/{claseId}/marcar-vista
```

#### 3. Realizar Actividades
```
1. Ver actividades pendientes
   GET /api/alumno/curso/{cursoId}/actividades-pendientes

2. Entregar tarea
   POST /api/alumno/actividad/{actividadId}/entregar
   FormData: {
     "archivo": File,
     "comentario": "Aquí está mi tarea"
   }

3. Realizar examen
   a. Iniciar examen
      POST /api/alumno/examen/{actividadId}/iniciar
      → Retorna: examen_iniciado_id

   b. Responder preguntas
      POST /api/alumno/examen/{examenIniciadoId}/responder
      {
        "respuestas": [
          { "pregunta_id": 1, "alternativa_id": 3 },
          { "pregunta_id": 2, "respuesta_texto": "..." }
        ]
      }

   c. Finalizar examen
      POST /api/alumno/examen/{examenIniciadoId}/finalizar
```

#### 4. Ver Calificaciones (Tab: Calificaciones)
```
GET /api/alumno/curso/{cursoId}/calificaciones
→ Retorna solo las calificaciones del estudiante autenticado
```

#### 5. Ver Anuncios (Tab: Anuncios)
```
GET /api/alumno/curso/{cursoId}/anuncios
```

---

## 📑 Funcionalidades por Tab

### Tab 1: CONTENIDO

#### Vista Docente
- ✅ Crear/editar/eliminar unidades
- ✅ Crear/editar/eliminar clases
- ✅ Subir archivos (PDFs, videos, documentos)
- ✅ Crear actividades (tareas, exámenes)
- ✅ Reordenar unidades y clases (drag & drop)
- ✅ Publicar/ocultar contenido
- ✅ Duplicar unidades/clases
- ✅ Vista previa del contenido como alumno

#### Vista Estudiante
- ✅ Ver unidades y clases organizadas
- ✅ Descargar/visualizar archivos
- ✅ Ver actividades con fechas límite
- ✅ Acceder a tareas y exámenes
- ✅ Ver estado de entregas (pendiente, entregado, calificado)
- ✅ Indicador de progreso del curso

### Tab 2: ANUNCIOS

#### Vista Docente
- ✅ Crear nuevos anuncios
- ✅ Editar anuncios existentes
- ✅ Eliminar anuncios
- ✅ Programar publicación (opcional)
- ✅ Adjuntar archivos a anuncios
- ✅ Ver estadísticas de lectura

#### Vista Estudiante
- ✅ Ver lista de anuncios ordenados por fecha
- ✅ Leer anuncios completos
- ✅ Marcar como leído
- ✅ Descargar archivos adjuntos
- ✅ Notificaciones de nuevos anuncios

### Tab 3: CALIFICACIONES

#### Vista Docente
- ✅ Ver tabla completa de calificaciones
  - Filas: Estudiantes
  - Columnas: Actividades
- ✅ Filtrar por unidad/tipo de actividad
- ✅ Calificar entregas pendientes
- ✅ Editar calificaciones
- ✅ Agregar comentarios/feedback
- ✅ Exportar calificaciones (Excel/PDF)
- ✅ Ver estadísticas del curso
  - Promedio general
  - Distribución de notas
  - Actividades con más dificultad
- ✅ Configurar pesos de evaluación

#### Vista Estudiante
- ✅ Ver solo SUS calificaciones
- ✅ Ver detalle por actividad
- ✅ Ver comentarios del docente
- ✅ Ver promedio del curso
- ✅ Gráfico de progreso
- ✅ Comparar con promedio del curso (opcional)

### Tab 4: ALUMNOS (Roster)

#### Vista Docente
- ✅ Ver lista completa de alumnos matriculados
- ✅ Ver información de contacto
- ✅ Ver progreso individual
- ✅ Enviar mensajes individuales o grupales
- ✅ Exportar lista de alumnos
- ✅ Ver historial de asistencia por alumno
- ✅ Filtrar y buscar alumnos

#### Vista Estudiante
- ✅ Ver compañeros de clase (opcional, según configuración)
- ✅ Ver información básica de contacto
- ✅ Enviar mensajes a compañeros (si está habilitado)

### Tab 5: CONFIGURACIÓN

#### Vista Docente
- ✅ Configurar información del curso
- ✅ Personalizar apariencia (color, imagen de banner)
- ✅ Configurar permisos
  - ¿Alumnos pueden ver compañeros?
  - ¿Alumnos pueden crear discusiones?
- ✅ Configurar notificaciones
- ✅ Gestionar co-docentes (si aplica)
- ✅ Archivar/restaurar curso

#### Vista Estudiante
- ❌ No tiene acceso

---

## 🔌 APIs Backend

### Endpoints Docente

```php
// ============================================
// CONTENIDO
// ============================================

// Obtener contenido completo del curso
GET /api/docente/curso/{docenteCursoId}/contenido
Response: [
  {
    "unidad_id": 1,
    "titulo": "Unidad 1",
    "orden": 1,
    "clases": [
      {
        "clase_id": 1,
        "titulo": "Clase 1",
        "orden": 1,
        "archivos": [...],
        "actividades": [...]
      }
    ]
  }
]

// Crear unidad
POST /api/docente/unidad
Body: { "docente_curso_id", "titulo", "descripcion", "orden" }

// Actualizar unidad
PUT /api/docente/unidad/{unidadId}
Body: { "titulo", "descripcion", "orden" }

// Eliminar unidad
DELETE /api/docente/unidad/{unidadId}

// Crear clase
POST /api/docente/clase
Body: { "unidad_id", "titulo", "descripcion", "orden" }

// Actualizar clase
PUT /api/docente/clase/{claseId}
Body: { "titulo", "descripcion", "orden" }

// Eliminar clase
DELETE /api/docente/clase/{claseId}

// Subir archivo a clase
POST /api/docente/clase/{claseId}/archivo
Body: FormData { "archivo", "nombre" }

// Eliminar archivo
DELETE /api/docente/archivo/{archivoId}

// Crear actividad
POST /api/docente/actividad
Body: {
  "id_clase_curso",
  "nombre_actividad",
  "descripcion",
  "id_tipo_actividad",
  "fecha_apertura",
  "fecha_cierre",
  "puntos_maximos",
  "es_calificado"
}

// Actualizar actividad
PUT /api/docente/actividad/{actividadId}

// Eliminar actividad
DELETE /api/docente/actividad/{actividadId}

// ============================================
// ANUNCIOS
// ============================================

// Listar anuncios del curso
GET /api/docente/curso/{docenteCursoId}/anuncios

// Crear anuncio
POST /api/docente/curso/{docenteCursoId}/anuncio
Body: { "titulo", "contenido" }

// Actualizar anuncio
PUT /api/docente/anuncio/{anuncioId}
Body: { "titulo", "contenido" }

// Eliminar anuncio
DELETE /api/docente/anuncio/{anuncioId}

// ============================================
// CALIFICACIONES
// ============================================

// Obtener tabla de calificaciones completa
GET /api/docente/curso/{docenteCursoId}/calificaciones
Response: {
  "estudiantes": [...],
  "actividades": [...],
  "calificaciones": {
    "estudiante_id_1": {
      "actividad_id_1": { "nota": 18, "fecha": "..." },
      "actividad_id_2": { "nota": 20, "fecha": "..." }
    }
  }
}

// Ver entregas pendientes de calificar
GET /api/docente/curso/{docenteCursoId}/entregas-pendientes

// Ver entregas de una actividad específica
GET /api/docente/actividad/{actividadId}/entregas

// Calificar una entrega
POST /api/docente/actividad/{actividadId}/calificar
Body: {
  "estudiante_id",
  "calificacion",
  "comentario"
}

// Exportar calificaciones
GET /api/docente/curso/{docenteCursoId}/calificaciones/exportar?formato=excel

// ============================================
// ALUMNOS
// ============================================

// Listar alumnos del curso
GET /api/docente/curso/{docenteCursoId}/alumnos

// Ver detalle de un alumno
GET /api/docente/alumno/{estudianteId}/detalle?curso_id={docenteCursoId}

// ============================================
// ASISTENCIA
// ============================================

// Iniciar sesión de asistencia
POST /api/docente/asistencia/iniciar
Body: { "clase_id", "fecha" }

// Marcar asistencia
POST /api/docente/asistencia/{sessionId}/marcar
Body: {
  "asistencias": [
    { "estudiante_id", "estado", "observacion" }
  ]
}

// Ver historial de asistencia
GET /api/docente/curso/{docenteCursoId}/asistencia/historial
```

### Endpoints Estudiante

```php
// ============================================
// CONTENIDO
// ============================================

// Obtener contenido del curso
GET /api/alumno/curso/{cursoId}/contenido

// Descargar archivo
GET /api/alumno/archivo/{archivoId}/descargar

// Marcar clase como vista
POST /api/alumno/clase/{claseId}/marcar-vista

// ============================================
// ACTIVIDADES
// ============================================

// Ver actividades pendientes
GET /api/alumno/curso/{cursoId}/actividades-pendientes

// Ver detalle de actividad
GET /api/alumno/actividad/{actividadId}

// Entregar tarea
POST /api/alumno/actividad/{actividadId}/entregar
Body: FormData { "archivo", "comentario" }

// Iniciar examen
POST /api/alumno/examen/{actividadId}/iniciar
Response: { "examen_iniciado_id", "tiempo_limite", "preguntas": [...] }

// Responder examen
POST /api/alumno/examen/{examenIniciadoId}/responder
Body: {
  "respuestas": [
    { "pregunta_id", "alternativa_id" },
    { "pregunta_id", "respuesta_texto" }
  ]
}

// Finalizar examen
POST /api/alumno/examen/{examenIniciadoId}/finalizar

// ============================================
// ANUNCIOS
// ============================================

// Ver anuncios del curso
GET /api/alumno/curso/{cursoId}/anuncios

// Marcar anuncio como leído
POST /api/alumno/anuncio/{anuncioId}/marcar-leido

// ============================================
// CALIFICACIONES
// ============================================

// Ver mis calificaciones
GET /api/alumno/curso/{cursoId}/calificaciones
Response: {
  "actividades": [...],
  "calificaciones": [...],
  "promedio": 16.5
}

// Ver detalle de calificación
GET /api/alumno/actividad/{actividadId}/calificacion
```

---

## 🎨 Componentes Frontend

### Estructura de Carpetas
```
resources/js/pages/
├── PortalDocente/
│   ├── Contenido/
│   │   ├── Editor.tsx (Vista principal con tabs)
│   │   ├── UnidadForm.tsx
│   │   ├── ClaseForm.tsx
│   │   ├── ActividadForm.tsx
│   │   └── ArchivoUpload.tsx
│   ├── Anuncios/
│   │   ├── index.tsx
│   │   ├── AnuncioForm.tsx
│   │   └── AnuncioCard.tsx
│   ├── Calificaciones/
│   │   ├── index.tsx
│   │   ├── TablaCalificaciones.tsx
│   │   ├── CalificarModal.tsx
│   │   └── EstadisticasCurso.tsx
│   ├── Alumnos/
│   │   ├── index.tsx
│   │   └── AlumnoCard.tsx
│   └── Configuracion/
│       └── index.tsx
├── PortalAlumno/
│   ├── Cursos/
│   │   ├── index.tsx (Lista de cursos)
│   │   └── Detalle.tsx (Vista del curso con tabs)
│   ├── Contenido/
│   │   ├── index.tsx
│   │   ├── UnidadCard.tsx
│   │   └── ClaseCard.tsx
│   ├── Actividades/
│   │   ├── TareaEntrega.tsx
│   │   └── ExamenResolver.tsx
│   ├── Anuncios/
│   │   └── index.tsx
│   └── Calificaciones/
│       └── index.tsx
```

### Componentes Compartidos
```
resources/js/components/curso/
├── CourseHero.tsx (Banner del curso)
├── CourseTabs.tsx (Tabs horizontales)
├── CourseSidebar.tsx (Sidebar derecho)
├── ContentItem.tsx (Item de contenido)
└── EmptyState.tsx (Estado vacío)
```

---

## 🔐 Permisos y Roles

### Permisos Necesarios

```php
// Docente
'portal.docente.cursos.ver'
'portal.docente.cursos.editar'
'portal.docente.contenido.crear'
'portal.docente.contenido.editar'
'portal.docente.contenido.eliminar'
'portal.docente.anuncios.crear'
'portal.docente.anuncios.editar'
'portal.docente.calificaciones.ver'
'portal.docente.calificaciones.editar'
'portal.docente.alumnos.ver'
'portal.docente.asistencia.tomar'

// Estudiante
'portal.alumno.cursos.ver'
'portal.alumno.contenido.ver'
'portal.alumno.actividades.realizar'
'portal.alumno.anuncios.ver'
'portal.alumno.calificaciones.ver'
```

### Middleware de Verificación

```php
// Verificar que el docente tiene acceso al curso
Route::middleware(['auth.token', 'verify.docente.curso'])->group(function () {
    // Rutas de docente
});

// Verificar que el estudiante está matriculado en el curso
Route::middleware(['auth.token', 'verify.estudiante.curso'])->group(function () {
    // Rutas de estudiante
});
```

---

## 📅 Plan de Implementación

### Fase 1: Backend - Estructura Base (Semana 1-2)
- [x] Revisar y ajustar migraciones existentes
- [ ] Crear controladores base
  - [ ] `DocenteCursoController`
  - [ ] `AlumnoCursoController`
  - [ ] `ContenidoController`
  - [ ] `AnuncioController`
  - [ ] `CalificacionController`
- [ ] Crear servicios
  - [ ] `ContenidoService`
  - [ ] `CalificacionService`
  - [ ] `AnuncioService`
- [ ] Implementar APIs de Contenido
- [ ] Implementar APIs de Anuncios

### Fase 2: Backend - Actividades y Calificaciones (Semana 3-4)
- [ ] Implementar sistema de entregas
- [ ] Implementar sistema de calificaciones
- [ ] Implementar exámenes virtuales
- [ ] Crear sistema de notificaciones
- [ ] Implementar exportación de calificaciones

### Fase 3: Frontend - Portal Docente (Semana 5-6)
- [x] Crear vista base con tabs (Editor.tsx)
- [ ] Implementar Tab Contenido
  - [ ] CRUD de unidades
  - [ ] CRUD de clases
  - [ ] Upload de archivos
  - [ ] CRUD de actividades
- [ ] Implementar Tab Anuncios
- [ ] Implementar Tab Calificaciones
- [ ] Implementar Tab Alumnos
- [ ] Implementar Tab Configuración

### Fase 4: Frontend - Portal Alumno (Semana 7-8)
- [ ] Crear vista de lista de cursos
- [ ] Crear vista de detalle de curso con tabs
- [ ] Implementar Tab Contenido (vista alumno)
- [ ] Implementar sistema de entregas
- [ ] Implementar resolución de exámenes
- [ ] Implementar Tab Anuncios (vista alumno)
- [ ] Implementar Tab Calificaciones (vista alumno)

### Fase 5: Funcionalidades Avanzadas (Semana 9-10)
- [ ] Sistema de notificaciones en tiempo real
- [ ] Foros de discusión
- [ ] Calendario de eventos
- [ ] Mensajería interna del curso
- [ ] Estadísticas y reportes avanzados
- [ ] Sistema de badges/logros

### Fase 6: Testing y Optimización (Semana 11-12)
- [ ] Testing unitario backend
- [ ] Testing de integración
- [ ] Testing E2E frontend
- [ ] Optimización de queries
- [ ] Optimización de carga de archivos
- [ ] Documentación final

---

## 📝 Notas Técnicas

### Consideraciones de Rendimiento
- Implementar paginación en listas largas
- Lazy loading de archivos pesados
- Cache de contenido estático
- Optimización de queries con eager loading

### Seguridad
- Validar permisos en cada endpoint
- Sanitizar inputs de usuario
- Validar tipos de archivo en uploads
- Implementar rate limiting en APIs
- Encriptar datos sensibles

### Escalabilidad
- Usar colas para procesos pesados (exportaciones, notificaciones)
- Implementar CDN para archivos estáticos
- Considerar almacenamiento en S3 para archivos
- Implementar sistema de cache (Redis)

---

## 🔗 Referencias
- Blackboard Learn: https://www.blackboard.com/
- Moodle: https://moodle.org/
- Canvas LMS: https://www.instructure.com/canvas

---

**Última actualización**: 2026-04-10
**Versión**: 1.0
**Autor**: Equipo de Desarrollo
