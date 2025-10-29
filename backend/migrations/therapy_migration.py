"""
Migration script for therapy session tables
"""

def migrate(db):
    """
    Create therapy sessions and therapy messages tables
    """
    # Create therapy_sessions table
    db.execute("""
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
    db.execute("""
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
    
    db.commit()
    print("Therapy session tables created successfully")

if __name__ == "__main__":
    # This is just for testing the migration script
    # In a real application, this would be run through the migration system
    pass