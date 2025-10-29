import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../services/authService'

const Dashboard = ({ user }) => {
  const [therapySession, setTherapySession] = useState(null)
  const [userSessionId, setUserSessionId] = useState(null)
  const [checkingSession, setCheckingSession] = useState(false)
  const navigate = useNavigate()

  
  // Check for therapy session status
  useEffect(() => {
    const checkTherapySessionStatus = async () => {
      if (!user) return
      
      try {
        setCheckingSession(true)
        const response = await fetch(`/api/therapy/user/${userSessionId || user?.id || 'anonymous'}`)
        const data = await response.json()
        
        if (data.success && data.sessions && data.sessions.length > 0) {
          // Find the most recent session
          const latestSession = data.sessions.reduce((latest, current) => {
            const latestDate = new Date(latest.created_at)
            const currentDate = new Date(current.created_at)
            return currentDate > latestDate ? current : latest
          })
          
          setTherapySession(latestSession)
        }
      } catch (error) {
        console.error('Error checking therapy session status:', error)
      } finally {
        setCheckingSession(false)
      }
    }
    
    // Check immediately on load
    checkTherapySessionStatus()
    
    // Poll for session status every 5 seconds
    const interval = setInterval(checkTherapySessionStatus, 5000)
    
    return () => clearInterval(interval)
  }, [user, userSessionId, navigate])
  const handleLogout = async () => {
    await AuthService.logout()
    navigate('/')
  }

  const handleTherapyRequest = async () => {
    try {
      // Create therapy session request
      const response = await fetch('/api/therapy/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_session_id: user?.id || 'anonymous',
          user_email: user?.email || 'anonymous@example.com'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Therapy session request submitted successfully!');
        // Store the session and user session ID in state
        setTherapySession(data.session);
        setUserSessionId(user?.id || 'anonymous');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error requesting therapy session:', error);
      alert('Failed to submit therapy session request');
    }
  }

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Navigation Buttons */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold text-green-400 mb-6 text-center">
                Choose Your Support Path
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Anonymous Chatting */}
                <div className="group">
                  <button
                    onClick={() => navigate('/chat')}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg border border-purple-500"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">💬</div>
                      <h3 className="text-xl font-semibold mb-2">Anonymous Chatting</h3>
                      <p className="text-purple-200 text-sm">
                        Connect with others safely and anonymously
                      </p>
                    </div>
                  </button>
                </div>

                {/* Calendar/Diary */}
                <div className="group">
                  <button
                    onClick={() => navigate('/calendar')}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg border border-green-500"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">📅</div>
                      <h3 className="text-xl font-semibold mb-2">Calendar/Diary</h3>
                      <p className="text-green-200 text-sm">
                        Track your mood and mental health journey
                      </p>
                    </div>
                  </button>
                </div>

                {/* Mental Therapy Request */}
                <div className="group md:col-span-2">
                  <button
                    onClick={() => handleTherapyRequest()}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-500"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">🧠</div>
                      <h3 className="text-xl font-semibold mb-2">Mental Therapy Request</h3>
                      <p className="text-blue-200 text-sm">
                        Request professional mental health therapy sessions
                      </p>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Active Therapy Session Notification */}
              {therapySession && (therapySession.status === 'accepted' || therapySession.status === 'in_progress') && (
                <div className="mt-6 bg-blue-900 border border-blue-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-blue-300 mb-1">Active Therapy Session</h5>
                      <p className="text-blue-100 text-sm">
                        You have an active therapy session. Click below to join.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/therapy/chat/${therapySession.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Join Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - User Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 h-fit border border-gray-700">
              <h3 className="text-xl font-semibold text-green-400 mb-6 text-center">
                Your Profile
              </h3>
              
              <div className="flex flex-col items-center mb-6">
                <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl w-16 h-16 flex items-center justify-center text-2xl mb-4 text-green-400">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <h4 className="text-lg font-medium text-green-400">
                  {user?.user_metadata?.full_name || 'User'}
                </h4>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h5 className="font-medium text-green-400 mb-1">Account Status</h5>
                  <p className="text-gray-300 text-sm">Verified</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h5 className="font-medium text-green-400 mb-1">Member Since</h5>
                  <p className="text-gray-300 text-sm">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            Remember: You are not alone. Seeking help is a sign of strength.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            If you're in crisis, please contact emergency services or a crisis hotline immediately.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard