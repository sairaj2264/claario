"""
Script to seed the database with mental health quotes
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.flaskServer import create_app
from app.models import db
from app.models.quote import Quote

# Mental health quotes to seed the database
MENTAL_HEALTH_QUOTES = [
    {
        "text": "You are not alone. You are seen. You are heard. You are loved.",
        "author": "Unknown",
        "category": "support"
    },
    {
        "text": "The only way out is through.",
        "author": "Robert Frost",
        "category": "perseverance"
    },
    {
        "text": "It's okay to not be okay. Healing takes time.",
        "author": "Unknown",
        "category": "self-compassion"
    },
    {
        "text": "Your illness does not define you. Your strength and courage does.",
        "author": "Unknown",
        "category": "empowerment"
    },
    {
        "text": "Every day may not be good, but there is something good in every day.",
        "author": "Unknown",
        "category": "positivity"
    },
    {
        "text": "You are stronger than you think, braver than you feel, and smarter than you seem.",
        "author": "A.A. Milne",
        "category": "encouragement"
    },
    {
        "text": "Recovery is not a race. It's a journey.",
        "author": "Unknown",
        "category": "recovery"
    },
    {
        "text": "You don't have to be perfect to be worthy of love and belonging.",
        "author": "Brené Brown",
        "category": "self-worth"
    },
    {
        "text": "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
        "author": "Ralph Waldo Emerson",
        "category": "inner-strength"
    },
    {
        "text": "You are allowed to be both a masterpiece and a work in progress simultaneously.",
        "author": "Sophia Bush",
        "category": "growth"
    },
    {
        "text": "Healing is not linear.",
        "author": "Unknown",
        "category": "healing"
    },
    {
        "text": "It's not the load that breaks you down, it's the way you carry it.",
        "author": "Lou Holtz",
        "category": "resilience"
    },
    {
        "text": "The darkest nights produce the brightest stars.",
        "author": "John Green",
        "category": "hope"
    },
    {
        "text": "You are enough just as you are.",
        "author": "Meghan Markle",
        "category": "self-acceptance"
    },
    {
        "text": "Progress, not perfection.",
        "author": "Unknown",
        "category": "growth"
    },
    {
        "text": "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
        "author": "Unknown",
        "category": "self-care"
    },
    {
        "text": "Sometimes we have to fall apart to know what we're made of.",
        "author": "Unknown",
        "category": "transformation"
    },
    {
        "text": "You are braver than you believe, stronger than you seem, and smarter than you think.",
        "author": "A.A. Milne",
        "category": "confidence"
    },
    {
        "text": "The best way to take care of the future is to take care of the present moment.",
        "author": "Thich Nhat Hanh",
        "category": "mindfulness"
    },
    {
        "text": "You are not your thoughts.",
        "author": "Unknown",
        "category": "mindfulness"
    }
]

def seed_quotes():
    """Seed the database with mental health quotes"""
    app = create_app()
    
    with app.app_context():
        # Check if quotes already exist
        existing_quotes = Quote.query.count()
        if existing_quotes > 0:
            print(f"Database already contains {existing_quotes} quotes. Skipping seeding.")
            return
        
        # Add quotes to database
        for quote_data in MENTAL_HEALTH_QUOTES:
            quote = Quote(
                text=quote_data["text"],
                author=quote_data["author"],
                category=quote_data["category"]
            )
            db.session.add(quote)
        
        db.session.commit()
        print(f"Successfully seeded database with {len(MENTAL_HEALTH_QUOTES)} mental health quotes.")

if __name__ == "__main__":
    seed_quotes()