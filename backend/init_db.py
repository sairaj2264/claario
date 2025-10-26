"""
Script to initialize the database tables
"""
from app.flaskServer import create_app
from app.models import db

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Database tables created successfully!")