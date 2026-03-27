# -*- coding: utf-8 -*-
from config import log, NOW

def migrate_pagos(old, new, dry_run: bool):
    log.head("C/3  pagos_notifica → pagos")

    with old.cursor() as c:
        c.execute("SELECT * FROM pagos_notifica ORDER BY pag_id")
        rows = c.fetchall()

    log.info(f"{len(rows)} pagos encontrados")

    with new.cursor() as c:
        c.execute("SELECT pag_id FROM pagos")
        existing = {r["pag_id"] for r in c.fetchall()}

    with old.cursor() as c:
        c.execute("SELECT id_usuario, id_contacto, es_pagador FROM padre_apoderado WHERE id_usuario IS NOT NULL")
        padre_rows = c.fetchall()

    usuario_to_contacto = {}
    for p in padre_rows:
        uid = p["id_usuario"]
        if uid not in usuario_to_contacto or str(p.get("es_pagador", "")) == "1":
            usuario_to_contacto[uid] = p["id_contacto"]

    with new.cursor() as c:
        c.execute("SELECT id_contacto, insti_id FROM padre_apoderado")
        contacto_insti = {r["id_contacto"]: r["insti_id"] for r in c.fetchall()}

    inserted = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["pag_id"] in existing:
                skipped += 1
                continue

            contacto_id = usuario_to_contacto.get(r.get("id_usuario"))
            if not contacto_id:
                log.err(f"  pag_id={r['pag_id']}: id_usuario={r.get('id_usuario')} no tiene padre_apoderado → contacto_id=NULL")

            insti_id = contacto_insti.get(contacto_id) if contacto_id else None

            pag_fecha_raw = r.get("pag_fecha")
            pag_fecha = None
            if pag_fecha_raw:
                try:
                    pag_fecha = str(pag_fecha_raw)[:10]
                except Exception:
                    pag_fecha = None

            estatus = 1 if str(r.get("estatus", "0")).strip() == "1" else 0

            sql = """
                INSERT INTO pagos
                    (pag_id, insti_id, estudiante_id, contacto_id,
                     pag_anual, pag_mes, pag_monto,
                     pag_nombre1, pag_otro1, pag_nombre2, pag_otro2,
                     total, pag_notifica, pag_fecha, estatus,
                     created_at, updated_at)
                VALUES
                    (%(pag_id)s, %(insti_id)s, %(estudiante_id)s, %(contacto_id)s,
                     %(pag_anual)s, %(pag_mes)s, %(pag_monto)s,
                     %(pag_nombre1)s, %(pag_otro1)s, %(pag_nombre2)s, %(pag_otro2)s,
                     %(total)s, %(pag_notifica)s, %(pag_fecha)s, %(estatus)s,
                     %(ts)s, %(ts)s)
            """
            params = {
                "pag_id":       r["pag_id"],
                "insti_id":     insti_id,
                "estudiante_id":r.get("id_estudiante"),
                "contacto_id":  contacto_id,
                "pag_anual":    r.get("pag_anual"),
                "pag_mes":      r.get("pag_mes"),
                "pag_monto":    r.get("pag_monto") or 0,
                "pag_nombre1":  r.get("pag_nombre1"),
                "pag_otro1":    r.get("pag_otro1") or 0,
                "pag_nombre2":  r.get("pag_nombre2"),
                "pag_otro2":    r.get("pag_otro2") or 0,
                "total":        r.get("total") or 0,
                "pag_notifica": r.get("pag_notifica") or "NO",
                "pag_fecha":    pag_fecha,
                "estatus":      estatus,
                "ts":           NOW,
            }

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  pag_id={r['pag_id']}  año={r.get('pag_anual')}  mes={r.get('pag_mes')}  estatus={estatus}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")
