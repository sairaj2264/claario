"""
Migration script for chat system tables
This script creates the necessary tables for the anonymous chat system
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Import after adding the path
from app.models import db
from app.models.chat import ChatGroup, Message, UserFlag, BannedUser

def upgrade():
    """
    Create chat system tables
    """
    # Create all chat-related tables
    db.create_all(bind=None)
    
    print("Chat system tables created successfully!")
    print("- chat_groups table")
    print("- messages table")
    print("- user_flags table")
    print("- banned_users table")

def downgrade():
    """
    Drop chat system tables
    """
    # Drop all chat-related tables
    db.drop_all(bind=None)
    
    print("Chat system tables dropped successfully!")

# Note: To run this migration, execute it from the backend directory:
# python -m migrations.chat_migration