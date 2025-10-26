// Example frontend code for Supabase OAuth integration
// This would typically be implemented in your React frontend

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Function to handle OAuth login
async function loginWithOAuth(provider) {
  try {
    // Initiate OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider, // 'google', 'github', etc.
      options: {
        redirectTo: 'http://localhost:3001/api/auth/callback' // Your backend callback URL
      }
    })

    if (error) {
      console.error('OAuth error:', error)
      return
    }

    // The OAuth flow will redirect the user to the provider
    // After authentication, the provider will redirect back to your callback URL
  } catch (error) {
    console.error('Login error:', error)
  }
}

// Function to handle the OAuth callback on your frontend
async function handleOAuthCallback() {
  try {
    // Get the session from Supabase
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session error:', error)
      return
    }

    const session = data.session
    
    if (session) {
      // Send the access token to your backend
      const response = await fetch('http://localhost:3001/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: session.access_token
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        console.log('User authenticated:', result.user)
        // Store user data or redirect to dashboard
      } else {
        console.error('Backend authentication failed:', result.error)
      }
    }
  } catch (error) {
    console.error('Callback handling error:', error)
  }
}

// Example usage
// loginWithOAuth('google')