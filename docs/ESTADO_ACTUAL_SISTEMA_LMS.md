# Estado Actual del Sistema LMS - Análisis Completo

## 📊 Resumen Ejecutivo

Este documento analiza el estado actual del sistema LMS, identificando qué está completo, qué está a medias y qué falta por implementar según el diseño objetivo estilo Blackboard.

**Fecha de Análisis**: 2026-04-10  
**Versión del Sistema**: 1.0 (En desarrollo)

---

## ✅ COMPONENTES COMPLETADOS

### Backend - Base de Datos
- ✅ Estructura completa de tablas (migraciones)
  - `cursos`, `docente_cursos`, `unidades`, `clases`
  - `archivos_clase`, `actividad_curso`, `cuestionario`
  - `pregunta_cuestionario`, `alternativa_pregunta`
  - `nota_actividad_estudiante`, `anuncios`
  - `asistencia_clases`, `asistencia_alumnos`
  - `matriculas`, `estudiantes`, `docentes`

### Backend - Modelos
- ✅ Todos los modelos principales creados
  - `Curso`, `DocenteCurso`, `Unidad`, `Clase`
  - `ArchivoClase`, `ActividadCurso`, `Cuestionario`
  - `NotaActividad`, `Anuncio`, `AsistenciaActividad`
  - Relaciones Eloquent configuradas correctamente

### Backend - Controladores API (Parcialmente)
- ✅ `DocenteApiController` - Funcionalidad básica
  - ✅ `dashboard()` - Resumen del docente
  - ✅ `misCursos()` - Lista de cursos asignados
  - ✅ `cursoContenido()` - Obtener contenido del curso
  - ✅ `crearUnidad()` - Crear unidad
  - ✅ `crearClase()` - Crear clase
  - ✅ `crearActividad()` - Crear actividad
  - ✅ `misAlumnos()` - Lista de alumnos
  - ✅ `alumnosSeccion()` - Alumnos de una sección
  - ✅ `iniciarAsistencia()` - Iniciar sesión de asistencia
  - ✅ `marcarAsistencia()` - Marcar asistencia
  - ✅ `getAnuncios()` - Obtener anuncios
  - ✅ `storeAnuncio()` - Crear anuncio
  - ✅ `alumnosConMetricas()` - Alumnos con métricas de rendimiento

- ✅ `CursoContenidoApiController` - Gestión de contenido
  - ✅ `show()` - Obtener contenido completo
  - ✅ `storeUnidad()` - Crear unidad
  - ✅ `updateUnidad()` - Actualizar unidad
  - ✅ `destroyUnidad()` - Eliminar unidad
  - ✅ `reordenarUnidades()` - Reordenar unidades
  - ✅ `storeClase()` - Crear clase
  - ✅ `updateClase()` - Actualizar clase
  - ✅ `destroyClase()` - Eliminar clase
  - ✅ `reordenarClases()` - Reordenar clases
  - ✅ `subirArchivo()` - Subir archivo a clase
  - ✅ `eliminarArchivo()` - Eliminar archivo

- ✅ `CalificacionApiController` - Gestión de calificaciones
  - ✅ `indexByActivity()` - Calificaciones por actividad
  - ✅ `calificar()` - Calificar en lote

- ✅ `ActividadApiController` - Gestión de actividades
  - ✅ CRUD básico de actividades
  - ✅ `tipos()` - Tipos de actividad
  - ✅ `guardarDibujo()` - Guardar dibujo de alumno

### Frontend - Componentes Base
- ✅ Layout principal (`AppLayout`)
- ✅ Sistema de autenticación
- ✅ Navegación y sidebar
- ✅ Sistema de permisos integrado

### Frontend - Portal Docente (Parcial)
- ✅ `MisAlumnos.tsx` - Lista de alumnos (recién corregido con Inertia)
- ✅ `Editor.tsx` - Vista principal con tabs estilo Blackboard
- ✅ `PasarLista.tsx` - Tomar asistencia
- ✅ `QuizBuilder.tsx` - Constructor de cuestionarios
- ⚠️ Componentes legacy que necesitan actualización:
  - `CalificarTareas.tsx`
  - `CalificarExamen.tsx`
  - `DetalleClase.tsx`
  - `DetalleActividad.tsx`
  - `AsistenciaGeneral.tsx`
  - `RevisarExamen.tsx`

### Frontend - Portal Alumno (Parcial)
- ✅ `Cursos/Detalle.tsx` - Vista de detalle de curso
- ✅ `Clases/Ver.tsx` - Ver clase individual
- ✅ `Notas/index.tsx` - Ver calificaciones
- ✅ `Asistencia.tsx` - Ver asistencia
- ✅ `Profesores.tsx` - Ver profesores
- ✅ `QR.tsx` - Código QR del alumno
- ✅ `Puzzles/` - Actividades de rompecabezas

---

## ⚠️ COMPONENTES A MEDIAS (Necesitan Actualización)

### Backend - APIs Incompletas

