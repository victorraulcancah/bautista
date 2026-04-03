# -*- coding: utf-8 -*-
from config import log, NOW, make_bcrypt, ts

ROL_MAP = {
    1: "administrador",
    2: "estudiante",
    3: "padre_familia",
    4: "apoderado",
    5: "madre_familia",
    6: "docente",
    7: "psicologo",
}

# Roles esperados del RolePermissionSeeder de Laravel
SPATIE_ROLES = ["administrador", "docente", "estudiante", "padre_familia", "madre_familia", "apoderado", "psicologo"]

def migrate_institucion(old, new, dry_run: bool):
    log.head("1/9  institucion_educativa")
    with old.cursor() as c:
        c.execute("SELECT * FROM institucion_educativa")
        rows = c.fetchall()

    log.info(f"{len(rows)} registros encontrados en el sistema antiguo")

    with new.cursor() as c:
        c.execute("SELECT insti_id FROM institucion_educativa")
        existing = {r["insti_id"] for r in c.fetchall()}

    inserted = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["insti_id"] in existing:
                log.skip(f"  insti_id={r['insti_id']} ya existe → omitido")
                skipped += 1
                continue

            sql = """
                INSERT INTO institucion_educativa
                    (insti_id, insti_ruc, insti_razon_social, insti_direccion,
                     insti_telefono1, insti_telefono2, insti_email,
                     insti_director, insti_ndni, insti_logo, insti_estatus,
                     created_at, updated_at)
                VALUES
                    (%(insti_id)s, %(insti_ruc)s, %(insti_razon_social)s,
                     %(insti_direccion)s, %(insti_telefono1)s, %(insti_telefono2)s,
                     %(insti_email)s, %(insti_director)s, %(insti_ndni)s,
                     %(insti_logo)s, %(insti_estatus)s, %(ts)s, %(ts)s)
            """
            params = {**r, "ts": NOW, "insti_estatus": r["insti_estatus"] or 1}

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  {r['insti_id']} → {r['insti_razon_social']}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")

def _ensure_roles(new) -> dict:
    """Crea los roles si no existen y devuelve {nombre: id}."""
    with new.cursor() as c:
        for nombre in SPATIE_ROLES:
            c.execute(
                "INSERT IGNORE INTO roles (name, guard_name, created_at, updated_at) VALUES (%s, 'web', NOW(), NOW())",
                (nombre,)
            )
        new.commit()
        c.execute("SELECT id, name FROM roles")
        return {r["name"]: r["id"] for r in c.fetchall()}

