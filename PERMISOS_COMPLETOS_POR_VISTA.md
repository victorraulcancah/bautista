# Sistema Completo de Permisos por Vista y Acción

## 📋 Inventario Completo de Vistas y Permisos

Este documento lista TODAS las vistas del sistema con sus acciones específicas y permisos requeridos.

---

## 🏠 DASHBOARD

### Vista: `/dashboard`
**Componente:** `Dashboard/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver dashboard admin | `dashboard.ver` | Dashboard completo del administrador |
| Ver resumen académico | `dashboard.resumen.academico` | Dashboard de estudiante |
| Ver cursos asignados | `dashboard.cursos.asignados` | Dashboard de docente |
| Ver resumen familiar | `dashboard.resumen.familiar` | Dashboard de padre/apoderado |

**API Endpoint:** `GET /api/dashboard/stats`

---

## 🏫 INSTITUCIÓN

### Vista: `/institucion`
**Componente:** `Institucion/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver datos institución | `institucion.ver` | Ver información de la institución |
| Editar institución | `institucion.editar` | Modificar datos institucionales |

**API Endpoints:**
- `GET /api/instituciones`
- `PUT /api/instituciones/{id}`

### Vista: `/institucion/galeria`
**Componente:** `Institucion/Galeria/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver galería | `institucion.ver` | Ver fotos de la galería |
| Subir fotos | `galeria.crear` | Agregar nuevas fotos |
| Eliminar fotos | `galeria.eliminar` | Borrar fotos existentes |

**API Endpoints:**
- `GET /api/galeria`
- `POST /api/galeria`
- `DELETE /api/galeria/{id}`


### Vista: `/institucion/noticias`
**Componente:** `Institucion/Noticias/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver noticias | `institucion.ver` | Listar noticias |
| Crear noticia | `noticias.crear` | Publicar nueva noticia |
| Editar noticia | `noticias.editar` | Modificar noticia existente |
| Eliminar noticia | `noticias.eliminar` | Borrar noticia |
| Ver portada | `institucion.ver` | Vista pública de noticias |
| Comentar | `institucion.ver` | Agregar comentarios |

**API Endpoints:**
- `GET /api/noticias`
- `POST /api/noticias`
- `PUT /api/noticias/{id}`
- `DELETE /api/noticias/{id}`
- `POST /api/institucion/noticias/{id}/comentarios`

---

## 📢 COMUNICADOS

### Vista: `/comunicados`
**Componente:** `Comunicados/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver comunicados | `comunicados.ver` | Listar comunicados |
| Crear comunicado | `comunicados.crear` | Publicar nuevo comunicado |
| Editar comunicado | `comunicados.editar` | Modificar comunicado |
| Eliminar comunicado | `comunicados.eliminar` | Borrar comunicado |

---

## 💰 PAGOS

### Vista: `/pagos`
**Componente:** `Pagos/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver pagos | `pagos.ver` | Listar todos los pagos |
| Crear pago | `pagos.crear` | Registrar nuevo pago |
| Editar pago | `pagos.editar` | Modificar pago existente |
| Eliminar pago | `pagos.eliminar` | Anular pago |
| Ver pagadores | `pagos.ver` | Ver lista de pagadores |
| Subir voucher | `pagos.voucher.subir` | Adjuntar comprobante |
| Validar voucher | `pagos.voucher.validar` | Aprobar/rechazar voucher |
| Exportar reporte | `pagos.exportar` | Generar PDF de pagos |

**API Endpoints:**
- `GET /api/pagos/pagadores`
- `GET /api/pagos/contactos/{contactoId}`
- `POST /api/pagos`
- `PUT /api/pagos/{id}`
- `DELETE /api/pagos/{id}`
- `POST /api/pagos/{pagId}/vouchers`
- `PATCH /api/pagos/vouchers/{notificaId}/estado`
- `GET /api/pagos/reporte-pdf`

---

## 🎓 ACADÉMICA

