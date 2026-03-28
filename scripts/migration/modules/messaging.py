# -*- coding: utf-8 -*-
from config import log, NOW

def _build_username_map(old, new) -> dict:
    with new.cursor() as c:
        c.execute("SELECT id, username FROM users")
        return {r["username"]: r["id"] for r in c.fetchall()}


def _build_estu_user_map(new) -> dict:
    with new.cursor() as c:
        c.execute("SELECT estu_id, user_id FROM estudiantes")
        return {r["estu_id"]: r["user_id"] for r in c.fetchall()}


def migrate_mensajeria_grupos(old, new, user_id_map: dict, dry_run: bool) -> dict:
    log.head("11/14  mensajeria_grupo → mensajeria_grupos")

    with old.cursor() as c:
        c.execute("SELECT * FROM mensajeria_grupo")
        rows = c.fetchall()

    log.info(f"{len(rows)} grupos encontrados")

    with new.cursor() as c:
        c.execute("SELECT id FROM mensajeria_grupos")
        existing = {r["id"] for r in c.fetchall()}

    with new.cursor() as c:
        c.execute("SELECT id, insti_id FROM users")
        user_insti = {r["id"]: r["insti_id"] for r in c.fetchall()}

    grupo_id_map = {}
    inserted = skipped = errors = 0

    with new.cursor() as c:
        for r in rows:
            if r["id"] in existing:
                grupo_id_map[r["id"]] = r["id"]
                skipped += 1
                continue

            new_docente_id = user_id_map.get(r.get("docente_id"))
            if not new_docente_id:
                log.err(f"  grupo id={r['id']}: docente_id={r.get('docente_id')} no encontrado → omitido")
                errors += 1
                continue

            insti_id = user_insti.get(new_docente_id)

            sql = """
                INSERT INTO mensajeria_grupos (id, insti_id, nombre, docente_id, created_at, updated_at)
                VALUES (%(id)s, %(insti_id)s, %(nombre)s, %(docente_id)s, %(ts)s, %(ts)s)
            """
            params = {
                "id":         r["id"],
                "insti_id":   insti_id,
                "nombre":     r.get("nombre"),
                "docente_id": new_docente_id,
                "ts":         NOW,
            }

            if not dry_run:
                c.execute(sql, params)
            grupo_id_map[r["id"]] = r["id"]
            log.ok(f"  grupo id={r['id']} → {r.get('nombre')}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")
    return grupo_id_map


def migrate_mensajeria_grupo_miembros(old, new, estu_user_map: dict, dry_run: bool):
    log.head("12/14  mensajeria_grupo_alumno → mensajeria_grupo_miembros")

    with old.cursor() as c:
        c.execute("SELECT * FROM mensajeria_grupo_alumno")
        rows = c.fetchall()

    log.info(f"{len(rows)} miembros encontrados")

    with new.cursor() as c:
        c.execute("SELECT grupo_id, user_id FROM mensajeria_grupo_miembros")
        existing = {(r["grupo_id"], r["user_id"]) for r in c.fetchall()}

    inserted = skipped = errors = 0

    with new.cursor() as c:
        for r in rows:
            new_user_id = estu_user_map.get(r.get("alumno_id"))
            if not new_user_id:
                log.err(f"  alumno_id={r.get('alumno_id')} no encontrado en estudiantes → omitido")
                errors += 1
                continue

            key = (r["grupo_id"], new_user_id)
            if key in existing:
                skipped += 1
                continue

            if not dry_run:
                c.execute(
                    "INSERT IGNORE INTO mensajeria_grupo_miembros (grupo_id, user_id) VALUES (%s, %s)",
                    (r["grupo_id"], new_user_id),
                )
            log.ok(f"  grupo_id={r['grupo_id']} user_id={new_user_id}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")


