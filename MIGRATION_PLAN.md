# Plan de Migración: bautistalapascana → bautista (Laravel 13 + React 19)

## Estado actual

### ✅ Ya migrados
- Autenticación (login, 2FA, recuperación de contraseña)
- Dashboard básico con estadísticas
- CRUD: Estudiantes, Docentes, Cursos, Grados, Niveles Educativos, Secciones
- Roles y permisos (Spatie)
- Estructura base: Institución, Perfiles, PadreApoderado (modelos creados)

### ❌ Pendientes (del sistema antiguo)
Matrícula, Asistencia, Clases/Contenido de Curso, Actividades, Quiz/Exámenes, Calificaciones, Mensajería, Noticias, Galería, Portal de Padres, Reportes/Excel

---

## Fases de migración

### FASE 1 — Estructura académica core
> Necesaria para que todo lo demás tenga sentido. Sin esto no hay clases ni actividades.

#### Módulo 1.1 — Matrícula (Enrollment)
**Equivalente antiguo:** `modulos/admin/matricula.php`, `modulos/padre_familia/matricula.php`
**Qué hace:** Períodos de apertura por año académico, inscripción de estudiantes en cursos/secciones.

Tablas a migrar: `matricula_aperturas`, `matriculas`

Pasos:
- [ ] Crear migración: `matricula_aperturas` (año, fecha inicio, fecha fin, estado)
- [ ] Crear migración: `matriculas` (estudiante_id, seccion_id, curso_id, año)
- [ ] Modelos: `MatriculaApertura`, `Matricula`
- [ ] Repository + Service + Controller API
- [ ] Página React: listado de aperturas, formulario de matrícula de estudiante
- [ ] Actualizar Dashboard con conteo de matrículas activas

---

#### Módulo 1.2 — Unidades y Clases (Contenido del Curso)
**Equivalente antiguo:** `modulos/profesor/cursos_contenido.php`, `modulos/alumnos/clase_curso.php`
**Qué hace:** Los cursos se organizan en Unidades → Clases. Los docentes crean contenido, los alumnos lo visualizan.

Tablas a migrar: `clase_cursos`, `archivos_clase`

Pasos:
- [ ] Crear migración: `unidades` (curso_id, titulo, orden)
- [ ] Crear migración: `clases` (unidad_id, titulo, descripcion, orden)
- [ ] Crear migración: `archivos_clase` (clase_id, nombre, path, tipo)
- [ ] Modelos: `Unidad`, `Clase`, `ArchivoClase`
- [ ] Repository + Service + Controller API
- [ ] Página React (Docente): árbol de curso → unidades → clases con drag & drop de orden
- [ ] Página React (Estudiante): vista de timeline del curso con clases y actividades
- [ ] Subida de archivos al storage de Laravel

---

### FASE 2 — Asistencia
> Módulo autónomo, se puede migrar en paralelo con Fase 1.

#### Módulo 2.1 — Asistencia de Estudiantes
**Equivalente antiguo:** `modulos/admin/asistencia.php`, `modulos/profesor/asistencia_alumnos.php`, `modulos/alumnos/asistencia.php`
**Qué hace:** El docente marca asistencia por clase/fecha. El alumno ve su calendario de asistencia.

Tablas a migrar: `asistencia`, `asistencia_alumno`

Pasos:
- [ ] Crear migración: `asistencias` (clase_id, estudiante_id, fecha, estado: presente/ausente/tardanza)
- [ ] Modelo: `Asistencia`
- [ ] Repository + Service + Controller API
- [ ] Página React (Docente): lista de alumnos por clase con toggle de asistencia
- [ ] Página React (Alumno): FullCalendar mostrando presencia/ausencia
- [ ] Vista Admin: reporte mensual con filtros + botón exportar Excel (usar `maatwebsite/excel`)

---

### FASE 3 — Actividades y Calificaciones
> El corazón pedagógico del sistema. Depende de Fase 1.2 (Clases).

