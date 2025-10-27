from app.models import db
import datetime

class Diary(db.Model):
    __tablename__ = 'diary'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    mood = db.Column(db.String(10), nullable=True)  # Store emoji as string
    is_completed = db.Column(db.Boolean, default=False, nullable=False)  # For streak tracking
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Define relationship with User
    user = db.relationship('User', backref=db.backref('diary_entries', lazy=True))
    
    def __repr__(self):
        return f'<Diary {self.title}>'
        
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'title': self.title,
            'content': self.content,
            'mood': self.mood,
            'is_completed': self.is_completed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user_id': self.user_id
        }