def migrate_users(old, new, dry_run: bool) -> dict:
    log.head("2/9  usuarios → users")

    with old.cursor() as c:
        c.execute("SELECT * FROM usuarios")
        rows = c.fetchall()

    log.info(f"{len(rows)} usuarios encontrados")

    with new.cursor() as c:
        c.execute("SELECT id, username FROM users")
        existing_usernames = {r["username"]: r["id"] for r in c.fetchall()}

    seen_in_old = {}
    for r in rows:
        u = (r["usuario"] or "").strip()
        if u in seen_in_old:
            log.err(f"  Duplicado en origen: usuario_id={r['usuario_id']} username={u} (ya procesado como id={seen_in_old[u]}) -> omitido")
        seen_in_old[u] = r["usuario_id"]

    # Asegurar que los roles existen antes de insertar usuarios
    roles_map = _ensure_roles(new) if not dry_run else {}

    id_map = {}
    inserted = skipped = 0
    processed_usernames = set()

    with new.cursor() as c:
        for r in rows:
            username = r["usuario"].strip() if r["usuario"] else f"user_{r['usuario_id']}"

            if username in processed_usernames:
                log.skip(f"  usuario_id={r['usuario_id']} username={username} duplicado en origen -> omitido")
                skipped += 1
                continue
            processed_usernames.add(username)

            if username in existing_usernames:
                log.skip(f"  username={username} ya existe → omitido")
                id_map[r["usuario_id"]] = existing_usernames[username]
                skipped += 1
                continue

            plain = (r["clave"] or username).strip()
            hashed = make_bcrypt(plain) if not dry_run else "DRY_RUN_HASH"

            rol_nombre = ROL_MAP.get(r.get("id_rol"))
            if not rol_nombre:
                log.err(f"  id_rol={r.get('id_rol')} sin mapeo para username={username} → usuario sin rol")

            rol_id = roles_map.get(rol_nombre) if rol_nombre else None

            sql = """
                INSERT INTO users
                    (insti_id, rol_id, username, name, email, password,
                     estado, created_at, updated_at)
                VALUES
                    (%(insti_id)s, %(rol_id)s, %(username)s, %(name)s, %(email)s,
                     %(password)s, %(estado)s, %(created_at)s, %(updated_at)s)
            """
            params = {
                "insti_id":   r["insti_id"],
                "rol_id":     rol_id,
                "username":   username,
                "name":       username,
                "email":      r["email"] or None,
                "password":   hashed,
                "estado":     r["estado"] or "1",
                "created_at": ts(r.get("fecha_creacion")),
                "updated_at": NOW,
            }

            if not dry_run:
                c.execute(sql, params)
                new_id = c.lastrowid
                log.ok(f"  {r['usuario_id']} → id={new_id}  username={username}  rol={rol_nombre or 'SIN ROL'}")
            else:
                new_id = -1
                log.ok(f"  {r['usuario_id']} → id={new_id}  username={username}  rol={rol_nombre or 'SIN ROL'} [DRY]")

            id_map[r["usuario_id"]] = new_id
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")
    return id_map


def migrate_perfiles(old, new, user_id_map: dict, dry_run: bool):
    log.head("3/9  perfiles")

    with old.cursor() as c:
        c.execute("SELECT * FROM perfiles")
        rows = c.fetchall()

    log.info(f"{len(rows)} perfiles encontrados")

    with new.cursor() as c:
        c.execute("SELECT perfil_id FROM perfiles")
        existing = {r["perfil_id"] for r in c.fetchall()}

    inserted = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["perfil_id"] in existing:
                skipped += 1
                continue

            new_user_id = user_id_map.get(r["id_usuario"])
            if not new_user_id:
                log.err(f"  perfil_id={r['perfil_id']}: id_usuario={r['id_usuario']} no encontrado en users → omitido")
                errors += 1
                continue

            sql = """
                INSERT INTO perfiles
                    (perfil_id, user_id, genero, primer_nombre, segundo_nombre,
                     apellido_paterno, apellido_materno, tipo_doc, doc_numero,
                     fecha_nacimiento, fecha_registro, direccion, telefono,
                     foto_perfil, created_at, updated_at)
                VALUES
                    (%(perfil_id)s, %(user_id)s, %(genero)s, %(primer_nombre)s,
                     %(segundo_nombre)s, %(apellido_paterno)s, %(apellido_materno)s,
                     %(tipo_doc)s, %(doc_numero)s, %(fecha_nacimiento)s,
                     %(fecha_registro)s, %(direccion)s, %(telefono)s,
                     %(foto_perfil)s, %(ts)s, %(ts)s)
            """
            params = {
                "perfil_id":        r["perfil_id"],
                "user_id":          new_user_id,
                "genero":           r.get("genero"),
                "primer_nombre":    r.get("primer_nombre"),
                "segundo_nombre":   r.get("segundo_nombre"),
                "apellido_paterno": r.get("apellido_paterno"),
                "apellido_materno": r.get("apellido_materno"),
                "tipo_doc":         r.get("doc_id"),
                "doc_numero":       r.get("doc_numero"),
                "fecha_nacimiento": r.get("fecha_nacimiento"),
                "fecha_registro":   r.get("fecha_registro"),
                "direccion":        r.get("direccion"),
                "telefono":         r.get("telefono_pricipal"),
                "foto_perfil":      r.get("foto_perfil"),
                "ts":               NOW,
            }

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  perfil_id={r['perfil_id']}  {r.get('primer_nombre')} {r.get('apellido_paterno')}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")
