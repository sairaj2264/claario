from app.models.user import User
from app.models import db

class UserService:
    @staticmethod
    def get_all_users():
        return User.query.all()
    
    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(user_id)
    
    @staticmethod
    def create_user(username, email, name=None, gender=None, age=None):
        user = User(username=username, email=email, name=name, gender=gender, age=age)
        db.session.add(user)
        db.session.commit()
        return user
    
    @staticmethod
    def create_or_update_user_from_oauth(username, email, name=None, gender=None, age=None):
        # Check if user already exists by email
        user = User.query.filter_by(email=email).first()
        if user:
            # Update existing user with new information
            user.username = username
            user.name = name or user.name
            user.gender = gender or user.gender
            user.age = age or user.age
            db.session.commit()
        else:
            # Create new user
            user = User(username=username, email=email, name=name, gender=gender, age=age)
            db.session.add(user)
            db.session.commit()
        return user
    
    @staticmethod
    def update_user(user_id, username=None, email=None, name=None, gender=None, age=None):
        user = User.query.get(user_id)
        if user:
            if username:
                user.username = username
            if email:
                user.email = email
            if name is not None:
                user.name = name
            if gender is not None:
                user.gender = gender
            if age is not None:
                user.age = age
            db.session.commit()
        return user
    
    @staticmethod
    def delete_user(user_id):
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return True
        return False