### Vista: `/niveles`
**Componente:** `Niveles/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver niveles | `niveles.ver` | Listar niveles educativos |
| Crear nivel | `niveles.crear` | Agregar nuevo nivel |
| Editar nivel | `niveles.editar` | Modificar nivel existente |
| Eliminar nivel | `niveles.eliminar` | Borrar nivel |

**API Endpoints:**
- `GET /api/niveles`
- `POST /api/niveles`
- `PUT /api/niveles/{id}`
- `DELETE /api/niveles/{id}`

### Vista: `/grados`
**Componente:** `Grados/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver grados | `cursos.ver` | Listar grados |
| Crear grado | `grados.crear` | Agregar nuevo grado |
| Editar grado | `grados.editar` | Modificar grado |
| Eliminar grado | `grados.eliminar` | Borrar grado |

**API Endpoints:**
- `GET /api/grados`
- `POST /api/grados`
- `PUT /api/grados/{id}`
- `DELETE /api/grados/{id}`

### Vista: `/secciones`
**Componente:** `Secciones/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver secciones | `secciones.ver` | Listar secciones |
| Crear sección | `secciones.crear` | Agregar nueva sección |
| Editar sección | `secciones.editar` | Modificar sección |
| Eliminar sección | `secciones.eliminar` | Borrar sección |
| Ver horarios | `secciones.ver` | Ver horarios de sección |
| Gestionar horarios | `secciones.horarios.editar` | Crear/editar horarios |

**API Endpoints:**
- `GET /api/secciones`
- `POST /api/secciones`
- `PUT /api/secciones/{id}`
- `DELETE /api/secciones/{id}`
- `GET /api/secciones/{seccionId}/horarios`
- `POST /api/secciones/{seccionId}/horarios`
- `DELETE /api/secciones/horarios/{id}`

### Vista: `/cursos`
**Componente:** `Cursos/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver cursos | `cursos.ver` | Listar cursos |
| Crear curso | `cursos.crear` | Agregar nuevo curso |
| Editar curso | `cursos.editar` | Modificar curso |
| Eliminar curso | `cursos.eliminar` | Borrar curso |
| Asignar a grado | `cursos.asignar` | Vincular curso con grado |

**API Endpoints:**
- `GET /api/cursos`
- `POST /api/cursos`
- `PUT /api/cursos/{id}`
- `DELETE /api/cursos/{id}`
- `GET /api/grados/{gradoId}/cursos`
- `POST /api/grados/{gradoId}/cursos`
- `DELETE /api/grados/{gradoId}/cursos/{gracId}`

### Vista: `/cursos/{id}/contenido`
**Componente:** `CursoContenido/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver contenido | `cursos.ver` | Ver unidades y clases |
| Crear unidad | `contenido.crear` | Agregar nueva unidad |
| Editar unidad | `contenido.editar` | Modificar unidad |
| Eliminar unidad | `contenido.eliminar` | Borrar unidad |
| Reordenar unidades | `contenido.editar` | Cambiar orden de unidades |
| Crear clase | `contenido.crear` | Agregar nueva clase |
| Editar clase | `contenido.editar` | Modificar clase |
| Eliminar clase | `contenido.eliminar` | Borrar clase |
| Reordenar clases | `contenido.editar` | Cambiar orden de clases |
| Subir archivos | `contenido.archivos.subir` | Adjuntar archivos a clase |
| Eliminar archivos | `contenido.archivos.eliminar` | Borrar archivos |

**API Endpoints:**
- `GET /api/contenido/cursos/{cursoId}`
- `POST /api/contenido/unidades`
- `PUT /api/contenido/unidades/{id}`
- `DELETE /api/contenido/unidades/{id}`
- `POST /api/contenido/cursos/{cursoId}/reordenar-unidades`
- `POST /api/contenido/clases`
- `PUT /api/contenido/clases/{id}`
- `DELETE /api/contenido/clases/{id}`
- `POST /api/contenido/unidades/{unidadId}/reordenar-clases`
- `POST /api/contenido/clases/{claseId}/archivos`
- `DELETE /api/contenido/archivos/{archivoId}`

---

## 👥 GESTIÓN DE PERSONAS

### Vista: `/estudiantes`
**Componente:** `GestionAlumnos/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver estudiantes | `estudiantes.ver` | Listar estudiantes |
| Crear estudiante | `estudiantes.crear` | Registrar nuevo estudiante |
| Editar estudiante | `estudiantes.editar` | Modificar datos de estudiante |
| Eliminar estudiante | `estudiantes.eliminar` | Dar de baja estudiante |
| Ver contactos | `estudiantes.ver` | Ver padres/apoderados |
| Gestionar contactos | `estudiantes.contactos.editar` | Agregar/editar contactos |
| Generar fotocheck | `estudiantes.fotocheck` | Crear fotocheck individual |
| Generar fotochecks masivos | `estudiantes.fotocheck` | Crear fotochecks por nivel |

