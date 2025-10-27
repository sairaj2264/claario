# Frontend Structure

## Folder Structure

```
src/
├── components/          # Reusable UI components
│   └── Header.jsx       # Example header component
├── pages/               # Page components that correspond to routes
│   ├── Dashboard.jsx    # User dashboard after login
│   ├── LoginPage.jsx    # Authentication page
│   └── AuthCallback.jsx # OAuth callback handler
├── assets/              # Static assets (images, icons, etc.)
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
├── supabaseClient.js   # Supabase client configuration
├── index.css           # Global CSS styles
└── App.css             # Component-specific styles
```

## Structure Explanation

- **components/**: Contains reusable UI components that can be used across multiple pages
- **pages/**: Contains page-level components that correspond to specific routes
- **assets/**: Static assets like images, icons, and other media files
- **App.jsx**: Main application component with routing configuration
- **main.jsx**: Entry point that renders the application
- **supabaseClient.js**: Supabase client initialization

This structure keeps the code organized and makes it easier to maintain and scale the application.