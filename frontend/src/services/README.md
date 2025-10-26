# Services

This directory contains service classes that encapsulate business logic and external API interactions.

## AuthService

The [authService.js](file:///d:/claario/frontend/src/services/authService.js) file provides a centralized wrapper around Supabase authentication methods:

- `getCurrentUser()` - Get the currently authenticated user
- `login()` - Authenticate with email and password
- `signUp()` - Create a new user account
- `signInWithOAuth()` - Initiate OAuth authentication flow
- `getSession()` - Get the current session
- `logout()` - Sign out the current user
- `onAuthStateChange()` - Listen for authentication state changes

Using this service abstracts the Supabase implementation details and makes it easier to manage authentication across the application.