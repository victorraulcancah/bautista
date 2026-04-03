# Estado de Migración de Módulos — Bautista La Pascana

> **Origen:** `bautistalapascana/` (PHP MVC legacy)
> **Destino:** `bautista/` (Laravel 13 + React 19)
> **Referencia legacy:** `bautistalapascana/bautistalapascana/modulos_y_tablas.md`
> **Fecha auditoría:** 2026-04-01

---

## Resumen ejecutivo

| Módulo | Estado | Avance |
|--------|--------|--------|
| 1. Autenticación, Seguridad y Auditoría | ⚠️ Casi completo | 8/9 |
| 2. Administración Académica             | ✅ Completo       | 8/8 |
| 3. Gestión Docente y Aulas Virtuales    | ✅ Completo       | 6/6 |
| 4. Aula Virtual: Tareas, Quizzes, Minijuegos | ✅ Completo  | 12/12 |
| 5. Sistema de Calificaciones (Libreta)  | ✅ Completo       | 6/6 |
| 6. Matrícula, Estudiantes y Apoderados  | ✅ Completo       | 11/11 |
| 7. Mensajería Interna                   | ✅ Completo       | 7/7 |
| 8. Tesorería y Pagos                    | ⚠️ Casi completo | 6/7 |
| **TOTAL**                               | **97% completo** | **64/66** |

---

## Módulo 1 — Autenticación, Seguridad y Auditoría

### ✅ Implementado

| Funcionalidad | Tabla/Modelo | Archivos clave |
|---|---|---|
| Login / Logout | `users` | `AuthApiController.php`, `auth/login.tsx` |
| Perfiles de usuario | `perfiles` | `Perfil.php`, `PerfilApiController.php` |
| Recuperación de contraseña | `password_reset_tokens` | `auth/forgot-password.tsx`, `auth/reset-password.tsx` |
| Historial de inicios de sesión | `login_histories` | `LoginHistory.php` |
| Autenticación de dos factores (2FA) | columnas en `users` | `auth/two-factor-challenge.tsx` |
| Actualización de contraseña (self) | — | `PerfilApiController::updatePassword` |
| Reset de credenciales (admin) | — | `UsuarioApiController::resetCredenciales` |
| Activar/bloquear usuario | `users.estado` | `UsuarioApiController::toggleEstado` |

### ❌ Faltante

| Funcionalidad | Tabla legacy | Descripción | Prioridad |
|---|---|---|---|
| **Registro de actividad de usuario** | `historial_usuario` | Log de acciones importantes: creación, edición, eliminación de entidades. El `login_histories` actual solo registra sesiones, no acciones dentro del sistema. | Media |

---

## Módulo 2 — Administración Académica

### ✅ Completo — nada faltante

| Funcionalidad | Tabla | Archivos clave |
|---|---|---|
| Niveles educativos | `niveles_educativos` | `NivelEducativo.php`, `NivelEducativoApiController.php`, `pages/Niveles/` |
| Grados | `grados` | `Grado.php`, `GradoApiController.php`, `pages/Grados/` |
| Secciones | `secciones` | `Seccion.php`, `SeccionApiController.php`, `pages/Secciones/` |
| Cursos | `cursos` | `Curso.php`, `CursoApiController.php`, `pages/Cursos/` |
| Relación grados-cursos | `grados_cursos` | migración `2026_04_01_110200` |
| Institución educativa | `institucion_educativa` | `InstitucionEducativa.php`, `InstitucionApiController.php`, `pages/Institucion/` |
| Noticias e institución blog | `institucion_noticias`, `institucion_blog` | `NoticiaApiController.php`, `BlogApiController.php`, `pages/Institucion/Noticias/`, `pages/Blog/` |
| Galería institucional | `institucion_galeria` | `InstitucionGaleria.php`, `GaleriaApiController.php`, `pages/Institucion/Galeria/` |

---

## Módulo 3 — Gestión Docente y Aulas Virtuales

### ✅ Completo — nada faltante