#### 1. DocenteApiController - Faltan endpoints
```php
// ❌ FALTA: Actualizar unidad
PUT /api/docente/unidad/{unidadId}

// ❌ FALTA: Eliminar unidad
DELETE /api/docente/unidad/{unidadId}

// ❌ FALTA: Actualizar clase
PUT /api/docente/clase/{claseId}

// ❌ FALTA: Eliminar clase
DELETE /api/docente/clase/{claseId}

// ❌ FALTA: Actualizar actividad
PUT /api/docente/actividad/{actividadId}

// ❌ FALTA: Eliminar actividad
DELETE /api/docente/actividad/{actividadId}

// ❌ FALTA: Actualizar anuncio
PUT /api/docente/anuncio/{anuncioId}

// ❌ FALTA: Eliminar anuncio
DELETE /api/docente/anuncio/{anuncioId}

// ❌ FALTA: Subir archivo a clase
POST /api/docente/clase/{claseId}/archivo

// ❌ FALTA: Eliminar archivo
DELETE /api/docente/archivo/{archivoId}

// ❌ FALTA: Ver entregas pendientes
GET /api/docente/curso/{docenteCursoId}/entregas-pendientes

// ❌ FALTA: Ver entregas de actividad
GET /api/docente/actividad/{actividadId}/entregas

// ❌ FALTA: Calificar entrega individual
POST /api/docente/actividad/{actividadId}/estudiante/{estudianteId}/calificar

// ❌ FALTA: Tabla completa de calificaciones
GET /api/docente/curso/{docenteCursoId}/calificaciones

// ❌ FALTA: Exportar calificaciones
GET /api/docente/curso/{docenteCursoId}/calificaciones/exportar

// ❌ FALTA: Historial de asistencia
GET /api/docente/curso/{docenteCursoId}/asistencia/historial
```

#### 2. AlumnoApiController - Necesita crearse
```php
// ❌ FALTA: Controlador completo para estudiantes
// Actualmente no existe un controlador centralizado para el portal alumno

// Endpoints necesarios:
GET /api/alumno/mis-cursos
GET /api/alumno/curso/{cursoId}/contenido
GET /api/alumno/curso/{cursoId}/anuncios
GET /api/alumno/curso/{cursoId}/calificaciones
GET /api/alumno/curso/{cursoId}/actividades-pendientes
GET /api/alumno/actividad/{actividadId}
POST /api/alumno/actividad/{actividadId}/entregar
GET /api/alumno/archivo/{archivoId}/descargar
POST /api/alumno/clase/{claseId}/marcar-vista
POST /api/alumno/anuncio/{anuncioId}/marcar-leido

// Exámenes
POST /api/alumno/examen/{actividadId}/iniciar
POST /api/alumno/examen/{examenIniciadoId}/responder
POST /api/alumno/examen/{examenIniciadoId}/finalizar
GET /api/alumno/examen/{examenIniciadoId}/resultado
```

### Frontend - Portal Docente

#### 1. Editor.tsx - Tabs Incompletos
```typescript
// ✅ COMPLETO: Tab "Contenido" - Estructura básica
// ⚠️ A MEDIAS: Falta funcionalidad de edición/eliminación inline
// ⚠️ A MEDIAS: Falta drag & drop para reordenar
// ⚠️ A MEDIAS: Falta vista previa de archivos

// ❌ FALTA: Tab "Anuncios" - Solo tiene EmptyState
// Necesita:
// - Lista de anuncios
// - Formulario crear/editar
// - Eliminar anuncio
// - Adjuntar archivos

// ❌ FALTA: Tab "Calificaciones" - Solo tiene EmptyState
// Necesita:
// - Tabla de calificaciones (estudiantes x actividades)
// - Filtros por unidad/tipo
// - Modal de calificación
// - Exportar a Excel/PDF
// - Estadísticas del curso

// ⚠️ A MEDIAS: Tab "Alumnos" - Tiene tabla básica
// Falta:
// - Ver progreso individual
// - Enviar mensajes
// - Exportar lista
// - Filtros y búsqueda avanzada

// ❌ FALTA: Tab "Configuración" - Solo tiene EmptyState
// Necesita:
// - Configuración del curso
// - Personalización (color, banner)
// - Permisos
// - Notificaciones
```

#### 2. Componentes Legacy a Actualizar
```
❌ CalificarTareas.tsx - No sigue el diseño Blackboard
❌ CalificarExamen.tsx - No sigue el diseño Blackboard
❌ DetalleClase.tsx - No integrado con Editor.tsx
❌ DetalleActividad.tsx - No integrado con Editor.tsx
❌ AsistenciaGeneral.tsx - Duplicado con PasarLista.tsx
❌ RevisarExamen.tsx - No sigue el diseño Blackboard
```

### Frontend - Portal Alumno

#### 1. Vista de Curso - Necesita Rediseño Completo
```typescript
// ❌ FALTA: Vista principal con tabs estilo Blackboard
// Actualmente: Cursos/Detalle.tsx existe pero no sigue el diseño

// Necesita:
// - Barra superior oscura con breadcrumbs
// - Tabs horizontales (Contenido, Anuncios, Calificaciones)
// - Banner hero del curso
// - Sidebar derecho con información
// - Diseño consistente con portal docente
```

#### 2. Tab Contenido (Vista Alumno)
```typescript
// ⚠️ A MEDIAS: Existe Clases/Ver.tsx pero no integrado

// Necesita:
// - Ver unidades y clases organizadas
// - Descargar/visualizar archivos
// - Ver actividades con fechas límite
// - Indicador de progreso
// - Marcar como completado
// - Acceso a tareas y exámenes
```

#### 3. Sistema de Entregas
```typescript
// ❌ FALTA: Componente para entregar tareas
// ❌ FALTA: Componente para resolver exámenes
// ❌ FALTA: Ver estado de entregas
// ❌ FALTA: Ver feedback del docente
```

---

## ❌ COMPONENTES FALTANTES (Por Implementar)

### Backend - Servicios

#### 1. ContenidoService
```php
// Centralizar lógica de negocio del contenido
// Actualmente está dispersa en controladores

interface ContenidoServiceInterface {
    public function obtenerContenidoCurso(int $cursoId);
    public function crearUnidad(array $data);
    public function actualizarUnidad(int $id, array $data);
    public function eliminarUnidad(int $id);
    public function reordenarUnidades(int $cursoId, array $orden);
    // ... métodos para clases y archivos
}
```

