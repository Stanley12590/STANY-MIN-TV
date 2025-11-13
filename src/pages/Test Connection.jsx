import React, { useState, useEffect } from 'react'
import { databaseService } from '../supabaseClient'
import { CheckCircle, XCircle, Database, RefreshCw } from 'lucide-react'

const TestConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setConnectionStatus('checking')
    
    try {
      // Test basic connection
      const health = await databaseService.healthCheck()
      
      if (health.healthy) {
        setConnectionStatus('connected')
        
        // Get some stats
        const counts = await databaseService.getDashboardCounts()
        setStats(counts)
      } else {
        setConnectionStatus('error')
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      setConnectionStatus('error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-6">
        <div className="text-center mb-6">
          <Database size={48} className="mx-auto mb-4 text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Database Connection Test</h1>
          <p className="text-gray-400 mt-2">Checking Supabase connection</p>
        </div>

        <div className="space-y-4">
          {/* Connection Status */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Connection Status</span>
              {connectionStatus === 'checking' && (
                <div className="flex items-center text-yellow-400">
                  <RefreshCw size={20} className="animate-spin mr-2" />
                  Checking...
                </div>
              )}
              {connectionStatus === 'connected' && (
                <div className="flex items-center text-green-400">
                  <CheckCircle size={20} className="mr-2" />
                  Connected
                </div>
              )}
              {connectionStatus === 'error' && (
                <div className="flex items-center text-red-400">
                  <XCircle size={20} className="mr-2" />
                  Failed
                </div>
              )}
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Supabase URL</span>
              {import.meta.env.VITE_SUPABASE_URL ? (
                <CheckCircle size={16} className="text-green-400" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Supabase Key</span>
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? (
                <CheckCircle size={16} className="text-green-400" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
            </div>
          </div>

          {/* Database Stats */}
          {stats && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-300 mb-3">Database Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Movies:</div>
                <div className="text-white text-right">{stats.movies}</div>
                
                <div className="text-gray-400">Channels:</div>
                <div className="text-white text-right">{stats.channels}</div>
                
                <div className="text-gray-400">Categories:</div>
                <div className="text-white text-right">{stats.categories}</div>
                
                <div className="text-gray-400">Banners:</div>
                <div className="text-white text-right">{stats.banners}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={testConnection}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Test Again
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Go to App
            </button>
          </div>

          {connectionStatus === 'error' && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2">Connection Failed</h4>
              <p className="text-red-300 text-sm">
                Check your Supabase credentials and make sure your database tables are set up correctly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestConnection
