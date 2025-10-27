#!/usr/bin/env python3
"""
Advanced Database Migration Script using Flask-Migrate
=====================================================

This script provides a more robust migration system using Flask-Migrate,
which is the standard migration tool for Flask-SQLAlchemy applications.

Usage:
    python advanced_migrate.py [init|migrate|upgrade|downgrade|history]

Commands:
    init        Initialize migrations repository
    migrate     Generate migration script from model changes
    upgrade     Apply pending migrations
    downgrade   Rollback migrations
    history     Show migration history
"""

import os
import sys
from flask.cli import with_appcontext
import click

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.flaskServer import create_app
from app.models import db
from flask_migrate import Migrate

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python advanced_migrate.py [init|migrate|upgrade|downgrade|history|current]")
        print("\nCommands:")
        print("  init        Initialize migrations repository")
        print("  migrate     Generate migration script from model changes")
        print("  upgrade     Apply pending migrations")
        print("  downgrade   Rollback migrations")
        print("  history     Show migration history")
        print("  current     Show current migration revision")
        return 1
    
    command = sys.argv[1].lower()
    
    # Create the Flask app and initialize Flask-Migrate
    app = create_app()
    migrate = Migrate(app, db)
    
    # Set the FLASK_APP environment variable
    os.environ['FLASK_APP'] = 'app.flaskServer:create_app'
    
    # Build the command
    cmd_parts = ['flask', 'db', command]
    if len(sys.argv) > 2:
        cmd_parts.extend(sys.argv[2:])
    
    # Execute the command
    cmd = ' '.join(cmd_parts)
    print(f"Executing: {cmd}")
    
    # Change to the backend directory
    original_dir = os.getcwd()
    backend_dir = os.path.join(os.path.dirname(__file__), '..')
    os.chdir(backend_dir)
    
    try:
        result = os.system(cmd)
        os.chdir(original_dir)
        if result == 0:
            print(f"Command '{command}' executed successfully.")
            return 0
        else:
            print(f"Command '{command}' failed with exit code {result}.")
            return 1
    except Exception as e:
        os.chdir(original_dir)
        print(f"Exception occurred: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())