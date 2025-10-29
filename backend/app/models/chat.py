from app.models import db
import datetime
import uuid

class ChatGroup(db.Model):
    __tablename__ = 'chat_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    group_code = db.Column(db.String(50), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    max_members = db.Column(db.Integer, default=5)
    is_active = db.Column(db.Boolean, default=True)
    
    def __init__(self, max_members=5):
        self.group_code = str(uuid.uuid4())[:8]
        self.max_members = max_members
    
    def to_dict(self):
        return {
            'id': self.id,
            'group_code': self.group_code,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'max_members': self.max_members,
            'is_active': self.is_active
        }

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('chat_groups.id'), nullable=False)
    user_session_id = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    flagged = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationship
    group = db.relationship('ChatGroup', backref=db.backref('messages', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'group_id': self.group_id,
            'user_session_id': self.user_session_id,
            'username': self.username,
            'content': self.content,
            'flagged': self.flagged,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class UserFlag(db.Model):
    __tablename__ = 'user_flags'
    
    id = db.Column(db.Integer, primary_key=True)
    user_session_id = db.Column(db.String(100), unique=True, nullable=False)
    flag_count = db.Column(db.Integer, default=0)
    last_flagged_at = db.Column(db.DateTime)
    is_banned = db.Column(db.Boolean, default=False)
    banned_at = db.Column(db.DateTime)
    ban_reason = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_session_id': self.user_session_id,
            'flag_count': self.flag_count,
            'last_flagged_at': self.last_flagged_at.isoformat() if self.last_flagged_at else None,
            'is_banned': self.is_banned,
            'banned_at': self.banned_at.isoformat() if self.banned_at else None,
            'ban_reason': self.ban_reason
        }

class BannedUser(db.Model):
    __tablename__ = 'banned_users'
    
    id = db.Column(db.Integer, primary_key=True)
    user_session_id = db.Column(db.String(100), unique=True, nullable=False)
    banned_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    reason = db.Column(db.Text)
    banned_by = db.Column(db.String(100))  # Admin identifier
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_session_id': self.user_session_id,
            'banned_at': self.banned_at.isoformat() if self.banned_at else None,
            'reason': self.reason,
            'banned_by': self.banned_by
        }


class TherapySession(db.Model):
    __tablename__ = 'therapy_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_session_id = db.Column(db.String(100), nullable=False)
    user_email = db.Column(db.String(100), nullable=False)
    therapist_id = db.Column(db.String(100), nullable=True)  # Will be set when therapist accepts
    status = db.Column(db.String(20), default='pending')  # pending, accepted, in_progress, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    accepted_at = db.Column(db.DateTime, nullable=True)
    started_at = db.Column(db.DateTime, nullable=True)
    ended_at = db.Column(db.DateTime, nullable=True)
    scheduled_duration = db.Column(db.Integer, default=15)  # Duration in minutes
    actual_duration = db.Column(db.Integer, nullable=True)  # Actual duration in minutes
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_session_id': self.user_session_id,
            'user_email': self.user_email,
            'therapist_id': self.therapist_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'scheduled_duration': self.scheduled_duration,
            'actual_duration': self.actual_duration
        }


class TherapyMessage(db.Model):
    __tablename__ = 'therapy_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('therapy_sessions.id'), nullable=False)
    sender_id = db.Column(db.String(100), nullable=False)  # user_session_id or therapist_id
    sender_type = db.Column(db.String(10), nullable=False)  # 'user' or 'therapist'
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationship
    session = db.relationship('TherapySession', backref=db.backref('messages', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'sender_id': self.sender_id,
            'sender_type': self.sender_type,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }