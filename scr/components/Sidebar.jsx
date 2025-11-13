import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Film,
  Tv,
  Tags,
  Image,
  BarChart3
} from 'lucide-react'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/movies', icon: Film, label: 'Movies' },
  { path: '/channels', icon: Tv, label: 'Live Channels' },
  { path: '/categories', icon: Tags, label: 'Categories' },
  { path: '/banners', icon: Image, label: 'Banners' }
]

const Sidebar = () => {
  const location = useLocation()

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold">Analytics</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="bg-green-600/20 border border-green-600 rounded-lg p-3">
          <p className="text-green-400 text-sm font-medium">Supabase Connected</p>
          <p className="text-green-300 text-xs mt-1">Database: Live</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
