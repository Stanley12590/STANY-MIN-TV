import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Film, Database, AlertTriangle, Key } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emergencyMode, setEmergencyMode] = useState(false)
  
  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if emergency access is already granted
    if (localStorage.getItem('emergency_admin_access') === 'true') {
      navigate('/')
      return
    }

    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(email, password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleEmergencyLogin = () => {
    // Direct access without authentication
    localStorage.setItem('emergency_admin_access', 'true')
    navigate('/')
  }

  // Test credentials for quick setup
  const useTestCredentials = () => {
    setEmail('test@admin.com')
    setPassword('test123')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Film size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Stany Min Tv</h1>
          <p className="text-gray-400">Admin Panel</p>
          <div className="flex items-center justify-center space-x-2 mt-2 text-green-400">
            <Database size={16} />
            <span className="text-sm">Supabase Connected</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {!emergencyMode ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Enter admin email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : null}
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              </button>
            </form>

            {/* Quick Test Button */}
            <button
              onClick={useTestCredentials}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Fill Test Credentials
            </button>

            {/* Emergency Access */}
            <div className="mt-6 p-4 border border-yellow-500 rounded-lg">
              <button
                onClick={() => setEmergencyMode(true)}
                className="w-full text-yellow-400 hover:text-yellow-300 text-sm font-medium flex items-center justify-center space-x-2"
              >
                <Key size={16} />
                <span>Emergency Access (No Auth Required)</span>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6">
              <Key size={32} className="text-yellow-400 mx-auto mb-2" />
              <h3 className="text-yellow-400 font-bold mb-2">Emergency Access</h3>
              <p className="text-yellow-300 text-sm">
                This will grant temporary access without authentication. 
                Use only for initial setup or troubleshooting.
              </p>
            </div>
            
            <button
              onClick={handleEmergencyLogin}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mb-4"
            >
              Grant Emergency Access
            </button>

            <button
              onClick={() => setEmergencyMode(false)}
              className="w-full text-gray-400 hover:text-white text-sm"
            >
              ← Back to Normal Login
            </button>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="mt-6 p-4 bg-blue-600/20 border border-blue-600 rounded-lg">
          <h3 className="font-semibold text-blue-300 mb-2">Quick Setup:</h3>
          <p className="text-blue-200 text-sm">1. Click "Emergency Access" to get started</p>
          <p className="text-blue-200 text-sm">2. Add users later in Supabase Auth</p>
          <p className="text-blue-200 text-sm">3. Use proper authentication later</p>
        </div>
      </div>
    </div>
  )
}

export default Login