| Funcionalidad | Tabla | Archivos clave |
|---|---|---|
| Docentes | `docentes` | `Docente.php`, `DocenteApiController.php`, `pages/GestionDocentes/` |
| Asignación docente-curso | `curso_docente` | `DocenteCurso.php`, `DocenteCursoApiController.php` |
| Horario docente | `docente_horario` | `DocenteHorario.php`, `DocenteHorarioApiController.php` |
| Horarios de asistencia | `horarios_asistencia` | `HorarioAsistencia.php`, `HorarioAsistenciaApiController.php` |
| Unidades del sílabo | `unidades` | `Unidad.php`, migración `2026_03_25_200001` |
| Portal docente (frontend) | — | `PortalDocente/Dashboard.tsx`, `PortalDocente/MisCursos.tsx`, `PortalDocente/Contenido/Editor.tsx`, `PortalDocente/Asistencia/PasarLista.tsx` |

---

## Módulo 4 — Aula Virtual: Tareas, Quizzes y Minijuegos

### ✅ Completo — nada faltante

| Funcionalidad | Tabla | Archivos clave |
|---|---|---|
| Actividades / Tareas | `actividad_curso` | `ActividadCurso.php`, `ActividadApiController.php` |
| Rompecabezas (imágenes) | `imagen_rompecabeza` | migración `2026_04_01_120000` |
| Intentos de rompecabezas | `alumno_rompecabeza` | migración `2026_04_01_120000` |
| Cuestionarios (config) | `cuestionario` | `Cuestionario.php` |
| Preguntas | `pregunta_cuestionario` | `PreguntaCuestionario.php` |
| Alternativas | `alternativas_pregunta` | `AlternativaPregunta.php` |
| Control de intentos de examen | `examen_iniciado` | `ExamenIniciado.php`, `ExamenResolucionApiController.php` |
| Respuestas del alumno | `pregunta_resp` | `PreguntaRespuesta.php` |
| Respuestas escritas | `respuesta_escrita` | migración `2026_04_01_100300` |
| Entrega de actividades (alumno) | — | `AlumnoApiController::entregarActividad` |
| Puzzles (frontend) | — | `PortalAlumno/Puzzles/index.tsx`, `PortalAlumno/Puzzles/Ver.tsx` |
| Dibujo (frontend) | — | `PortalAlumno/Dibujo.tsx` |

---

## Módulo 5 — Sistema de Calificaciones (Libreta Virtual)

### ✅ Completo — nada faltante

| Funcionalidad | Tabla | Archivos clave |
|---|---|---|
| Config de calificación | `nota_actividad` | `NotaActividad.php` |
| Nota por estudiante | `nota_actividad_estudiante` | migración `2026_03_27_234000`, `CalificacionApiController.php` |
| Promedios por unidad | `nota_unidad` | `NotaUnidad.php` |
| Nota final del curso | `notas_estudiante` | `NotaEstudiante.php` |
| Calificación por docente | — | `CalificacionApiController::calificar` |
| Libreta del alumno (frontend) | — | `PortalAlumno/Notas/index.tsx`, `Notas/index.tsx` |

---

## Módulo 6 — Matrícula, Estudiantes y Apoderados

### ✅ Completo — nada faltante

| Funcionalidad | Tabla | Archivos clave |
|---|---|---|
| Estudiantes | `estudiantes` | `Estudiante.php`, `EstudianteApiController.php`, `pages/GestionAlumnos/` |
| Contacto de emergencia | `estudiante_contacto` | migración `2026_03_26_062803` |
| Padre / Apoderado | `padre_apoderado` | `PadreApoderado.php`, `PadreApiController.php` |
| Aperturas de matrícula | `matricula_aperturas` | `MatriculaApertura.php`, `MatriculaApiController.php` |
| Registros de matrícula | `matriculas` | `Matricula.php` |
| Matrícula por padres | `matricula_padres`, `grupo_matricula_padres` | `MatriculaPadresController.php`, migración `2026_04_01_100200` |
| Hijos matriculados | `hijos_matriculados` | migración `2026_04_01_100200` |
| Gestión matrícula (admin, frontend) | — | `Matricula/index.tsx`, `Matricula/Gestion.tsx`, `Matricula/NivelEstudiantes.tsx` |
| Asistente de matrícula (padre, frontend) | — | `PortalPadre/MatriculaWizard.tsx` |
| Dashboard padre (frontend) | — | `Padre/Dashboard.tsx`, `Padre/HijoDetalle.tsx` |

---

## Módulo 7 — Mensajería Interna

### ✅ Completo — nada faltante

