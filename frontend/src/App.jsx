import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'

// Page components
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import CalendarPage from './pages/CalendarPage'
import ChatPage from './pages/ChatPage'
import AdminChatPage from './pages/AdminChatPage'
import TherapistDashboard from './pages/TherapistDashboard'
import TherapyChatPage from './pages/TherapyChatPage'

// Protection components
const UserProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  const isTherapist = localStorage.getItem('isTherapist') === 'true'
  
  // If admin is logged in, redirect to admin panel
  if (isAdmin) {
    window.location.href = '/admin/chat'
    return null
  }
  
  // If therapist is logged in, redirect to therapist dashboard
  if (isTherapist) {
    window.location.href = '/therapist/dashboard'
    return null
  }
  
  // If regular user is logged in, show content
  return user ? children : <div className="min-h-screen bg-gray-900 text-white p-4">
    <div className="max-w-6xl mx-auto">
      <div className="bg-red-900 border border-red-700 rounded-lg p-6 mt-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You must be logged in to access this page.</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
}

const AdminProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  const { user } = useAuth()
  const isTherapist = localStorage.getItem('isTherapist') === 'true'
  
  // If regular user is logged in, redirect to dashboard
  if (user && !isAdmin) {
    window.location.href = '/dashboard'
    return null
  }
  
  // If therapist is logged in, redirect to therapist dashboard
  if (isTherapist) {
    window.location.href = '/therapist/dashboard'
    return null
  }
  
  return isAdmin ? children : <div className="min-h-screen bg-gray-900 text-white p-4">
    <div className="max-w-6xl mx-auto">
      <div className="bg-red-900 border border-red-700 rounded-lg p-6 mt-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You must be logged in as an administrator to access this page.</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
}

const TherapistProtectedRoute = ({ children }) => {
  const isTherapist = localStorage.getItem('isTherapist') === 'true'
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  const { user } = useAuth()
  
  // If admin is logged in, redirect to admin panel
  if (isAdmin) {
    window.location.href = '/admin/chat'
    return null
  }
  
  // If regular user is logged in, redirect to dashboard
  if (user && !isTherapist) {
    window.location.href = '/dashboard'
    return null
  }
  
  return isTherapist ? children : <div className="min-h-screen bg-gray-900 text-white p-4">
    <div className="max-w-6xl mx-auto">
      <div className="bg-red-900 border border-red-700 rounded-lg p-6 mt-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You must be logged in as a therapist to access this page.</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
}

const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  const isTherapist = localStorage.getItem('isTherapist') === 'true'
  
  // If any user is logged in, redirect to appropriate area
  if (user || isAdmin || isTherapist) {
    if (isAdmin) {
      window.location.href = '/admin/chat'
    } else if (isTherapist) {
      window.location.href = '/therapist/dashboard'
    } else {
      window.location.href = '/dashboard'
    }
    return null
  }
  
  return children
}

const TherapyChatProtectedRoute = ({ children }) => {
  const isTherapist = localStorage.getItem('isTherapist') === 'true'
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  const { user } = useAuth()
  
  // If admin is logged in, redirect to admin panel
  if (isAdmin) {
    window.location.href = '/admin/chat'
    return null
  }
  
  // If either therapist or regular user is logged in, show content
  if (isTherapist || user) {
    return children
  }
  
  return <div className="min-h-screen bg-gray-900 text-white p-4">
    <div className="max-w-6xl mx-auto">
      <div className="bg-red-900 border border-red-700 rounded-lg p-6 mt-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You must be logged in to access this page.</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
}

function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/auth/callback" element={
          <PublicRoute>
            <AuthCallback />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <UserProtectedRoute>
            <Dashboard user={user} />
          </UserProtectedRoute>
        } />
        <Route path="/calendar" element={
          <UserProtectedRoute>
            <CalendarPage user={user} />
          </UserProtectedRoute>
        } />
        <Route path="/chat" element={
          <UserProtectedRoute>
            <ChatPage />
          </UserProtectedRoute>
        } />
        <Route path="/therapist/dashboard" element={
          <TherapistProtectedRoute>
            <TherapistDashboard />
          </TherapistProtectedRoute>
        } />
        <Route path="/therapy/chat/:sessionId" element={
                  <TherapyChatProtectedRoute>
                    <TherapyChatPage />
                  </TherapyChatProtectedRoute>
                } />
        <Route path="/admin/chat" element={
          <AdminProtectedRoute>
            <AdminChatPage />
          </AdminProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App