# -*- coding: utf-8 -*-
# Migra el módulo de rompecabezas:
#   imagen_rompecabeza_actividad  → imagen_rompecabeza   (metadatos de imagen)
#   alumno_rompecabeza            → alumno_rompecabeza   (récords de alumnos)
#
# Notas legacy:
#   - imagen_rompecabeza_actividad.ruta  → nuevo: imagen
#   - alumno_rompecabeza.id_activiidad   (typo: doble 'i')
#   - alumno_rompecabeza no tiene columna 'intentos' ni 'ayuda' → se usan defaults
from config import log, NOW


def migrate_puzzles(old, new, dry_run: bool):
    # ── 1. imagen_rompecabeza ──────────────────────────────────────────────────
    log.head("PUZ 1/2  imagen_rompecabeza_actividad → imagen_rompecabeza")
    with old.cursor() as c:
        c.execute("SELECT * FROM imagen_rompecabeza_actividad ORDER BY ropecabeza_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} imágenes de rompecabezas encontradas")

    with new.cursor() as c:
        c.execute("SELECT actividad_id FROM actividad_curso")
        valid_actividades = {r["actividad_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT rompe_id FROM imagen_rompecabeza")
        existing = {r["rompe_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            old_id = r["ropecabeza_id"]
            if old_id in existing:
                skipped += 1
                continue
            act_id = r.get("id_actividad")
            if act_id and act_id not in valid_actividades:
                log.err(f"  rompe_id={old_id}: actividad_id={act_id} no existe → omitido")
                errors += 1
                continue
            imagen = r.get("ruta")  # legacy usa 'ruta', no 'imagen'
            if not dry_run:
                c.execute(
                    """INSERT INTO imagen_rompecabeza
                        (rompe_id, actividad_id, imagen, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s)""",
                    (old_id, act_id, imagen, NOW, NOW),
                )
            log.ok(f"  rompe_id={old_id}  actividad={act_id}  imagen={imagen}")
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")

    # ── 2. alumno_rompecabeza ──────────────────────────────────────────────────
    log.head("PUZ 2/2  alumno_rompecabeza")
    with old.cursor() as c:
        c.execute("SELECT * FROM alumno_rompecabeza ORDER BY alum_rompe_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} récords de alumnos encontrados")

    with new.cursor() as c:
        c.execute("SELECT estu_id FROM estudiantes")
        valid_estudiantes = {r["estu_id"] for r in c.fetchall()}
    # Nuevo schema tiene unique(estu_id, actividad_id) — dedup por par
    with new.cursor() as c:
        c.execute("SELECT estu_id, actividad_id FROM alumno_rompecabeza")
        existing_pairs = {(r["estu_id"], r["actividad_id"]) for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            estu_id = r.get("id_alumno")
            act_id  = r.get("id_activiidad")  # typo legacy: doble 'i'
            if estu_id and estu_id not in valid_estudiantes:
                log.err(f"  alum_rompe_id={r['alum_rompe_id']}: estu_id={estu_id} no existe → omitido")
                errors += 1
                continue
            if act_id and act_id not in valid_actividades:
                log.err(f"  alum_rompe_id={r['alum_rompe_id']}: actividad_id={act_id} no existe → omitido")
                errors += 1
                continue
            pair = (estu_id, act_id)
            if pair in existing_pairs:
                skipped += 1
                continue
            # Legacy no tiene 'intentos' ni 'ayuda', se usan defaults del schema
            if not dry_run:
                c.execute(
                    """INSERT INTO alumno_rompecabeza
                        (estu_id, actividad_id, intentos, tiempo, ayuda,
                         created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                    (estu_id, act_id, 0, r.get("tiempo"), "0", NOW, NOW),
                )
            existing_pairs.add(pair)
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")
