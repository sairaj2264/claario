#!/usr/bin/env python3
"""
Test Migration Script
=====================

This script demonstrates how to use the migration system.
It can be used to test that the migration system works correctly.
"""

import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.flaskServer import create_app
from app.models import db, Migration

def test_migration_system():
    """Test the migration system"""
    print("Testing migration system...")
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        try:
            # Test that we can access the migrations table
            migrations = Migration.query.all()
            print(f"Found {len(migrations)} applied migrations")
            
            # Print migration information
            for migration in migrations:
                print(f"  - {migration.version}: {migration.description} (applied: {migration.applied_at})")
                
            print("Migration system test completed successfully!")
            return True
        except Exception as e:
            print(f"Error testing migration system: {e}")
            return False

if __name__ == '__main__':
    success = test_migration_system()
    sys.exit(0 if success else 1)