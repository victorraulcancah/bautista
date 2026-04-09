# Vistas del Portal Docente - Estado Completo

## Comparación Legacy vs Nuevo Sistema

| Vista Legacy | Archivo Legacy | Ruta Nueva | Componente Nuevo | Estado |
|--------------|----------------|------------|------------------|--------|
| `profesores/cursos` | `cursos.php` | `/docente/mis-cursos` | `MisCursos.tsx` | ✅ Completado |
| `profesores/cursos/:id` | `cursos_contenido.php` | `/docente/cursos/{id}/contenido` | `Contenido/Editor.tsx` | ✅ Completado |
| `profesores/actividad/:id` | `actividad.php` | `/docente/actividades/{id}` | `DetalleActividad.tsx` | ✅ Completado |
| `profesores/actividad/quiz/:id` | `quiz_crear.php` | `/docente/cursos/{id}/cuestionario/{actId}` | `Contenido/QuizBuilder.tsx` | ✅ Completado |
| `profesores/verexamen/:id` | `quiz_corre.php` | `/docente/examenes/{id}/revisar` | `RevisarExamen.tsx` | ✅ Completado |
| `profesores/calificar/:actividad` | `calificar_tareas.php` | `/docente/actividades/{id}/calificar` | `CalificarTareas.tsx` | ✅ Completado |
| `profesores/examen/:actividad` | `calificar_examen.php` | `/docente/actividades/{id}/calificar-examen` | `CalificarExamen.tsx` | ✅ Completado |
| `profesores/asistencia` | `asistencia_alumnos.php` | `/docente/asistencia-general` | `AsistenciaGeneral.tsx` | ✅ Completado |
| `profesores/asistencia/:clase` | `asictencia_clase.php` | `/docente/cursos/{id}/asistencia` | `Asistencia/PasarLista.tsx` | ⚠️ Similar |
| `profesores/asistencias` | `asistencia.php` | `/docente/asistencia-general` | `AsistenciaGeneral.tsx` | ✅ Completado |
| `profesores/clase/:clase` | `clase_curso.php` | `/docente/clases/{id}` | `DetalleClase.tsx` | ✅ Completado |
| `profesores/mensajes` | `mensaje.php` | `/mensajeria` | `MensajesPrivados/` | ✅ Compartido |
| `profesores/paint` | `prueba_pain.php` | `/docente/alumno/actividad/{id}/dibujo` | `PortalAlumno/Dibujo` | ⚠️ Similar |
| — | — | `/docente/dashboard` | `Dashboard.tsx` | ✅ Nuevo |
| — | — | `/docente/mis-alumnos` | `MisAlumnos.tsx` | ✅ Nuevo |

## Vistas Creadas en Esta Sesión

### 1. DetalleActividad.tsx
**Ruta:** `/docente/actividades/{id}`  
**Funcionalidad:**
- Vista detallada de una actividad específica
- Edición de descripción de la actividad
- Gestión de archivos del docente
- Acciones según tipo de actividad (examen, tarea, etc.)
- Información de fechas y configuración

**Características:**
- Diseño moderno con bordes redondeados
- Editor de descripción inline
- Upload de archivos con preview
- Botones de acción contextuales según tipo de actividad

### 2. CalificarTareas.tsx
**Ruta:** `/docente/actividades/{id}/calificar`  
**Funcionalidad:**
- Lista de alumnos matriculados
- Visualización de archivos entregados por estudiantes
- Input de notas individual por alumno
- Guardado de calificaciones

