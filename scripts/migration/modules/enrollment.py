# -*- coding: utf-8 -*-
from config import log, NOW

TIPO_USUARIO_MAP = {1: "E", 2: "D"}   # 1=alumnos→E, 2=docentes→D
TURNO_MAP = {"mañana": "M", "manana": "M", "tarde": "T"}


def migrate_matricula_aperturas(old, new, dry_run: bool) -> dict:
    """
    Migra matricula_aperturas (antiguo) → matricula_aperturas (nuevo).

    Mapeo de columnas:
      matr_id       → apertura_id
      id_inst       → insti_id
      fecha_inicio  → fecha_inicio
      fecha_final   → fecha_fin      (renombrado)
      anio          → anio
      estado        → estado
      (sin equiv.)  → nombre         (generado como "Matrícula {anio}")
    """
    log.head("ENR 1/3  matricula_aperturas")

    with old.cursor() as c:
        c.execute("SELECT * FROM matricula_aperturas ORDER BY matr_id")
        rows = c.fetchall()

    log.info(f"{len(rows)} aperturas encontradas")

    with new.cursor() as c:
        c.execute("SELECT apertura_id FROM matricula_aperturas")
        existing = {r["apertura_id"] for r in c.fetchall()}

    apertura_id_map = {}   # {old matr_id: anio}
    inserted = skipped = 0

    with new.cursor() as c:
        for r in rows:
            old_id = r["matr_id"]
            apertura_id_map[old_id] = r.get("anio") or str(NOW[:4])

            if old_id in existing:
                skipped += 1
                continue

            nombre = f"Matrícula {r.get('anio') or 'S/A'}"

            sql = """
                INSERT INTO matricula_aperturas
                    (apertura_id, insti_id, nombre, anio,
                     fecha_inicio, fecha_fin, estado,
                     created_at, updated_at)
                VALUES
                    (%(apertura_id)s, %(insti_id)s, %(nombre)s, %(anio)s,
                     %(fecha_inicio)s, %(fecha_fin)s, %(estado)s,
                     %(ts)s, %(ts)s)
            """
            params = {
                "apertura_id": old_id,
                "insti_id":    r.get("id_inst"),
                "nombre":      nombre,
                "anio":        r.get("anio"),
                "fecha_inicio":r.get("fecha_inicio"),
                "fecha_fin":   r.get("fecha_final"),   # renombrado
                "estado":      r.get("estado") or "1",
                "ts":          NOW,
            }

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  matr_id={old_id}  {nombre}  ({r.get('fecha_inicio')} – {r.get('fecha_final')})")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")
    return apertura_id_map


def migrate_matriculas(old, new, apertura_id_map: dict, dry_run: bool):
    """
    Migra matriculas (antiguo) → matriculas (nuevo).

    Mapeo de columnas:
      matricula_id     → matricula_id
      id_apertura_mtr  → apertura_id
      id_estudiante    → estu_id
      seccion          → seccion_id
      estado           → estado
      (calculado)      → anio           (desde apertura_id_map)

    Columnas descartadas del origen (no existen en el nuevo esquema):
      id_insti, id_contacto, nivel_educativo, grado, fehca_matricula
    """
    log.head("ENR 2/3  matriculas")

    with old.cursor() as c:
        c.execute("SELECT * FROM matriculas ORDER BY matricula_id")
        rows = c.fetchall()

    log.info(f"{len(rows)} matrículas encontradas")

    with new.cursor() as c:
        c.execute("SELECT matricula_id FROM matriculas")
        existing = {r["matricula_id"] for r in c.fetchall()}

    with new.cursor() as c:
        c.execute("SELECT estu_id FROM estudiantes")
        valid_estudiantes = {r["estu_id"] for r in c.fetchall()}

    inserted = skipped = errors = 0

    with new.cursor() as c:
        for r in rows:
            mat_id = r["matricula_id"]

            if mat_id in existing:
                skipped += 1
                continue

            old_apertura = r.get("id_apertura_mtr")
            if old_apertura not in apertura_id_map:
                log.err(f"  matricula_id={mat_id}: id_apertura_mtr={old_apertura} no existe → omitido")
                errors += 1
                continue

            estu_id = r.get("id_estudiante")
            if estu_id not in valid_estudiantes:
                log.err(f"  matricula_id={mat_id}: id_estudiante={estu_id} no existe en estudiantes → omitido")
                errors += 1
                continue

            anio = apertura_id_map[old_apertura]

            sql = """
                INSERT INTO matriculas
                    (matricula_id, apertura_id, estu_id, seccion_id,
                     anio, estado, created_at, updated_at)
                VALUES
                    (%(matricula_id)s, %(apertura_id)s, %(estu_id)s,
                     %(seccion_id)s, %(anio)s, %(estado)s, %(ts)s, %(ts)s)
            """
            params = {
                "matricula_id": mat_id,
                "apertura_id":  old_apertura,
                "estu_id":      estu_id,
                "seccion_id":   r.get("seccion"),
                "anio":         anio,
                "estado":       r.get("estado") or "1",
                "ts":           NOW,
            }

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  matricula_id={mat_id}  estu_id={estu_id}  seccion={r.get('seccion')}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")


