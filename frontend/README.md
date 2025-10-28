# Frontend Setup

## Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your Supabase credentials:
   ```
   cp .env.example .env
   ```

## Running the Development Server

To start the development server:
```
npm run dev
```

The server will start on `http://localhost:5173` by default.

## Project Structure

```
frontend/
├── src/
│   ├── assets/              # Static assets
│   ├── LoginPage.jsx        # Login page component
│   ├── AuthCallback.jsx     # OAuth callback handler
│   ├── Dashboard.jsx        # User dashboard after login
│   ├── supabaseClient.js    # Supabase client configuration
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   ├── index.css            # Global CSS styles
│   └── App.css              # Component-specific styles
├── public/                  # Public assets
├── index.html               # HTML template
├── package.json             # Project dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## Authentication Flow

The frontend implements Supabase authentication with the following flow:

1. User visits the homepage and clicks "Login"
2. User can choose to:
   - Sign in with OAuth providers (Google, GitHub)
   - Sign in with email and password
   - Sign up for a new account
3. For OAuth:
   - User is redirected to the provider's authentication page
   - After authentication, the provider redirects back to the callback URL
   - The AuthCallback component handles the session and sends user data to the backend
4. For email/password:
   - User credentials are verified with Supabase
   - User data is sent to the backend for storage
5. After successful authentication, the user is redirected to the dashboard

## Environment Variables

The following environment variables are required in the `.env` file:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Backend Integration

The frontend communicates with the backend at `http://localhost:3000` for:
- Sending user authentication data after OAuth
- Storing user information in the database
- Accessing protected API endpoints

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the production-ready application
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run ESLint to check for code issues