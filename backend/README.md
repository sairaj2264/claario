# Backend Setup

## Prerequisites
- Python 3.9+
- pip (Python package installer)

## Installation

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and fill in your Supabase credentials:
   ```
   cp .env.example .env
   ```

## Running the Server

To start the Flask development server:
```
python app.py
```

The server will start on `http://localhost:3001` by default.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py          # Configuration settings
│   ├── flaskServer.py     # Flask server initialization
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── services/          # Business logic
├── requirements.txt       # Python dependencies
└── app.py                # Main application entry point
```

## API Endpoints

- `GET /` - Health check endpoint
- `GET /health` - Health check with JSON response
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/<id>` - Get a specific user by ID
- `POST /api/auth/callback` - Supabase OAuth callback endpoint
- `GET /api/auth/user` - Get current authenticated user

## Supabase OAuth Integration

The backend now supports Supabase OAuth authentication. To use this feature:

1. Set up OAuth providers in your Supabase dashboard
2. Configure the frontend to use Supabase Auth
3. When a user authenticates, send the access token to `/api/auth/callback`
4. The backend will extract user information and store it in the database

The OAuth callback expects a JSON payload with:
```json
{
  "access_token": "supabase_jwt_token"
}
```

The system will extract the user's name, gender, and age (if available) from the token metadata and store it in the users table.

## Frontend Integration

See [supabase_oauth_example.js](file:///d:/claario/backend/supabase_oauth_example.js) for an example of how to integrate this with a frontend application using the Supabase JavaScript client.

The basic flow is:
1. User clicks login with OAuth provider (Google, GitHub, etc.)
2. Supabase handles the OAuth flow
3. Frontend receives the access token
4. Frontend sends the access token to the backend `/api/auth/callback` endpoint
5. Backend validates the token and extracts user information
6. User data is stored in the database