def migrate_horarios_asistencia(old, new, dry_run: bool):
    """
    Migra horarios_asistencia (antiguo) → horarios_asistencia (nuevo).

    Mapeo de columnas:
      id          → horario_id
      id_nivel    → nivel_id
      ingreso     → hora_ingreso
      salida      → hora_salida
      tipo_usuario→ tipo_usuario  (1→'E', 2→'D')
      turno       → turno         ('mañana'→'M', 'tarde'→'T')
      (calculado) → insti_id      (desde niveles_educativos)
    """
    log.head("ENR 3/3  horarios_asistencia")

    with old.cursor() as c:
        c.execute("SELECT * FROM horarios_asistencia ORDER BY id")
        rows = c.fetchall()

    log.info(f"{len(rows)} horarios encontrados")

    with new.cursor() as c:
        c.execute("SELECT horario_id FROM horarios_asistencia")
        existing = {r["horario_id"] for r in c.fetchall()}

    # Obtener insti_id por nivel desde el sistema ANTIGUO (id_nivel referencia el origen)
    with old.cursor() as c:
        c.execute("SELECT nivel_id, insti_id FROM niveles_educativos")
        nivel_insti_old = {r["nivel_id"]: r["insti_id"] for r in c.fetchall()}

    # nivel_ids válidos en el nuevo sistema (para poner NULL si no existe)
    with new.cursor() as c:
        c.execute("SELECT nivel_id FROM niveles_educativos")
        valid_niveles_new = {r["nivel_id"] for r in c.fetchall()}

    # insti_id de respaldo: la única institución del nuevo sistema
    with new.cursor() as c:
        c.execute("SELECT insti_id FROM institucion_educativa LIMIT 1")
        row = c.fetchone()
        default_insti_id = row["insti_id"] if row else None

    inserted = skipped = errors = 0

    with new.cursor() as c:
        for r in rows:
            hor_id = r["id"]

            if hor_id in existing:
                skipped += 1
                continue

            nivel_id_raw = r.get("id_nivel")
            try:
                nivel_id = int(nivel_id_raw) if nivel_id_raw is not None else None
            except (ValueError, TypeError):
                nivel_id = None

            # Resolver insti_id desde la base antigua; si falla, usar el fallback
            insti_id = nivel_insti_old.get(nivel_id) or default_insti_id
            if not insti_id:
                log.err(f"  horario id={hor_id}: no se puede resolver insti_id → omitido")
                errors += 1
                continue

            # nivel_id es nullable — solo usar si existe en el nuevo sistema
            nivel_id_new = nivel_id if nivel_id in valid_niveles_new else None

            tipo_raw  = r.get("tipo_usuario")
            tipo_char = TIPO_USUARIO_MAP.get(tipo_raw, "E")

            turno_raw  = str(r.get("turno") or "").strip().lower()
            turno_char = TURNO_MAP.get(turno_raw, "M")

            sql = """
                INSERT INTO horarios_asistencia
                    (horario_id, insti_id, nivel_id, tipo_usuario, turno,
                     hora_ingreso, hora_salida, created_at, updated_at)
                VALUES
                    (%(horario_id)s, %(insti_id)s, %(nivel_id)s, %(tipo_usuario)s,
                     %(turno)s, %(hora_ingreso)s, %(hora_salida)s, %(ts)s, %(ts)s)
            """
            params = {
                "horario_id":   hor_id,
                "insti_id":     insti_id,
                "nivel_id":     nivel_id_new,
                "tipo_usuario": tipo_char,
                "turno":        turno_char,
                "hora_ingreso": r.get("ingreso"),
                "hora_salida":  r.get("salida"),
                "ts":           NOW,
            }

            if not dry_run:
                c.execute(sql, params)
            log.ok(f"  id={hor_id}  nivel={nivel_id}  tipo={tipo_char}  turno={turno_char}  {r.get('ingreso')}–{r.get('salida')}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")


