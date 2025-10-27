from app.models import db
import datetime

class Quote(db.Model):
    __tablename__ = 'quotes'
    
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(255), nullable=True)
    category = db.Column(db.String(100), nullable=True)  # e.g., motivation, anxiety, etc.
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def __repr__(self):
        return f'<Quote {self.id}: {self.text[:50]}...>'
        
    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'author': self.author,
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }