import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Use DATABASE_URL if available, otherwise construct from individual components
    DATABASE_URL = os.getenv('DATABASE_URL')
    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        # Supabase database connection
        # Replace these values with your actual Supabase credentials
        DB_HOST = os.getenv('DB_HOST', 'db.supabase.co')
        DB_NAME = os.getenv('DB_NAME', 'your_database_name')
        DB_USER = os.getenv('DB_USER', 'your_username')
        DB_PASSWORD = os.getenv('DB_PASSWORD', 'your_password')
        DB_PORT = os.getenv('DB_PORT', '5432')
        
        # SQLAlchemy configuration
        SQLALCHEMY_DATABASE_URI = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False