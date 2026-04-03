# -*- coding: utf-8 -*-
# migrate_horarios_asistencia ya se ejecuta dentro de enrollment.migrate_enrollment.
# Este módulo solo maneja los archivos de horario adjuntos a secciones y docentes.
from config import log, NOW


def migrate_seccion_horarios(old, new, dry_run: bool):
    log.head("HOR 1/2  seccion_horarios")
    with old.cursor() as c:
        c.execute("""
            SELECT seccion_id, nombre, horario
            FROM secciones
            WHERE horario IS NOT NULL AND horario <> ''
        """)
        rows = c.fetchall()
    log.info(f"{len(rows)} secciones con archivo de horario encontradas")

    with new.cursor() as c:
        c.execute("SELECT seccion_id FROM seccion_horarios")
        existing = {r["seccion_id"] for r in c.fetchall()}

    ins = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["seccion_id"] in existing:
                skipped += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO seccion_horarios
                        (seccion_id, nombre, path, tipo, tamanio, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                    (r["seccion_id"], f"Horario {r['nombre']}",
                     f"horarios/{r['horario']}", "image/jpeg", 0, NOW, NOW),
                )
            log.ok(f"  seccion={r['nombre']} → horarios/{r['horario']}")
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}")


def migrate_docente_horarios(old, new, dry_run: bool):
    log.head("HOR 2/2  docente_horarios")
    with old.cursor() as c:
        c.execute("""
            SELECT doh_id, docente_id, doh_archivo, doh_fecha
            FROM docente_horario
            WHERE doh_archivo IS NOT NULL AND doh_archivo <> ''
        """)
        rows = c.fetchall()
    log.info(f"{len(rows)} docentes con archivo de horario encontrados")

    with new.cursor() as c:
        c.execute("SELECT docente_id FROM docentes")
        valid_docentes = {r["docente_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT horario_archivo_id FROM docente_horarios")
        existing = {r["horario_archivo_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["doh_id"] in existing:
                skipped += 1
                continue
            if r.get("docente_id") and r["docente_id"] not in valid_docentes:
                log.err(f"  doh_id={r['doh_id']}: docente_id={r['docente_id']} no existe → omitido")
                errors += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO docente_horarios
                        (horario_archivo_id, docente_id, nombre, path, tipo, tamanio, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (r["doh_id"], r.get("docente_id"),
                     f"Horario docente {r['docente_id']}",
                     f"docente_horarios/{r['doh_archivo']}",
                     "image/jpeg", 0, NOW, NOW),
                )
            log.ok(f"  doh_id={r['doh_id']}  docente={r.get('docente_id')}")
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")
