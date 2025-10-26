# Claario - Mental Health Support Platform

A full-stack web application providing mental health support services with anonymous chatting, mood tracking, and therapy request features.

## Project Structure

```
claario/
├── backend/                 # Python Flask backend
│   ├── app/                 # Application modules
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic
│   ├── venv/                # Python virtual environment
│   ├── app.py              # Main application entry point
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Environment variables
├── frontend/               # React frontend
│   ├── src/                # Source code
│   ├── dist/               # Build output
│   ├── node_modules/       # Node dependencies
│   ├── package.json        # Node dependencies and scripts
│   └── .env                # Environment variables
└── .gitignore              # Git ignore rules
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables by copying `.env.example` to `.env` and filling in the values

5. Run the server:
   ```
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables by copying `.env.example` to `.env` and filling in the values

4. Run the development server:
   ```
   npm run dev
   ```

## Git Ignore Structure

This project uses a multi-level .gitignore approach:

- Root [.gitignore](file:///d:/claario/.gitignore): General project-level ignores
- [backend/.gitignore](file:///d:/claario/backend/.gitignore): Python/Flask specific ignores
- [frontend/.gitignore](file:///d:/claario/frontend/.gitignore): Node.js/React specific ignores

This approach ensures that each part of the application only tracks relevant files while ignoring build artifacts, dependencies, and sensitive information.

## Environment Variables

Both frontend and backend require environment variables for proper operation. Check the respective `.env.example` files for required variables:

- [backend/.env.example](file:///d:/claario/backend/.env.example)
- [frontend/.env.example](file:///d:/claario/frontend/.env.example)

## Development

The application is designed as a full-stack solution with:

- **Frontend**: React with Vite and Tailwind CSS
- **Backend**: Python Flask with SQLAlchemy
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth

## Ports

- Frontend development server: `http://localhost:5173`
- Backend API server: `http://localhost:3001`