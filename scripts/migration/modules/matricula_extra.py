# -*- coding: utf-8 -*-
from config import log, NOW


def migrate_matricula_extra(old, new, dry_run: bool):
    # ── 1. matricula_padres ────────────────────────────────────────────────────
    log.head("MAT 1/3  matricula_padres")
    with old.cursor() as c:
        c.execute("SELECT * FROM matricula_padres ORDER BY matri_padre_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} matricula_padres encontrados")

    with new.cursor() as c:
        c.execute("SELECT matri_padre_id FROM matricula_padres")
        existing = {r["matri_padre_id"] for r in c.fetchall()}

    ins = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["matri_padre_id"] in existing:
                skipped += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO matricula_padres
                        (matri_padre_id, termino, datos_padres, datos_alumnos,
                         estado_verifica, confirmado, archivo, periodo, fecha_registro,
                         created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (r["matri_padre_id"], r.get("termino", "0"), r.get("datos_padres", "0"),
                     r.get("datos_alumnos", "0"), r.get("estado_verifica", "0"),
                     r.get("confirmado", "0"), r.get("archivo"), r.get("periodo"),
                     r.get("fecha_registro"), NOW, NOW),
                )
            log.ok(f"  matri_padre_id={r['matri_padre_id']}  periodo={r.get('periodo')}")
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}")

    # ── 2. grupo_matricula_padres ──────────────────────────────────────────────
    log.head("MAT 2/3  grupo_matricula_padres")
    with old.cursor() as c:
        c.execute("SELECT * FROM grupo_matricula_padres ORDER BY grupo_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} grupo_matricula_padres encontrados")

    with new.cursor() as c:
        c.execute("SELECT matri_padre_id FROM matricula_padres")
        valid_matriculas = {r["matri_padre_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT id_contacto FROM padre_apoderado")
        valid_padres = {r["id_contacto"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT grupo_id FROM grupo_matricula_padres")
        existing = {r["grupo_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["grupo_id"] in existing:
                skipped += 1
                continue
            id_matricula = r.get("id_matricula")
            id_padre = r.get("id_padre_apoderado")
            if id_matricula and id_matricula not in valid_matriculas:
                log.err(f"  grupo_id={r['grupo_id']}: id_matricula={id_matricula} no existe → omitido")
                errors += 1
                continue
            if id_padre and id_padre not in valid_padres:
                log.err(f"  grupo_id={r['grupo_id']}: id_padre_apoderado={id_padre} no existe → omitido")
                errors += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO grupo_matricula_padres
                        (grupo_id, id_matricula, id_padre_apoderado, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s)""",
                    (r["grupo_id"], id_matricula, id_padre, NOW, NOW),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")

    # ── 3. hijos_matriculados ──────────────────────────────────────────────────
    log.head("MAT 3/3  hijos_matriculados")
    with old.cursor() as c:
        c.execute("SELECT * FROM hijos_matriculados ORDER BY hijos_matri_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} hijos_matriculados encontrados")

    with new.cursor() as c:
        c.execute("SELECT estu_id FROM estudiantes")
        valid_estudiantes = {r["estu_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT hijos_matri_id FROM hijos_matriculados")
        existing = {r["hijos_matri_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["hijos_matri_id"] in existing:
                skipped += 1
                continue
            id_alumno = r.get("id_alumno")
            if id_alumno and id_alumno not in valid_estudiantes:
                log.err(f"  hijos_matri_id={r['hijos_matri_id']}: id_alumno={id_alumno} no existe → omitido")
                errors += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO hijos_matriculados
                        (hijos_matri_id, id_matricula_padres, id_alumno,
                         nivel_academico, grado_academico, seccion_academico,
                         created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (r["hijos_matri_id"], r.get("id_matricula_padres"), id_alumno,
                     r.get("nivel_academico"), r.get("grado_academico"),
                     r.get("seccion_academico"), NOW, NOW),
                )
            log.ok(f"  hijos_matri_id={r['hijos_matri_id']}  alumno={id_alumno}")
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")
