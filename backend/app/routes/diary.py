from flask import Blueprint, jsonify, request
from app.services.diary_service import DiaryService
from app.services.user_service import UserService
from datetime import datetime, date

diary_bp = Blueprint('diary', __name__)

@diary_bp.route('/api/diary/streak/<string:supabase_user_id>', methods=['GET'])
def get_user_streak(supabase_user_id):
    """Get the current streak for a user"""
    # Map Supabase user ID to local user ID
    user = UserService.get_or_create_user_by_supabase_id(supabase_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    streak = DiaryService.calculate_streak(user.id)
    return jsonify({"streak": streak})

@diary_bp.route('/api/diary/streak-data/<string:supabase_user_id>', methods=['GET'])
def get_streak_data(supabase_user_id):
    """Get streak data for GitHub-style visualization"""
    # Map Supabase user ID to local user ID
    user = UserService.get_or_create_user_by_supabase_id(supabase_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    days = request.args.get('days', 35, type=int)
    streak_data = DiaryService.get_streak_data(user.id, days)
    return jsonify(streak_data)

@diary_bp.route('/api/diary/monthly/<string:supabase_user_id>/<int:year>/<int:month>', methods=['GET'])
def get_monthly_entries(supabase_user_id, year, month):
    """Get all diary entries for a user in a specific month"""
    # Map Supabase user ID to local user ID
    user = UserService.get_or_create_user_by_supabase_id(supabase_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    entries = DiaryService.get_monthly_diary_entries(user.id, year, month)
    return jsonify([entry.to_dict() for entry in entries])

@diary_bp.route('/api/diary/entry/<string:supabase_user_id>/<string:date_str>', methods=['GET'])
def get_diary_entry(supabase_user_id, date_str):
    """Get a specific diary entry for a user on a specific date"""
    # Map Supabase user ID to local user ID
    user = UserService.get_or_create_user_by_supabase_id(supabase_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    try:
        # Parse the date string (expected format: YYYY-MM-DD)
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD"}), 400
     
    entry = DiaryService.get_diary_entry(user.id, date_obj)
    if entry:
        return jsonify(entry.to_dict())
    return jsonify({"error": "Diary entry not found"}), 404

@diary_bp.route('/api/diary/entry/<string:supabase_user_id>/<string:date_str>', methods=['POST'])
def create_diary_entry(supabase_user_id, date_str):
    """Create a new diary entry for a user on a specific date"""
    # Map Supabase user ID to local user ID
    user = UserService.get_or_create_user_by_supabase_id(supabase_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    try:
        # Parse the date string (expected format: YYYY-MM-DD)
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD"}), 400
     
    # Check if user can edit this date
    if not DiaryService.can_edit_entry(user.id, date_obj):
        return jsonify({"error": "Cannot create/edit entry for this date"}), 403
     
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    mood = data.get('mood')
     
    if not title or not content:
        return jsonify({"error": "Title and content are required"}), 400
     
    entry = DiaryService.create_diary_entry(user.id, date_obj, title, content, mood)
    return jsonify(entry.to_dict()), 201

@diary_bp.route('/api/diary/entry/<int:entry_id>', methods=['PUT'])
def update_diary_entry(entry_id):
    """Update an existing diary entry"""
    data = request.get_json()
    supabase_user_id = data.get('user_id')  # This is now the Supabase user ID (email)
    title = data.get('title')
    content = data.get('content')
    mood = data.get('mood')
     
    if supabase_user_id is None:
        return jsonify({"error": "User ID is required"}), 400
        
    # Map Supabase user ID to local user ID
    user = UserService.get_or_create_user_by_supabase_id(supabase_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
     
    # Check if user can edit this entry's date
    entry = DiaryService.get_diary_entry(user.id, entry_id)
    if entry and not DiaryService.can_edit_entry(user.id, entry.date):
        return jsonify({"error": "Cannot edit entry for this date"}), 403
     
    updated_entry = DiaryService.update_diary_entry(entry_id, user.id, title, content, mood)
    if updated_entry:
        return jsonify(updated_entry.to_dict())
    return jsonify({"error": "Diary entry not found or unauthorized"}), 404

@diary_bp.route('/api/diary/can-edit/<string:supabase_user_id>/<string:date_str>', methods=['GET'])
def can_edit_date(supabase_user_id, date_str):
    """Check if a user can edit/create an entry for a specific date"""
    # Map Supabase user ID to local user ID
    user = UserService.get_or_create_user_by_supabase_id(supabase_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    try:
        # Parse the date string (expected format: YYYY-MM-DD)
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD"}), 400
     
    can_edit = DiaryService.can_edit_entry(user.id, date_obj)
    return jsonify({"can_edit": can_edit})