#### Módulo 3.1 — Actividades
**Equivalente antiguo:** `modulos/profesor/actividad.php`, `modulos/alumnos/actividad.php`
**Qué hace:** Los docentes crean actividades asociadas a una clase. Tipos: Tarea (subir archivo), Quiz, Dibujo, Rompecabezas.

Tablas a migrar: `actividad_curso`, `archivos_actividad`, `tipo_actividad`

Tipos de actividad:
- `1` = Tarea (subida de archivo)
- `2` = Quiz/Examen
- `3` = Dibujo (canvas)
- `4` = Rompecabezas
- `5` = Otro

Pasos:
- [ ] Crear migración: `actividades` (clase_id, tipo, titulo, descripcion, fecha_entrega, puntaje_max)
- [ ] Crear migración: `archivos_actividad` (actividad_id, path, subido_por: docente/alumno)
- [ ] Crear migración: `entregas_actividad` (actividad_id, estudiante_id, archivo_path, nota, fecha_entrega)
- [ ] Modelos: `Actividad`, `EntregaActividad`
- [ ] Repository + Service + Controller API
- [ ] Página React (Docente): crear actividad con selector de tipo, subir archivo de referencia
- [ ] Página React (Alumno): ver descripción, descargar archivo, subir entrega, ver nota

---

#### Módulo 3.2 — Quiz y Exámenes
**Equivalente antiguo:** `modulos/profesor/quiz_crear.php`, `modulos/profesor/quiz_corre.php`, `modulos/alumnos/quiz.php`, `modulos/profesor/calificar_examen.php`
**Qué hace:** Creación de exámenes con preguntas y alternativas. El alumno lo resuelve con temporizador.

Tablas a migrar: `cuestionario`, `alternativas_pregunta`

Pasos:
- [ ] Crear migración: `quizzes` (actividad_id, tiempo_minutos, intentos_max)
- [ ] Crear migración: `preguntas` (quiz_id, enunciado, tipo: multiple/abierta, puntaje)
- [ ] Crear migración: `alternativas` (pregunta_id, texto, es_correcta)
- [ ] Crear migración: `intentos_quiz` (quiz_id, estudiante_id, inicio, fin, puntaje)
- [ ] Crear migración: `respuestas_intento` (intento_id, pregunta_id, alternativa_id, texto_libre)
- [ ] Modelos: `Quiz`, `Pregunta`, `Alternativa`, `IntentoQuiz`, `RespuestaIntento`
- [ ] Repository + Service + Controller API
- [ ] Página React (Docente): builder de preguntas con editor de texto enriquecido (TipTap)
- [ ] Página React (Alumno): ejecución del quiz con countdown timer
- [ ] Página React (Docente): corrección/revisión de respuestas abiertas

---

#### Módulo 3.3 — Calificaciones
**Equivalente antiguo:** `modulos/profesor/calificar_tareas.php`
**Qué hace:** El docente ve las entregas de los alumnos y asigna nota.

Tablas a migrar: `nota_actividad_estudiante`

Pasos:
- [ ] API endpoint: `GET /api/actividades/{id}/entregas` (lista de entregas de alumnos)
- [ ] API endpoint: `PUT /api/entregas/{id}/calificar` (asignar nota y feedback)
- [ ] Página React (Docente): tabla de entregas por actividad, descargar archivo, asignar nota
- [ ] Página React (Alumno): ver nota y feedback por actividad

---

### FASE 4 — Comunicación
> Autónoma, se puede hacer en cualquier momento.

#### Módulo 4.1 — Mensajería Interna
**Equivalente antiguo:** `modulos/admin/mensaje.php`, `modulos/alumnos/mensaje.php`, `modulos/profesor/mensaje.php`
**Qué hace:** Mensajes entre usuarios de la plataforma.

Tablas a migrar: `mensaje_usuarion`

