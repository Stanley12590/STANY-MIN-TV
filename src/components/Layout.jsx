import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children }) => {
  const { user } = useAuth()

  // Check for emergency access
  const hasEmergencyAccess = localStorage.getItem('emergency_admin_access') === 'true'

  if (!user && !hasEmergencyAccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {hasEmergencyAccess && !user && (
            <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center space-x-2">
                <Key size={16} />
                <span>Emergency Mode Active - No Authentication</span>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
