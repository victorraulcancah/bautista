# -*- coding: utf-8 -*-
# Migra tablas complementarias:
#   historial_usuario  → login_histories
#   mis_medios         → mis_medios
#   institucion_blog   → institucion_blog
#   grados_cursos      → grados_cursos
from config import log, NOW


def migrate_historial(old, new, user_id_map: dict, dry_run: bool):
    log.head("CPL 1/4  historial_usuario → login_histories")
    with old.cursor() as c:
        c.execute("SELECT * FROM historial_usuario ORDER BY historial_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} registros encontrados")

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            new_user_id = user_id_map.get(r.get("id_usuario"))
            if not new_user_id:
                log.err(f"  historial_id={r['historial_id']}: id_usuario={r.get('id_usuario')} no mapeado → omitido")
                errors += 1
                continue
            fecha = r.get("fecha") or NOW
            if not dry_run:
                c.execute(
                    """INSERT INTO login_histories
                        (user_id, ip_address, device, isp, tipo, created_at)
                       VALUES (%s,%s,%s,%s,%s,%s)""",
                    (new_user_id, r.get("ip_user"), r.get("device"),
                     r.get("isp"), r.get("tipo"), fecha),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Errores: {errors}")


def migrate_mis_medios(old, new, user_id_map: dict, dry_run: bool):
    log.head("CPL 2/4  mis_medios")
    with old.cursor() as c:
        c.execute("SELECT * FROM mis_medios ORDER BY id_medio")
        rows = c.fetchall()
    log.info(f"{len(rows)} medios encontrados")

    with new.cursor() as c:
        c.execute("SELECT id_medio FROM mis_medios")
        existing = {r["id_medio"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["id_medio"] in existing:
                skipped += 1
                continue
            new_user_id = user_id_map.get(r.get("usuario"))
            if not new_user_id:
                log.err(f"  id_medio={r['id_medio']}: usuario={r.get('usuario')} no mapeado → omitido")
                errors += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO mis_medios
                        (id_medio, user_id, nombre, tipo, ruta, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                    (r["id_medio"], new_user_id, r.get("nombre"),
                     r.get("tipo"), r.get("ruta"), NOW, NOW),
                )
            log.ok(f"  id_medio={r['id_medio']}  {r.get('nombre')}")
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")


def migrate_institucion_blog(old, new, user_id_map: dict, dry_run: bool):
    log.head("CPL 3/4  institucion_blog")
    with old.cursor() as c:
        c.execute("SELECT * FROM institucion_blog ORDER BY blo_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} entradas de blog encontradas")

    with new.cursor() as c:
        c.execute("SELECT blo_id FROM institucion_blog")
        existing = {r["blo_id"] for r in c.fetchall()}

    ins = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["blo_id"] in existing:
                skipped += 1
                continue
            new_user_id = user_id_map.get(r.get("usuario_id"))
            if not dry_run:
                c.execute(
                    """INSERT INTO institucion_blog
                        (blo_id, blo_titulo, blo_contenido, blo_imagen,
                         blo_fecha, insti_id, usuario_id, blo_estatus,
                         created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (r["blo_id"], r.get("blo_titulo"), r.get("blo_contenido"),
                     r.get("blo_imagen"), r.get("blo_fecha"), r.get("insti_id"),
                     new_user_id, r.get("blo_estatus"), NOW, NOW),
                )
            log.ok(f"  blo_id={r['blo_id']}  {str(r.get('blo_titulo',''))[:50]}")
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}")


def migrate_grados_cursos(old, new, dry_run: bool):
    log.head("CPL 4/4  grados_cursos")
    with old.cursor() as c:
        c.execute("SELECT * FROM grados_cursos ORDER BY grac_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} relaciones grado-curso encontradas")

    with new.cursor() as c:
        c.execute("SELECT grado_id FROM grados")
        valid_grados = {r["grado_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT curso_id FROM cursos")
        valid_cursos = {r["curso_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT grac_id FROM grados_cursos")
        existing = {r["grac_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["grac_id"] in existing:
                skipped += 1
                continue
            id_grado = r.get("id_grado")
            id_curso = r.get("id_curso")
            if id_grado and id_grado not in valid_grados:
                log.err(f"  grac_id={r['grac_id']}: id_grado={id_grado} no existe → omitido")
                errors += 1
                continue
            if id_curso and id_curso not in valid_cursos:
                log.err(f"  grac_id={r['grac_id']}: id_curso={id_curso} no existe → omitido")
                errors += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO grados_cursos
                        (grac_id, id_grado, id_curso, grac_estado, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s)""",
                    (r["grac_id"], id_grado, id_curso, r.get("grac_estado"), NOW, NOW),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")


def migrate_complementos(old, new, user_id_map: dict, dry_run: bool):
    migrate_historial(old, new, user_id_map, dry_run)
    migrate_mis_medios(old, new, user_id_map, dry_run)
    migrate_institucion_blog(old, new, user_id_map, dry_run)
    migrate_grados_cursos(old, new, dry_run)
