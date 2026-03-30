# -*- coding: utf-8 -*-
import pymysql
from config import OLD_DB, NEW_DB, connect

def check():
    print(f"Checking tables in {NEW_DB['db']}...")
    new = connect(NEW_DB)
    
    tables_needed = [
        "institucion_educativa", "users", "perfiles", "niveles_educativos",
        "grados", "secciones", "cursos", "docentes", "estudiantes",
        "institucion_galeria", "institucion_noticias", "mensajeria_grupos",
        "mensajes", "padre_apoderado", "estudiante_contacto", "pagos",
        "tipo_actividad", "tipo_respuesta_quiz", "actividad_curso",
        "cuestionario", "pregunta_cuestionario", "alternativas_pregunta",
        "matricula_aperturas", "matriculas", "horarios_asistencia",
        "unidades", "clases", "asistencias",
        "empresas", "proveedores", "clientes", "productos", "ventas" # ERP
    ]
    
    with new.cursor() as c:
        c.execute("SHOW TABLES")
        existing = {list(r.values())[0] for r in c.fetchall()}
    
    missing = []
    for t in tables_needed:
        if t not in existing:
            missing.append(t)
            
    if missing:
        print("\n❌ MISSING TABLES:")
        for t in missing:
            print(f"  - {t}")
    else:
        print("\n✅ All core tables are present.")
    
    new.close()

if __name__ == "__main__":
    check()
