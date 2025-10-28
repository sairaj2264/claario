from flask import request
from flask_socketio import emit, join_room, leave_room, rooms
from datetime import datetime
from app import socketio
from app.services.chat_service import chat_service
from app.services.content_moderation_service import content_moderation_service

@socketio.on('connect')
def handle_connect():
    """Handle new WebSocket connections."""
    print(f'Client connected: {request.environ["REMOTE_ADDR"]}')
    emit('connected', {'data': 'Connected successfully'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnections."""
    print(f'Client disconnected: {request.environ["REMOTE_ADDR"]}')
    
    # Remove user from any chat groups they might be in
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
        if not result.get('is_new_group'):
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
    
    # Moderate content
    moderation_result = content_moderation_service.moderate_content(content)
    
    # If content is inappropriate, flag the user
    if not moderation_result['is_appropriate']:
        chat_service.flag_user(user_session_id, ', '.join(moderation_result['violations']))
    
    # Censor content before sending
    censored_content, violations = content_moderation_service.censor_content(content)
    
    # Generate username for this message
    username = chat_service.generate_random_username()
    
    # Create message object
    message_data = {
        'user_session_id': user_session_id,
        'username': username,
        'content': censored_content,
        'timestamp': datetime.utcnow().isoformat(),
        'was_flagged': not moderation_result['is_appropriate'],
        'violations': violations
    }
    
    # Broadcast message to the group
    emit('new_message', message_data, to=str(group_id))
    
    # Save message to database
    try:
        result = chat_service.send_message(user_session_id, content)
        # We don't need to do anything special here since send_message already saves to DB
    except Exception as e:
        print(f"Error saving message to database: {e}")

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