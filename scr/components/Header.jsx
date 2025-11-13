import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, ExternalLink } from 'lucide-react'

const Header = ({ user }) => {
  const { logout } = useAuth()

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Stany Min Tv</h1>
            <p className="text-gray-400 text-sm">Admin Panel</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="https://dsopddfjpfwsibzvpvxz.supabase.co"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ExternalLink size={18} />
            <span className="hidden md:inline">Supabase</span>
          </a>
          
          <div className="flex items-center space-x-2 text-gray-300">
            <User size={18} />
            <span>{user?.email}</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
