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
    app.register_blueprint(main_bp)
    
    @app.route('/')
    def hello():
        return "Hello from Flask Backend Server!"
    
    @app.route('/api/health')
    def health_check():
        return {"status": "healthy", "service": "flask-backend-server"}
    
    return app