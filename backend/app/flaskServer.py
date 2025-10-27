from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize database
    db.init_app(app)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Import and register blueprints here
    from app.routes.main import main_bp
    from app.routes.auth import auth_bp
    from app.routes.quote import quote_bp
    from app.routes.diary import diary_bp
    from app.routes.calendar import calendar_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(quote_bp)
    app.register_blueprint(diary_bp)
    app.register_blueprint(calendar_bp)
    
    @app.route('/')
    def hello():
        return "Hello from Flask Backend Server!"
    
    @app.route('/api/health')
    def health_check():
        return {"status": "healthy", "service": "flask-backend-server"}
    
    return app