import pymysql
import sys
import json
import os

# Determinar el CWD para importar config
sys.path.append(os.getcwd())
from scripts.migration.config import OLD_DB

tables = [
    'nota_actividad', 
    'pagos_notifica', 
    'institucion_pagosm', 
    'pag_fecha', 
    'fechas_pagos', 
    'metodo_pago', 
    'asistencia', 
    'hijos_matriculados', 
    'contenido_escrito', 
    'recuperacion_usuario'
]

conn = pymysql.connect(**OLD_DB)
try:
    with conn.cursor() as cur:
        for t in tables:
            print(f"\n--- {t} ---")
            try:
                cur.execute(f"DESCRIBE {t}")
                rows = cur.fetchall()
                for r in rows:
                    print(r)
            except Exception as e:
                print(f"Error en {t}: {e}")
finally:
    conn.close()
