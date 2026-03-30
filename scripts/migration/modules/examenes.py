# -*- coding: utf-8 -*-
from config import log, NOW


def migrate_examenes(old, new, dry_run: bool):
    # ── 1. tipo_actividad ──────────────────────────────────────────────────────
    log.head("EXM  tipo_actividad")
    with old.cursor() as c:
        c.execute("SELECT * FROM tipo_actividad")
        rows = c.fetchall()
    with new.cursor() as c:
        c.execute("SELECT tipo_id FROM tipo_actividad")
        existing = {r["tipo_id"] for r in c.fetchall()}
    with new.cursor() as c:
        ins = 0
        for r in rows:
            if r["tipo_id"] in existing:
                continue
            if not dry_run:
                c.execute(
                    "INSERT INTO tipo_actividad (tipo_id, nombre, created_at, updated_at) VALUES (%s, %s, %s, %s)",
                    (r["tipo_id"], r.get("nombre"), NOW, NOW),
                )
            log.ok(f"  tipo_id={r['tipo_id']}  {r.get('nombre')}")
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}")

    # ── 2. tipo_respuesta_quiz ─────────────────────────────────────────────────
    log.head("EXM  tipo_respuesta_quiz")
    with old.cursor() as c:
        c.execute("SELECT * FROM tipo_respuesta_quiz")
        rows = c.fetchall()
    with new.cursor() as c:
        c.execute("SELECT tipo_id FROM tipo_respuesta_quiz")
        existing = {r["tipo_id"] for r in c.fetchall()}
    with new.cursor() as c:
        ins = 0
        for r in rows:
            if r["tipo_id"] in existing:
                continue
            if not dry_run:
                c.execute(
                    "INSERT INTO tipo_respuesta_quiz (tipo_id, nombre, created_at, updated_at) VALUES (%s, %s, %s, %s)",
                    (r["tipo_id"], r.get("nombre"), NOW, NOW),
                )
            log.ok(f"  tipo_id={r['tipo_id']}  {r.get('nombre')}")
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}")

    # ── 3. actividad_curso ─────────────────────────────────────────────────────
    log.head("EXM  actividad_curso")
    with old.cursor() as c:
        c.execute("SELECT * FROM actividad_curso ORDER BY actividad_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} actividades encontradas")
    with new.cursor() as c:
        c.execute("SELECT actividad_id FROM actividad_curso")
        existing = {r["actividad_id"] for r in c.fetchall()}
    inserted = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["actividad_id"] in existing:
                skipped += 1
                continue
            if not dry_run:
                fecha_creacion = r.get("fecha_creacion") or NOW
                c.execute("""
                    INSERT INTO actividad_curso
                        (actividad_id, id_curso, id_clase_curso, id_tipo_actividad,
                         nombre_actividad, descripcion_corta, descripcion_larga,
                         fecha_inicio, fecha_cierre, nota_visible, nota_actividad,
                         respuesta_visible, ocultar_actividad, estado, es_calificado,
                         created_at, updated_at)
                    VALUES
                        (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, (
                    r["actividad_id"], r.get("id_curso"), r.get("id_clase_curso"),
                    r.get("id_tipo_activada"), r.get("nombre_activid"),
                    r.get("descripcion_corta"), r.get("descripcion_larga"),
                    r.get("fecha_inicio"), r.get("fecha_cierre"),
                    r.get("nota_visible"), r.get("nota_actvidad"),
                    r.get("respuesta_visible"), r.get("ocultar_actividad"),
                    r.get("estado"), r.get("es_calificado"), fecha_creacion, NOW,
                ))
            log.ok(f"  actividad_id={r['actividad_id']}  {str(r.get('nombre_activid',''))[:50]}")
            inserted += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")

    # ── 4. cuestionario ────────────────────────────────────────────────────────
    log.head("EXM  cuestionario")
    with old.cursor() as c:
        c.execute("SELECT * FROM cuestionario ORDER BY cuestionario_id")
        rows = c.fetchall()
    with new.cursor() as c:
        c.execute("SELECT cuestionario_id FROM cuestionario")
        existing = {r["cuestionario_id"] for r in c.fetchall()}
    inserted = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["cuestionario_id"] in existing:
                skipped += 1
                continue
            if not dry_run:
                c.execute("""
                    INSERT INTO cuestionario
                        (cuestionario_id, id_actividad, duracion, nota_visible,
                         mostrar_respuesta, estado, created_at, updated_at)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                """, (
                    r["cuestionario_id"], r.get("id_actividad"), r.get("duracion"),
                    r.get("nota_visible"), r.get("mostrar_respusta"),
                    r.get("estado"), NOW, NOW,
                ))
            log.ok(f"  cuestionario_id={r['cuestionario_id']}  duracion={r.get('duracion')}")
            inserted += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")

    # ── 5. pregunta_cuestionario ───────────────────────────────────────────────
    log.head("EXM  pregunta_cuestionario")
    with old.cursor() as c:
        c.execute("SELECT * FROM pregunta_cuestionario ORDER BY pregunta_id")
        rows = c.fetchall()
    with new.cursor() as c:
        c.execute("SELECT pregunta_id FROM pregunta_cuestionario")
        existing = {r["pregunta_id"] for r in c.fetchall()}
    inserted = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["pregunta_id"] in existing:
                skipped += 1
                continue
            if not dry_run:
                c.execute("""
                    INSERT INTO pregunta_cuestionario
                        (pregunta_id, id_cuestionario, cabecera, cuerpo,
                         tipo_respuesta, valor_nota, created_at, updated_at)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                """, (
                    r["pregunta_id"], r.get("id_cuestionario"), r.get("cabecera"),
                    r.get("cuerpo"), r.get("tipo_respuesta"), r.get("valor_nota"), NOW, NOW,
                ))
            log.ok(f"  pregunta_id={r['pregunta_id']}  {str(r.get('cabecera',''))[:50]}")
            inserted += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")

    # ── 6. alternativas_pregunta ───────────────────────────────────────────────
    log.head("EXM  alternativas_pregunta")
    with old.cursor() as c:
        c.execute("SELECT * FROM alternativas_pregunta ORDER BY alternativa_id")
        rows = c.fetchall()
    with new.cursor() as c:
        c.execute("SELECT alternativa_id FROM alternativas_pregunta")
        existing = {r["alternativa_id"] for r in c.fetchall()}
    inserted = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["alternativa_id"] in existing:
                skipped += 1
                continue
            if not dry_run:
                c.execute("""
                    INSERT INTO alternativas_pregunta
                        (alternativa_id, id_pregunta, contenido, estado_res,
                         created_at, updated_at)
                    VALUES (%s,%s,%s,%s,%s,%s)
                """, (
                    r["alternativa_id"], r.get("id_pregunta"),
                    r.get("contenido"), r.get("estado_res", "0"), NOW, NOW,
                ))
            log.ok(f"  alternativa_id={r['alternativa_id']}  correcta={r.get('estado_res')}")
            inserted += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")
