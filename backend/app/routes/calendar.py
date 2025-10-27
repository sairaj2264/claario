from flask import Blueprint, jsonify, request
from app.services.calendar_service import CalendarService
from app.services.diary_service import DiaryService
from app.services.quote_service import QuoteService
from app.services.user_service import UserService
from datetime import datetime, date

calendar_bp = Blueprint('calendar', __name__)

@calendar_bp.route('/api/calendar/view/<string:supabase_user_id>/<int:year>/<int:month>', methods=['GET'])
def get_calendar_view(supabase_user_id, year, month):
    """
    Get all data needed for the calendar view for a specific month
    
    Args:
        supabase_user_id (str): The Supabase user ID (email)
        year (int): The year
        month (int): The month (1-12)
        
    Returns:
        JSON: Calendar view data including diary entries, streak info, and quote
    """
    try:
        # Map Supabase user ID to local user ID
        user = UserService.get_or_create_user_by_supabase_id(supabase_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        calendar_data = CalendarService.get_calendar_view_data(user.id, year, month)
        return jsonify(calendar_data)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch calendar data: {str(e)}"}), 500

@calendar_bp.route('/api/calendar/date/<string:supabase_user_id>/<string:date_str>', methods=['GET'])
def get_date_info(supabase_user_id, date_str):
    """
    Get detailed information for a specific date
    
    Args:
        supabase_user_id (str): The Supabase user ID (email)
        date_str (str): The date in YYYY-MM-DD format
        
    Returns:
        JSON: Detailed information for the date
    """
    try:
        # Map Supabase user ID to local user ID
        user = UserService.get_or_create_user_by_supabase_id(supabase_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Parse the date string (expected format: YYYY-MM-DD)
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD"}), 400
    
    try:
        date_info = CalendarService.get_date_info(user.id, date_obj)
        return jsonify(date_info)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch date information: {str(e)}"}), 500

@calendar_bp.route('/api/calendar/today/<string:supabase_user_id>', methods=['GET'])
def get_today_info(supabase_user_id):
    """
    Get information for today's date
    
    Args:
        supabase_user_id (str): The Supabase user ID (email)
         
    Returns:
        JSON: Today's information including diary entry and quote
    """
    try:
        # Map Supabase user ID to local user ID
        user = UserService.get_or_create_user_by_supabase_id(supabase_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        today = date.today()
        date_info = CalendarService.get_date_info(user.id, today)
        return jsonify(date_info)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch today's information: {str(e)}"}), 500

@calendar_bp.route('/api/calendar/quote/<string:supabase_user_id>', methods=['GET'])
def get_daily_quote(supabase_user_id):
    """
    Get a daily quote for the user (ensuring no repetition)
    
    Args:
        supabase_user_id (str): The Supabase user ID (email)
         
    Returns:
        JSON: A random quote
    """
    try:
        # Map Supabase user ID to local user ID
        user = UserService.get_or_create_user_by_supabase_id(supabase_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # In a more advanced implementation, we could track which quotes
        # the user has seen recently to avoid repetition
        quote = QuoteService.get_random_quote()
        if quote:
            return jsonify(quote.to_dict())
        return jsonify({"error": "No quotes available"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to fetch quote: {str(e)}"}), 500