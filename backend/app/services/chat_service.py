import uuid
import random
import string
from datetime import datetime, timedelta
from sqlalchemy import and_, or_
from app.models import db
from app.models.chat import ChatGroup, Message, UserFlag, BannedUser
from app.services.content_moderation_service import content_moderation_service

class ChatService:
    def __init__(self):
        # In-memory storage for active chat groups and user sessions
        # In a production environment, you might want to use Redis for this
        self.active_groups = {}  # group_id -> list of user_session_ids
        self.user_sessions = {}  # user_session_id -> group_id
        self.waiting_users = []  # list of user_session_ids waiting to be matched

    def generate_user_session_id(self):
        """Generate a unique session ID for anonymous users."""
        return str(uuid.uuid4())

    def generate_random_username(self):
        """Generate a random anonymous username."""
        adjectives = ['Cool', 'Awesome', 'Brave', 'Clever', 'Swift', 'Bright', 'Witty', 'Smart', 'Quick', 'Bold']
        nouns = ['Panda', 'Eagle', 'Tiger', 'Wolf', 'Fox', 'Bear', 'Lion', 'Hawk', 'Shark', 'Falcon']
        
        adjective = random.choice(adjectives)
        noun = random.choice(nouns)
        number = random.randint(10, 99)
        
        return f"{adjective}{noun}{number}"

    def create_or_join_group(self, user_session_id):
        """
        Create a new chat group or join an existing one.
        Returns group information and whether user joined a new or existing group.
        """
        # Check if user is already in a group
        if user_session_id in self.user_sessions:
            group_id = self.user_sessions[user_session_id]
            group = ChatGroup.query.get(group_id)
            if group and group.is_active:
                # Get existing group members
                members = []
                if group_id in self.active_groups:
                    members = list(self.active_groups[group_id])
                
                return {
                    'group': group.to_dict(),
                    'is_new_group': False,
                    'members': members,
                    'username': self.generate_random_username()  # Generate new username for each session
                }
        
        # Try to match with waiting users first
        if len(self.waiting_users) > 0:
            # Add current user to waiting list
            self.waiting_users.append(user_session_id)
            
            # If we have at least 2 users (for testing), create a group
            # In production, you might want to keep this at 5
            if len(self.waiting_users) >= 2:
                # Take all waiting users (up to 5)
                group_size = min(len(self.waiting_users), 5)
                group_users = self.waiting_users[:group_size]
                self.waiting_users = self.waiting_users[group_size:]
                
                # Create new group in database
                group = ChatGroup(max_members=5)
                db.session.add(group)
                db.session.commit()
                
                # Update in-memory tracking
                self.active_groups[group.id] = group_users
                for uid in group_users:
                    self.user_sessions[uid] = group.id
                
                # Return group info
                return {
                    'group': group.to_dict(),
                    'is_new_group': True,
                    'members': group_users,
                    'username': self.generate_random_username()
                }
        else:
            # Add user to waiting list
            self.waiting_users.append(user_session_id)
        
        # If we couldn't form a group, return waiting status
        return {
            'group': None,
            'is_new_group': False,
            'members': [],
            'username': self.generate_random_username(),
            'waiting': True
        }

    def leave_group(self, user_session_id):
        """Remove user from their current group."""
        if user_session_id in self.user_sessions:
            group_id = self.user_sessions[user_session_id]
            
            # Remove user from in-memory tracking
            if group_id in self.active_groups:
                if user_session_id in self.active_groups[group_id]:
                    self.active_groups[group_id].remove(user_session_id)
                    
                    # If group is empty, mark it as inactive
                    if len(self.active_groups[group_id]) == 0:
                        group = ChatGroup.query.get(group_id)
                        if group:
                            group.is_active = False
                            db.session.commit()
            
            # Remove user from sessions
            del self.user_sessions[user_session_id]
            
            return True
        return False

    def send_message(self, user_session_id, content):
        """Send a message to the user's group after content moderation."""
        # Check if user is in a group
        if user_session_id not in self.user_sessions:
            return {'success': False, 'error': 'User not in a group'}
        
        group_id = self.user_sessions[user_session_id]
        
        # Check if group exists and is active
        group = ChatGroup.query.get(group_id)
        if not group or not group.is_active:
            return {'success': False, 'error': 'Group not active'}
        
        # Moderate content
        moderation_result = content_moderation_service.moderate_content(content)
        
        # If content is inappropriate, flag the user
        if not moderation_result['is_appropriate']:
            self.flag_user(user_session_id, ', '.join(moderation_result['violations']))
        
        # Censor content before storing
        censored_content, violations = content_moderation_service.censor_content(content)
        
        # Create message in database
        username = self.generate_random_username()  # Generate username for this message
        message = Message(
            group_id=group_id,
            user_session_id=user_session_id,
            username=username,
            content=censored_content,
            flagged=not moderation_result['is_appropriate']
        )
        
        db.session.add(message)
        db.session.commit()
        
        # Return message with all details
        return {
            'success': True,
            'message': message.to_dict(),
            'was_flagged': not moderation_result['is_appropriate'],
            'violations': violations
        }

    def get_group_messages(self, group_id, limit=50):
        """Get recent messages for a group."""
        messages = Message.query.filter_by(group_id=group_id)\
                               .order_by(Message.created_at.desc())\
                               .limit(limit)\
                               .all()
        
        return [msg.to_dict() for msg in reversed(messages)]  # Reverse to show oldest first

    def get_messages_since(self, group_id, since_id):
        """Get messages since a specific ID."""
        messages = Message.query.filter(
            and_(Message.group_id == group_id, Message.id > since_id)
        ).order_by(Message.created_at.asc()).all()
        
        return [msg.to_dict() for msg in messages]

    def flag_user(self, user_session_id, reason="Inappropriate content"):
        """Flag a user for inappropriate behavior."""
        # Get or create user flag record
        user_flag = UserFlag.query.filter_by(user_session_id=user_session_id).first()
        
        if not user_flag:
            user_flag = UserFlag(user_session_id=user_session_id)
            db.session.add(user_flag)
        
        # Increment flag count
        user_flag.flag_count += 1
        user_flag.last_flagged_at = datetime.utcnow()
        
        # If user has been flagged 3 times, ban them
        if user_flag.flag_count >= 3:
            user_flag.is_banned = True
            user_flag.banned_at = datetime.utcnow()
            user_flag.ban_reason = reason
            
            # Add to banned users table
            banned_user = BannedUser(
                user_session_id=user_session_id,
                reason=reason,
                banned_by="System"
            )
            db.session.add(banned_user)
            
            # Remove user from any active groups
            self.leave_group(user_session_id)
        
        db.session.commit()
        return user_flag.to_dict()

    def is_user_banned(self, user_session_id):
        """Check if a user is banned."""
        user_flag = UserFlag.query.filter_by(user_session_id=user_session_id).first()
        if user_flag and user_flag.is_banned:
            return True
        return False

    def get_user_status(self, user_session_id):
        """Get user's current status (banned, in group, etc.)."""
        # Check if banned
        if self.is_user_banned(user_session_id):
            user_flag = UserFlag.query.filter_by(user_session_id=user_session_id).first()
            return {
                'is_banned': True,
                'ban_info': user_flag.to_dict() if user_flag else None
            }
        
        # Check if in group
        if user_session_id in self.user_sessions:
            group_id = self.user_sessions[user_session_id]
            group = ChatGroup.query.get(group_id)
            return {
                'is_banned': False,
                'in_group': True,
                'group': group.to_dict() if group else None
            }
        
        # User is not in any group and not banned
        return {
            'is_banned': False,
            'in_group': False,
            'waiting': user_session_id in self.waiting_users
        }

    def get_banned_users(self):
        """Get list of all banned users."""
        banned_users = BannedUser.query.all()
        return [user.to_dict() for user in banned_users]

    def unban_user(self, user_session_id):
        """Unban a user."""
        # Remove from banned users table
        BannedUser.query.filter_by(user_session_id=user_session_id).delete()
        
        # Update user flag record
        user_flag = UserFlag.query.filter_by(user_session_id=user_session_id).first()
        if user_flag:
            user_flag.is_banned = False
            user_flag.ban_reason = None
            user_flag.banned_at = None
        
        db.session.commit()
        return True

# Create a global instance for use throughout the application
chat_service = ChatService()