**API Endpoints:**
- `GET /api/estudiantes`
- `POST /api/estudiantes`
- `PUT /api/estudiantes/{id}`
- `DELETE /api/estudiantes/{id}`
- `GET /api/estudiantes/{id}/contactos`
- `POST /api/estudiantes/{id}/contactos`
- `GET /estudiantes/{id}/fotocheck`
- `GET /matriculas/aperturas/{aperturaId}/niveles/{nivelId}/fotochecks`

### Vista: `/docentes`
**Componente:** `GestionDocentes/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver docentes | `docentes.ver` | Listar docentes |
| Crear docente | `docentes.crear` | Registrar nuevo docente |
| Editar docente | `docentes.editar` | Modificar datos de docente |
| Eliminar docente | `docentes.eliminar` | Dar de baja docente |
| Ver cursos asignados | `docentes.ver` | Ver cursos del docente |
| Asignar cursos | `docentes.cursos.asignar` | Vincular docente con cursos |
| Desasignar cursos | `docentes.cursos.desasignar` | Desvincular cursos |
| Ver horario | `docentes.ver` | Ver horario del docente |
| Gestionar horario | `docentes.horarios.editar` | Crear/editar horarios |

**API Endpoints:**
- `GET /api/docentes`
- `POST /api/docentes`
- `PUT /api/docentes/{id}`
- `DELETE /api/docentes/{id}`
- `GET /api/docentes/{docenteId}/cursos`
- `POST /api/docentes/{docenteId}/cursos`
- `DELETE /api/docentes/{docenteId}/cursos/{id}`
- `GET /api/docentes/{docenteId}/horario`
- `GET /api/docentes/{docenteId}/horarios`
- `POST /api/docentes/{docenteId}/horarios`
- `DELETE /api/docentes/horarios/{id}`

---

## 📝 MATRÍCULA

### Vista: `/matriculas`
**Componente:** `Matricula/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver aperturas | `matriculas.ver` | Listar periodos de matrícula |
| Crear apertura | `matriculas.crear` | Abrir nuevo periodo |
| Editar apertura | `matriculas.editar` | Modificar periodo |
| Eliminar apertura | `matriculas.eliminar` | Cerrar periodo |

**API Endpoints:**
- `GET /api/matriculas/aperturas`
- `POST /api/matriculas/aperturas`
- `PUT /api/matriculas/aperturas/{id}`
- `DELETE /api/matriculas/aperturas/{id}`

### Vista: `/matriculas/gestion`
**Componente:** `Matricula/Gestion.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver matrículas | `matriculas.ver` | Listar estudiantes matriculados |
| Matricular estudiante | `matriculas.crear` | Registrar matrícula |
| Anular matrícula | `matriculas.eliminar` | Dar de baja matrícula |
| Ver por nivel | `matriculas.ver` | Filtrar por nivel educativo |
| Ver disponibles | `matriculas.ver` | Ver estudiantes sin matricular |

**API Endpoints:**
- `GET /api/matriculas/aperturas/{aperturaId}/estudiantes`
- `GET /api/matriculas/aperturas/{aperturaId}/por-nivel`
- `GET /api/matriculas/aperturas/{aperturaId}/disponibles`
- `POST /api/matriculas`
- `DELETE /api/matriculas/{id}`

---

## 📅 ASISTENCIA

### Vista: `/asistencia`
**Componente:** `Asistencia/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver asistencia | `asistencia.ver` | Ver registros de asistencia |
| Ver historial | `asistencia.ver` | Ver historial completo |
| Exportar datos | `asistencia.exportar` | Generar reporte Excel/PDF |
| Exportar todo | `asistencia.exportar` | Exportar todos los registros |

