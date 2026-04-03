# -*- coding: utf-8 -*-
import argparse
from config import OLD_DB, NEW_DB, log, connect
import modules.core as core
import modules.academic as academic
import modules.users as users
import modules.institutional as institutional
import modules.messaging as messaging
import modules.payments as payments
import modules.examenes as examenes
import modules.enrollment as enrollment
import modules.ubigeo as ubigeo
import modules.pagos_extra as pagos_extra
import modules.matricula_extra as matricula_extra
import modules.contenido as contenido
import modules.asistencia_clases as asistencia_clases
import modules.complementos as complementos
import modules.resolucion as resolucion
import modules.asistencia_qr as asistencia_qr
import modules.puzzles as puzzles
import modules.docente_cursos as docente_cursos
import modules.grades as grades
import modules.academic_extras as academic_extras
import modules.payments_catalog as payments_catalog

TABLAS = {
    # ── Core ──────────────────────────────────────────────────────────────────
    "institucion_educativa": lambda old, new, maps, dry: core.migrate_institucion(old, new, dry),
    "users":                 lambda old, new, maps, dry: maps.update({"users": core.migrate_users(old, new, dry)}),
    "perfiles":              lambda old, new, maps, dry: core.migrate_perfiles(old, new, maps.get("users", {}), dry),
    # ── Académico ─────────────────────────────────────────────────────────────
    "niveles_educativos":    lambda old, new, maps, dry: academic.migrate_niveles(old, new, dry),
    "grados":                lambda old, new, maps, dry: academic.migrate_grados(old, new, dry),
    "secciones":             lambda old, new, maps, dry: academic.migrate_secciones(old, new, dry),
    "cursos":                lambda old, new, maps, dry: academic.migrate_cursos(old, new, dry),
    # ── Personas ──────────────────────────────────────────────────────────────
    "docentes":              lambda old, new, maps, dry: users.migrate_docentes(old, new, maps.get("users", {}), dry),
    "estudiantes":           lambda old, new, maps, dry: users.migrate_estudiantes(old, new, maps.get("users", {}), dry),
    "padre_apoderado":       lambda old, new, maps, dry: users.migrate_padre_apoderado(old, new, maps.get("users", {}), dry),
    "estudiante_contacto":   lambda old, new, maps, dry: users.migrate_estudiante_contacto(old, new, dry),
    # ── Geolocalización ───────────────────────────────────────────────────────
    "ubigeo":                lambda old, new, maps, dry: ubigeo.migrate_ubigeo(old, new, dry),
    # ── Institución ───────────────────────────────────────────────────────────
    "institucion_galeria":   lambda old, new, maps, dry: institutional.migrate_galeria(old, new, dry),
    "institucion_noticias":  lambda old, new, maps, dry: institutional.migrate_noticias(old, new, dry),
    # ── Mensajería ────────────────────────────────────────────────────────────
    "mensajeria":            lambda old, new, maps, dry: messaging.migrate_mensajeria(old, new, maps.get("users", {}), dry),
    # ── Pagos ─────────────────────────────────────────────────────────────────
    "pagos":                 lambda old, new, maps, dry: payments.migrate_pagos(old, new, dry),
    "pagos_matricula":       lambda old, new, maps, dry: pagos_extra.migrate_pagos_extra(old, new, dry),
    # ── Matrícula ─────────────────────────────────────────────────────────────
    "enrollment":            lambda old, new, maps, dry: enrollment.migrate_enrollment(old, new, dry),
    "matricula_padres":      lambda old, new, maps, dry: matricula_extra.migrate_matricula_extra(old, new, dry),
    # ── Evaluaciones ──────────────────────────────────────────────────────────
    "examenes":              lambda old, new, maps, dry: examenes.migrate_examenes(old, new, dry),
    "contenido":             lambda old, new, maps, dry: contenido.migrate_contenido(old, new, dry),
    # ── Asistencia (nuevo schema) ─────────────────────────────────────────────
    "asistencia_clases":     lambda old, new, maps, dry: asistencia_clases.migrate_asistencia_clases(old, new, dry),
    "asistencia_qr":         lambda old, new, maps, dry: asistencia_qr.migrate_asistencia_qr(old, new, dry),
    # ── Resoluciones (Intentos) ───────────────────────────────────────────────
    "resolucion":            lambda old, new, maps, dry: resolucion.migrate_resolucion(old, new, dry),
    "puzzles":               lambda old, new, maps, dry: puzzles.migrate_puzzles(old, new, dry),
    # ── Horarios (archivos adjuntos — horarios_asistencia ya va en enrollment) ──
    "horarios":              lambda old, new, maps, dry: (horarios.migrate_seccion_horarios(old, new, dry), horarios.migrate_docente_horarios(old, new, dry)),
    "docente_cursos":        lambda old, new, maps, dry: docente_cursos.migrate_docente_cursos(old, new, dry),
    "grades":                lambda old, new, maps, dry: grades.migrate_grades(old, new, dry),
    "academic_extras":       lambda old, new, maps, dry: academic_extras.migrate_academic_extras(old, new, maps.get("users", {}), dry),
    "payments_catalog":      lambda old, new, maps, dry: payments_catalog.migrate_payments_catalog(old, new, dry),
    # ── Complementos ──────────────────────────────────────────────────────────
    "complementos":          lambda old, new, maps, dry: complementos.migrate_complementos(old, new, maps.get("users", {}), dry),
}

