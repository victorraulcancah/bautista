# -*- coding: utf-8 -*-
from config import log, NOW

def migrate_docente_cursos(old, new, dry_run: bool):
    """
    Migra curso_docente (antiguo) → docente_cursos (nuevo).
    """
    log.head("ACAD 7.5 docente_cursos")

    with old.cursor() as c:
        c.execute("SELECT * FROM curso_docente ORDER BY curso_doce_id")
        rows = c.fetchall()

    log.info(f"{len(rows)} vinculaciones docente-curso encontradas")

    with new.cursor() as c:
        c.execute("SELECT docen_curso_id FROM docente_cursos")
        existing = {r["docen_curso_id"] for r in c.fetchall()}

    inserted = skipped = errors = 0

    with new.cursor() as c:
        for r in rows:
            old_id = r["curso_doce_id"]

            if old_id in existing:
                skipped += 1
                continue

            # Mapeo directo basado en el esquema legacy proporcionado
            sql = """
                INSERT INTO docente_cursos
                    (docen_curso_id, docente_id, apertura_id, curso_id,
                     nivel_id, grado_id, seccion_id, estado,
                     created_at, updated_at)
                VALUES
                    (%(docen_curso_id)s, %(docente_id)s, %(apertura_id)s, %(curso_id)s,
                     %(nivel_id)s, %(grado_id)s, %(seccion_id)s, %(estado)s,
                     %(ts)s, %(ts)s)
            """
            params = {
                "docen_curso_id": old_id,
                "docente_id":     r.get("docente_id"),
                "apertura_id":    r.get("id_apertura"),
                "curso_id":       r.get("curso_id"),
                "nivel_id":       r.get("nivel"),
                "grado_id":       r.get("grado"),
                "seccion_id":     r.get("seccion"),
                "estado":         r.get("estatus") or "1",
                "ts":             NOW,
            }

            if not dry_run:
                try:
                    c.execute(sql, params)
                    inserted += 1
                except Exception as e:
                    log.err(f"  Error insertando curso_doce_id={old_id}: {e}")
                    errors += 1
            else:
                inserted += 1
            log.ok(f"  docen_curso_id={old_id}  docente={r.get('docente_id')} curso={r.get('curso_id')}")

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")