**API Endpoints:**
- `GET /api/asistencia/usuarios`
- `GET /api/asistencia/usuario/{id}`
- `GET /api/asistencia/historial`
- `GET /api/asistencia/usuario/{id}/export`
- `GET /api/asistencia/export-all`

### Vista: `/asistencia/scanner`
**Componente:** `Asistencia/Scanner.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Escanear QR | `asistencia.escanear` | Marcar asistencia con QR |
| Marcar asistencia | `asistencia.marcar` | Registrar asistencia manual |

**API Endpoints:**
- `POST /api/asistencia/marcar-qr`

---

## 📚 BIBLIOTECA

### Vista: `/biblioteca`
**Componente:** `Medios/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver biblioteca | `biblioteca.ver` | Ver archivos y carpetas |
| Crear carpeta | `biblioteca.crear` | Crear nueva carpeta |
| Editar carpeta | `biblioteca.editar` | Renombrar carpeta |
| Subir archivo | `biblioteca.subir` | Cargar archivos |
| Eliminar | `biblioteca.eliminar` | Borrar archivos/carpetas |
| Ver breadcrumb | `biblioteca.ver` | Ver ruta de navegación |

**API Endpoints:**
- `GET /api/medios`
- `GET /api/medios/{id}/breadcrumb`
- `POST /api/medios/carpeta`
- `PUT /api/medios/carpeta/{id}`
- `POST /api/medios/upload`
- `DELETE /api/medios/{id}`

---

## 💬 MENSAJERÍA

### Vista: `/mensajeria`
**Componente:** `MensajesPrivados/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver mensajes | `mensajeria.ver` | Listar mensajes recibidos/enviados |
| Enviar mensaje | `mensajeria.enviar` | Crear nuevo mensaje |
| Ver no leídos | `mensajeria.ver` | Ver mensajes sin leer |
| Buscar contactos | `mensajeria.ver` | Buscar usuarios |

**API Endpoints:**
- `GET /api/mensajes`
- `POST /api/mensajes`
- `GET /api/mensajes/no-leidos`
- `GET /api/usuarios/buscar`

### Vista: `/mensajeria/ver/{id}`
**Componente:** `MensajesPrivados/Ver.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver mensaje | `mensajeria.ver` | Ver detalle del mensaje |
| Responder | `mensajeria.enviar` | Responder mensaje |

**API Endpoints:**
- `GET /api/mensajes/{id}`
- `POST /api/mensajes/{id}/responder`

### Grupos de Mensajería

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver grupos | `mensajeria.grupos.ver` | Listar grupos de mensajería |
| Crear grupo | `mensajeria.grupos.crear` | Crear nuevo grupo |
| Ver cursos | `mensajeria.grupos.ver` | Ver cursos para mensajería |
| Ver alumnos por curso | `mensajeria.grupos.ver` | Listar alumnos de un curso |
| Ver grados | `mensajeria.grupos.ver` | Ver grados para mensajería |
| Ver alumnos por grado | `mensajeria.grupos.ver` | Listar alumnos de un grado |
| Ver aulas | `mensajeria.grupos.ver` | Ver aulas para mensajería |
| Ver alumnos por aula | `mensajeria.grupos.ver` | Listar alumnos de un aula |

**API Endpoints:**
- `GET /api/mensajeria/grupos`
- `POST /api/mensajeria/grupos`
- `GET /api/mensajeria/cursos`
- `GET /api/mensajeria/cursos/{id}/alumnos`
- `GET /api/mensajeria/grados`
- `GET /api/mensajeria/grados/{id}/alumnos`
- `GET /api/mensajeria/aulas`
- `GET /api/mensajeria/aulas/{id}/alumnos`

---

## 👤 USUARIOS Y SEGURIDAD

