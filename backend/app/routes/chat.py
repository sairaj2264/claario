from flask import Blueprint, request, jsonify
from sqlalchemy import and_
from app.models import db
from app.models.chat import ChatGroup, Message, UserFlag, BannedUser
from app.services.chat_service import chat_service
from app.services.content_moderation_service import content_moderation_service

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/api/chat/session', methods=['POST'])
def create_session():
    """Create a new chat session for an anonymous user."""
    try:
        user_session_id = chat_service.generate_user_session_id()
        return jsonify({
            'success': True,
            'user_session_id': user_session_id
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chat_bp.route('/api/chat/group', methods=['POST'])
def join_group():
    """Join or create a chat group."""
    try:
        data = request.get_json()
        user_session_id = data.get('user_session_id')
        
        if not user_session_id:
            return jsonify({
                'success': False,
                'error': 'User session ID is required'
            }), 400
        
        # Check if user is banned
        if chat_service.is_user_banned(user_session_id):
            return jsonify({
                'success': False,
                'error': 'User is banned from chat',
                'banned': True
            }), 403
        
        # Join or create group
        result = chat_service.create_or_join_group(user_session_id)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chat_bp.route('/api/chat/message', methods=['POST'])
def send_message():
    """Send a message to the chat group."""
    try:
        data = request.get_json()
        user_session_id = data.get('user_session_id')
        content = data.get('content')
        
        if not user_session_id or not content:
            return jsonify({
                'success': False,
                'error': 'User session ID and content are required'
            }), 400
        
        # Check if user is banned
        if chat_service.is_user_banned(user_session_id):
            return jsonify({
                'success': False,
                'error': 'User is banned from chat',
                'banned': True
            }), 403
        
        # Send message
        result = chat_service.send_message(user_session_id, content)
        
        if not result['success']:
            return jsonify(result), 400
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chat_bp.route('/api/chat/messages/<int:group_id>', methods=['GET'])
def get_messages(group_id):
    """Get messages for a specific group."""
    try:
        limit = request.args.get('limit', 50, type=int)
        since = request.args.get('since', 0, type=int)
        
        # If since parameter is provided, fetch messages after that ID
        if since > 0:
            messages = chat_service.get_messages_since(group_id, since)
        else:
            # Otherwise fetch the last N messages
            messages = chat_service.get_group_messages(group_id, limit)
        
        return jsonify({
            'success': True,
            'messages': messages
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chat_bp.route('/api/chat/leave', methods=['POST'])
def leave_group():
    """Leave the current chat group."""
    try:
        data = request.get_json()
        user_session_id = data.get('user_session_id')
        
        if not user_session_id:
            return jsonify({
                'success': False,
                'error': 'User session ID is required'
            }), 400
        
        success = chat_service.leave_group(user_session_id)
        
        return jsonify({
            'success': success,
            'message': 'Left group successfully' if success else 'Not in a group'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chat_bp.route('/api/chat/status/<user_session_id>', methods=['GET'])
def get_user_status(user_session_id):
    """Get user's current chat status."""
    try:
        status = chat_service.get_user_status(user_session_id)
        
        return jsonify({
            'success': True,
            'status': status
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chat_bp.route('/api/chat/moderate', methods=['POST'])
def moderate_content():
    """Moderate content without sending it."""
    try:
        data = request.get_json()
        content = data.get('content')
        
        if not content:
            return jsonify({
                'success': False,
                'error': 'Content is required'
            }), 400
        
        # Moderate content
        result = content_moderation_service.moderate_content(content)
        censored_content, violations = content_moderation_service.censor_content(content)
        
        return jsonify({
            'success': True,
            'moderation_result': result,
            'censored_content': censored_content,
            'violations': violations
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Admin routes for managing flagged users and bans
@chat_bp.route('/api/chat/admin/flagged-users', methods=['GET'])
def get_flagged_users():
    """Get all flagged users (admin only)."""
    try:
        # In a real implementation, you would check admin permissions here
        flagged_users = UserFlag.query.filter(UserFlag.flag_count > 0)\
                                     .order_by(UserFlag.flag_count.desc())\
                                     .all()
        
        return jsonify({
            'success': True,
            'flagged_users': [user.to_dict() for user in flagged_users]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chat_bp.route('/api/chat/admin/banned-users', methods=['GET'])
def get_banned_users():
    """Get all banned users (admin only)."""
    try:
        # In a real implementation, you would check admin permissions here
        banned_users = chat_service.get_banned_users()
        
        return jsonify({
            'success': True,
            'banned_users': banned_users
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chat_bp.route('/api/chat/admin/unban', methods=['POST'])
def unban_user():
    """Unban a user (admin only)."""
    try:
        data = request.get_json()
        user_session_id = data.get('user_session_id')
        
        if not user_session_id:
            return jsonify({
                'success': False,
                'error': 'User session ID is required'
            }), 400
        
        # In a real implementation, you would check admin permissions here
        success = chat_service.unban_user(user_session_id)
        
        return jsonify({
            'success': success,
            'message': 'User unbanned successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500