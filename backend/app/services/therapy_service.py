"""
Therapy Service Module
Handles therapy session requests, management, and communication
"""

from app.models import db
from app.models.chat import TherapySession, TherapyMessage
from datetime import datetime
import uuid

class TherapyService:
    @staticmethod
    def create_therapy_request(user_session_id, user_email):
        """
        Create a new therapy session request
        """
        try:
            session = TherapySession(
                user_session_id=user_session_id,
                user_email=user_email
            )
            db.session.add(session)
            db.session.commit()
            return session.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_pending_sessions():
        """
        Get all pending therapy sessions
        """
        try:
            sessions = TherapySession.query.filter_by(status='pending').all()
            return [session.to_dict() for session in sessions]
        except Exception as e:
            raise e

    @staticmethod
    def accept_session(session_id, therapist_id):
        """
        Accept a therapy session request
        """
        try:
            session = TherapySession.query.get(session_id)
            if session and session.status == 'pending':
                session.therapist_id = therapist_id
                session.status = 'accepted'
                session.accepted_at = datetime.utcnow()
                db.session.commit()
                return session.to_dict()
            return None
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def start_session(session_id):
        """
        Start a therapy session
        """
        try:
            session = TherapySession.query.get(session_id)
            print(f"Attempting to start session {session_id}")
            print(f"Session found: {session is not None}")
            if session:
                print(f"Session status before start: {session.status}")
            
            if session and session.status == 'accepted':
                session.status = 'in_progress'
                session.started_at = datetime.utcnow()
                db.session.commit()
                print(f"Session started successfully: {session.to_dict()}")
                return session.to_dict()
            elif session:
                print(f"Session cannot be started. Status is {session.status}")
                return None
            else:
                print("Session not found")
                return None
        except Exception as e:
            db.session.rollback()
            print(f"Error starting session: {e}")
            raise e

    @staticmethod
    def end_session(session_id):
        """
        End a therapy session
        """
        try:
            session = TherapySession.query.get(session_id)
            print(f"Attempting to end session {session_id}")
            print(f"Session found: {session is not None}")
            if session:
                print(f"Session status: {session.status}")
                print(f"Session started_at: {session.started_at}")
            
            if session and session.status == 'in_progress':
                session.status = 'completed'
                session.ended_at = datetime.utcnow()
                if session.started_at:
                    duration = (session.ended_at - session.started_at).total_seconds() / 60
                    session.actual_duration = int(duration)
                db.session.commit()
                print(f"Session ended successfully: {session.to_dict()}")
                return session.to_dict()
            elif session:
                print(f"Session cannot be ended. Status is {session.status}")
                return None
            else:
                print("Session not found")
                return None
        except Exception as e:
            db.session.rollback()
            print(f"Error ending session: {e}")
            raise e

    @staticmethod
    def get_therapist_sessions(therapist_id):
        """
        Get all sessions for a specific therapist
        """
        try:
            sessions = TherapySession.query.filter(
                TherapySession.therapist_id == therapist_id
            ).all()
            return [session.to_dict() for session in sessions]
        except Exception as e:
            raise e

    @staticmethod
    def get_user_sessions(user_session_id):
        """
        Get all sessions for a specific user
        """
        try:
            sessions = TherapySession.query.filter_by(user_session_id=user_session_id).all()
            return [session.to_dict() for session in sessions]
        except Exception as e:
            raise e

    @staticmethod
    def send_message(session_id, sender_id, sender_type, content):
        """
        Send a message in a therapy session
        """
        try:
            message = TherapyMessage(
                session_id=session_id,
                sender_id=sender_id,
                sender_type=sender_type,
                content=content
            )
            db.session.add(message)
            db.session.commit()
            return message.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_session_messages(session_id):
        """
        Get all messages for a therapy session
        """
        try:
            messages = TherapyMessage.query.filter_by(session_id=session_id).order_by(
                TherapyMessage.created_at.asc()
            ).all()
            return [message.to_dict() for message in messages]
        except Exception as e:
            raise e

# Create a global instance
therapy_service = TherapyService()