### Vista: `/usuarios`
**Componente:** `Usuarios/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver usuarios | `usuarios.ver` | Listar usuarios del sistema |
| Crear usuario | `usuarios.crear` | Registrar nuevo usuario |
| Editar usuario | `usuarios.editar` | Modificar datos de usuario |
| Cambiar estado | `usuarios.estado` | Activar/desactivar usuario |
| Ver historial | `usuarios.historial` | Ver log de cambios |
| Ver actividad | `usuarios.actividad` | Ver actividad del usuario |
| Resetear credenciales | `usuarios.resetear` | Cambiar contraseña |

**API Endpoints:**
- `GET /api/usuarios`
- `POST /api/usuarios`
- `PUT /api/usuarios/{id}`
- `PATCH /api/usuarios/{id}/estado`
- `GET /api/usuarios/{id}/historial`
- `GET /api/usuarios/{id}/actividad`
- `PATCH /api/usuarios/{id}/credenciales`

### Vista: `/roles-permisos`
**Componente:** `Seguridad/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver roles | `roles.ver` | Listar roles del sistema |
| Crear rol | `roles.crear` | Crear nuevo rol |
| Editar rol | `roles.editar` | Modificar rol existente |
| Eliminar rol | `roles.eliminar` | Borrar rol |
| Ver permisos | `roles.ver` | Listar todos los permisos |
| Asignar permisos | `roles.editar` | Vincular permisos a rol |

**API Endpoints:**
- `GET /api/seguridad/roles`
- `POST /api/seguridad/roles`
- `PUT /api/seguridad/roles/{id}`
- `DELETE /api/seguridad/roles/{id}`
- `GET /api/seguridad/permisos`

---

## 🎯 ACTIVIDADES Y EXÁMENES

### Vista: `/examenes`
**Componente:** `Examenes/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver exámenes | `dashboard.resumen.academico` | Listar exámenes disponibles |
| Resolver examen | `dashboard.resumen.academico` | Tomar examen |

**API Endpoints:**
- `GET /api/actividades`
- `POST /api/examenes/comenzar`
- `POST /api/examenes/{id}/responder`
- `POST /api/examenes/{id}/finalizar`

### Gestión de Actividades (Admin/Docente)

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver actividades | `actividades.ver` | Listar actividades |
| Crear actividad | `actividades.crear` | Crear nueva actividad |
| Editar actividad | `actividades.editar` | Modificar actividad |
| Eliminar actividad | `actividades.eliminar` | Borrar actividad |
| Ver tipos | `actividades.ver` | Ver tipos de actividades |
| Ver cuestionario | `actividades.ver` | Ver preguntas del examen |
| Editar cuestionario | `actividades.editar` | Modificar preguntas |
| Ver notas | `actividades.notas.ver` | Ver calificaciones |
| Calificar | `actividades.calificar` | Asignar notas |

**API Endpoints:**
- `GET /api/actividades`
- `POST /api/actividades`
- `PUT /api/actividades/{id}`
- `DELETE /api/actividades/{id}`
- `GET /api/actividades/tipos`
- `GET /api/actividades/{id}/cuestionario`
- `PUT /api/actividades/{id}/cuestionario`
- `GET /api/actividades/{id}/notas`
- `POST /api/actividades/{id}/calificar`

---

## 📊 HORARIOS Y NOTAS

### Vista: `/horarios`
**Componente:** `Horarios/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver horarios | `dashboard.resumen.academico` | Ver horario personal |

### Vista: `/notas`
**Componente:** `Notas/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver notas | `dashboard.resumen.academico` | Ver calificaciones propias |

---

## 🎓 PORTAL ALUMNO

### Vista: `/alumno/cursos`
**Componente:** Redirige a `/cursos`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver mis cursos | `dashboard.resumen.academico` | Ver cursos matriculados |

### Vista: `/alumno/cursos/{id}`
**Componente:** `PortalAlumno/Cursos/Detalle.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver detalle curso | `dashboard.resumen.academico` | Ver contenido del curso |

**API Endpoints:**
- `GET /api/alumno/cursos`
- `GET /api/alumno/curso/{id}`

### Vista: `/alumno/clase/{id}`
**Componente:** `PortalAlumno/Clases/Ver.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver clase | `dashboard.resumen.academico` | Ver contenido de la clase |

**API Endpoints:**
- `GET /api/alumno/clase/{id}`

### Vista: `/alumno/notas`
**Componente:** `PortalAlumno/Notas/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver notas | `dashboard.resumen.academico` | Ver calificaciones |

