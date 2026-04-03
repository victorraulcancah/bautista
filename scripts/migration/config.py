# -*- coding: utf-8 -*-
import sys
from datetime import datetime
import bcrypt
import pymysql
import pymysql.cursors

OLD_DB = dict(host="127.0.0.1", port=3306, user="root", password="", db="edu_bautista",  charset="utf8mb4")
NEW_DB = dict(host="127.0.0.1", port=3306, user="root", password="", db="edu_bautista1", charset="utf8mb4")

NOW = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

class Logger:
    def ok(self, msg):   print(f"  ✓  {msg}")
    def skip(self, msg): print(f"  –  {msg}")
    def err(self, msg):  print(f"  ✗  {msg}", file=sys.stderr)
    def head(self, msg): print(f"\n{'─'*60}\n  {msg}\n{'─'*60}")
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
