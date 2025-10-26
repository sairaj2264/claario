from flask import Blueprint, jsonify, request
from app.services.user_service import UserService
from app.models.user import User

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/users', methods=['GET'])
def get_users():
    users = UserService.get_all_users()
    return jsonify([user.to_dict() for user in users])

@main_bp.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    
    if not username or not email:
        return jsonify({"error": "Username and email are required"}), 400
    
    user = UserService.create_user(username, email)
    return jsonify(user.to_dict()), 201

@main_bp.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = UserService.get_user_by_id(user_id)
    if user:
        return jsonify(user.to_dict())
    return jsonify({"error": "User not found"}), 404