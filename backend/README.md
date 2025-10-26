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