def migrate_unidades(old, new, dry_run: bool):
    log.head("ENR 4/6  unidades")

    with old.cursor() as c:
        c.execute("SELECT * FROM unidad_curso ORDER BY unidad_id")
        rows = c.fetchall()

    log.info(f"{len(rows)} unidades encontradas")

    # Construir mapa curso_doce_id → curso_id real (a través de curso_docente)
    with old.cursor() as c:
        c.execute("SELECT curso_doce_id, curso_id FROM curso_docente")
        curso_docente_map = {r["curso_doce_id"]: r["curso_id"] for r in c.fetchall()}

    with new.cursor() as c:
        c.execute("SELECT unidad_id FROM unidades")
        existing = {r["unidad_id"] for r in c.fetchall()}

    inserted = skipped = errors = 0

    with new.cursor() as c:
        for r in rows:
            u_id = r["unidad_id"]
            if u_id in existing:
                skipped += 1
                continue

            curso_doce_id = r.get("id_docente_curso")
            curso_id = curso_docente_map.get(curso_doce_id) if curso_doce_id else None
            if not curso_id:
                log.err(f"  unidad_id={u_id}: no se pudo resolver curso_id desde id_docente_curso={curso_doce_id} → omitido")
                errors += 1
                continue

            titulo = r.get("nombre_unidad") or "(sin nombre)"
            estado = r.get("estado") or "1"
            fecha_creacion = r.get("fecha_creacion") or NOW

            sql = """
                INSERT INTO unidades
                    (unidad_id, curso_id, titulo, descripcion,
                     orden, estado, created_at, updated_at)
                VALUES
                    (%s, %s, %s, %s,
                     %s, %s, %s, %s)
            """
            params = (
                u_id, curso_id, titulo, None,
                1, estado, fecha_creacion, NOW
            )

            if not dry_run:
                try:
                    c.execute(sql, params)
                    inserted += 1
                except Exception as e:
                    log.err(f"  Error insertando unidad_id={u_id}: {e}")
                    errors += 1
            else:
                inserted += 1
            log.ok(f"  unidad_id={u_id} curso_id={curso_id} titulo='{titulo[:30]}'")

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")