| Funcionalidad | Tabla | Archivos clave |
|---|---|---|
| Grupos de mensajería | `mensajeria_grupos` | `MensajeriaGrupo.php`, `MensajeriaGrupoApiController.php` |
| Miembros del grupo | `mensajeria_grupo_miembros` | migración `2026_03_26_060131` |
| Mensajes | `mensajes` | `Mensaje.php`, `MensajeApiController.php` |
| Respuestas | `mensajes_respuestas` | `MensajeRespuesta.php` |
| Estado de lectura | campo `leido` en `mensajes` | — |
| Mensajería (frontend docente/admin) | — | `Comunicados/index.tsx`, `Comunicados/components/` |
| Mensajes privados (frontend) | — | `MensajesPrivados/index.tsx`, `MensajesPrivados/Ver.tsx` |

---

## Módulo 8 — Tesorería y Pagos

### ✅ Implementado

| Funcionalidad | Tabla | Archivos clave |
|---|---|---|
| Pagos generales | `pagos` | `Pago.php`, `PagoApiController.php`, `pages/Pagos/` |
| Pagos de matrícula | `pagos_matricula` | migración `2026_04_01_100100` |
| Pagos extras | `pagos_extras` | migración `2026_04_01_100100` |
| Fechas de pago | `fechas_pagos` | migración `2026_04_01_100100` |
| Reporte PDF | — | `PagoApiController::reportePdf` |

### ❌ Faltante

| Funcionalidad | Tabla legacy | Descripción | Prioridad |
|---|---|---|---|
| **Vouchers / comprobantes de pago** | `pagos_notifica` | Los padres suben un comprobante/voucher de pago para que tesorería lo valide manualmente. Necesita: tabla con archivo adjunto, estado (pendiente / validado / rechazado), fecha, comentario. | Alta |

---

## Inventario técnico actual

| Elemento | Cantidad |
|---|---|
| Modelos Eloquent | 41 |
| Controladores API | 33 |
| Migraciones | 44 |
| Páginas React (.tsx) | 89 |
| Grupos de rutas API | 27 |

---

## Pendientes de implementar

### ❌ P1 — Vouchers / Notificaciones de Pago (`pagos_notifica`)

**Qué implementar:**

1. **Migración** — nueva tabla `pagos_notifica`:
   ```
   id, pago_id (FK pagos), user_id (FK users),
   archivo (ruta del comprobante),
   estado ENUM('pendiente','validado','rechazado'),
   comentario, created_at, updated_at
   ```

2. **Modelo** — `app/Models/PagoNotifica.php`

3. **Endpoint API** — en `PagoApiController`:
   - `POST /api/pagos/{id}/voucher` — padre sube comprobante
   - `PATCH /api/pagos/notifica/{id}/estado` — admin valida/rechaza

4. **Frontend** — componente en `pages/Pagos/components/VoucherModal.tsx` y vista para el padre en `PortalPadre/`

---

### ❌ P2 — Log de Actividad de Usuario (Media prioridad)

**Qué implementar:**

1. **Migración** — nueva tabla `actividad_usuario`:
   ```
   id, user_id (FK users), accion VARCHAR,
   entidad VARCHAR, entidad_id INT,
   descripcion TEXT, ip VARCHAR,
   created_at
   ```

2. **Modelo** — `app/Models/ActividadUsuario.php`

3. **Uso** — registrar en los servicios clave: creación/edición de estudiantes, docentes, notas, pagos

4. **Endpoint** — `GET /api/usuarios/{id}/actividad` (ya existe `/historial` para login, ampliar o crear nuevo)

---

## Tablas legacy descartadas (no migrar)

Las siguientes tablas del sistema legacy corresponden a un módulo ERP/facturación que no forma parte del sistema educativo. Se recomienda confirmar con el área administrativa antes de descartar definitivamente:

| Tabla legacy | Descripción | Decisión |
|---|---|---|
| `ventas_sunat` | Facturación electrónica SUNAT | ⏸️ Pendiente confirmar |
| `notas_electronicas_sunat` | Notas de crédito/débito SUNAT | ⏸️ Pendiente confirmar |
| `guia_remision` | Guías de remisión | ⏸️ Pendiente confirmar |
| `proveedores` | Proveedores | ⏸️ Pendiente confirmar |
| `productos` | Productos/inventario | ⏸️ Pendiente confirmar |
| `compras` | Registro de compras | ⏸️ Pendiente confirmar |
