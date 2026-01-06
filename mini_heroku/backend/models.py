import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mini_heroku.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Apps table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS apps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            runtime TEXT,
            port INTEGER,
            status TEXT DEFAULT 'stopped',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Deployments table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS deployments (
            id TEXT PRIMARY KEY,
            app_name TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            message TEXT,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            finished_at TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def create_app(name, runtime=None, port=None):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT OR IGNORE INTO apps (name, runtime, port) VALUES (?, ?, ?)', (name, runtime, port))
        conn.commit()
    finally:
        conn.close()

def start_deployment(task_id, app_name):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO deployments (id, app_name, status) VALUES (?, ?, ?)', (task_id, app_name, 'building'))
        conn.commit()
    finally:
        conn.close()

def update_deployment(task_id, status, message=None):
    conn = get_db()
    cursor = conn.cursor()
    try:
        if status == 'success':
            cursor.execute('UPDATE deployments SET status=?, message=?, finished_at=CURRENT_TIMESTAMP WHERE id=?', (status, message, task_id))
        else:
            cursor.execute('UPDATE deployments SET status=?, message=?, finished_at=CURRENT_TIMESTAMP WHERE id=?', (status, message, task_id))
        conn.commit()
    finally:
        conn.close()

def get_deployment(task_id):
    conn = get_db()
    try:
        row = conn.execute('SELECT * FROM deployments WHERE id = ?', (task_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()
    print(f"Database initialized at {DB_PATH}")
