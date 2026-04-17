import sqlite3
import json
import sys
from pathlib import Path

try:
    project_root = Path(__file__).resolve().parents[1]
    db_path = project_root / 'YSXS' / 'literature.db'
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    cur.execute("PRAGMA table_info('category')")
    cols = cur.fetchall()
    print(json.dumps(cols, ensure_ascii=False, indent=2))
    cur = conn.cursor()
    cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='category'")
    table_sql = cur.fetchone()
    print('\nCREATE SQL:')
    print(table_sql[0] if table_sql else 'N/A')
    conn.close()
except Exception as e:
    print('ERROR', e)
    sys.exit(1)