#### 2. CalificacionService
```php
interface CalificacionServiceInterface {
    public function obtenerTablaCalificaciones(int $docenteCursoId);
    public function calificarActividad(int $actividadId, int $estudianteId, array $data);
    public function exportarCalificaciones(int $docenteCursoId, string $formato);
    public function obtenerEstadisticasCurso(int $docenteCursoId);
    public function obtenerCalificacionesEstudiante(int $estudianteId, int $cursoId);
}
```

#### 3. AnuncioService
```php
interface AnuncioServiceInterface {
    public function listarAnuncios(int $docenteCursoId);
    public function crearAnuncio(array $data);
    public function actualizarAnuncio(int $id, array $data);
    public function eliminarAnuncio(int $id);
    public function marcarComoLeido(int $anuncioId, int $usuarioId);
}
```

#### 4. ActividadService
```php
interface ActividadServiceInterface {
    public function obtenerActividadesPendientes(int $estudianteId, int $cursoId);
    public function entregarTarea(int $actividadId, int $estudianteId, array $data);
    public function iniciarExamen(int $actividadId, int $estudianteId);
    public function responderExamen(int $examenIniciadoId, array $respuestas);
    public function finalizarExamen(int $examenIniciadoId);
    public function obtenerResultadoExamen(int $examenIniciadoId);
}
```

### Backend - Middleware

#### 1. VerifyDocenteCurso
```php
// Verificar que el docente tiene acceso al curso
// Actualmente no existe validación centralizada
```

#### 2. VerifyEstudianteCurso
```php
// Verificar que el estudiante está matriculado en el curso
// Actualmente no existe validación centralizada
```

### Backend - Notificaciones

```php
// ❌ FALTA: Sistema de notificaciones
// - Notificar nuevos anuncios
// - Notificar calificaciones publicadas
// - Notificar fechas límite próximas
// - Notificar mensajes del docente
```

### Backend - Exportaciones

```php
// ❌ FALTA: Exportar calificaciones a Excel
// ❌ FALTA: Exportar calificaciones a PDF
// ❌ FALTA: Exportar lista de alumnos
// ❌ FALTA: Exportar historial de asistencia
```

### Frontend - Componentes Compartidos

```typescript
// ❌ FALTA: CourseHero.tsx - Banner del curso
// ❌ FALTA: CourseTabs.tsx - Tabs horizontales reutilizables
// ❌ FALTA: CourseSidebar.tsx - Sidebar derecho
// ❌ FALTA: ContentItem.tsx - Item de contenido reutilizable
// ❌ FALTA: EmptyState.tsx - Estados vacíos consistentes
// ❌ FALTA: FileUploader.tsx - Componente de upload
// ❌ FALTA: FileViewer.tsx - Visor de archivos
// ❌ FALTA: GradeTable.tsx - Tabla de calificaciones
// ❌ FALTA: ActivityCard.tsx - Card de actividad
// ❌ FALTA: AnnouncementCard.tsx - Card de anuncio
```

### Frontend - Portal Docente - Tab Anuncios

```typescript
// ❌ FALTA: pages/PortalDocente/Anuncios/index.tsx
// ❌ FALTA: pages/PortalDocente/Anuncios/AnuncioForm.tsx
// ❌ FALTA: pages/PortalDocente/Anuncios/AnuncioCard.tsx
// ❌ FALTA: pages/PortalDocente/Anuncios/hooks/useAnuncios.ts
```

### Frontend - Portal Docente - Tab Calificaciones

```typescript
// ❌ FALTA: pages/PortalDocente/Calificaciones/index.tsx
// ❌ FALTA: pages/PortalDocente/Calificaciones/TablaCalificaciones.tsx
// ❌ FALTA: pages/PortalDocente/Calificaciones/CalificarModal.tsx
// ❌ FALTA: pages/PortalDocente/Calificaciones/EstadisticasCurso.tsx
// ❌ FALTA: pages/PortalDocente/Calificaciones/hooks/useCalificaciones.ts
// ❌ FALTA: pages/PortalDocente/Calificaciones/hooks/useExportar.ts
```

### Frontend - Portal Docente - Tab Configuración

```typescript
// ❌ FALTA: pages/PortalDocente/Configuracion/index.tsx
// ❌ FALTA: pages/PortalDocente/Configuracion/GeneralSettings.tsx
// ❌ FALTA: pages/PortalDocente/Configuracion/AppearanceSettings.tsx
// ❌ FALTA: pages/PortalDocente/Configuracion/PermissionsSettings.tsx
// ❌ FALTA: pages/PortalDocente/Configuracion/NotificationsSettings.tsx
```

### Frontend - Portal Alumno - Vista Principal

```typescript
// ❌ FALTA: pages/PortalAlumno/Curso/index.tsx (Vista con tabs)
// ❌ FALTA: pages/PortalAlumno/Curso/TabContenido.tsx
// ❌ FALTA: pages/PortalAlumno/Curso/TabAnuncios.tsx
// ❌ FALTA: pages/PortalAlumno/Curso/TabCalificaciones.tsx
```

### Frontend - Portal Alumno - Actividades

```typescript
// ❌ FALTA: pages/PortalAlumno/Actividades/TareaEntrega.tsx
// ❌ FALTA: pages/PortalAlumno/Actividades/ExamenResolver.tsx
// ❌ FALTA: pages/PortalAlumno/Actividades/ExamenResultado.tsx
// ❌ FALTA: pages/PortalAlumno/Actividades/hooks/useEntregarTarea.ts
// ❌ FALTA: pages/PortalAlumno/Actividades/hooks/useResolverExamen.ts
```

