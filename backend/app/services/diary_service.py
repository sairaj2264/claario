from app.models.diary import Diary
from app.models.user import User
from app.models import db
from datetime import datetime, timedelta, date
from sqlalchemy import and_, or_, func

class DiaryService:
    @staticmethod
    def get_diary_entry(user_id, date):
        """Get a diary entry for a specific user and date"""
        return Diary.query.filter_by(user_id=user_id, date=date).first()
    
    @staticmethod
    def create_diary_entry(user_id, date, title, content, mood=None):
        """
        Create a new diary entry
        
        Args:
            user_id (int): The user ID
            date (date): The date of the diary entry
            title (str): The title of the diary entry
            content (str): The content of the diary entry
            mood (str, optional): The mood emoji
            
        Returns:
            Diary: The created diary entry
        """
        # Check if entry already exists for this date
        existing_entry = DiaryService.get_diary_entry(user_id, date)
        if existing_entry:
            return existing_entry
            
        # Create new diary entry
        diary_entry = Diary(
            user_id=user_id,
            date=date,
            title=title,
            content=content,
            mood=mood,
            is_completed=True
        )
        db.session.add(diary_entry)
        db.session.commit()
        return diary_entry
    
    @staticmethod
    def update_diary_entry(entry_id, user_id, title=None, content=None, mood=None):
        """
        Update an existing diary entry
        
        Args:
            entry_id (int): The ID of the diary entry to update
            user_id (int): The user ID (for verification)
            title (str, optional): The new title
            content (str, optional): The new content
            mood (str, optional): The new mood
            
        Returns:
            Diary: The updated diary entry or None if not found/authorized
        """
        diary_entry = Diary.query.filter_by(id=entry_id, user_id=user_id).first()
        if not diary_entry:
            return None
            
        if title is not None:
            diary_entry.title = title
        if content is not None:
            diary_entry.content = content
        if mood is not None:
            diary_entry.mood = mood
            
        diary_entry.is_completed = True
        diary_entry.updated_at = datetime.utcnow()
        db.session.commit()
        return diary_entry
    
    @staticmethod
    def get_monthly_diary_entries(user_id, year, month):
        """
        Get all diary entries for a user in a specific month
        
        Args:
            user_id (int): The user ID
            year (int): The year
            month (int): The month (1-12)
            
        Returns:
            list: List of diary entries for the month
        """
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)
            
        return Diary.query.filter(
            and_(
                Diary.user_id == user_id,
                Diary.date >= start_date,
                Diary.date < end_date
            )
        ).all()
    
    @staticmethod
    def can_edit_entry(user_id, date):
        """
        Check if a user can edit/create an entry for a specific date
        Users can:
        - Create entries for today
        - Edit entries for the past 2 days
        
        Args:
            user_id (int): The user ID
            date (date): The date to check
            
        Returns:
            bool: True if the user can edit/create an entry for the date
        """
        today = date.today()
        
        # Can always create/edit today's entry
        if date == today:
            return True
            
        # Can edit past 2 days
        if today - timedelta(days=2) <= date < today:
            return True
            
        return False
    
    @staticmethod
    def calculate_streak(user_id):
        """
        Calculate the current streak for a user based on consecutive diary entries
        
        Args:
            user_id (int): The user ID
            
        Returns:
            int: The current streak count
        """
        # Get all completed diary entries for the user, ordered by date descending
        entries = Diary.query.filter_by(user_id=user_id, is_completed=True)\
                            .order_by(Diary.date.desc()).all()
        
        if not entries:
            return 0
            
        streak = 0
        current_date = date.today()
        
        # Check if the user has an entry for today or yesterday
        # (to maintain streak if they missed today but did yesterday)
        has_today = any(entry.date == current_date for entry in entries)
        has_yesterday = any(entry.date == current_date - timedelta(days=1) for entry in entries)
        
        # If no entry for today or yesterday, streak is 0
        if not has_today and not has_yesterday:
            return 0
            
        # Start from today or yesterday if today doesn't exist
        check_date = current_date if has_today else current_date - timedelta(days=1)
        
        # Count consecutive days backward
        while True:
            # Check if there's an entry for check_date
            entry_exists = any(entry.date == check_date for entry in entries)
            if not entry_exists:
                break
                
            streak += 1
            check_date -= timedelta(days=1)
            
        return streak
    
    @staticmethod
    def get_streak_data(user_id, days=35):
        """
        Get streak data for the last N days for GitHub-style visualization
        
        Args:
            user_id (int): The user ID
            days (int): Number of days to retrieve (default: 35 for 5 weeks)
            
        Returns:
            list: List of dicts with date and completion status
        """
        # Calculate the start date
        end_date = date.today()
        start_date = end_date - timedelta(days=days-1)
        
        # Get all diary entries for the user in the date range
        entries = Diary.query.filter(
            and_(
                Diary.user_id == user_id,
                Diary.date >= start_date,
                Diary.date <= end_date,
                Diary.is_completed == True
            )
        ).all()
        
        # Create a set of dates with completed entries
        completed_dates = {entry.date for entry in entries}
        
        # Generate streak data for each day
        streak_data = []
        for i in range(days):
            check_date = start_date + timedelta(days=i)
            streak_data.append({
                'date': check_date.isoformat(),
                'completed': check_date in completed_dates,
                'year': check_date.year,
                'month': check_date.month,
                'day': check_date.day
            })
            
        return streak_data