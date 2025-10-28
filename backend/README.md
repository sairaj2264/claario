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

The server will start on `http://localhost:3000` by default.

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

### Quote API Endpoints

- `GET /api/quotes` - Get all quotes
- `GET /api/quotes/random` - Get a random quote (with optional `exclude_ids` parameter)
- `POST /api/quotes` - Create a new quote
- `GET /api/quotes/<id>` - Get a specific quote by ID
- `PUT /api/quotes/<id>` - Update a specific quote
- `DELETE /api/quotes/<id>` - Delete a specific quote

### Diary API Endpoints

- `GET /api/diary/streak/<user_id>` - Get the current streak for a user
- `GET /api/diary/streak-data/<user_id>` - Get streak data for GitHub-style visualization (default: 35 days)
- `GET /api/diary/monthly/<user_id>/<year>/<month>` - Get all diary entries for a user in a specific month
- `GET /api/diary/entry/<user_id>/<date>` - Get a specific diary entry for a user on a specific date
- `POST /api/diary/entry/<user_id>/<date>` - Create a new diary entry for a user on a specific date
- `PUT /api/diary/entry/<entry_id>` - Update an existing diary entry
- `GET /api/diary/can-edit/<user_id>/<date>` - Check if a user can edit/create an entry for a specific date

### Calendar API Endpoints

- `GET /api/calendar/view/<user_id>/<year>/<month>` - Get all data needed for the calendar view for a specific month
- `GET /api/calendar/date/<user_id>/<date>` - Get detailed information for a specific date
- `GET /api/calendar/today/<user_id>` - Get information for today's date
- `GET /api/calendar/quote/<user_id>` - Get a daily quote for the user

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

## Database Migrations

The backend now includes a database migration system. See [MIGRATION_GUIDE.md](file:///d:/claario/backend/MIGRATION_GUIDE.md) for details on how to manage schema changes.

## Calendar Feature

The backend now includes a comprehensive calendar feature with:
- Diary entry management with mood tracking
- Streak visualization for daily activity
- Inspirational quotes API
- Date-based restrictions for diary editing (today create, past 2 days edit)

All calendar-related endpoints are documented above in the API Endpoints section.