---

## 🔧 PROBLEMAS IDENTIFICADOS

### 1. Inconsistencia en la Arquitectura
```
PROBLEMA: Mezcla de patrones
- Algunos endpoints en DocenteApiController
- Otros en CursoContenidoApiController
- Lógica de negocio en controladores (no en servicios)

SOLUCIÓN:
- Crear servicios para centralizar lógica
- Mantener controladores delgados
- Seguir patrón Repository/Service
```

### 2. Falta de Validación de Permisos
```
PROBLEMA: No hay middleware para verificar acceso
- Docente puede acceder a cualquier curso
- Estudiante puede acceder a cualquier contenido

SOLUCIÓN:
- Crear middleware VerifyDocenteCurso
- Crear middleware VerifyEstudianteCurso
- Aplicar en todas las rutas protegidas
```

### 3. Componentes Frontend Desactualizados
```
PROBLEMA: Componentes legacy no siguen diseño Blackboard
- CalificarTareas.tsx
- CalificarExamen.tsx
- DetalleClase.tsx
- etc.

SOLUCIÓN:
- Refactorizar o eliminar componentes legacy
- Integrar funcionalidad en Editor.tsx con tabs
- Mantener diseño consistente
```

### 4. Falta de Integración Frontend-Backend
```
PROBLEMA: Componentes hacen llamadas API directas
- No hay hooks reutilizables
- Lógica duplicada
- Difícil de mantener

SOLUCIÓN:
- Crear hooks personalizados (useContenido, useCalificaciones, etc.)
- Centralizar llamadas API
- Implementar cache y optimistic updates
```

### 5. Relación Unidad-Curso Incorrecta
```
PROBLEMA: En la migración, unidades tienen curso_id
Pero en DocenteApiController.crearUnidad() se usa docente_curso_id

SOLUCIÓN:
- Decidir si unidades pertenecen a curso o docente_curso
- Actualizar migración o controlador según decisión
- Mantener consistencia
```

---

## 📋 PRIORIDADES DE CORRECCIÓN

### Prioridad ALTA (Crítico)

1. **Corregir relación Unidad-Curso**
   - Decidir estructura correcta
   - Actualizar migración o código
   - Probar creación de unidades

2. **Implementar middleware de permisos**
   - VerifyDocenteCurso
   - VerifyEstudianteCurso
   - Aplicar en rutas

3. **Completar DocenteApiController**
   - Agregar endpoints faltantes (UPDATE, DELETE)
   - Implementar upload de archivos
   - Implementar tabla de calificaciones

4. **Crear AlumnoApiController**
   - Endpoints básicos de contenido
   - Sistema de entregas
   - Resolución de exámenes

### Prioridad MEDIA (Importante)

5. **Implementar Tab Anuncios (Docente)**
   - Backend: CRUD completo
   - Frontend: Componentes y hooks

6. **Implementar Tab Calificaciones (Docente)**
   - Backend: Tabla completa, exportación
   - Frontend: Tabla interactiva, modal calificar

7. **Rediseñar Portal Alumno**
   - Vista principal con tabs
   - Tab Contenido
   - Tab Anuncios
   - Tab Calificaciones

8. **Sistema de Entregas (Alumno)**
   - Entregar tareas
   - Resolver exámenes
   - Ver resultados

### Prioridad BAJA (Mejoras)

9. **Tab Configuración (Docente)**
   - Configuración general
   - Personalización
   - Permisos

10. **Sistema de Notificaciones**
    - Backend: Jobs y notificaciones
    - Frontend: Indicadores y alertas

11. **Exportaciones**
    - Excel, PDF
    - Reportes avanzados

12. **Optimizaciones**
    - Cache
    - Lazy loading
    - Optimistic updates

---

## 📊 MÉTRICAS DE COMPLETITUD

### Backend
- **Base de Datos**: 100% ✅
- **Modelos**: 100% ✅
- **Controladores**: 40% ⚠️
- **Servicios**: 0% ❌
- **Middleware**: 20% ❌
- **APIs**: 45% ⚠️

**Total Backend**: ~50% completo

### Frontend
- **Layout Base**: 100% ✅
- **Portal Docente**: 30% ⚠️
  - Editor.tsx: 40%
  - Tab Contenido: 50%
  - Tab Anuncios: 0%
  - Tab Calificaciones: 0%
  - Tab Alumnos: 60%
  - Tab Configuración: 0%
- **Portal Alumno**: 20% ❌
  - Vista principal: 0%
  - Contenido: 30%
  - Actividades: 10%
  - Anuncios: 0%
  - Calificaciones: 40%

**Total Frontend**: ~25% completo

### **COMPLETITUD GENERAL DEL SISTEMA: ~37%**

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### Semana 1-2: Correcciones Críticas
1. Corregir relación Unidad-Curso
2. Implementar middleware de permisos
3. Completar endpoints faltantes en DocenteApiController
4. Crear AlumnoApiController básico

### Semana 3-4: Portal Docente - Tabs
5. Implementar Tab Anuncios completo
6. Implementar Tab Calificaciones completo
7. Mejorar Tab Alumnos
8. Crear componentes compartidos

### Semana 5-6: Portal Alumno
9. Rediseñar vista principal con tabs
10. Implementar Tab Contenido (vista alumno)
11. Implementar sistema de entregas
12. Implementar resolución de exámenes

