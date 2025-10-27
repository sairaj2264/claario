from app.models.diary import Diary
from app.models.user import User
from app.models import db
from datetime import datetime, timedelta, date
from sqlalchemy import and_, or_, func
from app.services.diary_service import DiaryService
from app.services.quote_service import QuoteService

class CalendarService:
    @staticmethod
    def get_calendar_view_data(user_id, year, month):
        """
        Get all data needed for the calendar view for a specific month
        
        Args:
            user_id (int): The user ID
            year (int): The year
            month (int): The month (1-12)
            
        Returns:
            dict: Calendar view data including diary entries, streak info, and quote
        """
        # Get diary entries for the month
        diary_entries = DiaryService.get_monthly_diary_entries(user_id, year, month)
        
        # Convert to dictionary for easier frontend consumption
        entries_dict = {}
        for entry in diary_entries:
            date_str = entry.date.isoformat()
            entries_dict[date_str] = {
                'id': entry.id,
                'title': entry.title,
                'content': entry.content,
                'mood': entry.mood,
                'is_completed': entry.is_completed,
                'created_at': entry.created_at.isoformat() if entry.created_at else None
            }
        
        # Get streak information
        streak = DiaryService.calculate_streak(user_id)
        streak_data = DiaryService.get_streak_data(user_id, 35)  # Last 35 days for visualization
        
        # Get a random quote (could be enhanced to avoid recent quotes)
        quote = QuoteService.get_random_quote()
        quote_data = quote.to_dict() if quote else None
        
        # Get today's diary entry if it exists
        today = date.today()
        today_entry = DiaryService.get_diary_entry(user_id, today)
        today_entry_data = today_entry.to_dict() if today_entry else None
        
        return {
            'year': year,
            'month': month,
            'diary_entries': entries_dict,
            'streak': streak,
            'streak_data': streak_data,
            'quote': quote_data,
            'today_entry': today_entry_data,
            'can_edit_today': DiaryService.can_edit_entry(user_id, today)
        }
    
    @staticmethod
    def get_date_info(user_id, date_obj):
        """
        Get detailed information for a specific date
        
        Args:
            user_id (int): The user ID
            date_obj (date): The date to get information for
            
        Returns:
            dict: Detailed information for the date
        """
        # Get diary entry for the date
        entry = DiaryService.get_diary_entry(user_id, date_obj)
        entry_data = entry.to_dict() if entry else None
        
        # Check if user can edit this date
        can_edit = DiaryService.can_edit_entry(user_id, date_obj)
        
        # Get a random quote
        quote = QuoteService.get_random_quote()
        quote_data = quote.to_dict() if quote else None
        
        return {
            'date': date_obj.isoformat(),
            'diary_entry': entry_data,
            'can_edit': can_edit,
            'quote': quote_data
        }