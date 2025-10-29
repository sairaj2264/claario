import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const TherapistDashboard = () => {
  const [pendingSessions, setPendingSessions] = useState([])
  const [activeSessions, setActiveSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTherapySessions()
    
    // Poll for new requests every 5 seconds
    const interval = setInterval(() => {
      fetchPendingSessions()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchTherapySessions = async () => {
    try {
      setLoading(true)
      
      // Fetch pending sessions
      const pendingResponse = await fetch('/api/therapy/pending')
      const pendingData = await pendingResponse.json()
      
      if (pendingData.success) {
        setPendingSessions(pendingData.sessions)
      }
      
      // For now, we'll just set active sessions to empty
      // In a real implementation, you would fetch active sessions for this therapist
      setActiveSessions([])
      
      setError(null)
    } catch (err) {
      setError('Failed to fetch therapy sessions')
      console.error('Error fetching therapy sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingSessions = async () => {
    try {
      // Fetch pending sessions only
      const pendingResponse = await fetch('/api/therapy/pending')
      const pendingData = await pendingResponse.json()
      
      if (pendingData.success) {
        setPendingSessions(pendingData.sessions)
      }
      
      setError(null)
    } catch (err) {
      setError('Failed to fetch therapy requests')
      console.error('Error fetching therapy requests:', err)
    }
  }

  const handleAcceptSession = async (sessionId) => {
      try {
        console.log('Attempting to accept session:', sessionId);
        // In a real implementation, you would use the actual therapist ID
        const therapistId = 'therapist_' + Date.now() // Placeholder
        
        const response = await fetch(`/api/therapy/accept/${sessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            therapist_id: therapistId
          })
        })
        
        const data = await response.json()
        console.log('Accept session response:', data);
        
        if (data.success) {
          // Remove from pending sessions
          setPendingSessions(prev => prev.filter(session => session.id !== sessionId))
          // Navigate to the therapy chat page
          console.log('Navigating to therapy chat page for session:', sessionId);
          navigate(`/therapy/chat/${sessionId}`)
        } else {
          alert(`Error: ${data.error}`)
        }
      } catch (error) {
        console.error('Error accepting session:', error)
        alert('Failed to accept session')
      }
    }

  const handleStartSession = async (sessionId) => {
      try {
        console.log('Attempting to start session:', sessionId);
        const response = await fetch(`/api/therapy/start/${sessionId}`, {
          method: 'POST'
        })
        
        const data = await response.json()
        console.log('Start session response:', data);
        
        if (data.success) {
          // Move to active sessions
          const session = pendingSessions.find(s => s.id === sessionId)
          if (session) {
            setActiveSessions(prev => [...prev, {...session, status: 'in_progress'}])
            setPendingSessions(prev => prev.filter(s => s.id !== sessionId))
          }
          // Navigate to the therapy chat page
          console.log('Navigating to therapy chat page for session:', sessionId);
          navigate(`/therapy/chat/${sessionId}`)
        } else {
          alert(`Error: ${data.error}`)
        }
      } catch (error) {
        console.error('Error starting session:', error)
        alert('Failed to start session')
      }
    }

  const handleLogout = () => {
    localStorage.removeItem('isTherapist')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-4 text-green-400">Loading therapy sessions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-900 rounded-xl shadow-lg p-8 text-center border border-red-700">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={fetchTherapySessions}
              className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-400">Therapist Dashboard</h1>
              <p className="text-gray-400">Manage therapy sessions and patient requests</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-green-400 mb-2">Pending Requests</h2>
            <p className="text-3xl font-bold text-yellow-400">{pendingSessions.length}</p>
            <p className="text-gray-400">Awaiting acceptance</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-green-400 mb-2">Active Sessions</h2>
            <p className="text-3xl font-bold text-blue-400">{activeSessions.length}</p>
            <p className="text-gray-400">Currently in progress</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-green-400 mb-2">Total Sessions</h2>
            <p className="text-3xl font-bold text-purple-400">
              {pendingSessions.length + activeSessions.length}
            </p>
            <p className="text-gray-400">Today</p>
          </div>
        </div>

        {/* Pending Sessions */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">Pending Therapy Requests</h2>
          {pendingSessions.length === 0 ? (
            <p className="text-gray-400">No pending therapy requests at this time.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Requested At</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {pendingSessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-white">{session.user_email}</div>
                        <div className="text-gray-400 text-xs">{session.user_session_id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {session.created_at 
                          ? new Date(session.created_at).toLocaleString() 
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {session.scheduled_duration} minutes
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleAcceptSession(session.id)}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition mr-2"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStartSession(session.id)}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition"
                        >
                          Start
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">Active Therapy Sessions</h2>
          {activeSessions.length === 0 ? (
            <p className="text-gray-400">No active therapy sessions at this time.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Started At</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {activeSessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-white">{session.user_email}</div>
                        <div className="text-gray-400 text-xs">{session.user_session_id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {session.started_at 
                          ? new Date(session.started_at).toLocaleString() 
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {session.scheduled_duration} minutes
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => navigate(`/therapy/chat/${session.id}`)}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition"
                        >
                          Join Chat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TherapistDashboard