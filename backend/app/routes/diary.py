from flask import Blueprint, jsonify, request
from app.services.diary_service import DiaryService
from app.services.user_service import UserService
from datetime import datetime, date

diary_bp = Blueprint('diary', __name__)

@diary_bp.route('/api/diary/streak/<int:user_id>', methods=['GET'])
def get_user_streak(user_id):
    """Get the current streak for a user"""
    streak = DiaryService.calculate_streak(user_id)
    return jsonify({"streak": streak})

@diary_bp.route('/api/diary/streak-data/<int:user_id>', methods=['GET'])
def get_streak_data(user_id):
    """Get streak data for GitHub-style visualization"""
    days = request.args.get('days', 35, type=int)
    streak_data = DiaryService.get_streak_data(user_id, days)
    return jsonify(streak_data)

@diary_bp.route('/api/diary/monthly/<int:user_id>/<int:year>/<int:month>', methods=['GET'])
def get_monthly_entries(user_id, year, month):
    """Get all diary entries for a user in a specific month"""
    entries = DiaryService.get_monthly_diary_entries(user_id, year, month)
    return jsonify([entry.to_dict() for entry in entries])

@diary_bp.route('/api/diary/entry/<int:user_id>/<string:date_str>', methods=['GET'])
def get_diary_entry(user_id, date_str):
    """Get a specific diary entry for a user on a specific date"""
    try:
        # Parse the date string (expected format: YYYY-MM-DD)
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD"}), 400
    
    entry = DiaryService.get_diary_entry(user_id, date_obj)
    if entry:
        return jsonify(entry.to_dict())
    return jsonify({"error": "Diary entry not found"}), 404

@diary_bp.route('/api/diary/entry/<int:user_id>/<string:date_str>', methods=['POST'])
def create_diary_entry(user_id, date_str):
    """Create a new diary entry for a user on a specific date"""
    try:
        # Parse the date string (expected format: YYYY-MM-DD)
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD"}), 400
    
    # Check if user can edit this date
    if not DiaryService.can_edit_entry(user_id, date_obj):
        return jsonify({"error": "Cannot create/edit entry for this date"}), 403
    
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    mood = data.get('mood')
    
    if not title or not content:
        return jsonify({"error": "Title and content are required"}), 400
    
    entry = DiaryService.create_diary_entry(user_id, date_obj, title, content, mood)
    return jsonify(entry.to_dict()), 201

@diary_bp.route('/api/diary/entry/<int:entry_id>', methods=['PUT'])
def update_diary_entry(entry_id):
    """Update an existing diary entry"""
    data = request.get_json()
    user_id = data.get('user_id')
    title = data.get('title')
    content = data.get('content')
    mood = data.get('mood')
    
    if user_id is None:
        return jsonify({"error": "User ID is required"}), 400
    
    # Check if user can edit this entry's date
    entry = DiaryService.get_diary_entry(user_id, entry_id)
    if entry and not DiaryService.can_edit_entry(user_id, entry.date):
        return jsonify({"error": "Cannot edit entry for this date"}), 403
    
    updated_entry = DiaryService.update_diary_entry(entry_id, user_id, title, content, mood)
    if updated_entry:
        return jsonify(updated_entry.to_dict())
    return jsonify({"error": "Diary entry not found or unauthorized"}), 404

@diary_bp.route('/api/diary/can-edit/<int:user_id>/<string:date_str>', methods=['GET'])
def can_edit_date(user_id, date_str):
    """Check if a user can edit/create an entry for a specific date"""
    try:
        # Parse the date string (expected format: YYYY-MM-DD)
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD"}), 400
    
    can_edit = DiaryService.can_edit_entry(user_id, date_obj)
    return jsonify({"can_edit": can_edit})