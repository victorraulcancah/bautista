
from config import connect, OLD_DB, log
try:
    # Overwrite password if necessary
    OLD_DB['password'] = 'c4p1cu4%'
    conn = connect(OLD_DB)
    with conn.cursor() as c:
        for table in ['examen_iniciado', 'pregunta_resp', 'respuesta_alterna', 'respuesta_escrita']:
            try:
                c.execute(f"DESCRIBE {table}")
                res = c.fetchall()
                print(f"--- {table} ---")
                for col in res:
                    print(f"{col['Field']}: {col['Type']}")
            except Exception as e:
                print(f"Error describing {table}: {e}")
    conn.close()
except Exception as e:
    print(f"Connection error: {e}")
