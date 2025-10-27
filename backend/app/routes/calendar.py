from flask import Blueprint, jsonify, request
from app.services.calendar_service import CalendarService
from app.services.diary_service import DiaryService
from app.services.quote_service import QuoteService
from datetime import datetime, date

calendar_bp = Blueprint('calendar', __name__)

@calendar_bp.route('/api/calendar/view/<int:user_id>/<int:year>/<int:month>', methods=['GET'])
def get_calendar_view(user_id, year, month):
    """
    Get all data needed for the calendar view for a specific month
    
    Args:
        user_id (int): The user ID
        year (int): The year
        month (int): The month (1-12)
        
    Returns:
        JSON: Calendar view data including diary entries, streak info, and quote
    """
    try:
        calendar_data = CalendarService.get_calendar_view_data(user_id, year, month)
        return jsonify(calendar_data)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch calendar data: {str(e)}"}), 500

@calendar_bp.route('/api/calendar/date/<int:user_id>/<string:date_str>', methods=['GET'])
def get_date_info(user_id, date_str):
    """
    Get detailed information for a specific date
    
    Args:
        user_id (int): The user ID
        date_str (str): The date in YYYY-MM-DD format
        
    Returns:
        JSON: Detailed information for the date
    """
    try:
        # Parse the date string (expected format: YYYY-MM-DD)
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD"}), 400
    
    try:
        date_info = CalendarService.get_date_info(user_id, date_obj)
        return jsonify(date_info)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch date information: {str(e)}"}), 500

@calendar_bp.route('/api/calendar/today/<int:user_id>', methods=['GET'])
def get_today_info(user_id):
    """
    Get information for today's date
    
    Args:
        user_id (int): The user ID
        
    Returns:
        JSON: Today's information including diary entry and quote
    """
    try:
        today = date.today()
        date_info = CalendarService.get_date_info(user_id, today)
        return jsonify(date_info)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch today's information: {str(e)}"}), 500

@calendar_bp.route('/api/calendar/quote/<int:user_id>', methods=['GET'])
def get_daily_quote(user_id):
    """
    Get a daily quote for the user (ensuring no repetition)
    
    Args:
        user_id (int): The user ID
        
    Returns:
        JSON: A random quote
    """
    try:
        # In a more advanced implementation, we could track which quotes
        # the user has seen recently to avoid repetition
        quote = QuoteService.get_random_quote()
        if quote:
            return jsonify(quote.to_dict())
        return jsonify({"error": "No quotes available"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to fetch quote: {str(e)}"}), 500