def migrate_mensajes(old, new, user_id_map: dict, username_map: dict, dry_run: bool) -> dict:
    log.head("13/14  mensaje_usuarion → mensajes")

    with old.cursor() as c:
        c.execute("SELECT * FROM mensaje_usuarion ORDER BY mensaje_id")
        rows = c.fetchall()

    log.info(f"{len(rows)} mensajes encontrados")

    with new.cursor() as c:
        c.execute("SELECT id FROM mensajes")
        existing = {r["id"] for r in c.fetchall()}

    with new.cursor() as c:
        c.execute("SELECT id, insti_id FROM users")
        user_insti = {r["id"]: r["insti_id"] for r in c.fetchall()}

    mensaje_id_map = {}
    inserted = skipped = errors = 0

    with new.cursor() as c:
        for r in rows:
            if r["mensaje_id"] in existing:
                mensaje_id_map[r["mensaje_id"]] = r["mensaje_id"]
                skipped += 1
                continue

            remitente_id = user_id_map.get(r.get("remitente"))
            if not remitente_id:
                log.err(f"  mensaje_id={r['mensaje_id']}: remitente={r.get('remitente')} no encontrado en users → omitido")
                errors += 1
                continue

            es_grupo = int(r.get("es_grupo") or 0)
            destinatario_id = None
            grupo_id        = None

            if es_grupo:
                grupo_id = r.get("id_usuario")
            else:
                destinatario_id = user_id_map.get(r.get("id_usuario"))
                if not destinatario_id:
                    log.err(f"  mensaje_id={r['mensaje_id']}: destinatario={r.get('id_usuario')} no encontrado en users → omitido")
                    errors += 1
                    continue

            insti_id = user_insti.get(remitente_id)
            leido    = 1 if str(r.get("estado", "0")) == "1" else 0
            fecha    = r.get("fecha") or NOW

            sql = """
                INSERT INTO mensajes
                    (id, insti_id, remitente_id, destinatario_id, grupo_id,
                     asunto, cuerpo, leido, created_at, updated_at)
                VALUES
                    (%(id)s, %(insti_id)s, %(remitente_id)s, %(destinatario_id)s,
                     %(grupo_id)s, %(asunto)s, %(cuerpo)s, %(leido)s, %(ts)s, %(ts)s)
            """
            params = {
                "id":             r["mensaje_id"],
                "insti_id":       insti_id,
                "remitente_id":   remitente_id,
                "destinatario_id":destinatario_id,
                "grupo_id":       grupo_id,
                "asunto":         r.get("asunto") or "(sin asunto)",
                "cuerpo":         r.get("mensaje") or "",
                "leido":          leido,
                "ts":             fecha,
            }

            if not dry_run:
                c.execute(sql, params)
                new_id = c.lastrowid if r["mensaje_id"] not in existing else r["mensaje_id"]
            else:
                new_id = r["mensaje_id"]

            mensaje_id_map[r["mensaje_id"]] = r["mensaje_id"]
            log.ok(f"  mensaje_id={r['mensaje_id']} asunto='{str(r.get('asunto',''))[:40]}'")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")
    return mensaje_id_map


def migrate_mensajes_respuestas(old, new, user_id_map: dict, dry_run: bool):
    log.head("14/14  mensajeria_respuestas → mensajes_respuestas")

    with old.cursor() as c:
        try:
            c.execute("SELECT * FROM mensajeria_respuestas ORDER BY id")
            rows = c.fetchall()
        except Exception as e:
            log.err(f"  No se pudo leer mensajeria_respuestas: {e} → omitida")
            return

    log.info(f"{len(rows)} respuestas encontradas")

    with new.cursor() as c:
        c.execute("SELECT id FROM mensajes_respuestas")
        existing = {r["id"] for r in c.fetchall()}

    with new.cursor() as c:
        c.execute("SELECT id FROM mensajes")
        mensajes_new = {r["id"] for r in c.fetchall()}

    inserted = skipped = errors = 0

    with new.cursor() as c:
        for r in rows:
            if r["id"] in existing:
                skipped += 1
                continue

            user_id = user_id_map.get(r.get("id_usuario"))
            if not user_id:
                log.err(f"  resp id={r['id']}: id_usuario={r.get('id_usuario')} no encontrado en users → omitido")
                errors += 1
                continue

            msg_id = r.get("id_mensaje")
            if msg_id not in mensajes_new:
                log.err(f"  resp id={r['id']}: id_mensaje={msg_id} no existe en mensajes → omitido")
                errors += 1
                continue

            sql = """
                INSERT INTO mensajes_respuestas
                    (id, mensaje_id, user_id, respuesta, created_at, updated_at)
                VALUES
                    (%(id)s, %(mensaje_id)s, %(user_id)s, %(respuesta)s, %(ts)s, %(ts)s)
            """
            params = {
                "id":         r["id"],
                "mensaje_id": msg_id,
                "user_id":    user_id,
                "respuesta":  r.get("respuesta") or "",
                "ts":         r.get("creado_el") or NOW,
            }

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  resp id={r['id']} mensaje_id={msg_id}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")


def migrate_mensajeria(old, new, user_id_map: dict, dry_run: bool):
    username_map   = _build_username_map(old, new)
    estu_user_map  = _build_estu_user_map(new)

    migrate_mensajeria_grupos(old, new, user_id_map, dry_run)
    migrate_mensajeria_grupo_miembros(old, new, estu_user_map, dry_run)
    migrate_mensajes(old, new, user_id_map, username_map, dry_run)
    migrate_mensajes_respuestas(old, new, user_id_map, dry_run)
