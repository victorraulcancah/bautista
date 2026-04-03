# -*- coding: utf-8 -*-
from config import log, NOW


def migrate_contenido(old, new, dry_run: bool):
    # ── 1. archivos_actividad ──────────────────────────────────────────────────
    log.head("CON 1/4  archivos_actividad")
    with old.cursor() as c:
        c.execute("SELECT * FROM archivos_actividad ORDER BY archiv_actividad_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} archivos_actividad encontrados")

    with new.cursor() as c:
        c.execute("SELECT actividad_id FROM actividad_curso")
        valid_actividades = {r["actividad_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT estu_id FROM estudiantes")
        valid_estudiantes = {r["estu_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT archiv_actividad_id FROM archivos_actividad")
        existing = {r["archiv_actividad_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["archiv_actividad_id"] in existing:
                skipped += 1
                continue
            id_actividad = r.get("id_actividad")
            estudiante = r.get("estudiante")
            if id_actividad and id_actividad not in valid_actividades:
                log.err(f"  archiv_id={r['archiv_actividad_id']}: id_actividad={id_actividad} no existe → omitido")
                errors += 1
                continue
            if estudiante and estudiante not in valid_estudiantes:
                log.err(f"  archiv_id={r['archiv_actividad_id']}: estudiante={estudiante} no existe → omitido")
                errors += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO archivos_actividad
                        (archiv_actividad_id, id_actividad, origen, archivo,
                         nombre_archivo, tipo_archivo, estudiante, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (r["archiv_actividad_id"], id_actividad, r.get("origen"),
                     r.get("archivo"), r.get("nombre_archivo"), r.get("tipo_archivo"),
                     estudiante, NOW, NOW),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")

    # ── 2. nota_actividad ──────────────────────────────────────────────────────
    log.head("CON 2/4  nota_actividad")
    with old.cursor() as c:
        c.execute("SELECT * FROM nota_actividad ORDER BY nota_activida_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} nota_actividad encontradas")

    with new.cursor() as c:
        c.execute("SELECT nota_activida_id FROM nota_actividad")
        existing = {r["nota_activida_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["nota_activida_id"] in existing:
                skipped += 1
                continue
            id_actividad = r.get("id_actividad")
            id_estudiante = r.get("id_estudiante")
            if id_actividad and id_actividad not in valid_actividades:
                log.err(f"  nota_id={r['nota_activida_id']}: id_actividad={id_actividad} no existe → omitido")
                errors += 1
                continue
            if id_estudiante and id_estudiante not in valid_estudiantes:
                log.err(f"  nota_id={r['nota_activida_id']}: id_estudiante={id_estudiante} no existe → omitido")
                errors += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO nota_actividad
                        (nota_activida_id, id_actividad, id_estudiante,
                         calificacion, fecha_calificada, estado, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (r["nota_activida_id"], id_actividad, id_estudiante,
                     r.get("calificacion"), r.get("fecha_calificada"),
                     r.get("estado"), NOW, NOW),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")

    # ── 3. contenido_escrito ───────────────────────────────────────────────────
    log.head("CON 3/4  contenido_escrito")
    with old.cursor() as c:
        c.execute("SELECT * FROM contenido_escrito ORDER BY contenido_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} contenido_escrito encontrados")

    with new.cursor() as c:
        c.execute("SELECT pregunta_id FROM pregunta_cuestionario")
        valid_preguntas = {r["pregunta_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT contenido_id FROM contenido_escrito")
        existing = {r["contenido_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["contenido_id"] in existing:
                skipped += 1
                continue
            id_pregunta = r.get("id_pregunta")
            if id_pregunta and id_pregunta not in valid_preguntas:
                log.err(f"  contenido_id={r['contenido_id']}: id_pregunta={id_pregunta} no existe → omitido")
                errors += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO contenido_escrito
                        (contenido_id, id_pregunta, respuesta, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s)""",
                    (r["contenido_id"], id_pregunta, r.get("respuesta"), NOW, NOW),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")

    # ── 4. respuesta_escrita ───────────────────────────────────────────────────
    log.head("CON 4/4  respuesta_escrita")
    with old.cursor() as c:
        c.execute("SELECT * FROM respuesta_escrita ORDER BY res_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} respuesta_escrita encontradas")

    with new.cursor() as c:
        c.execute("SELECT res_id FROM respuesta_escrita")
        existing = {r["res_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["res_id"] in existing:
                skipped += 1
                continue
            id_pregunta = r.get("id_pregunta")
            if id_pregunta and id_pregunta not in valid_preguntas:
                log.err(f"  res_id={r['res_id']}: id_pregunta={id_pregunta} no existe → omitido")
                errors += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO respuesta_escrita
                        (res_id, id_exam_ini, id_pregunta, respuesta, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s)""",
                    (r["res_id"], r.get("id_exam_ini"), id_pregunta,
                     r.get("respuesta"), NOW, NOW),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")
