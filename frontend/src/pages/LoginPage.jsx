import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../services/authService'

const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('user') // 'user', 'therapist', 'admin'
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleOAuthLogin = async (provider) => {
    setLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await AuthService.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      // The OAuth flow will redirect the user to the provider
      // After authentication, the provider will redirect back to your callback URL
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      // Handle different user types
      if (userType === 'admin') {
        // Admin login with hardcoded credentials
        if (email === 'admin' && password === 'admin') {
          localStorage.setItem('isAdmin', 'true')
          window.location.href = '/admin/chat'
          return
        } else {
          throw new Error('Invalid admin credentials')
        }
      } else if (userType === 'therapist') {
        // Therapist login with hardcoded credentials
        if (email === 'therapist' && password === 'therapist') {
          localStorage.setItem('isTherapist', 'true')
          window.location.href = '/therapist/dashboard'
          return
        } else {
          throw new Error('Invalid therapist credentials')
        }
      } else {
        // Regular user login
        if (isSignUp) {
          const { data, error } = await AuthService.signUp(email, password)
          
          if (error) throw error
          
          setMessage('Signup successful! Please check your email for confirmation.')
        } else {
          const { data, error } = await AuthService.login(email, password)
          
          if (error) throw error
          
          // Send user data to backend
          await sendUserToBackend(data.user)
          window.location.href = '/dashboard'
        }
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const sendUserToBackend = async (user) => {
    try {
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: user.access_token
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('Backend authentication failed:', result.error)
      }
    } catch (error) {
      console.error('Error sending user to backend:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Sign up to get started' : 'Sign in to your account'}
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-3 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* User Type Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Login As</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setUserType('user')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                userType === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setUserType('therapist')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                userType === 'therapist'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Therapist
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                userType === 'admin'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* OAuth Buttons - Only for regular users */}
        {userType === 'user' && (
          <>
            <div className="mb-6">
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-3 px-4 text-gray-700 hover:bg-gray-50 transition-colors mb-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white rounded-xl py-3 px-4 hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          </>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {userType === 'admin' ? 'Username' : 'Email'}
            </label>
            <input
              id="email"
              type={userType === 'admin' || userType === 'therapist' ? 'text' : 'email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                userType === 'admin' ? 'admin' :
                userType === 'therapist' ? 'therapist' :
                'your@email.com'
              }
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                userType === 'admin' ? 'admin' :
                userType === 'therapist' ? 'therapist' :
                '••••••••'
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white rounded-lg py-3 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              userType === 'admin' ? 'bg-purple-600 hover:bg-purple-700' :
              userType === 'therapist' ? 'bg-green-600 hover:bg-green-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isSignUp && userType === 'user' ? 'Sign Up' :
              userType === 'admin' ? 'Login as Admin' :
              userType === 'therapist' ? 'Login as Therapist' :
              'Login as User'
            )}
          </button>
        </form>

        {/* Sign up option - only for regular users */}
        {userType === 'user' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginPage