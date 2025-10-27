import { useState, useEffect } from 'react'
import AuthService from '../services/authService'

export const useAuth = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking user:', error)
      }
    }

    checkUser()

    // Listen for auth changes
    const subscription = AuthService.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return { user }
}