from flask import request
from flask_socketio import emit, join_room, leave_room, rooms
from datetime import datetime
from app import socketio
from app.services.chat_service import chat_service
from app.services.content_moderation_service import content_moderation_service
from app.services.therapy_service import therapy_service

@socketio.on('connect')
def handle_connect():
    """Handle new WebSocket connections."""
    print(f'Client connected: {request.environ["REMOTE_ADDR"]}')
    emit('connected', {'data': 'Connected successfully'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnections."""
    print(f'Client disconnected: {request.environ["REMOTE_ADDR"]}')
    
    # Clean up therapy session connections
    # Note: We don't have access to user_session_id here, so we'll need to handle this differently
    # In a real implementation, you might want to store the mapping between request.sid and user_session_id

@socketio.on('join_chat')
def handle_join_chat(data):
    """Handle user joining a chat group."""
    user_session_id = data.get('user_session_id')
    
    if not user_session_id:
        emit('error', {'message': 'User session ID is required'})
        return
    
    # Check if user is banned
    if chat_service.is_user_banned(user_session_id):
        emit('banned', {'message': 'You are banned from chat'})
        return
    
    # Join or create group
    result = chat_service.create_or_join_group(user_session_id)
    
    if result.get('waiting'):
        emit('waiting_for_group', {
            'message': 'Waiting for more users to join...',
            'username': result.get('username')
        })
        return
    
    group = result.get('group')
    if group:
        # Join the SocketIO room
        join_room(str(group['id']))
        
        # Emit group info to the user
        emit('joined_group', {
            'group': group,
            'username': result.get('username'),
            'is_new_group': result.get('is_new_group')
        })
        
        # Notify others in the group about the new user
        # Always notify when a user joins (whether new group or existing group)
        emit('user_joined', {
            'username': result.get('username'),
            'user_session_id': user_session_id,
            'message': f"{result.get('username')} joined the chat"
        }, to=str(group['id']))
        
        # Send recent messages to the user
        messages = chat_service.get_group_messages(group['id'])
        emit('previous_messages', {'messages': messages})
    else:
        emit('error', {'message': 'Failed to join or create group'})

@socketio.on('leave_chat')
def handle_leave_chat(data):
    """Handle user leaving a chat group."""
    user_session_id = data.get('user_session_id')
    
    if not user_session_id:
        emit('error', {'message': 'User session ID is required'})
        return
    
    # Leave the group in our service
    success = chat_service.leave_group(user_session_id)
    
    if success:
        # Get the group ID before removing the user
        # Note: This is a simplification. In a real implementation, you'd want to track this better
        emit('left_chat', {'message': 'You have left the chat'})
    else:
        emit('error', {'message': 'Not in a group'})

@socketio.on('send_message')
def handle_send_message(data):
    """Handle sending a chat message."""
    user_session_id = data.get('user_session_id')
    content = data.get('content')
    
    if not user_session_id or not content:
        emit('error', {'message': 'User session ID and content are required'})
        return
    
    # Check if user is banned
    if chat_service.is_user_banned(user_session_id):
        emit('banned', {'message': 'You are banned from chat'})
        return
    
    # Check if user is in a group
    if user_session_id not in chat_service.user_sessions:
        emit('error', {'message': 'You are not in a chat group'})
        return
    
    group_id = chat_service.user_sessions[user_session_id]
    
    # Save message to database first
    try:
        result = chat_service.send_message(user_session_id, content)
        if not result['success']:
            emit('error', {'message': result.get('error', 'Failed to send message')})
            return
            
        message = result['message']
        
        # Create message object for broadcasting (using the saved message data)
        message_data = {
            'id': message['id'],
            'user_session_id': user_session_id,
            'username': message['username'],
            'content': message['content'],
            'created_at': message['created_at'],
            'flagged': message.get('flagged', False)
        }
        
        # Broadcast message to the group
        emit('new_message', message_data, to=str(group_id))
        
    except Exception as e:
        print(f"Error processing message: {e}")
        emit('error', {'message': 'Failed to process message'})

@socketio.on('typing')
def handle_typing(data):
    """Handle typing indicator."""
    user_session_id = data.get('user_session_id')
    is_typing = data.get('is_typing', False)
    
    if not user_session_id:
        return
    
    # Check if user is in a group
    if user_session_id in chat_service.user_sessions:
        group_id = chat_service.user_sessions[user_session_id]
        username = chat_service.generate_random_username()  # Generate username for typing indicator
        
        # Broadcast typing status to the group
        emit('user_typing', {
            'user_session_id': user_session_id,
            'username': username,
            'is_typing': is_typing
        }, to=str(group_id))

# Import this module in app.py to register the events
# Add this to app.py: from app import socket_events

# Keep track of connected users per session
therapy_session_connections = {}

# Therapy session events
@socketio.on('join_therapy_session')
def handle_join_therapy_session(data):
    """Handle therapist or user joining a therapy session"""
    session_id = data.get('session_id')
    user_id = data.get('user_id')
    
    if not session_id or not user_id:
        emit('error', {'message': 'Session ID and user ID are required'})
        return
    
    # Initialize the session connections tracking if not exists
    if session_id not in therapy_session_connections:
        therapy_session_connections[session_id] = set()
    
    # Add user to the session connections
    therapy_session_connections[session_id].add(user_id)
    
    # Join the SocketIO room for this therapy session
    join_room(f"therapy_{session_id}")
    
    # Check if we should start the session (when both user and therapist have joined)
    from app.services.therapy_service import therapy_service
    session_info = therapy_service.get_user_sessions(session_id)
    
    if session_info and len(session_info) > 0:
        session = session_info[0]
        # If session is accepted and both user and therapist have joined, start the session
        if session['status'] == 'accepted' and len(therapy_session_connections[session_id]) >= 2:
            print(f"Both user and therapist have joined session {session_id}, starting session")
            started_session = therapy_service.start_session(session_id)
            if started_session:
                # Notify all in the session that it has started
                emit('therapy_session_started', {
                    'session': started_session
                }, to=f"therapy_{session_id}")
    
    # Notify others in the session
    emit('user_joined_therapy', {
        'user_id': user_id,
        'message': f"User {user_id} joined the therapy session"
    }, to=f"therapy_{session_id}")

@socketio.on('send_therapy_message')
def handle_send_therapy_message(data):
    """Handle sending a therapy session message"""
    session_id = data.get('session_id')
    sender_id = data.get('sender_id')
    sender_type = data.get('sender_type')  # 'user' or 'therapist'
    content = data.get('content')
    
    if not all([session_id, sender_id, sender_type, content]):
        emit('error', {'message': 'Session ID, sender ID, sender type, and content are required'})
        return
    
    try:
        # Save message to database
        message = therapy_service.send_message(session_id, sender_id, sender_type, content)
        
        # Broadcast message to the therapy session room
        emit('new_therapy_message', message, to=f"therapy_{session_id}")
    except Exception as e:
        emit('error', {'message': f'Failed to send message: {str(e)}'})

@socketio.on('leave_therapy_session')
def handle_leave_therapy_session(data):
    """Handle user or therapist leaving a therapy session"""
    session_id = data.get('session_id')
    user_id = data.get('user_id')
    
    if not session_id or not user_id:
        emit('error', {'message': 'Session ID and user ID are required'})
        return
    
    # Remove user from the session connections
    if session_id in therapy_session_connections and user_id in therapy_session_connections[session_id]:
        therapy_session_connections[session_id].remove(user_id)
        # Clean up the set if it's empty
        if not therapy_session_connections[session_id]:
            del therapy_session_connections[session_id]
    
    # Leave the SocketIO room for this therapy session
    leave_room(f"therapy_{session_id}")
    
    # Notify others in the session
    emit('user_left_therapy', {
        'user_id': user_id,
        'message': f"User {user_id} left the therapy session"
    }, to=f"therapy_{session_id}")