**Características:**
- Tabla con diseño AdminLTE (header verde #00a65a)
- Indicadores visuales de estado de entrega
- Inputs numéricos para notas (0-20)
- Toast notifications para feedback

### 3. CalificarExamen.tsx
**Ruta:** `/docente/actividades/{id}/calificar-examen`  
**Funcionalidad:**
- Lista de alumnos con estado de examen
- Indicador de examen entregado/no entregado
- Input de notas
- Botón para revisar examen detallado

**Características:**
- Badges de estado (entregado/no entregado)
- Botón "Ver Examen" para revisión detallada
- Tabla responsive con diseño consistente

### 4. RevisarExamen.tsx
**Ruta:** `/docente/examenes/{id}/revisar`  
**Funcionalidad:**
- Revisión pregunta por pregunta del examen
- Calificación parcial por pregunta
- Cálculo automático de nota total
- Visualización de respuestas correctas e incorrectas
- Soporte para preguntas de opción múltiple y escritas

**Características:**
- Vista detallada de cada pregunta con su valor
- Inputs para notas parciales
- Indicadores visuales de respuestas correctas/incorrectas
- Cálculo en tiempo real de nota total
- Diseño con cards redondeadas

### 5. AsistenciaGeneral.tsx
**Ruta:** `/docente/asistencia-general`  
**Funcionalidad:**
- Consulta de asistencias por curso y rango de fechas
- Estadísticas de asistencia por alumno
- Cálculo de porcentaje de asistencia
- Exportación de reportes
- Búsqueda de estudiantes

**Características:**
- Filtros por curso y fechas
- Tabla con estadísticas completas (asistencias, faltas, tardanzas)
- Barra de progreso visual del porcentaje
- Botón de exportación
- Búsqueda en tiempo real

### 6. DetalleClase.tsx
**Ruta:** `/docente/clases/{id}`  
**Funcionalidad:**
- Vista detallada de una clase
- Edición de descripción de la clase
- Gestión de archivos de la clase
- Información de fechas y visibilidad
- Acceso rápido para crear actividades

**Características:**
- Editor de descripción inline
- Upload y eliminación de archivos
- Panel de información lateral
- Botón para crear nueva actividad

## Estructura de Archivos

```
bautista/resources/js/pages/PortalDocente/
├── Dashboard.tsx                    ✅ Existente
├── MisAlumnos.tsx                   ✅ Existente
├── MisCursos.tsx                    ✅ Existente
├── DetalleActividad.tsx             ✅ NUEVO
├── CalificarTareas.tsx              ✅ NUEVO
├── CalificarExamen.tsx              ✅ NUEVO
├── RevisarExamen.tsx                ✅ NUEVO
├── AsistenciaGeneral.tsx            ✅ NUEVO
├── DetalleClase.tsx                 ✅ NUEVO
├── Asistencia/
│   └── PasarLista.tsx               ✅ Existente
└── Contenido/
    ├── Editor.tsx                   ✅ Existente
    └── QuizBuilder.tsx              ✅ Existente
```

## Rutas del Backend Necesarias

Para que estas vistas funcionen correctamente, se necesitan los siguientes endpoints en el backend:

### Actividades
- `GET /api/docente/actividades/{id}` - Obtener detalle de actividad
- `GET /api/docente/actividades/{id}/archivos` - Listar archivos de actividad
- `POST /api/docente/actividades/{id}/archivos` - Subir archivo
- `PUT /api/docente/actividades/{id}/descripcion` - Actualizar descripción
- `GET /api/docente/actividades/{id}/alumnos` - Listar alumnos para calificar
- `POST /api/docente/actividades/{id}/calificar` - Guardar nota de tarea

### Exámenes
- `GET /api/docente/actividades/{id}/examenes` - Listar alumnos con exámenes
- `POST /api/docente/actividades/{id}/calificar-examen` - Guardar nota de examen
- `GET /api/docente/examenes/{id}/revisar` - Obtener detalle de examen para revisar
- `POST /api/docente/examenes/{id}/calificar` - Guardar calificación detallada

### Asistencia
- `GET /api/docente/cursos/{id}/asistencias` - Obtener asistencias por curso y fechas
- `GET /api/docente/cursos/{id}/asistencias/exportar` - Exportar reporte

### Clases
- `GET /api/docente/clases/{id}` - Obtener detalle de clase
- `GET /api/docente/clases/{id}/archivos` - Listar archivos de clase
- `POST /api/docente/clases/{id}/archivos` - Subir archivo
- `DELETE /api/docente/clases/archivos/{id}` - Eliminar archivo
- `PUT /api/docente/clases/{id}/descripcion` - Actualizar descripción

## Características de Diseño Comunes

Todas las vistas nuevas mantienen consistencia con el diseño existente:

1. **Colores:**
   - Primario: Indigo (#4F46E5)
   - Éxito: Verde (#00a65a) - usado en headers de tablas
   - Fondo: #FDFDFF

2. **Bordes Redondeados:**
   - Cards principales: `rounded-[3rem]`
   - Cards secundarias: `rounded-[2.5rem]`
   - Botones: `rounded-2xl`
   - Inputs: `rounded-xl`

3. **Tipografía:**
   - Títulos principales: `text-4xl font-black`
   - Subtítulos: `text-2xl font-black`
   - Texto normal: `font-medium` o `font-bold`

4. **Sombras:**
   - Cards: `shadow-xl`
   - Elementos secundarios: `shadow-lg`

5. **Espaciado:**
   - Padding de cards: `p-8`
   - Espaciado entre secciones: `space-y-8`

## Próximos Pasos

1. **Implementar Controllers y Rutas del Backend:**
   - Crear los controladores necesarios en Laravel
   - Definir las rutas en `routes/api.php`
   - Implementar la lógica de negocio

2. **Agregar Rutas en Inertia:**
   - Actualizar `routes/web.php` con las nuevas rutas
   - Configurar los controladores Inertia

3. **Testing:**
   - Probar cada vista con datos reales
   - Verificar la integración con el backend
   - Ajustar estilos según necesidad

4. **Optimizaciones:**
   - Implementar loading states
   - Agregar manejo de errores
   - Optimizar queries del backend

## Notas Importantes

- Todas las vistas usan el hook `useToast` para notificaciones
- Se mantiene consistencia con el patrón de diseño existente
- Los breadcrumbs están configurados para navegación
- Las vistas son responsive y funcionan en mobile
- Se usa TypeScript para type safety