### Semana 7-8: Funcionalidades Avanzadas
13. Tab Configuración (docente)
14. Sistema de notificaciones
15. Exportaciones
16. Optimizaciones

---

## 🚀 PLAN DE ESTABILIZACIÓN Y MEJORA - FASE 1

Este plan aborda la **Prioridad ALTA** identificada en el análisis, enfocándose en la consistencia de la base de datos, la seguridad mediante middleware y la completitud de las APIs básicas.

### ⚠️ DECISIONES ARQUITECTÓNICAS IMPORTANTES

#### 1. Consolidación de APIs
**DECISIÓN**: Eliminar rutas duplicadas en `DocenteApiController` a favor de `CursoContenidoApiController`

**RUTAS A ELIMINAR** (DocenteApiController):
```php
❌ POST /api/docente/unidad
❌ POST /api/docente/clase
❌ POST /api/docente/actividad
```

**RUTAS ESTÁNDAR** (CursoContenidoApiController):
```php
✅ POST /api/contenido/unidades
✅ POST /api/contenido/clases
✅ POST /api/actividades (ActividadApiController)
```

**IMPACTO**: Requerirá actualización en el frontend (Editor.tsx)

#### 2. Relación Unidad-Curso
**DECISIÓN CONFIRMADA**: Las Unidades y Clases pertenecen al **Curso** (compartido), NO a la asignación individual del docente.

**ESTRUCTURA**:
```
Curso (compartido)
  └─ Unidad (compartida entre todas las secciones)
      └─ Clase (compartida entre todas las secciones)
          └─ Actividad (compartida)
```

**BENEFICIOS**:
- Múltiples secciones comparten el mismo material
- Docentes colaboran en el mismo contenido
- Actualizaciones benefician a todas las secciones
- Menos duplicación de contenido

**TABLA AFECTADA**:
```sql
-- ✅ CORRECTO (actual)
CREATE TABLE unidades (
    unidad_id BIGINT PRIMARY KEY,
    curso_id BIGINT,  -- ✅ Pertenece al curso
    titulo VARCHAR(200),
    ...
);

-- ❌ INCORRECTO (lo que estaba en DocenteApiController)
-- docente_curso_id NO debe usarse aquí
```

---

### 📋 CAMBIOS PROPUESTOS

#### 1. Seguridad y Middleware [NUEVO]

##### [NEW] VerifyDocenteCurso.php
**Ubicación**: `app/Http/Middleware/VerifyDocenteCurso.php`

**Propósito**: Verificar que el docente autenticado tiene permiso sobre el curso solicitado

**Lógica**:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\DocenteCurso;
use App\Models\Docente;

class VerifyDocenteCurso
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        // Obtener docente_id del usuario
        $docente = Docente::where('id_usuario', $user->id)->first();
        
        if (!$docente) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        
        // Obtener docenteCursoId del request (puede venir de ruta o query)
        $docenteCursoId = $request->route('docenteCursoId') 
                       ?? $request->input('docente_curso_id');
        
        if (!$docenteCursoId) {
            return response()->json(['message' => 'docente_curso_id requerido'], 422);
        }
        
        // Verificar que el docente tiene acceso a este curso
        $tieneAcceso = DocenteCurso::where('docen_curso_id', $docenteCursoId)
            ->where('docente_id', $docente->docente_id)
            ->exists();
        
        if (!$tieneAcceso) {
            return response()->json(['message' => 'No tiene acceso a este curso'], 403);
        }
        
        return $next($request);
    }
}
```

##### [NEW] VerifyEstudianteCurso.php
**Ubicación**: `app/Http/Middleware/VerifyEstudianteCurso.php`

**Propósito**: Verificar que el estudiante está matriculado en el curso/sección

**Lógica**:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Estudiante;
use App\Models\Matricula;
use App\Models\DocenteCurso;

class VerifyEstudianteCurso
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        // Obtener estudiante_id del usuario
        $estudiante = Estudiante::where('user_id', $user->id)->first();
        
        if (!$estudiante) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        
        // Obtener cursoId o docenteCursoId del request
        $cursoId = $request->route('cursoId') ?? $request->input('curso_id');
        $docenteCursoId = $request->route('docenteCursoId');
        
        if ($docenteCursoId) {
            // Verificar a través de docente_curso
            $docenteCurso = DocenteCurso::find($docenteCursoId);
            if (!$docenteCurso) {
                return response()->json(['message' => 'Curso no encontrado'], 404);
            }
            
            $estaMatriculado = Matricula::where('estu_id', $estudiante->estu_id)
                ->where('seccion_id', $docenteCurso->seccion_id)
                ->where('apertura_id', $docenteCurso->apertura_id)
                ->where('estado', '1')
                ->exists();
        } else if ($cursoId) {
            // Verificar a través de curso_id
            $estaMatriculado = Matricula::where('estu_id', $estudiante->estu_id)
                ->whereHas('seccion.grado', function($q) use ($cursoId) {
                    // Verificar que la sección tiene el curso
                    // Esto depende de cómo relacionas curso con sección
                })
                ->where('estado', '1')
                ->exists();
        } else {
            return response()->json(['message' => 'curso_id o docente_curso_id requerido'], 422);
        }
        
        if (!$estaMatriculado) {
            return response()->json(['message' => 'No está matriculado en este curso'], 403);
        }
        
        return $next($request);
    }
}
```

---

#### 2. Refactorización de APIs Backend

