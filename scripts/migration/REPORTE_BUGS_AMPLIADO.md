# Reporte de Bugs — Análisis Ampliado (Parte 2)

**Fecha de análisis:** 2026-03-26
**Objetivo:** Extender la revisión cruzada a los módulos no verificados y evaluar el riesgo en las tablas omitidas en el reporte inicial.

---

## Hallazgo #1 — Los módulos ERP y Exámenes SÍ se están migrando
### Severidad: ℹ️ INFORMATIVO / AVISO

El archivo `README.md` del proyecto señala que las tablas de `erp` y `examenes` son *legacy* y no están implementadas en el nuevo sistema. Sin embargo:
1. Las migraciones PHP (`2026_03_27_003827_create_erp_ventas_tables.php` y `2026_03_27_003827_create_examenes_virtuales_tables.php`) **sí existen** y crean todas estas tablas en el nuevo sistema.
2. El script `main.py` **sí invoca** las funciones de migración para estos módulos al final de la ejecución:
   ```python
   erp.migrate_erp(old, new, args.dry_run)
   examenes.migrate_examenes(old, new, args.dry_run)
   ```
3. Tras revisar `erp.py` y `examenes.py`, los scripts de Python insertan las 18 tablas (12 de ERP y 6 de Exámenes) realizando un copiado 1:1 de los IDs y columnas, los cuales **coinciden perfectamente** con la nueva estructura de Laravel.
**Conclusión:** No hay pérdida de datos en la estructura de estas tablas, pero es importante saber que la data de ERP y Exámenes antiguos sí está pasando a la nueva base de datos.

---

## Bug #5 — Pérdida TOTAL de Matrículas y Asistencias (Módulos Huérfanos)
### Severidad: 🔴 CRÍTICO / PÉRDIDA DE DATOS

En el esquema de Laravel existen las siguientes tablas base fundamentales para el flujo de la escuela:
- `matricula_aperturas` y `matriculas`
- `asistencias` y `horarios_asistencia`
- `clases`, `unidades` y `archivos_clase`

**Problema:**
No existe **ningún script en Python** (ni en `academic.py`, `users.py` u otro módulo) que lea los datos antiguos para pasarlos a estas tablas. El proceso de migración transfiere a los estudiantes, a las secciones y a los cursos, pero **omite por completo el vínculo de la matrícula**.

**Impacto en producción:**
1. Los estudiantes aparecerán en el sistema nuevo sin estar asignados a ninguna sección, grado o curso (pues no existe el registro de `matriculas`).
2. Todo el historial de `asistencias` de años o meses anteriores almacenado en el sistema antiguo se perderá, ya que no se está transfiriendo a `edu_bautista2`.
3. Todo el registro de syllabus, `unidades` y `clases` creados por los docentes no se migrará.

**Acción Requerida:**
Se debe desarrollar un nuevo módulo Python (ej. `modules/enrollment.py` y `modules/attendance.py`) para rescatar la data transaccional del sistema antiguo de estas tablas clave, o confirmar formalmente con el cliente si desean iniciar el nuevo sistema en "blanco" para el periodo actual.

---

## Verificación de Integridad de Módulos Mensajería, Pagos y Académico
### Severidad: ✅ OK

Se analizaron el resto de rutinas de mapeo (ej. `mensajeria_grupo_alumno` hacia `mensajeria_grupo_miembros`) y `pagos` contra las migraciones de PHP (`create_mensajeria_tables.php` etc.):
- `mensajeria_grupo_miembros` en Laravel solo tiene `grupo_id` y `user_id`. El script de Python `messaging.py` extrae exactamente esas dos columnas, realizando correctamente el mapeo del alumno al nuevo `user_id`. No hay pérdida de columnas (Parámetro A pasado con éxito).
- En el módulo `pagos`, el script hace la vinculación de `padre_apoderado` para rescatar el `contacto_id` del pagador y lo asigna al pago. Las columnas de Laravel coinciden. (Parámetros A y B en orden, salvo la conversión del mes detallada en Tu Reporte Bug #4).
- Las tablas académicas (`niveles_educativos`, `grados`, `secciones`, `cursos`) mapean 1:1 de `academic.py` hacia las migraciones Laravel sin dejar columnas truncadas o en null. No hay Bugs #1 adicionales aquí.

---

## Resumen de Prioridades Adicional
| Prioridad | Bug Limitación | Impacto |
|-----------|----------------|---------|
| **CRÍTICA** | Bug #5 Matrículas y Asistencias no migradas | Los alumnos se migran pero no tendrán salones ni notas activas. |
| **BAJA** | ERP y Exámenes omitidos en README | Se migran correctamente, pero el dev team debe saber que ya no son código legacy muerto, están activos. |
