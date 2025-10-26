import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
// These should match what's in your backend .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mpitktteoyjhfrdohuvi.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waXRrdHRlb3lqaGZyZG9odXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzOTExMDYsImV4cCI6MjA3Njk2NzEwNn0.i6_CRio2-WYB28J3k451PxqEcdgNIYgVx1xdenWQhCU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)