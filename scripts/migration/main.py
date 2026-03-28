# -*- coding: utf-8 -*-
import argparse
from config import OLD_DB, NEW_DB, log, connect
import modules.core as core
import modules.academic as academic
import modules.users as users
import modules.institutional as institutional
import modules.messaging as messaging
import modules.payments as payments
import modules.erp as erp
import modules.examenes as examenes
import modules.enrollment as enrollment

TABLAS = {
    "institucion_educativa": lambda old, new, maps, dry: core.migrate_institucion(old, new, dry),
    "users":                 lambda old, new, maps, dry: maps.update({"users": core.migrate_users(old, new, dry)}),
    "perfiles":              lambda old, new, maps, dry: core.migrate_perfiles(old, new, maps.get("users", {}), dry),
    "niveles_educativos":    lambda old, new, maps, dry: academic.migrate_niveles(old, new, dry),
    "grados":                lambda old, new, maps, dry: academic.migrate_grados(old, new, dry),
    "secciones":             lambda old, new, maps, dry: academic.migrate_secciones(old, new, dry),
    "cursos":                lambda old, new, maps, dry: academic.migrate_cursos(old, new, dry),
    "docentes":              lambda old, new, maps, dry: users.migrate_docentes(old, new, maps.get("users", {}), dry),
    "estudiantes":           lambda old, new, maps, dry: users.migrate_estudiantes(old, new, maps.get("users", {}), dry),
    "institucion_galeria":   lambda old, new, maps, dry: institutional.migrate_galeria(old, new, dry),
    "institucion_noticias":  lambda old, new, maps, dry: institutional.migrate_noticias(old, new, dry),
    "mensajeria":            lambda old, new, maps, dry: messaging.migrate_mensajeria(old, new, maps.get("users", {}), dry),
    "padre_apoderado":       lambda old, new, maps, dry: users.migrate_padre_apoderado(old, new, maps.get("users", {}), dry),
    "estudiante_contacto":   lambda old, new, maps, dry: users.migrate_estudiante_contacto(old, new, dry),
    "pagos":                 lambda old, new, maps, dry: payments.migrate_pagos(old, new, dry),
    "erp":                   lambda old, new, maps, dry: erp.migrate_erp(old, new, dry),
    "examenes":              lambda old, new, maps, dry: examenes.migrate_examenes(old, new, dry),
    "enrollment":            lambda old, new, maps, dry: enrollment.migrate_enrollment(old, new, dry),
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
            if args.tabla in ("perfiles", "docentes", "estudiantes", "mensajeria",
                              "padre_apoderado", "estudiante_contacto", "pagos",
                              "enrollment"):
                print(f"\n  ℹ  La tabla '{args.tabla}' requiere el mapeo de users — migrando users primero...\n")
                maps["users"] = core.migrate_users(old, new, args.dry_run)
            TABLAS[args.tabla](old, new, maps, args.dry_run)
        else:
            core.migrate_institucion(old, new, args.dry_run)
            maps["users"] = core.migrate_users(old, new, args.dry_run)
            core.migrate_perfiles(old, new, maps["users"], args.dry_run)
            academic.migrate_niveles(old, new, args.dry_run)
            academic.migrate_grados(old, new, args.dry_run)
            academic.migrate_secciones(old, new, args.dry_run)
            academic.migrate_cursos(old, new, args.dry_run)
            users.migrate_docentes(old, new, maps["users"], args.dry_run)
            users.migrate_estudiantes(old, new, maps["users"], args.dry_run)
            institutional.migrate_noticias(old, new, args.dry_run)
            institutional.migrate_galeria(old, new, args.dry_run)
            messaging.migrate_mensajeria(old, new, maps["users"], args.dry_run)
            users.migrate_padre_apoderado(old, new, maps["users"], args.dry_run)
            users.migrate_estudiante_contacto(old, new, args.dry_run)
            payments.migrate_pagos(old, new, args.dry_run)
            erp.migrate_erp(old, new, args.dry_run)
            examenes.migrate_examenes(old, new, args.dry_run)
            enrollment.migrate_enrollment(old, new, args.dry_run)

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