### Vista: `/alumno/asistencia`
**Componente:** `PortalAlumno/Asistencia.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver asistencia | `portal.alumno.asistencia` | Ver registro de asistencia |

**API Endpoints:**
- `GET /api/alumno/asistencia`

### Vista: `/alumno/qr`
**Componente:** `PortalAlumno/QR.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver QR | `portal.alumno.qr` | Ver código QR personal |

### Vista: `/alumno/profesores`
**Componente:** `PortalAlumno/Profesores.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver profesores | `dashboard.resumen.academico` | Ver lista de docentes |

**API Endpoints:**
- `GET /api/alumno/profesores`

### Vista: `/alumno/puzzles`
**Componente:** `Actividades/Puzzles/index.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver puzzles | `dashboard.resumen.academico` | Ver rompecabezas disponibles |
| Jugar puzzle | `dashboard.resumen.academico` | Resolver rompecabezas |

### Actividades del Alumno

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Entregar actividad | `dashboard.resumen.academico` | Subir tarea |
| Guardar dibujo | `dashboard.resumen.academico` | Guardar actividad de dibujo |

**API Endpoints:**
- `POST /api/alumno/actividad/{id}/entregar`
- `POST /api/alumno/dibujo/guardar`

---

## 👨‍🏫 PORTAL DOCENTE

### Vista: `/docente/mis-cursos`
**Componente:** Redirige a `/cursos`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver mis cursos | `dashboard.cursos.asignados` | Ver cursos asignados |

**API Endpoints:**
- `GET /api/docente/mis-cursos`

### Vista: `/docente/mis-alumnos`
**Componente:** `PortalDocente/MisAlumnos.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver mis alumnos | `portal.docente.alumnos` | Ver estudiantes de mis cursos |

**API Endpoints:**
- `GET /api/docente/mis-alumnos`

### Vista: `/docente/cursos/{id}/contenido`
**Componente:** `PortalDocente/Contenido/Editor.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Gestionar contenido | `dashboard.cursos.asignados` | Crear/editar unidades y clases |
| Crear unidad | `dashboard.cursos.asignados` | Agregar unidad |
| Crear clase | `dashboard.cursos.asignados` | Agregar clase |
| Crear actividad | `dashboard.cursos.asignados` | Agregar actividad |

**API Endpoints:**
- `POST /api/docente/unidad`
- `POST /api/docente/clase`
- `POST /api/docente/actividad`

### Vista: `/docente/cursos/{id}/asistencia`
**Componente:** `PortalDocente/Asistencia/PasarLista.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Pasar lista | `dashboard.cursos.asignados` | Marcar asistencia de alumnos |
| Iniciar asistencia | `dashboard.cursos.asignados` | Crear sesión de asistencia |
| Marcar asistencia | `dashboard.cursos.asignados` | Registrar asistencia individual |

**API Endpoints:**
- `GET /api/docente/curso/{id}/alumnos`
- `POST /api/docente/asistencia/iniciar`
- `POST /api/docente/asistencia/{id}/marcar`

### Vista: `/docente/cursos/{id}/cuestionario/{actividadId}`
**Componente:** `PortalDocente/Contenido/QuizBuilder.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Crear cuestionario | `dashboard.cursos.asignados` | Diseñar examen |
| Editar cuestionario | `dashboard.cursos.asignados` | Modificar preguntas |

---

## 👨‍👩‍👧 PORTAL PADRE

### Vista: `/padre/matricula`
**Componente:** `Matricula/Padre/MatriculaWizard.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver wizard matrícula | `dashboard.resumen.familiar` | Proceso de matrícula |
| Ver status | `dashboard.resumen.familiar` | Ver estado de matrícula |
| Guardar datos padres | `dashboard.resumen.familiar` | Registrar datos de padres |
| Guardar datos hijos | `dashboard.resumen.familiar` | Registrar datos de hijos |
| Actualizar paso | `dashboard.resumen.familiar` | Avanzar en el wizard |

**API Endpoints:**
- `GET /api/padre/matricula/status`
- `POST /api/padre/matricula/step`
- `POST /api/padre/matricula/save-padres`
- `POST /api/padre/matricula/save-hijos`

### Vista: `/padre/hijo/{id}`
**Componente:** `Matricula/Padre/HijoDetalle.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver detalle hijo | `dashboard.resumen.familiar` | Ver información del hijo |
| Ver resumen | `dashboard.resumen.familiar` | Ver resumen académico |