##### [MODIFY] routes/api.php
**Cambios**:
```php
// ============================================
// APLICAR MIDDLEWARES
// ============================================

// Rutas de Docente (requieren verificación de acceso al curso)
Route::middleware(['auth.token', 'verify.docente.curso'])->group(function () {
    Route::get('docente/curso/{docenteCursoId}/contenido', [DocenteApiController::class, 'cursoContenido']);
    Route::get('docente/curso/{docenteCursoId}/alumnos', [DocenteApiController::class, 'alumnosSeccion']);
    Route::get('docente/curso/{docenteCursoId}/anuncios', [DocenteApiController::class, 'getAnuncios']);
    Route::post('docente/curso/{docenteCursoId}/anuncio', [DocenteApiController::class, 'storeAnuncio']);
    Route::put('docente/anuncio/{anuncioId}', [DocenteApiController::class, 'updateAnuncio']);
    Route::delete('docente/anuncio/{anuncioId}', [DocenteApiController::class, 'destroyAnuncio']);
    Route::get('docente/curso/{docenteCursoId}/calificaciones', [DocenteApiController::class, 'tablaCalificaciones']);
    Route::get('docente/curso/{docenteCursoId}/entregas-pendientes', [DocenteApiController::class, 'entregasPendientes']);
});

// ❌ ELIMINAR estas rutas duplicadas:
// Route::post('docente/unidad', [DocenteApiController::class, 'crearUnidad']);
// Route::post('docente/clase', [DocenteApiController::class, 'crearClase']);
// Route::post('docente/actividad', [DocenteApiController::class, 'crearActividad']);

// ✅ USAR estas rutas estándar:
Route::middleware(['auth.token'])->group(function () {
    // Contenido del curso (compartido)
    Route::prefix('contenido')->group(function () {
        Route::get('cursos/{cursoId}', [CursoContenidoApiController::class, 'show']);
        Route::post('unidades', [CursoContenidoApiController::class, 'storeUnidad']);
        Route::put('unidades/{id}', [CursoContenidoApiController::class, 'updateUnidad']);
        Route::delete('unidades/{id}', [CursoContenidoApiController::class, 'destroyUnidad']);
        Route::post('unidades/{cursoId}/reordenar', [CursoContenidoApiController::class, 'reordenarUnidades']);
        
        Route::post('clases', [CursoContenidoApiController::class, 'storeClase']);
        Route::put('clases/{id}', [CursoContenidoApiController::class, 'updateClase']);
        Route::delete('clases/{id}', [CursoContenidoApiController::class, 'destroyClase']);
        Route::post('clases/{unidadId}/reordenar', [CursoContenidoApiController::class, 'reordenarClases']);
        
        Route::post('clases/{claseId}/archivo', [CursoContenidoApiController::class, 'subirArchivo']);
        Route::delete('archivos/{archivoId}', [CursoContenidoApiController::class, 'eliminarArchivo']);
    });
    
    // Actividades
    Route::apiResource('actividades', ActividadApiController::class);
});

// Rutas de Alumno (requieren verificación de matrícula)
Route::middleware(['auth.token', 'verify.estudiante.curso'])->group(function () {
    Route::get('alumno/curso/{cursoId}/contenido', [AlumnoApiController::class, 'contenido']);
    Route::get('alumno/curso/{cursoId}/anuncios', [AlumnoApiController::class, 'anuncios']);
    Route::get('alumno/curso/{cursoId}/calificaciones', [AlumnoApiController::class, 'calificaciones']);
    Route::get('alumno/curso/{cursoId}/actividades-pendientes', [AlumnoApiController::class, 'actividadesPendientes']);
});
```

##### [MODIFY] DocenteApiController.php
**Cambios**:
```php
// ❌ ELIMINAR estos métodos (ahora en CursoContenidoApiController):
// - crearUnidad()
// - crearClase()
// - crearActividad()

// ✅ AGREGAR estos métodos faltantes:

/**
 * Update an announcement.
 */
public function updateAnuncio(Request $request, int $anuncioId)
{
    $validated = $request->validate([
        'titulo' => 'required|string|max:255',
        'contenido' => 'required|string',
    ]);

    $anuncio = Anuncio::findOrFail($anuncioId);
    $anuncio->update($validated);
    
    return response()->json($anuncio);
}

/**
 * Delete an announcement.
 */
public function destroyAnuncio(int $anuncioId)
{
    $anuncio = Anuncio::findOrFail($anuncioId);
    $anuncio->delete();
    
    return response()->json(null, 204);
}

/**
 * Get full grade table for a course.
 */
public function tablaCalificaciones(int $docenteCursoId)
{
    $docenteCurso = DocenteCurso::findOrFail($docenteCursoId);
    
    // Obtener estudiantes de la sección
    $estudiantes = Matricula::where('seccion_id', $docenteCurso->seccion_id)
        ->where('apertura_id', $docenteCurso->apertura_id)
        ->where('estado', '1')
        ->with('estudiante.perfil')
        ->get();
    
    // Obtener actividades del curso
    $actividades = ActividadCurso::whereHas('clase.unidad', function($q) use ($docenteCurso) {
        $q->where('curso_id', $docenteCurso->curso_id);
    })
    ->where('es_calificado', '1')
    ->with('clase.unidad')
    ->get();
    
    // Obtener calificaciones
    $calificaciones = [];
    foreach ($estudiantes as $estudiante) {
        $calificaciones[$estudiante->estu_id] = [];
        foreach ($actividades as $actividad) {
            $nota = NotaActividad::where('estu_id', $estudiante->estu_id)
                ->where('actividad_id', $actividad->actividad_id)
                ->first();
            
            $calificaciones[$estudiante->estu_id][$actividad->actividad_id] = [
                'nota' => $nota?->nota,
                'fecha' => $nota?->fecha_calificacion,
                'observacion' => $nota?->observacion,
            ];
        }
    }
    
    return response()->json([
        'estudiantes' => $estudiantes,
        'actividades' => $actividades,
        'calificaciones' => $calificaciones,
    ]);
}

/**
 * Get pending submissions to grade.
 */
public function entregasPendientes(int $docenteCursoId)
{
    $docenteCurso = DocenteCurso::findOrFail($docenteCursoId);
    
    $entregas = ActividadUsuario::whereHas('actividad.clase.unidad', function($q) use ($docenteCurso) {
        $q->where('curso_id', $docenteCurso->curso_id);
    })
    ->where('estado', 'entregado')
    ->whereDoesntHave('calificacion')
    ->with(['actividad', 'estudiante.perfil'])
    ->get();
    
    return response()->json($entregas);
}
```

