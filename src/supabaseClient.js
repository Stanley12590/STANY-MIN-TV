import { createClient } from '@supabase/supabase-js'

// Fallback values for development
const FALLBACK_SUPABASE_URL = 'https://dsopddfjpfwsibzvpvxz.supabase.co'
const FALLBACK_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzb3BkZGZqcGZ3c2lienZwdnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDQ2MjEsImV4cCI6MjA3ODYyMDYyMX0.MWMayxipYe51wNoIqEtDTlMTl6fkSG1Lj_OWqWVYRcA'

// Use environment variables or fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_KEY

console.log('🔗 Supabase Configuration:')
console.log('URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing')
console.log('Key:', supabaseKey ? '✅ Loaded' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Supabase credentials are missing!')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
})

// Test connection immediately
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection failed:', error.message)
  } else {
    console.log('✅ Supabase connected successfully!')
    console.log('Session:', data.session ? 'Active' : 'No session')
  }
})

// ... (REST OF YOUR DATABASE SERVICE CODE REMAINS THE SAME)
export const databaseService = {
  // ALL YOUR EXISTING FUNCTIONS HERE
  async signIn(email, password) {
    // ... existing code
  },
  // ... etc
}
