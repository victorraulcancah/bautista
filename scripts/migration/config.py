# -*- coding: utf-8 -*-
import sys
import io
from datetime import datetime
import bcrypt
import pymysql
import pymysql.cursors

# Configurar la salida estándar para UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

OLD_DB = dict(host="127.0.0.1", port=3306, user="root", password="", db="edu_bautista",  charset="utf8mb4")
NEW_DB = dict(host="127.0.0.1", port=3306, user="root", password="", db="edu_bautista2", charset="utf8mb4")

NOW = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

class Logger:
    def ok(self, msg):   print(f"  [OK]  {msg}")
    def skip(self, msg): print(f"  [-]  {msg}")
    def err(self, msg):  print(f"  [X]  {msg}", file=sys.stderr)
    def head(self, msg): print(f"\n{'-'*60}\n  {msg}\n{'-'*60}")
    def info(self, msg): print(f"     {msg}")

log = Logger()

def connect(cfg: dict) -> pymysql.Connection:
    return pymysql.connect(
        host=cfg["host"], port=cfg["port"],
        user=cfg["user"], password=cfg["password"],
        database=cfg["db"], charset=cfg["charset"],
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )

def make_bcrypt(plain: str) -> str:
    # Python bcrypt generates $2b$ but PHP Hash::check() expects $2y$
    h = bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=10)).decode()
    return h.replace('$2b$', '$2y$', 1)

def ts(val):
    """Devuelve val o NOW si val es None."""
    return val if val else NOW
