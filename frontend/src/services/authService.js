import { supabase } from '../supabaseClient'

class AuthService {
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  static async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    return { data, error }
  }

  static async signInWithOAuth(options) {
    const { data, error } = await supabase.auth.signInWithOAuth(options)
    return { data, error }
  }

  static async getSession() {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  }

  static async logout() {
    await supabase.auth.signOut()
  }

  static onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
    return subscription
  }
}

export default AuthService