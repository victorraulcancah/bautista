# -*- coding: utf-8 -*-
from config import log, NOW

def migrate_payments_catalog(old, new, dry_run: bool):
    """
    Migra institucion_pagosm, metodo_pago, fechas_pagos.
    """
    log.head("PAY 2.0 Catálogo de Pagos")

    _migrate_institucion_pagosm(old, new, dry_run)
    _migrate_metodo_pago(old, new, dry_run)
    _migrate_fechas_pagos(old, new, dry_run)


def _migrate_institucion_pagosm(old, new, dry_run: bool):
    log.info("Migrando institucion_pagosm (Catálogo de pensiones)...")
    with old.cursor() as c:
        c.execute("SELECT * FROM institucion_pagosm")
        rows = c.fetchall()

    with new.cursor() as c:
        for r in rows:
            sql = """
                INSERT INTO institucion_pagosm 
                    (pag_id, insti_id, pag_descripcion, pag_monto, pag_fecha, pag_estatus, created_at, updated_at)
                VALUES (%(id)s, %(inst)s, %(desc)s, %(monto)s, %(fecha)s, %(est)s, %(ts)s, %(ts)s)
                ON DUPLICATE KEY UPDATE pag_descripcion=%(desc)s, updated_at=%(ts)s
            """
            params = {
                "id": r["pag_id"],
                "inst": r["insti_id"],
                "desc": r["pag_descripcion"],
                "monto": r["pag_monto"],
                "fecha": r["pag_fecha"],
                "est": r["pag_estatus"],
                "ts": NOW
            }
            if not dry_run:
                try:
                    c.execute(sql, params)
                except Exception as e:
                    log.err(f"  Error en pag_id {r['pag_id']}: {e}")

    if not dry_run: new.commit()
    log.ok(f"  {len(rows)} registros procesados")


def _migrate_metodo_pago(old, new, dry_run: bool):
    log.info("Migrando metodo_pago...")
    with old.cursor() as c:
        c.execute("SELECT * FROM metodo_pago")
        rows = c.fetchall()

    with new.cursor() as c:
        for r in rows:
            sql = """
                INSERT INTO metodo_pago 
                    (id_metodo_pago, nombre, estado, created_at, updated_at)
                VALUES (%(id)s, %(nombre)s, %(est)s, %(ts)s, %(ts)s)
                ON DUPLICATE KEY UPDATE nombre=%(nombre)s, updated_at=%(ts)s
            """
            params = {
                "id": r["id_metodo_pago"],
                "nombre": r["nombre"],
                "est": r["estado"] or "1",
                "ts": NOW
            }
            if not dry_run:
                try:
                    c.execute(sql, params)
                except Exception as e:
                    log.err(f"  Error en id_metodo_pago {r['id_metodo_pago']}: {e}")

    if not dry_run: new.commit()
    log.ok(f"  {len(rows)} registros procesados")


def _migrate_fechas_pagos(old, new, dry_run: bool):
    log.info("Migrando fechas_pagos (Vencimientos)...")
    with old.cursor() as c:
        c.execute("SELECT * FROM fechas_pagos")
        rows = c.fetchall()

    with new.cursor() as c:
        for r in rows:
            sql = """
                INSERT INTO fechas_pagos 
                    (fechapago_id, id_pago, fecha_final, monto, id_moneda, estado, created_at, updated_at)
                VALUES (%(id)s, %(pago)s, %(fecha)s, %(monto)s, %(mon)s, %(est)s, %(ts)s, %(ts)s)
                ON DUPLICATE KEY UPDATE fecha_final=%(fecha)s, updated_at=%(ts)s
            """
            params = {
                "id": r["fechapago_id"],
                "pago": r["id_pago"],
                "fecha": r["fecha_final"],
                "monto": r["monto"],
                "mon": r["id_moneda"],
                "est": r["estado"],
                "ts": NOW
            }
            if not dry_run:
                try:
                    c.execute(sql, params)
                except Exception as e:
                    log.err(f"  Error en fechapago_id {r['fechapago_id']}: {e}")

    if not dry_run: new.commit()
    log.ok(f"  {len(rows)} registros procesados")
