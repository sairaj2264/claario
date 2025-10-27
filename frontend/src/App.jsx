import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'

// Page components
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import CalendarPage from './pages/CalendarPage'

function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <div>Please log in</div>} />
        <Route path="/calendar" element={user ? <CalendarPage user={user} /> : <div>Please log in</div>} />
      </Routes>
    </div>
  )
}

export default App