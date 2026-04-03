# -*- coding: utf-8 -*-
from config import log, NOW


def migrate_ubigeo(old, new, dry_run: bool):
    # ── 1. dir_departamento ────────────────────────────────────────────────────
    log.head("UBI 1/3  dir_departamento")
    with old.cursor() as c:
        c.execute("SELECT * FROM dir_departamento ORDER BY dep_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} departamentos encontrados")
    with new.cursor() as c:
        c.execute("SELECT dep_id FROM dir_departamento")
        existing = {r["dep_id"] for r in c.fetchall()}
    ins = 0
    with new.cursor() as c:
        for r in rows:
            if r["dep_id"] in existing:
                continue
            if not dry_run:
                c.execute(
                    "INSERT INTO dir_departamento (dep_id, dep_nombre, dep_cod, created_at, updated_at) VALUES (%s,%s,%s,%s,%s)",
                    (r["dep_id"], r.get("dep_nombre"), r.get("dep_cod"), NOW, NOW),
                )
            log.ok(f"  dep_id={r['dep_id']}  {r.get('dep_nombre')}")
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}")

    # ── 2. dir_provincia ───────────────────────────────────────────────────────
    log.head("UBI 2/3  dir_provincia")
    with old.cursor() as c:
        c.execute("SELECT * FROM dir_provincia ORDER BY pro_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} provincias encontradas")
    with new.cursor() as c:
        c.execute("SELECT pro_id FROM dir_provincia")
        existing = {r["pro_id"] for r in c.fetchall()}
    ins = 0
    with new.cursor() as c:
        for r in rows:
            if r["pro_id"] in existing:
                continue
            if not dry_run:
                c.execute(
                    "INSERT INTO dir_provincia (pro_id, pro_nombre, dep_codigo, pro_cod, created_at, updated_at) VALUES (%s,%s,%s,%s,%s,%s)",
                    (r["pro_id"], r.get("pro_nombre"), r.get("dep_codigo"), r.get("pro_cod"), NOW, NOW),
                )
            log.ok(f"  pro_id={r['pro_id']}  {r.get('pro_nombre')}")
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}")

    # ── 3. dir_distrito ────────────────────────────────────────────────────────
    log.head("UBI 3/3  dir_distrito")
    with old.cursor() as c:
        c.execute("SELECT * FROM dir_distrito ORDER BY dis_id")
        rows = c.fetchall()
    log.info(f"{len(rows)} distritos encontrados")
    with new.cursor() as c:
        c.execute("SELECT dis_id FROM dir_distrito")
        existing = {r["dis_id"] for r in c.fetchall()}
    ins = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["dis_id"] in existing:
                skipped += 1
                continue
            if not dry_run:
                c.execute(
                    "INSERT INTO dir_distrito (dis_id, dis_nombre, dis_codigo, pro_codigo, dep_codigo, created_at, updated_at) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                    (r["dis_id"], r.get("dis_nombre"), r.get("dis_codigo"), r.get("pro_codigo"), r.get("dep_codigo"), NOW, NOW),
                )
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}")
