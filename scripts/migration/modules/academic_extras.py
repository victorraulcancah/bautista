# -*- coding: utf-8 -*-
from config import log, NOW

def migrate_academic_extras(old, new, user_id_map: dict, dry_run: bool):
    """
    Migra hijos_matriculados, contenido_escrito, recuperacion_usuario, asistencia.
    """
    log.head("ACAD 9.0 Complementos Académicos Extra")

    _migrate_hijos_matriculados(old, new, dry_run)
    _migrate_contenido_escrito(old, new, dry_run)
    _migrate_recuperacion_usuario(old, new, user_id_map, dry_run)
    _migrate_asistencia_legacy(old, new, dry_run)


def _migrate_hijos_matriculados(old, new, dry_run: bool):
    log.info("Migrando hijos_matriculados (Vínculos Padre-Hijo)...")
    with old.cursor() as c:
        c.execute("SELECT * FROM hijos_matriculados")
        rows = c.fetchall()

    with new.cursor() as c:
        for r in rows:
            sql = """
                INSERT INTO hijos_matriculados 
                    (hijos_matri_id, id_matricula_padres, id_alumno, nivel_academico, grado_academico, seccion_academico, created_at, updated_at)
                VALUES (%(id)s, %(mat)s, %(alum)s, %(niv)s, %(gra)s, %(sec)s, %(ts)s, %(ts)s)
                ON DUPLICATE KEY UPDATE updated_at=%(ts)s
            """
            params = {
                "id": r["hijos_matri_id"],
                "mat": r["id_matricula_padres"],
                "alum": r["id_alumno"],
                "niv": r["nivel_academico"],
                "gra": r["grado_academico"],
                "sec": r["seccion_academico"],
                "ts": NOW
            }
            if not dry_run:
                try:
                    c.execute(sql, params)
                except Exception as e:
                    log.err(f"  Error en hijos_matri_id {r['hijos_matri_id']}: {e}")

    if not dry_run: new.commit()
    log.ok(f"  {len(rows)} registros procesados")


def _migrate_contenido_escrito(old, new, dry_run: bool):
    log.info("Migrando contenido_escrito (Respuestas largas)...")
    with old.cursor() as c:
        c.execute("SELECT * FROM contenido_escrito")
        rows = c.fetchall()

    with new.cursor() as c:
        for r in rows:
            sql = """
                INSERT INTO contenido_escrito 
                    (contenido_id, id_pregunta, respuesta, created_at, updated_at)
                VALUES (%(id)s, %(preg)s, %(resp)s, %(ts)s, %(ts)s)
                ON DUPLICATE KEY UPDATE respuesta=%(resp)s, updated_at=%(ts)s
            """
            params = {
                "id": r["contenido_id"],
                "preg": r["id_pregunta"],
                "resp": r["respuesta"],
                "ts": NOW
            }
            if not dry_run:
                try:
                    c.execute(sql, params)
                except Exception as e:
                    log.err(f"  Error en contenido_id {r['contenido_id']}: {e}")

    if not dry_run: new.commit()
    log.ok(f"  {len(rows)} registros procesados")


def _migrate_recuperacion_usuario(old, new, user_id_map: dict, dry_run: bool):
    log.info("Migrando recuperacion_usuario (Tokens)...")
    with old.cursor() as c:
        c.execute("SELECT * FROM recuperacion_usuario")
        rows = c.fetchall()

    with new.cursor() as c:
        for r in rows:
            new_user_id = user_id_map.get(r["id_usuario"])
            if not new_user_id: continue
            
            sql = """
                INSERT INTO recuperacion_usuario 
                    (id_recuperacion, id_usuario, token, created_at, updated_at)
                VALUES (%(id)s, %(user)s, %(token)s, %(ts)s, %(ts)s)
                ON DUPLICATE KEY UPDATE token=%(token)s, updated_at=%(ts)s
            """
            params = {
                "id": r["id_recuperacion"],
                "user": new_user_id,
                "token": r["token"],
                "ts": NOW
            }
            if not dry_run:
                try:
                    c.execute(sql, params)
                except Exception as e:
                    log.err(f"  Error en id_recuperacion {r['id_recuperacion']}: {e}")

    if not dry_run: new.commit()
    log.ok(f"  {len(rows)} registros procesados")


def _migrate_asistencia_legacy(old, new, dry_run: bool):
    log.info("Migrando asistencia (Legacy General)...")
    with old.cursor() as c:
        c.execute("SELECT * FROM asistencia")
        rows = c.fetchall()

    with new.cursor() as c:
        for r in rows:
            sql = """
                INSERT INTO asistencia 
                    (id_asistencia, id_estudiante, tipo, fecha, estado, created_at, updated_at)
                VALUES (%(id)s, %(estu)s, %(tipo)s, %(fecha)s, %(est)s, %(ts)s, %(ts)s)
                ON DUPLICATE KEY UPDATE updated_at=%(ts)s
            """
            params = {
                "id": r["id_asistencia"],
                "estu": r["id_estudiante"],
                "tipo": r["tipo"],
                "fecha": r["fecha"],
                "est": r["estado"],
                "ts": NOW
            }
            if not dry_run:
                try:
                    c.execute(sql, params)
                except Exception as e:
                    log.err(f"  Error en id_asistencia {r['id_asistencia']}: {e}")

    if not dry_run: new.commit()
    log.ok(f"  {len(rows)} registros procesados en asistencia")
