"""
Simple script to create therapy session tables
"""

import sqlite3
import os

# Get the database path from environment or use default
DB_PATH = os.environ.get('DATABASE_URL', 'app.db')

def create_therapy_tables():
    """Create therapy sessions and therapy messages tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create therapy_sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS therapy_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_session_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            therapist_id TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            accepted_at TIMESTAMP,
            started_at TIMESTAMP,
            ended_at TIMESTAMP,
            scheduled_duration INTEGER DEFAULT 15,
            actual_duration INTEGER
        )
    """)
    
    # Create therapy_messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS therapy_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            sender_id TEXT NOT NULL,
            sender_type TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES therapy_sessions (id)
        )
    """)
    
    conn.commit()
    conn.close()
    print("Therapy session tables created successfully")

if __name__ == "__main__":
    create_therapy_tables()