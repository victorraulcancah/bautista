# -*- coding: utf-8 -*-
import re

SQL_FILE = r"C:\Users\victorraul\Documents\Laravel\edu_bautista 20260324 1341.sql"
TABLES = ["empresas", "tipo_pago", "documentos_sunat", "metodo_pago", "proveedores", "clientes", "productos", "caja_empresa", "caja_chica", "compras", "cotizaciones", "ventas"]

def extract():
    with open(SQL_FILE, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    for table in TABLES:
        # Regex to find CREATE TABLE `table` (...) ;
        pattern = rf"CREATE TABLE\s+`{table}`\s*\((.*?)\)\s*ENGINE"
        match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
        if match:
            print(f"\n--- TABLE: {table} ---\n")
            print(f"CREATE TABLE `{table}` ({match.group(1)});")
        else:
            # Try without backticks
            pattern = rf"CREATE TABLE\s+{table}\s*\((.*?)\)\s*ENGINE"
            match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
            if match:
                print(f"\n--- TABLE: {table} ---\n")
                print(f"CREATE TABLE {table} ({match.group(1)});")

if __name__ == "__main__":
    extract()
