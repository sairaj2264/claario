import os
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
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    
    @app.route('/')
    def hello():
        return "Hello from Flask Backend!"
    
    @app.route('/health')
    def health_check():
        return {"status": "healthy", "service": "flask-backend"}
    
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 3001)), debug=True)