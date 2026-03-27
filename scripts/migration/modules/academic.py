# -*- coding: utf-8 -*-
from config import log, NOW

def migrate_niveles(old, new, dry_run: bool):
    log.head("4/9  niveles_educativos")
    with old.cursor() as c:
        c.execute("SELECT * FROM niveles_educativos")
        rows = c.fetchall()

    log.info(f"{len(rows)} niveles encontrados")

    with new.cursor() as c:
        c.execute("SELECT nivel_id FROM niveles_educativos")
        existing = {r["nivel_id"] for r in c.fetchall()}

    inserted = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["nivel_id"] in existing:
                skipped += 1
                continue

            sql = """
                INSERT INTO niveles_educativos
                    (nivel_id, insti_id, nombre_nivel, nivel_estatus, created_at, updated_at)
                VALUES
                    (%(nivel_id)s, %(insti_id)s, %(nombre_nivel)s,
                     %(nivel_estatus)s, %(ts)s, %(ts)s)
            """
            params = {**r, "ts": NOW, "nivel_estatus": r.get("nivel_estatus") or 1}

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  nivel_id={r['nivel_id']} → {r['nombre_nivel']}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")

def migrate_grados(old, new, dry_run: bool):
    log.head("5/9  grados")
    with old.cursor() as c:
        c.execute("SELECT * FROM grados")
        rows = c.fetchall()

    log.info(f"{len(rows)} grados encontrados")

    with new.cursor() as c:
        c.execute("SELECT grado_id FROM grados")
        existing = {r["grado_id"] for r in c.fetchall()}

    inserted = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["grado_id"] in existing:
                skipped += 1
                continue

            sql = """
                INSERT INTO grados
                    (grado_id, nivel_id, nombre_grado, abreviatura, created_at, updated_at)
                VALUES
                    (%(grado_id)s, %(nivel_id)s, %(nombre_grado)s,
                     %(abreviatura)s, %(ts)s, %(ts)s)
            """
            params = {**r, "ts": NOW}

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  grado_id={r['grado_id']} → {r['nombre_grado']}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")

def migrate_secciones(old, new, dry_run: bool):
    log.head("6/9  secciones")
    with old.cursor() as c:
        c.execute("SELECT * FROM secciones")
        rows = c.fetchall()

    log.info(f"{len(rows)} secciones encontradas")

    with new.cursor() as c:
        c.execute("SELECT seccion_id FROM secciones")
        existing = {r["seccion_id"] for r in c.fetchall()}

    inserted = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["seccion_id"] in existing:
                skipped += 1
                continue

            sql = """
                INSERT INTO secciones
                    (seccion_id, id_grado, nombre, abreviatura,
                     cnt_alumnos, horario, created_at, updated_at)
                VALUES
                    (%(seccion_id)s, %(id_grado)s, %(nombre)s,
                     %(abreviatura)s, %(cnt_alumnos)s, %(horario)s,
                     %(ts)s, %(ts)s)
            """
            params = {**r, "ts": NOW, "cnt_alumnos": r.get("cnt_alumnos") or 0}

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  seccion_id={r['seccion_id']} → {r['nombre']}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")

def migrate_cursos(old, new, dry_run: bool):
    log.head("7/9  cursos")
    with old.cursor() as c:
        c.execute("SELECT * FROM cursos")
        rows = c.fetchall()

    log.info(f"{len(rows)} cursos encontrados")

    with new.cursor() as c:
        c.execute("SELECT curso_id FROM cursos")
        existing = {r["curso_id"] for r in c.fetchall()}

    inserted = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["curso_id"] in existing:
                skipped += 1
                continue

            sql = """
                INSERT INTO cursos
                    (curso_id, id_insti, nombre, descripcion, logo,
                     nivel_academico_id, grado_academico, estado,
                     created_at, updated_at)
                VALUES
                    (%(curso_id)s, %(id_insti)s, %(nombre)s, %(descripcion)s,
                     %(logo)s, %(nivel_academico_id)s, %(grado_academico)s,
                     %(estado)s, %(ts)s, %(ts)s)
            """
            params = {**r, "ts": NOW, "estado": "1"}

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  curso_id={r['curso_id']} → {r['nombre']}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")