##### [MODIFY] CursoContenidoService.php
**Cambios**:
```php
// Asegurar que todos los métodos usan curso_id correctamente

public function crearUnidad(array $data)
{
    // ✅ CORRECTO: Usar curso_id
    return Unidad::create([
        'curso_id' => $data['curso_id'],  // ✅ NO docente_curso_id
        'titulo' => $data['titulo'],
        'descripcion' => $data['descripcion'] ?? null,
        'orden' => Unidad::where('curso_id', $data['curso_id'])->count() + 1,
        'estado' => '1',
    ]);
}

public function reordenarUnidades(int $cursoId, array $orden)
{
    foreach ($orden as $index => $unidadId) {
        Unidad::where('unidad_id', $unidadId)
            ->where('curso_id', $cursoId)  // ✅ Verificar que pertenece al curso
            ->update(['orden' => $index + 1]);
    }
}
```

---

#### 3. Portal Alumno - Completitud

##### [MODIFY] AlumnoApiController.php
**Cambios**:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use App\Models\DocenteCurso;
use App\Models\Unidad;
use App\Models\Anuncio;
use App\Models\NotaActividad;
use App\Models\ActividadCurso;
use App\Models\ActividadUsuario;
use Illuminate\Http\Request;

class AlumnoApiController extends Controller
{
    /**
     * Get course content for student.
     */
    public function contenido(Request $request, int $cursoId)
    {
        $unidades = Unidad::where('curso_id', $cursoId)
            ->with([
                'clases' => function ($q) {
                    $q->orderBy('orden')
                      ->with(['archivos', 'actividades.tipoActividad']);
                }
            ])
            ->orderBy('orden')
            ->get();

        return response()->json($unidades);
    }

    /**
     * Get announcements for student.
     */
    public function anuncios(Request $request, int $cursoId)
    {
        $estudiante = Estudiante::where('user_id', $request->user()->id)->firstOrFail();
        
        // Obtener anuncios de todas las secciones del curso donde está matriculado
        $anuncios = Anuncio::whereHas('docenteCurso', function($q) use ($cursoId, $estudiante) {
            $q->where('curso_id', $cursoId)
              ->whereHas('seccion.matriculas', function($q2) use ($estudiante) {
                  $q2->where('estu_id', $estudiante->estu_id)
                     ->where('estado', '1');
              });
        })
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($anuncios);
    }

    /**
     * Get student's grades for a course.
     */
    public function calificaciones(Request $request, int $cursoId)
    {
        $estudiante = Estudiante::where('user_id', $request->user()->id)->firstOrFail();
        
        // Obtener actividades del curso
        $actividades = ActividadCurso::whereHas('clase.unidad', function($q) use ($cursoId) {
            $q->where('curso_id', $cursoId);
        })
        ->where('es_calificado', '1')
        ->with('clase.unidad')
        ->get();
        
        // Obtener calificaciones del estudiante
        $calificaciones = [];
        $sumaNotas = 0;
        $cantidadNotas = 0;
        
        foreach ($actividades as $actividad) {
            $nota = NotaActividad::where('estu_id', $estudiante->estu_id)
                ->where('actividad_id', $actividad->actividad_id)
                ->first();
            
            $calificaciones[] = [
                'actividad' => $actividad->nombre_actividad,
                'unidad' => $actividad->clase->unidad->titulo,
                'nota' => $nota?->nota,
                'fecha' => $nota?->fecha_calificacion,
                'observacion' => $nota?->observacion,
                'puntos_maximos' => $actividad->puntos_maximos,
            ];
            
            if ($nota && is_numeric($nota->nota)) {
                $sumaNotas += floatval($nota->nota);
                $cantidadNotas++;
            }
        }
        
        $promedio = $cantidadNotas > 0 ? round($sumaNotas / $cantidadNotas, 2) : 0;
        
        return response()->json([
            'actividades' => $calificaciones,
            'promedio' => $promedio,
        ]);
    }

    /**
     * Get pending activities for student.
     */
    public function actividadesPendientes(Request $request, int $cursoId)
    {
        $estudiante = Estudiante::where('user_id', $request->user()->id)->firstOrFail();
        
        $actividades = ActividadCurso::whereHas('clase.unidad', function($q) use ($cursoId) {
            $q->where('curso_id', $cursoId);
        })
        ->where('estado', '1')
        ->where(function($q) {
            $q->whereNull('fecha_cierre')
              ->orWhere('fecha_cierre', '>=', now());
        })
        ->whereDoesntHave('entregas', function($q) use ($estudiante) {
            $q->where('estu_id', $estudiante->estu_id);
        })
        ->with(['clase.unidad', 'tipoActividad'])
        ->get();
        
        return response()->json($actividades);
    }
}
```

---

#### 4. Frontend - Ajustes de Integración

##### [MODIFY] Editor.tsx
**Cambios en las llamadas API**:
```typescript
// ❌ ANTES (rutas duplicadas):
// api.post('/docente/unidad', { docente_curso_id, titulo })
// api.post('/docente/clase', { unidad_id, titulo })
// api.post('/docente/actividad', { id_clase_curso, nombre_actividad, tipo_id })

