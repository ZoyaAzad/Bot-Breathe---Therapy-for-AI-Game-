from app import db
from datetime import datetime

class Session(db.Model):
    """Therapy session model"""
    id = db.Column(db.Integer, primary_key=True)
    ai_character_id = db.Column(db.Integer, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='active')  # active, completed, abandoned
    initial_mood = db.Column(db.Integer, nullable=True)  # 1-10 scale
    current_mood = db.Column(db.Integer, nullable=True)  # 1-10 scale
    final_mood = db.Column(db.Integer, nullable=True)  # 1-10 scale
    
    # Relationship to messages
    messages = db.relationship('Message', backref='session', lazy=True, cascade='all, delete-orphan')

class Message(db.Model):
    """Individual message in a therapy session"""
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'), nullable=False)
    sender = db.Column(db.String(10), nullable=False)  # 'human' or 'ai'
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    mood_score = db.Column(db.Integer, nullable=True)  # Only for AI messages, 1-10 scale
