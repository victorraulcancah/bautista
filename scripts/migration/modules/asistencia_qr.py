# -*- coding: utf-8 -*-
# Migra registros de asistencia general por QR (tabla 'asistencia' legacy):
#   asistencia  →  asistencias
#
# La tabla legacy registra cada escaneo como una fila con datetime.
# Se consolidan los escaneos del mismo día/persona/tipo en una sola fila
# con hora_entrada (MIN) y hora_salida (MAX, solo si hay más de un escaneo).
#
# Mapeo de tipo: 1=estudiante → 'E', 2=docente → 'D'
from config import log, NOW

TIPO_MAP = {1: "E", 2: "D"}


def migrate_asistencia_qr(old, new, dry_run: bool):
    log.head("AQR 1/1  asistencia (QR) → asistencias")

    with old.cursor() as c:
        c.execute("""
            SELECT
                id_estudiante,
                tipo,
                DATE(fecha)     AS fecha_dia,
                MIN(TIME(fecha)) AS hora_entrada,
                MAX(TIME(fecha)) AS hora_salida,
                COUNT(*)         AS marcas
            FROM asistencia
            GROUP BY id_estudiante, tipo, DATE(fecha)
            ORDER BY DATE(fecha) DESC, id_estudiante ASC
        """)
        rows = c.fetchall()
    log.info(f"{len(rows)} jornadas de asistencia encontradas")

    # Obtener insti_id por defecto (primera institución del nuevo sistema)
    with new.cursor() as c:
        c.execute("SELECT insti_id FROM institucion_educativa LIMIT 1")
        row = c.fetchone()
        default_insti_id = row["insti_id"] if row else 1

    # Dedup por (id_persona, tipo, fecha, turno=NULL)
    with new.cursor() as c:
        c.execute("SELECT id_persona, tipo, fecha FROM asistencias WHERE turno IS NULL")
        existing = {(r["id_persona"], r["tipo"], str(r["fecha"])) for r in c.fetchall()}

    ins = skipped = errors = 0
    with new.cursor() as c:
        for r in rows:
            persona_id = r["id_estudiante"]
            tipo_nuevo = TIPO_MAP.get(r["tipo"])
            if not tipo_nuevo:
                log.err(f"  tipo desconocido {r['tipo']} para id={persona_id} → omitido")
                errors += 1
                continue
            fecha = str(r["fecha_dia"])
            if (persona_id, tipo_nuevo, fecha) in existing:
                skipped += 1
                continue
            hora_entrada = r["hora_entrada"]
            hora_salida  = r["hora_salida"] if r["marcas"] > 1 else None
            if not dry_run:
                try:
                    c.execute(
                        """INSERT INTO asistencias
                            (insti_id, id_persona, tipo, fecha,
                             hora_entrada, hora_salida, turno, estado,
                             created_at, updated_at)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                        (default_insti_id, persona_id, tipo_nuevo, fecha,
                         hora_entrada, hora_salida, None, "1", NOW, NOW),
                    )
                except Exception as e:
                    log.err(f"  Error persona={persona_id} fecha={fecha}: {e}")
                    errors += 1
                    continue
            existing.add((persona_id, tipo_nuevo, fecha))
            ins += 1
    if not dry_run:
        new.commit()
    log.info(f"Insertados: {ins}  |  Omitidos: {skipped}  |  Errores: {errors}")
