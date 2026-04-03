# Tablas en Uso Activo — Sistema BAUTISTA (Legacy)

Este documento identifica las tablas del sistema antiguo que tienen un uso confirmado en el código fuente (`.php`) y que son necesarias para el funcionamiento del portal de Alumnos, Padres y Docentes.

## 1. Núcleo Académico y Estructura
- `institucion_educativa`: Datos de la escuela.
- `niveles_educativos`: Inicial, Primaria, Secundaria.
- `grados`: 1ro, 2do, etc.
- `secciones`: A, B, etc.
- `cursos`: Materias.
- `grados_cursos`: Relación Cursos vs Grados.
- `institucion_galeria` / `institucion_noticias` / `institucion_blog`: Comunicados públicos.

## 2. Gestión Universitaria / Personas
- `usuarios`: Credenciales.
- `perfiles`: Datos personales (DNI, nombres).
- `usuario_rol` / `roles`: Permisos.
- `docentes`: Datos específicos de profesores.
- `estudiantes`: Datos del alumno.
- `padre_apoderado`: Datos del tutor.
- `estudiante_contacto`: Contactos de emergencia.
- `recuperacion_usuario`: Tokens de contraseña.
- `historial_usuario`: Auditoría (logs).

## 3. Matrícula y Seguimiento
- `matricula_aperturas`: Campañas (fechas).
- `matriculas`: Registro oficial por año.
- `hijos_matriculados`: Vínculo Padre-Hijo.
- `matricula_padres` / `grupo_matricula_padres`: Matrícula agrupada.

## 4. Aula Virtual y Cursos
- `curso_docente` (`docente_cursos`): Carga horaria.
- `unidad_curso`: Bimestres/Temas.
- `clase_cursos`: Clases individuales.
- `archivos_clase`: Materiales/PDFs.
- `actividad_curso`: Tareas y entregas.
- `archivos_actividad`: Archivos adjuntos a tareas.
- `docente_horario` / `horarios_asistencia`: Calendario escolar.

## 5. Evaluaciones y Quizzes
- `cuestionario`: Configuración de examen.
- `pregunta_cuestionario`: Banco de preguntas.
- `alternativas_pregunta` / `respuesta_alterna`: Opciones múltiples.
- `tipo_respuesta_quiz`: Formato (V/F, Texto, etc).
- `examen_iniciado`: Control de intentos.
- `pregunta_resp` / `respuesta_escrita` / `contenido_escrito`: Respuestas del alumno.

## 6. Sistema de Calificaciones (Libreta)
- `nota_actividad`: Configuración de la tarea.
- `nota_actividad_estudiante`: Calificación por alumno/tarea.
- `nota_unidad`: Promedios bimestrales.
- `notas_estudiante`: Registro central del cierre de promedio del curso general.

## 7. Mensajería Interna
- `mensaje_usuarion`: Mensajes individuales.
- `mensajeria_grupo`: Hilos/Grupos.
- `mensajeria_grupo_alumno`: Miembros del grupo.
- `mensajeria_respuestas`: Contenido de los mensajes.

## 8. Asistencia
- `asistencia`: Marcación diaria.
- `asistencia_actividad` / `asistencia_clases`: Por curso.
- `asistencia_alumno`: Estado P/F/T.

## 9. Pagos y Tesorería
- `institucion_pagosm`: Catálogo de pensiones.
- `pagos_matricula`: Recibos de inscripción.
- `pagos_extras`: Cobros varios.
- `pagos_notifica`: Vouchers/Comprobantes subidos por padres.
- `pag_fecha` / `fechas_pagos` / `metodo_pago`: Control de tesorería.

## 10. Ubigeo e Imágenes
- `dir_departamento`, `dir_provincia`, `dir_distrito`, `ubigeo_inei`: Direcciones.
- `mis_medios`: Galería del usuario.
- `imagen_rompecabeza_actividad` / `alumno_rompecabeza`: Juegos didácticos.

---

### **Tablas Ignoradas (Módulo ERP/Facturación no utilizado)**
Se excluyen tablas relacionadas a Ventas, Proveedores, Compras, Caja y Facturación Electrónica (`ventas`, `productos`, `compras`, `sucursales`, `producto_foto`, etc.) por ser parte de un boilerplate de ERP que no está activo en este proyecto educativo.
