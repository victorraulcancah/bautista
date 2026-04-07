import pymysql
import pymysql.cursors
import json

OLD_DB = dict(host="127.0.0.1", port=3306, user="root", password="", db="edu_bautista", charset="utf8mb4")

def inspect():
    conn = pymysql.connect(**OLD_DB, cursorclass=pymysql.cursors.DictCursor)
    try:
        with conn.cursor() as c:
            # Niveles
            c.execute("SELECT nivel_id, nombre_nivel FROM niveles_educativos")
            niveles = c.fetchall()
            print("\n--- NIVELES (OLD DB) ---")
            for n in niveles:
                print(f"ID: {n['nivel_id']} | {n['nombre_nivel']}")
                
                # Grados for this nivel
                c.execute("SELECT grado_id, nombre_grado FROM grados WHERE nivel_id = %s", (n['nivel_id'],))
                grados = c.fetchall()
                print(f"  -> {len(grados)} grados")
                for g in grados:
                    print(f"     G_ID: {g['grado_id']} | {g['nombre_grado']}")
                
                # Cursos for this nivel
                c.execute("SELECT curso_id, nombre FROM cursos WHERE nivel_academico_id = %s", (n['nivel_id'],))
                cursos = c.fetchall()
                print(f"  -> {len(cursos)} cursos")
    finally:
        conn.close()

if __name__ == "__main__":
    inspect()