**API Endpoints:**
- `GET /api/padre/hijos`
- `GET /api/padre/hijo/{id}/resumen`

---

## ⚙️ CONFIGURACIÓN

### Vista: `/settings/profile`
**Componente:** `settings/profile.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver perfil | Todos | Ver datos personales |
| Editar perfil | Todos | Modificar datos personales |
| Cambiar foto | Todos | Actualizar foto de perfil |

**API Endpoints:**
- `PATCH /api/me/perfil`
- `POST /api/me/foto`

### Vista: `/settings/security`
**Componente:** `settings/security.tsx`

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver seguridad | Todos | Ver opciones de seguridad |
| Cambiar contraseña | Todos | Actualizar contraseña |

**API Endpoints:**
- `PUT /api/me/password`

---

## 🔍 SERVICIOS EXTERNOS

### RENIEC (Consulta DNI)

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Consultar DNI | `estudiantes.crear` o `docentes.crear` | Buscar datos por DNI |

**API Endpoints:**
- `GET /api/reniec/dni/{dni}`

---

## 📋 RESUMEN DE PERMISOS POR MÓDULO

### Permisos de Dashboard
- `dashboard.ver` - Dashboard administrador
- `dashboard.resumen.academico` - Dashboard estudiante
- `dashboard.cursos.asignados` - Dashboard docente
- `dashboard.resumen.familiar` - Dashboard padre/apoderado

### Permisos de Institución
- `institucion.ver` - Ver datos institución
- `institucion.editar` - Editar institución
- `galeria.crear` - Subir fotos
- `galeria.eliminar` - Eliminar fotos
- `noticias.crear` - Publicar noticias
- `noticias.editar` - Editar noticias
- `noticias.eliminar` - Eliminar noticias

### Permisos de Comunicados
- `comunicados.ver` - Ver comunicados
- `comunicados.crear` - Crear comunicados
- `comunicados.editar` - Editar comunicados
- `comunicados.eliminar` - Eliminar comunicados

### Permisos de Pagos
- `pagos.ver` - Ver pagos
- `pagos.crear` - Registrar pagos
- `pagos.editar` - Modificar pagos
- `pagos.eliminar` - Anular pagos
- `pagos.voucher.subir` - Subir comprobantes
- `pagos.voucher.validar` - Validar comprobantes
- `pagos.exportar` - Exportar reportes

### Permisos Académicos
- `niveles.ver` - Ver niveles
- `niveles.crear` - Crear niveles
- `niveles.editar` - Editar niveles
- `niveles.eliminar` - Eliminar niveles
- `grados.crear` - Crear grados
- `grados.editar` - Editar grados
- `grados.eliminar` - Eliminar grados
- `secciones.ver` - Ver secciones
- `secciones.crear` - Crear secciones
- `secciones.editar` - Editar secciones
- `secciones.eliminar` - Eliminar secciones
- `secciones.horarios.editar` - Gestionar horarios
- `cursos.ver` - Ver cursos
- `cursos.crear` - Crear cursos
- `cursos.editar` - Editar cursos
- `cursos.eliminar` - Eliminar cursos
- `cursos.asignar` - Asignar cursos a grados

### Permisos de Contenido
- `contenido.crear` - Crear unidades/clases
- `contenido.editar` - Editar unidades/clases
- `contenido.eliminar` - Eliminar unidades/clases
- `contenido.archivos.subir` - Subir archivos
- `contenido.archivos.eliminar` - Eliminar archivos

### Permisos de Estudiantes
- `estudiantes.ver` - Ver estudiantes
- `estudiantes.crear` - Crear estudiantes
- `estudiantes.editar` - Editar estudiantes
- `estudiantes.eliminar` - Eliminar estudiantes
- `estudiantes.contactos.editar` - Gestionar contactos
- `estudiantes.fotocheck` - Generar fotochecks

### Permisos de Docentes
- `docentes.ver` - Ver docentes
- `docentes.crear` - Crear docentes
- `docentes.editar` - Editar docentes
- `docentes.eliminar` - Eliminar docentes
- `docentes.cursos.asignar` - Asignar cursos
- `docentes.cursos.desasignar` - Desasignar cursos
- `docentes.horarios.editar` - Gestionar horarios

### Permisos de Matrícula
- `matriculas.ver` - Ver matrículas
- `matriculas.crear` - Crear matrículas
- `matriculas.editar` - Editar matrículas
- `matriculas.eliminar` - Eliminar matrículas

### Permisos de Asistencia
- `asistencia.ver` - Ver asistencia
- `asistencia.marcar` - Marcar asistencia
- `asistencia.escanear` - Escanear QR
- `asistencia.exportar` - Exportar reportes

### Permisos de Biblioteca
- `biblioteca.ver` - Ver biblioteca
- `biblioteca.crear` - Crear carpetas
- `biblioteca.editar` - Editar carpetas
- `biblioteca.subir` - Subir archivos
- `biblioteca.eliminar` - Eliminar archivos/carpetas

### Permisos de Mensajería
- `mensajeria.ver` - Ver mensajes
- `mensajeria.enviar` - Enviar mensajes
- `mensajeria.grupos.ver` - Ver grupos
- `mensajeria.grupos.crear` - Crear grupos

### Permisos de Usuarios
- `usuarios.ver` - Ver usuarios
- `usuarios.crear` - Crear usuarios
- `usuarios.editar` - Editar usuarios
- `usuarios.estado` - Cambiar estado
- `usuarios.historial` - Ver historial
- `usuarios.actividad` - Ver actividad
- `usuarios.resetear` - Resetear credenciales

### Permisos de Roles
- `roles.ver` - Ver roles
- `roles.crear` - Crear roles
- `roles.editar` - Editar roles
- `roles.eliminar` - Eliminar roles

### Permisos de Actividades
- `actividades.ver` - Ver actividades
- `actividades.crear` - Crear actividades
- `actividades.editar` - Editar actividades
- `actividades.eliminar` - Eliminar actividades
- `actividades.notas.ver` - Ver notas
- `actividades.calificar` - Calificar actividades

### Permisos del Portal Alumno
- `portal.alumno.qr` - Ver código QR
- `portal.alumno.asistencia` - Ver asistencia

### Permisos del Portal Docente
- `portal.docente.alumnos` - Ver mis alumnos

---

## 🎯 MATRIZ DE PERMISOS POR ROL

### Administrador
Tiene TODOS los permisos del sistema.

### Docente
- `dashboard.cursos.asignados`
- `cursos.ver`
- `contenido.crear`, `contenido.editar`, `contenido.eliminar`
- `contenido.archivos.subir`, `contenido.archivos.eliminar`
- `actividades.ver`, `actividades.crear`, `actividades.editar`, `actividades.eliminar`
- `actividades.notas.ver`, `actividades.calificar`
- `asistencia.ver`, `asistencia.marcar`
- `mensajeria.ver`, `mensajeria.enviar`
- `biblioteca.ver`
- `portal.docente.alumnos`

### Estudiante
- `dashboard.resumen.academico`
- `cursos.ver`
- `asistencia.ver`
- `mensajeria.ver`, `mensajeria.enviar`
- `biblioteca.ver`
- `portal.alumno.qr`
- `portal.alumno.asistencia`

### Padre/Madre/Apoderado
- `dashboard.resumen.familiar`
- `pagos.ver`
- `mensajeria.ver`, `mensajeria.enviar`
- `comunicados.ver`
- `institucion.ver`

---

## 📊 ESTADÍSTICAS

- **Total de Vistas:** 45+
- **Total de Permisos Únicos:** 80+
- **Total de Endpoints API:** 150+
- **Roles Definidos:** 5 (Administrador, Docente, Estudiante, Padre, Madre, Apoderado)

---

## ✅ CONCLUSIÓN

Este documento lista TODAS las vistas del sistema con sus acciones específicas y permisos requeridos. Cada vista tiene claramente definido:

1. La ruta web
2. El componente frontend
3. Las acciones disponibles
4. Los permisos necesarios
5. Los endpoints API correspondientes

Este inventario servirá como base para:
- Implementar el sistema de permisos con Spatie
- Crear los seeders de roles y permisos
- Validar el control de acceso en frontend y backend
- Documentar el sistema para futuros desarrolladores