Pasos:
- [ ] Crear migración: `mensajes` (de_user_id, para_user_id, asunto, contenido, leido_at)
- [ ] Modelo: `Mensaje`
- [ ] Repository + Service + Controller API
- [ ] Página React: bandeja de entrada + redactar mensaje
- [ ] Badge de mensajes no leídos en el layout (actualizar `HandleInertiaRequests`)

---

#### Módulo 4.2 — Noticias / Blog
**Equivalente antiguo:** `modulos/alumnos/noticias.php`, `modulos/padre_familia/noticias.php`
**Qué hace:** El admin publica noticias/anuncios visibles para toda la comunidad.

Tablas a migrar: `institucion_blog`

Pasos:
- [ ] Crear migración: `noticias` (titulo, contenido, imagen_path, publicado_at, autor_id)
- [ ] Modelo: `Noticia`
- [ ] Controller API (solo admin puede crear/editar)
- [ ] Página React: listado de noticias + detalle
- [ ] Editor de texto enriquecido para el contenido (TipTap)

---

### FASE 5 — Portal de Padres
> Depende de Fases 1, 2, 3.

#### Módulo 5.1 — Portal de Padres de Familia
**Equivalente antiguo:** `modulos/padre_familia/`
**Qué hace:** Padres ven hijos matriculados, asistencia, notas, y pueden comunicarse con docentes.

Pasos:
- [ ] Completar relación `PadreApoderado` ↔ `Estudiante` en BD
- [ ] API endpoints específicos para rol `padre`:
  - `GET /api/mis-hijos` — hijos matriculados
  - `GET /api/mis-hijos/{id}/asistencia`
  - `GET /api/mis-hijos/{id}/calificaciones`
- [ ] Páginas React: Dashboard padre, Mis hijos, Asistencia hijo, Notas hijo
- [ ] Guard de rutas por rol en frontend

---

### FASE 6 — Extras y Reportes
> Baja prioridad, mejora la experiencia.

#### Módulo 6.1 — Galería de Medios
**Equivalente antiguo:** `modulos/alumnos/galeria_imagen.php`
- [ ] API de subida/listado/eliminación de archivos por usuario
- [ ] Página React con grid de imágenes/videos

#### Módulo 6.2 — Exportación Excel
**Equivalente antiguo:** reportes de asistencia en admin
- [ ] Instalar `maatwebsite/excel`
- [ ] Export para: Asistencia (por mes/curso), Calificaciones (por curso), Matrículas

#### Módulo 6.3 — Actividades especiales (Dibujo / Rompecabezas)
**Equivalente antiguo:** `modulos/alumnos/dibujo_paint.php`, `rompecaveza.php`
- [ ] Canvas de dibujo en React (Fabric.js o similar)
- [ ] Puzzle en React con imagen configurable

---

## Orden recomendado de implementación

```
Semana 1:  Matrícula (1.1) + Unidades/Clases (1.2)
Semana 2:  Asistencia (2.1)
Semana 3:  Actividades - Tareas (3.1)
Semana 4:  Quiz/Exámenes (3.2)
Semana 5:  Calificaciones (3.3) + Mensajería (4.1)
Semana 6:  Noticias (4.2) + Portal de Padres (5.1)
Semana 7+: Galería, Exportaciones, Actividades especiales
```

## Convención para cada módulo nuevo

1. **Migración** → `php artisan make:migration`
2. **Modelo** → `php artisan make:model`
3. **Repository** → crear interface en `app/Repositories/Interfaces/` + impl en `app/Repositories/`
4. **Service** → crear interface en `app/Services/Interfaces/` + impl en `app/Services/`
5. **Controller** → `app/Http/Controllers/Api/`
6. **Form Request** → `app/Http/Requests/Store{Modelo}Request.php`
7. **Ruta API** → agregar en `routes/api.php`
8. **Ruta Web** → agregar en `routes/web.php` (Inertia)
9. **Página React** → `resources/js/pages/{Modulo}/index.tsx`
10. **Regenerar Wayfinder** → `npm run build`
