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
    def get_or_create_user_by_supabase_id(supabase_user_id):
        """
        Get or create a user based on their Supabase user ID (email)
        This bridges the gap between Supabase authentication and local user records
        """
        # For now, we'll use the email as the identifier since that's what links Supabase and local users
        # In a production environment, you might want to store the Supabase ID directly
        email = supabase_user_id  # Assuming the supabase_user_id is actually the email
        
        # Check if user already exists by email
        user = User.query.filter_by(email=email).first()
        if user:
            return user
            
        # If user doesn't exist, create a new one with minimal information
        # In a real implementation, you'd get more details from the Supabase token
        username = email.split('@')[0] if email else 'user'
        user = User(username=username, email=email)
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