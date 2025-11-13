import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Film, Database } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('stanytz076@admin.com')
  const [password, setPassword] = useState('fucky360#')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
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
            {error}
          </div>
        )}

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
            <span>{loading ? 'Signing In...' : 'Sign In to Admin Panel'}</span>
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-600/20 border border-blue-600 rounded-lg">
          <h3 className="font-semibold text-blue-300 mb-2">Database Info</h3>
          <p className="text-blue-200 text-sm">Project: dsopddfjpfwsibzvpvxz</p>
          <p className="text-blue-200 text-sm">Status: <span className="text-green-400">Live</span></p>
        </div>
      </div>
    </div>
  )
}

export default Login
