from app.models import db
import datetime

class Migration(db.Model):
    __tablename__ = 'migrations'
    
    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    applied_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def __repr__(self):
        return f'<Migration {self.version}>'
        
    def to_dict(self):
        return {
            'id': self.id,
            'version': self.version,
            'description': self.description,
            'applied_at': self.applied_at.isoformat() if self.applied_at else None
        }