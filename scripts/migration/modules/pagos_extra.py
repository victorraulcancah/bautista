# -*- coding: utf-8 -*-
from config import log, NOW


def migrate_pagos_extra(old, new, dry_run: bool):
    # ── 1. pagos_matricula ─────────────────────────────────────────────────────
    log.head("PAG 1/3  pagos_matricula")
    with old.cursor() as c:
        c.execute("SELECT * FROM pagos_matricula ORDER BY pago_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} pagos_matricula encontrados")

    # Validar matriculas existentes en nuevo sistema
    with new.cursor() as c:
        c.execute("SELECT matricula_id FROM matriculas")
        valid_matriculas = {r["matricula_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT pago_id FROM pagos_matricula")
        existing = {r["pago_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["pago_id"] in existing:
                skipped += 1
                continue
            id_matricula = r.get("id_matricula")
            if id_matricula and id_matricula not in valid_matriculas:
                log.err(f"  pago_id={r['pago_id']}: id_matricula={id_matricula} no existe → omitido")
                errors += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO pagos_matricula
                        (pago_id, id_matricula, monto, mora_total, decuento, porcentaje_mora, fecha, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (r["pago_id"], id_matricula, r.get("monto"), r.get("mora_total"),
                     r.get("decuento"), r.get("porcentaje_mora"), r.get("fecha"), NOW, NOW),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")

    # ── 2. fechas_pagos ────────────────────────────────────────────────────────
    log.head("PAG 2/3  fechas_pagos")
    with old.cursor() as c:
        c.execute("SELECT * FROM fechas_pagos ORDER BY fechapago_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} fechas_pagos encontradas")

    with new.cursor() as c:
        c.execute("SELECT pago_id FROM pagos_matricula")
        valid_pagos = {r["pago_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT fechapago_id FROM fechas_pagos")
        existing = {r["fechapago_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["fechapago_id"] in existing:
                skipped += 1
                continue
            id_pago = r.get("id_pago")
            if id_pago and id_pago not in valid_pagos:
                log.err(f"  fechapago_id={r['fechapago_id']}: id_pago={id_pago} no existe → omitido")
                errors += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO fechas_pagos
                        (fechapago_id, id_pago, fecha_final, monto, id_moneda, estado, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (r["fechapago_id"], id_pago, r.get("fecha_final"), r.get("monto"),
                     r.get("id_moneda"), r.get("estado"), NOW, NOW),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")

    # ── 3. pagos_extras ────────────────────────────────────────────────────────
    log.head("PAG 3/3  pagos_extras")
    with old.cursor() as c:
        c.execute("SELECT * FROM pagos_extras ORDER BY pagoextra_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} pagos_extras encontrados")

    with new.cursor() as c:
        c.execute("SELECT fechapago_id FROM fechas_pagos")
        valid_fechas = {r["fechapago_id"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT pagoextra_id FROM pagos_extras")
        existing = {r["pagoextra_id"] for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["pagoextra_id"] in existing:
                skipped += 1
                continue
            id_fech_pago = r.get("id_fech_pago")
            if id_fech_pago and id_fech_pago not in valid_fechas:
                log.err(f"  pagoextra_id={r['pagoextra_id']}: id_fech_pago={id_fech_pago} no existe → omitido")
                errors += 1
                continue
            if not dry_run:
                c.execute(
                    """INSERT INTO pagos_extras
                        (pagoextra_id, id_fech_pago, monto, fecha, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,%s,%s)""",
                    (r["pagoextra_id"], id_fech_pago, r.get("monto"), r.get("fecha"), NOW, NOW),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")
