from flask import Blueprint, jsonify, request
from app.services.user_service import UserService
import jwt
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/callback', methods=['POST'])
def supabase_auth_callback():
    """
    Handle Supabase OAuth callback
    Expects a JSON with the Supabase user token
    """
    data = request.get_json()
    access_token = data.get('access_token')
    
    if not access_token:
        return jsonify({"error": "Access token is required"}), 400
    
    try:
        # Decode the JWT token to get user information
        # Note: In a production environment, you should verify the token properly
        # using the Supabase public key
        decoded = jwt.decode(access_token, options={"verify_signature": False})
        
        # Extract user information
        user_data = decoded.get('user_metadata', {})
        email = decoded.get('email')
        username = user_data.get('user_name') or (email.split('@')[0] if email else 'user')
        name = user_data.get('full_name') or user_data.get('name', '')
        gender = user_data.get('gender', '')
        
        # Try to extract age (this might not be directly available)
        age = None
        if 'birthdate' in user_data:
            # Calculate age from birthdate if available
            try:
                birthdate = datetime.strptime(user_data['birthdate'], '%Y-%m-%d')
                today = datetime.today()
                age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
            except:
                pass  # If birthdate parsing fails, leave age as None
        
        # Create or update user in our database
        user = UserService.create_or_update_user_from_oauth(
            username=username,
            email=email,
            name=name,
            gender=gender,
            age=age
        )
        
        return jsonify({
            "message": "User authenticated successfully",
            "user": user.to_dict()
        }), 200
        
    except jwt.DecodeError:
        return jsonify({"error": "Invalid token"}), 400
    except Exception as e:
        return jsonify({"error": f"Authentication failed: {str(e)}"}), 500

@auth_bp.route('/api/auth/user', methods=['GET'])
def get_current_user():
    """
    Get current authenticated user
    In a real implementation, this would check the session or token
    """
    # This is a placeholder implementation
    # In a real app, you would verify the user's authentication status
    return jsonify({"message": "User endpoint - implementation needed"}), 200