# Tablas que requieren el mapa de users cargado primero
_REQUIEREN_USERS = {
    "perfiles", "docentes", "estudiantes", "mensajeria",
    "padre_apoderado", "estudiante_contacto", "pagos",
    "enrollment", "matricula_padres", "asistencia_clases", "asistencia_qr", "contenido", "resolucion",
    "academic_extras",
}


def main():
    parser = argparse.ArgumentParser(description="Migración edu_bautista → edu_bautista2")
    parser.add_argument("--dry-run", action="store_true", help="Simula sin escribir en la base de datos")
    parser.add_argument("--tabla", choices=list(TABLAS.keys()), help="Migra solo la tabla indicada")
    args = parser.parse_args()

    if args.dry_run:
        print("\n⚠️  MODO DRY-RUN — no se escribirá nada en la base de datos\n")

    print(f"Conectando a {OLD_DB['db']} (origen)...")
    old = connect(OLD_DB)
    print(f"Conectando a {NEW_DB['db']} (destino)...")
    new = connect(NEW_DB)

    with new.cursor() as c:
        c.execute("SET FOREIGN_KEY_CHECKS = 0")

    maps = {}

    try:
        if args.tabla:
            if args.tabla in _REQUIEREN_USERS:
                print(f"\n  ℹ  La tabla '{args.tabla}' requiere el mapeo de users — migrando users primero...\n")
                maps["users"] = core.migrate_users(old, new, args.dry_run)
            TABLAS[args.tabla](old, new, maps, args.dry_run)
        else:
            # ── Orden de ejecución (respeta dependencias FK) ───────────────────
            # 1. Geolocalización (sin deps)
            ubigeo.migrate_ubigeo(old, new, args.dry_run)
            # 2. Core
            core.migrate_institucion(old, new, args.dry_run)
            maps["users"] = core.migrate_users(old, new, args.dry_run)
            core.migrate_perfiles(old, new, maps["users"], args.dry_run)
            # 3. Estructura académica
            academic.migrate_niveles(old, new, args.dry_run)
            academic.migrate_grados(old, new, args.dry_run)
            academic.migrate_secciones(old, new, args.dry_run)
            academic.migrate_cursos(old, new, args.dry_run)
            # 4. Personas
            users.migrate_docentes(old, new, maps["users"], args.dry_run)
            users.migrate_estudiantes(old, new, maps["users"], args.dry_run)
            users.migrate_padre_apoderado(old, new, maps["users"], args.dry_run)
            users.migrate_estudiante_contacto(old, new, args.dry_run)
            docente_cursos.migrate_docente_cursos(old, new, args.dry_run)
            # 5. Matrícula
            enrollment.migrate_enrollment(old, new, args.dry_run)
            matricula_extra.migrate_matricula_extra(old, new, args.dry_run)
            # 6. Institución
            institutional.migrate_noticias(old, new, args.dry_run)
            institutional.migrate_galeria(old, new, args.dry_run)
            # 7. Mensajería
            messaging.migrate_mensajeria(old, new, maps["users"], args.dry_run)
            # 8. Pagos
            payments.migrate_pagos(old, new, args.dry_run)
            pagos_extra.migrate_pagos_extra(old, new, args.dry_run)
            # 9. Evaluaciones (después de enrollment para que existan actividades)
            examenes.migrate_examenes(old, new, args.dry_run)
            contenido.migrate_contenido(old, new, args.dry_run)
            # 10. Asistencia (nuevo schema, después de clases)
            asistencia_clases.migrate_asistencia_clases(old, new, args.dry_run)
            asistencia_qr.migrate_asistencia_qr(old, new, args.dry_run)
            # 11. Resoluciones (Intentos de examen)
            resolucion.migrate_resolucion(old, new, args.dry_run)
            puzzles.migrate_puzzles(old, new, args.dry_run)
            # 12. Horarios (archivos adjuntos — horarios_asistencia ya fue en enrollment)
            horarios.migrate_seccion_horarios(old, new, args.dry_run)
            horarios.migrate_docente_horarios(old, new, args.dry_run)
            # 13. Calificaciones y Extras
            grades.migrate_grades(old, new, args.dry_run)
            academic_extras.migrate_academic_extras(old, new, maps["users"], args.dry_run)
            # 14. Pagos (Catálogo)
            payments_catalog.migrate_payments_catalog(old, new, args.dry_run)
            # 15. Complementos (Historial, Medios, Blog)
            complementos.migrate_complementos(old, new, maps["users"], args.dry_run)

    except Exception as e:
        new.rollback()
        log.err(f"ERROR FATAL: {e}")
        raise
    finally:
        with new.cursor() as c:
            c.execute("SET FOREIGN_KEY_CHECKS = 1")
        new.commit()
        old.close()
        new.close()

    print("\n" + "═" * 60)
    print("  Migración completada." if not args.dry_run else "  Simulación completada (no se escribió nada).")
    print("═" * 60 + "\n")
    if not args.dry_run:
        print("  IMPORTANTE: Los usuarios migrados tienen como contraseña")
        print("  su propio DNI/usuario del sistema antiguo.\n")

if __name__ == "__main__":
    main()
