# Initialize SQLAlchemy instance
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import all models to ensure they are registered with SQLAlchemy
from app.models.user import User
from app.models.diary import Diary
from app.models.quote import Quote
from app.models.migration import Migration