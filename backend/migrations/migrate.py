#!/usr/bin/env python3
"""
Database Migration Script
=========================

This script handles database schema migrations for the application.
It tracks which migrations have been applied and applies new ones as needed.

Usage:
    python migrate.py [up|down|status]

Commands:
    up      Apply pending migrations
    down    Rollback migrations
    status  Show migration status
"""

import os
import sys
from datetime import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Create a minimal Flask app for database operations only
from flask import Flask
from app.config import Config
from app.models import db, Migration
from sqlalchemy import text

def create_minimal_app():
    """Create a minimal Flask app with only database configuration"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize database
    db.init_app(app)
    
    return app

# Migration definitions
MIGRATIONS = [
    {
        'version': '001_initial',
        'description': 'Initial database schema',
        'upgrade': lambda: print("Initial schema already exists, no changes needed."),
        'downgrade': lambda: print("Downgrade not implemented for initial schema.")
    },
    {
        'version': '002_add_created_at_index',
        'description': 'Add index on created_at columns for better query performance',
        'upgrade': lambda: [
            db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);")),
            db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_diary_created_at ON diary(created_at);")),
            db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);"))
        ],
        'downgrade': lambda: [
            db.session.execute(text("DROP INDEX IF EXISTS idx_users_created_at;")),
            db.session.execute(text("DROP INDEX IF EXISTS idx_diary_created_at;")),
            db.session.execute(text("DROP INDEX IF EXISTS idx_quotes_created_at;"))
        ]
    },
    {
       'version': '003_add_diary_tags',
       'description': 'Add tags column to diary table for categorization',
       'upgrade': lambda: db.session.execute(text("ALTER TABLE diary ADD COLUMN IF NOT EXISTS tags TEXT;")),
       'downgrade': lambda: db.session.execute(text("ALTER TABLE diary DROP COLUMN IF EXISTS tags;"))
   },
   {
      'version': '004_add_diary_is_completed',
      'description': 'Add is_completed column to diary table for streak tracking',
      'upgrade': lambda: db.session.execute(text("ALTER TABLE diary ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE NOT NULL;")),
      'downgrade': lambda: db.session.execute(text("ALTER TABLE diary DROP COLUMN IF EXISTS is_completed;"))
  },
  {
      'version': '005_add_diary_updated_at',
      'description': 'Add updated_at column to diary table',
      'upgrade': lambda: db.session.execute(text("ALTER TABLE diary ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;")),
      'downgrade': lambda: db.session.execute(text("ALTER TABLE diary DROP COLUMN IF EXISTS updated_at;"))
  }
]

def get_applied_migrations():
    """Get list of applied migrations from database"""
    try:
        return Migration.query.all()
    except Exception as e:
        print(f"Warning: Could not fetch migrations from database: {e}")
        return []

def is_migration_applied(version):
    """Check if a migration has been applied"""
    applied_migrations = get_applied_migrations()
    return any(m.version == version for m in applied_migrations)

def record_migration(version, description):
    """Record a migration as applied in the database"""
    migration = Migration(
        version=version,
        description=description,
        applied_at=datetime.utcnow()
    )
    db.session.add(migration)
    db.session.commit()

def apply_migration(migration):
    """Apply a single migration"""
    version = migration['version']
    description = migration['description']
    upgrade_func = migration['upgrade']
    
    print(f"Applying migration {version}: {description}")
    
    try:
        # Execute the upgrade function
        result = upgrade_func()
        if result is not None:
            # If the function returns a list of results, check them
            if isinstance(result, list):
                for res in result:
                    if res is not None:
                        print(f"  Result: {res}")
        
        # Record the migration
        record_migration(version, description)
        print(f"Successfully applied migration {version}")
        return True
    except Exception as e:
        print(f"Failed to apply migration {version}: {e}")
        db.session.rollback()
        return False

def migrate_up():
    """Apply all pending migrations"""
    print("Checking for pending migrations...")
    
    applied_count = 0
    for migration in MIGRATIONS:
        version = migration['version']
        
        if is_migration_applied(version):
            print(f"Migration {version} already applied, skipping.")
            continue
            
        if apply_migration(migration):
            applied_count += 1
        else:
            print(f"Stopping migration process due to failure in {version}")
            return False
    
    if applied_count == 0:
        print("No pending migrations to apply.")
    else:
        print(f"Successfully applied {applied_count} migration(s).")
    
    return True

def migrate_down(steps=1):
    """Rollback migrations"""
    print(f"Rolling back {steps} migration(s)...")
    
    try:
        # Get applied migrations in reverse order
        applied_migrations = get_applied_migrations()
        if not applied_migrations:
            print("No migrations to rollback.")
            return True
            
        # Sort by applied date descending
        applied_migrations.sort(key=lambda x: x.applied_at, reverse=True)
        
        rolled_back = 0
        for migration_record in applied_migrations[:steps]:
            # Find the migration definition
            migration_def = None
            for mig in MIGRATIONS:
                if mig['version'] == migration_record.version:
                    migration_def = mig
                    break
                    
            if migration_def and 'downgrade' in migration_def:
                print(f"Rolling back migration {migration_record.version}: {migration_record.description}")
                try:
                    downgrade_func = migration_def['downgrade']
                    result = downgrade_func()
                    if result is not None:
                        if isinstance(result, list):
                            for res in result:
                                if res is not None:
                                    print(f"  Result: {res}")
                    
                    # Remove from migrations table
                    db.session.delete(migration_record)
                    db.session.commit()
                    print(f"Successfully rolled back migration {migration_record.version}")
                    rolled_back += 1
                except Exception as e:
                    print(f"Failed to rollback migration {migration_record.version}: {e}")
                    db.session.rollback()
                    return False
            else:
                print(f"No downgrade function for migration {migration_record.version}, skipping.")
        
        print(f"Successfully rolled back {rolled_back} migration(s).")
        return True
    except Exception as e:
        print(f"Error during rollback: {e}")
        return False

def show_status():
    """Show migration status"""
    print("Migration Status:")
    print("-" * 50)
    
    try:
        applied_migrations = get_applied_migrations()
        applied_versions = {m.version for m in applied_migrations}
        
        for migration in MIGRATIONS:
            version = migration['version']
            description = migration['description']
            status = "APPLIED" if version in applied_versions else "PENDING"
            print(f"{version:<15} {status:<10} {description}")
            
        if not MIGRATIONS:
            print("No migrations defined.")
    except Exception as e:
        print(f"Error fetching migration status: {e}")

def init_migration_table():
    """Initialize the migrations table if it doesn't exist"""
    try:
        # Try to query the migrations table to see if it exists
        db.session.execute(text("SELECT 1 FROM migrations LIMIT 1"))
        print("Migrations table already exists.")
    except Exception as e:
        print("Migrations table does not exist. Creating it...")
        try:
            # Create the migrations table
            Migration.__table__.create(db.engine)
            print("Migrations table created successfully.")
        except Exception as e:
            print(f"Failed to create migrations table: {e}")
            return False
    return True

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python migrate.py [up|down|status]")
        return 1
    
    command = sys.argv[1].lower()
    
    # Create minimal Flask app context
    app = create_minimal_app()
    
    with app.app_context():
        # Initialize migrations table
        if not init_migration_table():
            return 1
            
        if command == 'up':
            return 0 if migrate_up() else 1
        elif command == 'down':
            steps = int(sys.argv[2]) if len(sys.argv) > 2 else 1
            return 0 if migrate_down(steps) else 1
        elif command == 'status':
            show_status()
            return 0
        else:
            print(f"Unknown command: {command}")
            print("Usage: python migrate.py [up|down|status]")
            return 1

if __name__ == '__main__':
    sys.exit(main())