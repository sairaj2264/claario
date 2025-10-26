import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

const AuthCallback = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from Supabase URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (data.session) {
          // Send the access token to your backend
          const response = await fetch('http://localhost:3001/api/auth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: data.session.access_token
            })
          })

          const result = await response.json()
          
          if (response.ok) {
            console.log('User authenticated:', result.user)
            onLoginSuccess(data.session.user)
            // Redirect to dashboard or home page
            navigate('/dashboard')
          } else {
            throw new Error(result.error || 'Backend authentication failed')
          }
        } else {
          throw new Error('No session found')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate, onLoginSuccess])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white rounded-lg py-2 px-6 hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default AuthCallback