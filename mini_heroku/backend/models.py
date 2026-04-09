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
            source TEXT DEFAULT 'upload',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Simple migration: add source column if it doesn't exist
    try:
        cursor.execute("ALTER TABLE apps ADD COLUMN source TEXT DEFAULT 'upload'")
    except sqlite3.OperationalError:
        pass # Column already exists
    
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

    # Deployment Stages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS deployment_stages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deployment_id TEXT NOT NULL,
            stage_name TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            message TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (deployment_id) REFERENCES deployments (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def create_app(name, runtime=None, port=None, source='upload'):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT OR IGNORE INTO apps (name, runtime, port, source) VALUES (?, ?, ?, ?)', (name, runtime, port, source))
        # Ensure source is updated if record exists
        cursor.execute('UPDATE apps SET source=? WHERE name=?', (source, name))
        conn.commit()
    finally:
        conn.close()

def get_app_by_name(name):
    conn = get_db()
    try:
        row = conn.execute('SELECT * FROM apps WHERE name = ?', (name,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def update_app(name, runtime=None, port=None, source=None):
    conn = get_db()
    cursor = conn.cursor()
    try:
        if runtime and port:
            cursor.execute('UPDATE apps SET runtime=?, port=? WHERE name=?', (runtime, port, name))
        elif runtime:
            cursor.execute('UPDATE apps SET runtime=? WHERE name=?', (runtime, name))
        elif port:
            cursor.execute('UPDATE apps SET port=? WHERE name=?', (port, name))
        
        if source:
            cursor.execute('UPDATE apps SET source=? WHERE name=?', (source, name))
        conn.commit()
    finally:
        conn.close()

def start_deployment(task_id, app_name):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO deployments (id, app_name, status) VALUES (?, ?, ?)', (task_id, app_name, 'processing'))
        # Initialize stages
        stages = [
            "Source Code Ingestion",
            "Runtime & Dependency Inspection",
            "Dockerfile Generation",
            "Container Image Building",
            "Registry Management",
            "Runtime Execution"
        ]
        for stage in stages:
            cursor.execute('INSERT INTO deployment_stages (deployment_id, stage_name, status) VALUES (?, ?, ?)', (task_id, stage, 'pending'))
        conn.commit()
    finally:
        conn.close()

def update_deployment_stage(deployment_id, stage_name, status, message=None):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE deployment_stages 
            SET status=?, message=?, updated_at=CURRENT_TIMESTAMP 
            WHERE deployment_id=? AND stage_name=?
        ''', (status, message, deployment_id, stage_name))
        conn.commit()
    finally:
        conn.close()

def update_deployment(task_id, status, message=None):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('UPDATE deployments SET status=?, message=?, finished_at=CURRENT_TIMESTAMP WHERE id=?', (status, message, task_id))
        conn.commit()
    finally:
        conn.close()

def get_deployment(task_id):
    conn = get_db()
    try:
        row = conn.execute('SELECT * FROM deployments WHERE id = ?', (task_id,)).fetchone()
        if not row:
            return None
        deployment = dict(row)
        stages = conn.execute('SELECT stage_name, status, message, updated_at FROM deployment_stages WHERE deployment_id = ? ORDER BY id ASC', (task_id,)).fetchall()
        deployment['stages'] = [dict(s) for s in stages]
        return deployment
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()
    print(f"Database initialized at {DB_PATH}")
