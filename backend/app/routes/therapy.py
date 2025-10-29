"""
Therapy Routes Module
API endpoints for therapy session management
"""

from flask import Blueprint, request, jsonify
from app.services.therapy_service import therapy_service
from app.services.user_service import UserService

therapy_bp = Blueprint('therapy', __name__)

@therapy_bp.route('/api/therapy/request', methods=['POST'])
def create_therapy_request():
    """Create a new therapy session request"""
    try:
        data = request.get_json()
        user_session_id = data.get('user_session_id')
        user_email = data.get('user_email')
        
        if not user_session_id or not user_email:
            return jsonify({
                'success': False,
                'error': 'User session ID and email are required'
            }), 400
        
        result = therapy_service.create_therapy_request(user_session_id, user_email)
        
        return jsonify({
            'success': True,
            'session': result
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@therapy_bp.route('/api/therapy/pending', methods=['GET'])
def get_pending_sessions():
    """Get all pending therapy sessions (for therapists)"""
    try:
        sessions = therapy_service.get_pending_sessions()
        
        return jsonify({
            'success': True,
            'sessions': sessions
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@therapy_bp.route('/api/therapy/accept/<int:session_id>', methods=['POST'])
def accept_session(session_id):
    """Accept a therapy session request"""
    try:
        data = request.get_json()
        therapist_id = data.get('therapist_id')
        
        if not therapist_id:
            return jsonify({
                'success': False,
                'error': 'Therapist ID is required'
            }), 400
        
        result = therapy_service.accept_session(session_id, therapist_id)
        
        if result:
            return jsonify({
                'success': True,
                'session': result
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Session not found or already accepted'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@therapy_bp.route('/api/therapy/start/<int:session_id>', methods=['POST'])
def start_session(session_id):
    """Start a therapy session"""
    try:
        result = therapy_service.start_session(session_id)
        
        if result:
            return jsonify({
                'success': True,
                'session': result
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Session not found or not accepted'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@therapy_bp.route('/api/therapy/end/<int:session_id>', methods=['POST'])
def end_session(session_id):
    """End a therapy session"""
    try:
        result = therapy_service.end_session(session_id)
        
        if result:
            return jsonify({
                'success': True,
                'session': result
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Session not found or not in progress'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@therapy_bp.route('/api/therapy/therapist/<therapist_id>', methods=['GET'])
def get_therapist_sessions(therapist_id):
    """Get all sessions for a specific therapist"""
    try:
        sessions = therapy_service.get_therapist_sessions(therapist_id)
        
        return jsonify({
            'success': True,
            'sessions': sessions
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@therapy_bp.route('/api/therapy/user/<user_session_id>', methods=['GET'])
def get_user_sessions(user_session_id):
    """Get all sessions for a specific user"""
    try:
        sessions = therapy_service.get_user_sessions(user_session_id)
        
        return jsonify({
            'success': True,
            'sessions': sessions
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@therapy_bp.route('/api/therapy/message', methods=['POST'])
def send_message():
    """Send a message in a therapy session"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        sender_id = data.get('sender_id')
        sender_type = data.get('sender_type')  # 'user' or 'therapist'
        content = data.get('content')
        
        if not all([session_id, sender_id, sender_type, content]):
            return jsonify({
                'success': False,
                'error': 'Session ID, sender ID, sender type, and content are required'
            }), 400
        
        result = therapy_service.send_message(session_id, sender_id, sender_type, content)
        
        return jsonify({
            'success': True,
            'message': result
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@therapy_bp.route('/api/therapy/messages/<int:session_id>', methods=['GET'])
def get_session_messages(session_id):
    """Get all messages for a therapy session"""
    try:
        messages = therapy_service.get_session_messages(session_id)
        
        return jsonify({
            'success': True,
            'messages': messages
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500