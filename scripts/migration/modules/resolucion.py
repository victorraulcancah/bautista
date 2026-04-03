# -*- coding: utf-8 -*-
# Migra intentos de examen y respuestas de alumnos:
#   examen_iniciado  (legacy) → examen_iniciado  (nuevo, PK: intento_id)
#   pregunta_resp    (legacy) → pregunta_resp    (nuevo)
#
# Mapeo de estado legacy → nuevo:
#   legacy '0' (en curso) → nuevo '1' (activo)
#   legacy '1' (completado) → nuevo '0' (finalizado)
from config import log, NOW

ESTADO_MAP = {"0": "1", "1": "0"}


def migrate_resolucion(old, new, dry_run: bool):
    # ── 1. examen_iniciado ─────────────────────────────────────────────────────
    log.head("RES 1/2  examen_iniciado")
    with old.cursor() as c:
        c.execute("SELECT * FROM examen_iniciado ORDER BY iniciado_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} intentos encontrados")

    with new.cursor() as c:
        c.execute("SELECT intento_id FROM examen_iniciado")
        existing = {r["intento_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT estu_id FROM estudiantes")
        valid_estudiantes = {r["estu_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT actividad_id FROM actividad_curso")
        valid_actividades = {r["actividad_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            old_id = r["iniciado_id"]
            if old_id in existing:
                skipped += 1
                continue
            estu_id = r.get("id_estudiante")
            act_id  = r.get("id_actividad")
            if estu_id and estu_id not in valid_estudiantes:
                log.err(f"  iniciado_id={old_id}: estu_id={estu_id} no existe → omitido")
                errors += 1
                continue
            if act_id and act_id not in valid_actividades:
                log.err(f"  iniciado_id={old_id}: act_id={act_id} no existe → omitido")
                errors += 1
                continue
            estado = ESTADO_MAP.get(str(r.get("estado", "0")), "1")
            fecha_inicio = r.get("fecha_incio") or NOW  # typo intencionado en legacy
            if not dry_run:
                c.execute(
                    """INSERT INTO examen_iniciado
                        (intento_id, estu_id, actividad_id, fecha_inicio,
                         fecha_limite, fecha_fin, estado, puntaje_total,
                         created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (old_id, estu_id, act_id, fecha_inicio,
                     None, None, estado, 0, NOW, NOW),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")

    # ── 2. pregunta_resp ───────────────────────────────────────────────────────
    log.head("RES 2/2  pregunta_resp")
    with old.cursor() as c:
        c.execute("SELECT * FROM pregunta_resp ORDER BY resp_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} respuestas encontradas")

    with new.cursor() as c:
        c.execute("SELECT intento_id FROM examen_iniciado")
        valid_intentos = {r["intento_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT pregunta_id FROM pregunta_cuestionario")
        valid_preguntas = {r["pregunta_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT alternativa_id FROM alternativas_pregunta")
        valid_alternativas = {r["alternativa_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT resp_id FROM pregunta_resp")
        existing = {r["resp_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            old_id = r["resp_id"]
            if old_id in existing:
                skipped += 1
                continue
            intento_id = r.get("exan_ini")   # legacy FK: exan_ini → iniciado_id
            preg_id    = r.get("pregunta_id")
            if intento_id and intento_id not in valid_intentos:
                log.err(f"  resp_id={old_id}: intento_id={intento_id} no existe → omitido")
                errors += 1
                continue
            if preg_id and preg_id not in valid_preguntas:
                log.err(f"  resp_id={old_id}: pregunta_id={preg_id} no existe → omitido")
                errors += 1
                continue
            # Determinar si es opción múltiple (tipo='1') o texto libre
            tipo    = str(r.get("tipo") or "")
            content = r.get("contenido")
            alt_id  = None
            txt_res = None
            if tipo == "1":
                try:
                    candidate = int(str(content).strip()) if content else None
                    if candidate and candidate in valid_alternativas:
                        alt_id = candidate
                    else:
                        txt_res = content
                except (ValueError, TypeError):
                    txt_res = content
            else:
                txt_res = content
            if not dry_run:
                c.execute(
                    """INSERT INTO pregunta_resp
                        (resp_id, intento_id, pregunta_id, alternativa_id,
                         respuesta_texto, es_correcta, puntaje,
                         created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (old_id, intento_id, preg_id, alt_id,
                     txt_res, 0, 0, NOW, NOW),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")
