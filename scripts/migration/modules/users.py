# -*- coding: utf-8 -*-
from config import log, NOW

def migrate_docentes(old, new, user_id_map: dict, dry_run: bool):
    log.head("8/9  docentes")
    with old.cursor() as c:
        c.execute("SELECT * FROM docentes")
        rows = c.fetchall()

    log.info(f"{len(rows)} docentes encontrados")

    with new.cursor() as c:
        c.execute("SELECT docente_id FROM docentes")
        existing = {r["docente_id"] for r in c.fetchall()}

    inserted = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["docente_id"] in existing:
                skipped += 1
                continue

            new_user_id = user_id_map.get(r.get("id_usuario"))
            if not new_user_id:
                log.err(f"  docente_id={r['docente_id']}: id_usuario={r.get('id_usuario')} no encontrado → omitido")
                errors += 1
                continue

            sql = """
                INSERT INTO docentes
                    (docente_id, id_insti, id_perfil, id_usuario,
                     especialidad, planilla, estado, created_at, updated_at)
                VALUES
                    (%(docente_id)s, %(id_insti)s, %(id_perfil)s, %(id_usuario)s,
                     %(especialidad)s, %(planilla)s, %(estado)s, %(ts)s, %(ts)s)
            """
            params = {
                "docente_id":   r["docente_id"],
                "id_insti":     r["id_insti"],
                "id_perfil":    r["id_perfil"],
                "id_usuario":   new_user_id,
                "especialidad": r.get("especialidad"),
                "planilla":     r.get("planilla") or 1,
                "estado":       "1",
                "ts":           NOW,
            }

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  docente_id={r['docente_id']}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")

def migrate_estudiantes(old, new, user_id_map: dict, dry_run: bool):
    log.head("9/9  estudiantes")
    with old.cursor() as c:
        c.execute("SELECT * FROM estudiantes")
        rows = c.fetchall()

    log.info(f"{len(rows)} estudiantes encontrados")

    with new.cursor() as c:
        c.execute("SELECT estu_id FROM estudiantes")
        existing = {r["estu_id"] for r in c.fetchall()}

    inserted = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["estu_id"] in existing:
                skipped += 1
                continue

            new_user_id = user_id_map.get(r.get("usuario_id"))
            if not new_user_id:
                log.err(f"  estu_id={r['estu_id']}: usuario_id={r.get('usuario_id')} no encontrado → omitido")
                errors += 1
                continue

            sql = """
                INSERT INTO estudiantes
                    (estu_id, insti_id, perfil_id, user_id, estado,
                     foto, colegio, neurodivergencia, redes,
                     facebook, instagram, tiktok, terapia_ocupacional,
                     seguro, privado, fecha_ingreso, fecha_promovido,
                     mensualidad, edad, talla, peso,
                     created_at, updated_at)
                VALUES
                    (%(estu_id)s, %(insti_id)s, %(perfil_id)s, %(user_id)s, %(estado)s,
                     %(foto)s, %(colegio)s, %(neurodivergencia)s, %(redes)s,
                     %(facebook)s, %(instagram)s, %(tiktok)s, %(terapia_ocupacional)s,
                     %(seguro)s, %(privado)s, %(fecha_ingreso)s, %(fecha_promovido)s,
                     %(mensualidad)s, %(edad)s, %(talla)s, %(peso)s,
                     %(ts)s, %(ts)s)
            """
            params = {
                "estu_id":            r["estu_id"],
                "insti_id":           r["insti_id"],
                "perfil_id":          r["perfil_id"],
                "user_id":            new_user_id,
                "estado":             r.get("estado") or "1",
                "foto":               r.get("foto"),
                "colegio":            r.get("colegio"),
                "neurodivergencia":   r.get("neurodivergencia"),
                "redes":              r.get("redes"),
                "facebook":           r.get("facebook"),
                "instagram":          r.get("instagram"),
                "tiktok":             r.get("tiktok"),
                "terapia_ocupacional":r.get("terapia_ocupacional"),
                "seguro":             r.get("Seguro"),    # mayúscula en origen
                "privado":            r.get("Privado"),   # mayúscula en origen
                "fecha_ingreso":      r.get("fecha_i"),   # renombrado
                "fecha_promovido":    r.get("fecha_p"),   # renombrado
                "mensualidad":        r.get("mensualidad"),
                "edad":               r.get("edad"),
                "talla":              r.get("talla"),
                "peso":               r.get("peso"),
                "ts":                 NOW,
            }

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  estu_id={r['estu_id']}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")