def migrate_clases(old, new, dry_run: bool):
    log.head("ENR 5/6  clases")

    with old.cursor() as c:
        c.execute("SELECT * FROM clase_cursos ORDER BY clase_id")
        rows = c.fetchall()

    log.info(f"{len(rows)} clases encontradas")

    with new.cursor() as c:
        c.execute("SELECT clase_id FROM clases")
        existing = {r["clase_id"] for r in c.fetchall()}

    inserted = skipped = errors = 0

    with new.cursor() as c:
        for r in rows:
            c_id = r["clase_id"]
            if c_id in existing:
                skipped += 1
                continue

            unidad_id = r.get("id_unidad")
            if not unidad_id:
                log.err(f"  clase_id={c_id}: id_unidad nulo → omitido")
                errors += 1
                continue

            titulo = r.get("nombre_clase") or "(sin titulo)"
            estado = r.get("visible") or "1"
            descripcion = r.get("descripcion_corta")

            sql = """
                INSERT INTO clases
                    (clase_id, unidad_id, titulo, descripcion,
                     orden, estado, created_at, updated_at)
                VALUES
                    (%s, %s, %s, %s,
                     %s, %s, %s, %s)
            """
            params = (
                c_id, unidad_id, titulo, descripcion,
                1, estado, NOW, NOW
            )

            if not dry_run:
                try:
                    c.execute(sql, params)
                    inserted += 1
                except Exception as e:
                    log.err(f"  Error insertando clase_id={c_id}: {e}")
                    errors += 1
            else:
                inserted += 1
            log.ok(f"  clase_id={c_id} unidad_id={unidad_id} titulo='{str(titulo)[:30]}'")

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")


def migrate_asistencias(old, new, dry_run: bool):
    log.head("ENR 6/6  asistencias")

    with old.cursor() as c:
        c.execute("SELECT * FROM asistencia_alumno")
        rows = c.fetchall()

    log.info(f"{len(rows)} asistencias encontradas")

    with new.cursor() as c:
        c.execute("SELECT asistencia_id FROM asistencias")
        existing = {r["asistencia_id"] for r in c.fetchall()}

    with new.cursor() as c:
        c.execute("SELECT estu_id, insti_id FROM estudiantes")
        estu_insti = {r["estu_id"]: r["insti_id"] for r in c.fetchall()}

    inserted = skipped = errors = 0

    with new.cursor() as c:
        for r in rows:
            a_id = r["alumno_asiste_id"]
            if a_id in existing:
                skipped += 1
                continue

            estu_id = r.get("id_alumno")
            insti_id = estu_insti.get(estu_id)
            if not insti_id:
                log.err(f"  asistencia_id={a_id}: id_alumno={estu_id} no resolve insti_id → omitido")
                errors += 1
                continue

            fecha_full = r.get("fecha_marcado")
            try:
                dt_str = str(fecha_full)
                fecha_part = dt_str[:10]
                hora_part = dt_str[11:19] if len(dt_str) > 10 else None
            except Exception:
                fecha_part = NOW[:10]
                hora_part = None

            estado = r.get("estado") or "1"

            sql = """
                INSERT INTO asistencias
                    (asistencia_id, insti_id, id_persona, tipo,
                     fecha, hora_entrada, hora_salida, turno, estado, observacion,
                     created_at, updated_at)
                VALUES
                    (%s, %s, %s, %s,
                     %s, %s, %s, %s, %s, %s,
                     %s, %s)
            """
            params = (
                a_id, insti_id, estu_id, 'E',
                fecha_part, hora_part, None, None, estado, "Migrado de asistencia_alumno",
                fecha_full or NOW, NOW
            )

            if not dry_run:
                try:
                    c.execute(sql, params)
                    inserted += 1
                except Exception as e:
                    log.err(f"  Error insertando asistencia_id={a_id}: {e}")
                    errors += 1
            else:
                inserted += 1
            log.ok(f"  asist id={a_id} estu_id={estu_id} fecha={fecha_part}")

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}  |  Errores: {errors}")


def migrate_enrollment(old, new, dry_run: bool):
    apertura_id_map = migrate_matricula_aperturas(old, new, dry_run)
    migrate_matriculas(old, new, apertura_id_map, dry_run)
    migrate_horarios_asistencia(old, new, dry_run)
    migrate_unidades(old, new, dry_run)
    migrate_clases(old, new, dry_run)
    migrate_asistencias(old, new, dry_run)
