import sqlite3
from pathlib import Path
from contextlib import closing

project_root = Path(__file__).resolve().parents[1]
db_path = project_root / 'YSXS' / 'literature.db'
print('DB path:', db_path)

with closing(sqlite3.connect(str(db_path))) as conn:
    conn.execute('PRAGMA foreign_keys=OFF')
    cur = conn.cursor()
    # dump existing data
    cur.execute('SELECT id, owner_id, value, label FROM category')
    rows = cur.fetchall()

    # create new table
    cur.execute('''
    CREATE TABLE category_new (
        id INTEGER PRIMARY KEY,
        owner_id INTEGER,
        value VARCHAR(50) NOT NULL,
        label VARCHAR(100) NOT NULL,
        CONSTRAINT uq_category_owner_value UNIQUE (owner_id, value),
        CONSTRAINT fk_category_owner_id_user FOREIGN KEY(owner_id) REFERENCES user (id)
    )
    ''')

    # copy data
    cur.executemany('INSERT INTO category_new (id, owner_id, value, label) VALUES (?, ?, ?, ?)', rows)

    # drop old and rename
    cur.execute('DROP TABLE category')
    cur.execute('ALTER TABLE category_new RENAME TO category')

    # recreate index
    cur.execute('CREATE INDEX IF NOT EXISTS ix_category_owner_id ON category(owner_id)')

    conn.commit()
    conn.execute('PRAGMA foreign_keys=ON')

print('Recreated category table without UNIQUE(value)')
