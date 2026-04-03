# -*- coding: utf-8 -*-
# Migra el sistema de asistencia del legacy al nuevo schema rediseñado:
#   asistencia_actividad  →  asistencia_clases   (sesión de asistencia por clase)
#   asistencia_alumno     →  asistencia_alumnos  (registro individual por alumno)
#
# Mapeo de estado legacy → nuevo:
#   asistencia_actividad.estado: '1' = abierto, '0' = cerrado  (se conserva)
#   asistencia_alumno.estado:    '1' → 'P' (presente), '0' → 'F' (falta)
from config import log, NOW

ESTADO_ALUMNO_MAP = {
    "1": "P",  # presente
    "0": "F",  # falta
}


def migrate_asistencia_clases(old, new, dry_run: bool):
    # ── 1. asistencia_actividad → asistencia_clases ────────────────────────────
    log.head("ASI 1/2  asistencia_actividad → asistencia_clases")
    with old.cursor() as c:
        c.execute("SELECT * FROM asistencia_actividad ORDER BY asistecia_actividad_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} sesiones de asistencia encontradas")

    # Validar que las clases existan en nuevo sistema
    with new.cursor() as c:
        c.execute("SELECT clase_id FROM clases")
        valid_clases = {r["clase_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT id FROM asistencia_clases")
        existing = {r["id"] for r in c.fetchall()}

    # Mapa legacy asistecia_actividad_id → nuevo id (mismo valor, PK preservada)
    asistencia_id_map = {}
    ins = skipped = errors = 0

    with new.cursor() as c:
        for r in rows:
            old_id = r["asistecia_actividad_id"]
            if old_id in existing:
                asistencia_id_map[old_id] = old_id
                skipped += 1
                continue

            id_clase_curso = r.get("id_actividad")  # en legacy apunta a clase_cursos.clase_id
            if id_clase_curso and id_clase_curso not in valid_clases:
                log.err(f"  asistencia_id={old_id}: id_actividad={id_clase_curso} (clase) no existe → omitido")
                errors += 1
                continue

            fecha = str(r.get("fecha", NOW))[:10]
            estado = r.get("estado", "1")

            if not dry_run:
                c.execute(
                    """INSERT INTO asistencia_clases
                        (id, id_clase_curso, fecha, estado, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s)""",
                    (old_id, id_clase_curso, fecha, estado, NOW, NOW),
                )
            asistencia_id_map[old_id] = old_id
            ins += 1
            log.ok(f"  asistencia_id={old_id}  clase={id_clase_curso}  fecha={fecha}")

    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")

    # ── 2. asistencia_alumno → asistencia_alumnos ──────────────────────────────
    log.head("ASI 2/2  asistencia_alumno → asistencia_alumnos")
    with old.cursor() as c:
        c.execute("SELECT * FROM asistencia_alumno ORDER BY alumno_asiste_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} registros de asistencia de alumnos encontrados")

    with new.cursor() as c:
        c.execute("SELECT estu_id FROM estudiantes")
        valid_estudiantes = {r["estu_id"] for r in c.fetchall()}
    # asistencia_alumnos usa id autoincremental nuevo, no preservamos PK legacy
    # verificamos duplicados por (id_asistencia_clase, id_estudiante)
    with new.cursor() as c:
        c.execute("SELECT id_asistencia_clase, id_estudiante FROM asistencia_alumnos")
        existing_pairs = {(r["id_asistencia_clase"], r["id_estudiante"]) for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            old_asistencia_id = r.get("id_asistencia")
            new_asistencia_id = asistencia_id_map.get(old_asistencia_id)
            if not new_asistencia_id:
                log.err(f"  alumno_asiste_id={r['alumno_asiste_id']}: id_asistencia={old_asistencia_id} no migrado → omitido")
                errors += 1
                continue

            id_estudiante = r.get("id_alumno")
            if id_estudiante and id_estudiante not in valid_estudiantes:
                log.err(f"  alumno_asiste_id={r['alumno_asiste_id']}: id_alumno={id_estudiante} no existe → omitido")
                errors += 1
                continue

            pair = (new_asistencia_id, id_estudiante)
            if pair in existing_pairs:
                skipped += 1
                continue

            estado_legacy = str(r.get("estado", "1"))
            estado_nuevo = ESTADO_ALUMNO_MAP.get(estado_legacy, "P")

            if not dry_run:
                c.execute(
                    """INSERT INTO asistencia_alumnos
                        (id_asistencia_clase, id_estudiante, estado,
                         observacion, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s)""",
                    (new_asistencia_id, id_estudiante, estado_nuevo, None, NOW, NOW),
                )
            existing_pairs.add(pair)
            ins += 1

    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")
