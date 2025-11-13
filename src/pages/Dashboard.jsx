import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { databaseService } from '../supabaseClient'
import {
  Film,
  Tv,
  Tags,
  Image,
  Plus,
  TrendingUp,
  Eye
} from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color, href }) => (
  <Link to={href} className="block">
    <div className="bg-gray-800 rounded-xl p-6 border-l-4 hover:bg-gray-750 transition-colors" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  </Link>
)

const QuickAction = ({ title, description, icon: Icon, color, href }) => (
  <Link to={href} className="block">
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors group">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  </Link>
)

const Dashboard = () => {
  const [stats, setStats] = useState({
    movies: 0,
    channels: 0,
    categories: 0,
    banners: 0
  })
  const [recentMovies, setRecentMovies] = useState([])
  const [recentChannels, setRecentChannels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [counts, movies, channels] = await Promise.all([
        databaseService.getDashboardCounts(),
        databaseService.getMovies(),
        databaseService.getChannels()
      ])

      setStats(counts)
      setRecentMovies(movies.data?.slice(0, 5) || [])
      setRecentChannels(channels.data?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center space-x-2 text-green-400">
          <TrendingUp size={20} />
          <span>Live Data</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Movies"
          value={stats.movies}
          icon={Film}
          color="#EF4444"
          href="/movies"
        />
        <StatCard
          title="Live Channels"
          value={stats.channels}
          icon={Tv}
          color="#3B82F6"
          href="/channels"
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          icon={Tags}
          color="#8B5CF6"
          href="/categories"
        />
        <StatCard
          title="Banners"
          value={stats.banners}
          icon={Image}
          color="#F59E0B"
          href="/banners"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction
          title="Add Movie"
          description="Add new movie content"
          icon={Plus}
          color="#EF4444"
          href="/movies"
        />
        <QuickAction
          title="Add Channel"
          description="Add live streaming channel"
          icon={Plus}
          color="#3B82F6"
          href="/channels"
        />
        <QuickAction
          title="Add Category"
          description="Create new category"
          icon={Plus}
          color="#8B5CF6"
          href="/categories"
        />
        <QuickAction
          title="Add Banner"
          description="Manage homepage banners"
          icon={Plus}
          color="#F59E0B"
          href="/banners"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Movies */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Movies</h2>
            <Link to="/movies" className="text-red-400 hover:text-red-300 text-sm font-semibold">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentMovies.map((movie) => (
              <div key={movie.id} className="flex items-center space-x-4 p-4 bg-gray-750 rounded-lg">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">{movie.title}</h4>
                  <p className="text-gray-400 text-xs">{movie.release_year}</p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={`https://your-user-app.com/movie/${movie.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Eye size={16} />
                  </a>
                  <div className="text-yellow-400 text-sm font-semibold">
                    ⭐ {movie.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Channels */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Channels</h2>
            <Link to="/channels" className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentChannels.map((channel) => (
              <div key={channel.id} className="flex items-center space-x-4 p-4 bg-gray-750 rounded-lg">
                <img
                  src={channel.poster_url}
                  alt={channel.name}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">{channel.name}</h4>
                  <p className="text-gray-400 text-xs truncate">{channel.description}</p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={`https://your-user-app.com/channel/${channel.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Eye size={16} />
                  </a>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