// ✅ DESPUÉS (rutas consolidadas):
const addUnidad = () => {
    if (!nuevaUnidad) return;
    api.post('/contenido/unidades', { 
        curso_id: courseData.curso_id,  // ✅ Usar curso_id
        titulo: nuevaUnidad 
    })
    .then(() => {
        setNuevaUnidad('');
        setShowUnidadForm(false);
        loadContent();
    });
};

const addClase = (unidadId: number) => {
    const titulo = prompt('Título de la nueva sesión:');
    if (!titulo) return;
    api.post('/contenido/clases', { 
        unidad_id: unidadId, 
        titulo 
    })
    .then(() => loadContent());
};

const addActividad = (claseId: number, tipoId: number) => {
    const nombre = prompt(tipoId === 3 ? 'Nombre del Cuestionario/Examen:' : 'Nombre de la actividad/tarea:');
    if (!nombre) return;
    api.post('/actividades', { 
        id_clase_curso: claseId, 
        nombre_actividad: nombre, 
        id_tipo_actividad: tipoId 
    })
    .then(() => loadContent());
};
```

---

### ❓ PREGUNTAS ABIERTAS

#### 1. Contenido Compartido vs Exclusivo
**PREGUNTA**: ¿Desea que el material del curso (unidades/clases) sea estrictamente compartido entre todas las secciones de un mismo curso, o debe haber una opción para que un docente cree contenido exclusivo para su sección?

**OPCIÓN A (Actual)**: Contenido compartido por Curso
- ✅ Menos duplicación
- ✅ Colaboración entre docentes
- ✅ Actualizaciones centralizadas
- ❌ Menos flexibilidad individual

**OPCIÓN B**: Contenido por Sección
- ✅ Flexibilidad total por docente
- ✅ Personalización por sección
- ❌ Duplicación de contenido
- ❌ Difícil mantener consistencia

**RECOMENDACIÓN**: Mantener OPCIÓN A (compartido) con posibilidad de agregar "Contenido Adicional" por sección en el futuro.

---

### ✅ PLAN DE VERIFICACIÓN

#### Tests Automatizados
```bash
# 1. Verificar limpieza de rutas
php artisan route:list | grep docente

# 2. Verificar middlewares registrados
php artisan route:list --columns=uri,name,middleware | grep verify

# 3. Ejecutar tests unitarios (cuando se creen)
php artisan test --filter=DocenteCursoTest
php artisan test --filter=EstudianteCursoTest
```

#### Tests Manuales (Postman/Insomnia)

**Test 1: Middleware VerifyDocenteCurso**
```
1. Login como Docente A (tiene acceso a Curso 1)
2. GET /api/docente/curso/1/contenido
   ✅ Debe retornar 200 OK

3. GET /api/docente/curso/999/contenido (Curso que no tiene asignado)
   ✅ Debe retornar 403 Forbidden
```

**Test 2: Middleware VerifyEstudianteCurso**
```
1. Login como Estudiante A (matriculado en Curso 1)
2. GET /api/alumno/curso/1/contenido
   ✅ Debe retornar 200 OK

3. GET /api/alumno/curso/999/contenido (Curso donde no está matriculado)
   ✅ Debe retornar 403 Forbidden
```

**Test 3: Rutas Consolidadas**
```
1. POST /api/contenido/unidades
   Body: { "curso_id": 1, "titulo": "Unidad Test" }
   ✅ Debe crear unidad correctamente

2. POST /api/docente/unidad (ruta antigua)
   ✅ Debe retornar 404 Not Found (ruta eliminada)
```

---

### 📊 CHECKLIST DE IMPLEMENTACIÓN

#### Backend
- [ ] Crear `VerifyDocenteCurso.php` middleware
- [ ] Crear `VerifyEstudianteCurso.php` middleware
- [ ] Registrar middlewares en `Kernel.php`
- [ ] Actualizar `routes/api.php` (aplicar middlewares, eliminar duplicados)
- [ ] Eliminar métodos duplicados en `DocenteApiController.php`
- [ ] Agregar métodos faltantes en `DocenteApiController.php`
- [ ] Actualizar `CursoContenidoService.php` (verificar uso de curso_id)
- [ ] Crear/actualizar `AlumnoApiController.php`
- [ ] Ejecutar tests de verificación

#### Frontend
- [ ] Actualizar `Editor.tsx` (cambiar llamadas API)
- [ ] Probar creación de unidades
- [ ] Probar creación de clases
- [ ] Probar creación de actividades
- [ ] Verificar que no hay errores 404

#### Documentación
- [x] Actualizar `ESTADO_ACTUAL_SISTEMA_LMS.md`
- [ ] Crear guía de migración para desarrolladores
- [ ] Documentar nuevas rutas API

---

### 🎯 PRÓXIMOS PASOS DESPUÉS DE FASE 1

Una vez completada la Fase 1, continuar con:

1. **Fase 2**: Implementar Tabs completos (Anuncios, Calificaciones)
2. **Fase 3**: Portal Alumno completo
3. **Fase 4**: Funcionalidades avanzadas (notificaciones, exportaciones)

---

**Última actualización**: 2026-04-10  
**Próxima revisión**: Después de completar Fase 1  
**Estado**: 🟡 En Planificación
