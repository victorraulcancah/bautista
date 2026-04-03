# -*- coding: utf-8 -*-
from config import log, NOW

def migrate_grades(old, new, dry_run: bool):
    """
    Migra tablas de calificaciones: nota_actividad, nota_actividad_estudiante, nota_unidad, notas_estudiante.
    """
    log.head("ACAD 8.0 Calificaciones (Grades)")

    # 1. nota_actividad (Legacy transactional) -> nota_actividad (New)
    _migrate_nota_actividad(old, new, dry_run)

    # 2. nota_actividad_estudiante (Legacy) -> nota_actividad_estudiante (New)
    _migrate_nota_actividad_estudiante(old, new, dry_run)

    # 3. nota_unidad (Legacy) -> nota_unidad (New)
    _migrate_nota_unidad(old, new, dry_run)

    # 4. notas_estudiante (Legacy) -> notas_estudiante (New)
    _migrate_notas_estudiante(old, new, dry_run)


def _migrate_nota_actividad(old, new, dry_run: bool):
    log.info("Migrando nota_actividad (Legacy transactional)...")
    with old.cursor() as c:
        c.execute("SELECT * FROM nota_actividad")
        rows = c.fetchall()

    with new.cursor() as c:
        for r in rows:
            sql = """
                INSERT INTO nota_actividad 
                    (nota_activida_id, id_actividad, id_estudiante, calificacion, fecha_calificada, estado, created_at, updated_at)
                VALUES (%(id)s, %(act)s, %(estu)s, %(nota)s, %(fecha)s, %(est)s, %(ts)s, %(ts)s)
                ON DUPLICATE KEY UPDATE calificacion=%(nota)s, updated_at=%(ts)s
            """
            params = {
                "id": r["nota_activida_id"],
                "act": r["id_actividad"],
                "estu": r["id_estudiante"],
                "nota": r["calificacion"],
                "fecha": r["fecha_calificada"],
                "est": r["estado"] or "1",
                "ts": NOW
            }
            if not dry_run:
                try:
                    c.execute(sql, params)
                except Exception as e:
                    log.err(f"  Error en nota_activida_id {r['nota_activida_id']}: {e}")

    if not dry_run: new.commit()
    log.ok(f"  {len(rows)} registros procesados en nota_actividad")


def _migrate_nota_actividad_estudiante(old, new, dry_run: bool):
    log.info("Migrando nota_actividad_estudiante...")
    with old.cursor() as c:
        c.execute("SELECT * FROM nota_actividad_estudiante")
        rows = c.fetchall()

    with new.cursor() as c:
        for r in rows:
            sql = """
                INSERT INTO nota_actividad_estudiante 
                    (id, estu_id, actividad_id, nota, created_at, updated_at)
                VALUES (%(id)s, %(estu)s, %(act)s, %(nota)s, %(ts)s, %(ts)s)
                ON DUPLICATE KEY UPDATE nota=%(nota)s, updated_at=%(ts)s
            """
            params = {
                "id": r["nota_actividad_id"],
                "estu": r["id_estudiante"],
                "act": r["id_actividad"],
                "nota": r["nota"],
                "ts": NOW
            }
            if not dry_run:
                try:
                    c.execute(sql, params)
                except Exception as e:
                    log.err(f"  Error en nota_actividad_id {r['nota_actividad_id']}: {e}")

    if not dry_run: new.commit()
    log.ok(f"  {len(rows)} registros procesados en nota_actividad_estudiante")


def _migrate_nota_unidad(old, new, dry_run: bool):
    log.info("Migrando nota_unidad...")
    with old.cursor() as c:
        c.execute("SELECT * FROM nota_unidad")
        rows = c.fetchall()

    with new.cursor() as c:
        for r in rows:
            sql = """
                INSERT INTO nota_unidad 
                    (id, estu_id, unidad_id, nota_final, estado, created_at, updated_at)
                VALUES (%(id)s, %(estu)s, %(unid)s, %(nota)s, %(est)s, %(ts)s, %(ts)s)
                ON DUPLICATE KEY UPDATE nota_final=%(nota)s, updated_at=%(ts)s
            """
            params = {
                "id": r["nota_unidad_id"],
                "estu": r["id_nota_estudiante"], # Segun DESCRIBE legacy
                "unid": r["id_unidad"],
                "nota": r["promedio_unidad"],
                "est": r["estado"] or "1",
                "ts": NOW
            }
            if not dry_run:
                try:
                    c.execute(sql, params)
                except Exception as e:
                    log.err(f"  Error en nota_unidad_id {r['nota_unidad_id']}: {e}")

    if not dry_run: new.commit()
    log.ok(f"  {len(rows)} registros procesados en nota_unidad")


def _migrate_notas_estudiante(old, new, dry_run: bool):
    log.info("Migrando notas_estudiante (Promedio final)...")
    with old.cursor() as c:
        c.execute("SELECT * FROM notas_estudiante")
        rows = c.fetchall()

    with new.cursor() as c:
        for r in rows:
            sql = """
                INSERT INTO notas_estudiante 
                    (id, estu_id, curso_id, año_lectivo, promedio_final, created_at, updated_at)
                VALUES (%(id)s, %(estu)s, %(cur)s, %(anio)s, %(nota)s, %(ts)s, %(ts)s)
                ON DUPLICATE KEY UPDATE promedio_final=%(nota)s, updated_at=%(ts)s
            """
            params = {
                "id": r["nota_id"],
                "estu": r["id_estudiante"],
                "cur": r["id_curso"],
                "anio": r["anio"],
                "nota": r["promedio_final"],
                "ts": NOW
            }
            if not dry_run:
                try:
                    c.execute(sql, params)
                except Exception as e:
                    log.err(f"  Error en nota_id {r['nota_id']}: {e}")

    if not dry_run: new.commit()
    log.ok(f"  {len(rows)} registros procesados en notas_estudiante")
