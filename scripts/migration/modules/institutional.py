# -*- coding: utf-8 -*-
from config import log, NOW

def migrate_noticias(old, new, dry_run: bool):
    log.head("10/10  institucion_noticias")

    with old.cursor() as c:
        c.execute("SELECT * FROM institucion_noticias WHERE not_estatus = '1'")
        rows = c.fetchall()

    log.info(f"{len(rows)} noticias encontradas en el sistema antiguo")

    with new.cursor() as c:
        c.execute("SELECT not_id FROM institucion_noticias")
        existing = {r["not_id"] for r in c.fetchall()}

    inserted = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["not_id"] in existing:
                log.skip(f"  not_id={r['not_id']} ya existe → omitido")
                skipped += 1
                continue

            sql = """
                INSERT INTO institucion_noticias
                    (not_id, insti_id, not_titulo, not_mensaje,
                     not_imagen, not_fecha, not_estatus, created_at, updated_at)
                VALUES
                    (%(not_id)s, %(insti_id)s, %(not_titulo)s, %(not_mensaje)s,
                     %(not_imagen)s, %(not_fecha)s, %(not_estatus)s, %(ts)s, %(ts)s)
            """
            params = {
                "not_id":      r["not_id"],
                "insti_id":    r.get("insti_id"),
                "not_titulo":  r.get("not_titulo"),
                "not_mensaje": r.get("not_mensaje"),
                "not_imagen":  r.get("not_imagen") or None,
                "not_fecha":   r.get("not_fecha"),
                "not_estatus": 1,
                "ts":          NOW,
            }

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  not_id={r['not_id']}  {r.get('not_titulo', '')[:50]}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")
    if inserted > 0:
        log.info("NOTA: Las imágenes de noticias están en bautistalapascana/images/Noticia/")
        log.info("      Cópialas a storage/app/public/noticias/ manualmente.")


def migrate_galeria(old, new, dry_run: bool):
    log.head("10/10  institucion_galeria")

    with old.cursor() as c:
        c.execute("SELECT * FROM institucion_galeria")
        rows = c.fetchall()

    log.info(f"{len(rows)} fotos encontradas en el sistema antiguo")

    with new.cursor() as c:
        c.execute("SELECT gal_id FROM institucion_galeria")
        existing = {r["gal_id"] for r in c.fetchall()}

    inserted = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["gal_id"] in existing:
                log.skip(f"  gal_id={r['gal_id']} ya existe → omitido")
                skipped += 1
                continue

            sql = """
                INSERT INTO institucion_galeria
                    (gal_id, insti_id, gal_nombre, gal_posicion,
                     gal_estatus, created_at, updated_at)
                VALUES
                    (%(gal_id)s, %(insti_id)s, %(gal_nombre)s,
                     %(gal_posicion)s, %(gal_estatus)s, %(ts)s, %(ts)s)
            """
            params = {
                "gal_id":       r["gal_id"],
                "insti_id":     r.get("insti_id"),
                "gal_nombre":   r.get("gal_nombre"),
                "gal_posicion": r.get("gal_posicion") or 0,
                "gal_estatus":  1,
                "ts":           NOW,
            }

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  gal_id={r['gal_id']}  posicion={r.get('gal_posicion')}  nombre={r.get('gal_nombre')}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")
    if inserted > 0:
        log.info("NOTA: Los archivos de imagen no existen en el sistema antiguo.")
        log.info("      Sube las imágenes manualmente desde /institucion/galeria.")