def migrate_padre_apoderado(old, new, user_id_map: dict, dry_run: bool):
    log.head("A/3  padre_apoderado")
    with old.cursor() as c:
        c.execute("SELECT * FROM padre_apoderado")
        rows = c.fetchall()

    log.info(f"{len(rows)} contactos encontrados")

    with new.cursor() as c:
        c.execute("SELECT id_contacto FROM padre_apoderado")
        existing = {r["id_contacto"] for r in c.fetchall()}

    inserted = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            if r["id_contacto"] in existing:
                skipped += 1
                continue

            new_user_id = user_id_map.get(r.get("id_usuario"))
            if not new_user_id and r.get("id_usuario"):
                log.err(f"  id_contacto={r['id_contacto']}: id_usuario={r.get('id_usuario')} no encontrado → se guarda con user_id=NULL")

            # Derivar parentesco del id_rol legacy: 3=padre, 4=apoderado, 5=madre
            PARENTESCO_MAP = {3: "padre", 4: "apoderado", 5: "madre"}
            parentesco = PARENTESCO_MAP.get(r.get("id_rol"))

            sql = """
                INSERT INTO padre_apoderado
                    (id_contacto, user_id, insti_id, parentesco, nombres, apellidos,
                     direccion, departamento_id, provincia_id, distrito_id,
                     telefono_1, telefono_2, tipo_doc, numero_doc, genero,
                     fecha_nacimiento, nacionalidad, estado_civil, es_pagador,
                     email_contacto, estado, foto_perfil,
                     facebook, instagram, tiktok, created_at, updated_at)
                VALUES
                    (%(id_contacto)s, %(user_id)s, %(insti_id)s, %(parentesco)s, %(nombres)s, %(apellidos)s,
                     %(direccion)s, %(departamento_id)s, %(provincia_id)s, %(distrito_id)s,
                     %(telefono_1)s, %(telefono_2)s, %(tipo_doc)s, %(numero_doc)s, %(genero)s,
                     %(fecha_nacimiento)s, %(nacionalidad)s, %(estado_civil)s, %(es_pagador)s,
                     %(email_contacto)s, %(estado)s, %(foto_perfil)s,
                     %(facebook)s, %(instagram)s, %(tiktok)s, %(ts)s, %(ts)s)
            """
            params = {
                "id_contacto":    r["id_contacto"],
                "user_id":        new_user_id or None,
                "insti_id":       r.get("id_insti"),
                "parentesco":     parentesco,
                "nombres":        r.get("nombres"),
                "apellidos":      r.get("apellidos"),
                "direccion":      r.get("direccion"),
                "departamento_id":r.get("departamento_id"),
                "provincia_id":   r.get("provincia_id"),
                "distrito_id":    r.get("distrito_id"),
                "telefono_1":     r.get("telefono_1"),
                "telefono_2":     r.get("telefono_2"),
                "tipo_doc":       r.get("tipo_doc"),
                "numero_doc":     r.get("numero_doc"),
                "genero":         r.get("genero"),
                "fecha_nacimiento":r.get("fecha_nacimiento"),
                "nacionalidad":   r.get("nacionalidad"),
                "estado_civil":   r.get("estado_civil"),
                "es_pagador":     r.get("es_pagador"),
                "email_contacto": r.get("email_concto"),
                "estado":         r.get("estado") or "1",
                "foto_perfil":    r.get("foto_perfil"),
                "facebook":       r.get("facebook"),
                "instagram":      r.get("instagram"),
                "tiktok":         r.get("tiktok"),
                "ts":             NOW,
            }

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  id_contacto={r['id_contacto']}  {r.get('nombres')} {r.get('apellidos')}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")

def migrate_estudiante_contacto(old, new, dry_run: bool):
    log.head("B/3  estudiante_contacto")
    with old.cursor() as c:
        c.execute("SELECT id_estuddiante, id_contacto FROM estudiante_contacto")
        rows = c.fetchall()

    log.info(f"{len(rows)} relaciones estudiante-contacto encontradas")

    with new.cursor() as c:
        c.execute("SELECT estudiante_id, contacto_id FROM estudiante_contacto")
        existing = {(r["estudiante_id"], r["contacto_id"]) for r in c.fetchall()}

    with new.cursor() as c:
        c.execute("SELECT estu_id, mensualidad FROM estudiantes")
        valid_estudiantes = {r["estu_id"]: r["mensualidad"] for r in c.fetchall()}
    with new.cursor() as c:
        c.execute("SELECT id_contacto FROM padre_apoderado")
        valid_contactos = {r["id_contacto"] for r in c.fetchall()}

    inserted = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            estu_id  = r["id_estuddiante"]
            cont_id  = r["id_contacto"]

            key = (estu_id, cont_id)
            if key in existing:
                skipped += 1
                continue

            if estu_id not in valid_estudiantes:
                log.err(f"  id_estuddiante={estu_id} no existe en estudiantes → omitido")
                errors += 1
                continue

            if cont_id not in valid_contactos:
                log.err(f"  id_contacto={cont_id} no existe en padre_apoderado → omitido")
                errors += 1
                continue

            mensualidad = valid_estudiantes[estu_id] or 0

            if not dry_run:
                c.execute(
                    "INSERT IGNORE INTO estudiante_contacto (estudiante_id, contacto_id, mensualidad, created_at, updated_at) VALUES (%s, %s, %s, NOW(), NOW())",
                    (estu_id, cont_id, mensualidad),
                )
            log.ok(f"  estudiante_id={estu_id} ↔ contacto_id={cont_id} (mensualidad={mensualidad})")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")
