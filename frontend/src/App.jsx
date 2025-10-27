import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Page components
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <div>Please log in</div>} />
    </Routes>
  )
}

export default App