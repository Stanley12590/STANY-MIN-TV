import React, { useState, useEffect } from 'react'
import { databaseService } from '../supabaseClient'
import { Plus, Trash2, Film, Tv, ExternalLink } from 'lucide-react'

const Banners = () => {
  const [banners, setBanners] = useState([])
  const [movies, setMovies] = useState([])
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    banner_image_url: '',
    target_type: 'movie',
    target_movie_id: '',
    target_channel_id: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadBanners()
    loadMovies()
    loadChannels()
  }, [])

  const loadBanners = async () => {
    try {
      const { data, error } = await databaseService.getBanners()
      if (error) throw error
      setBanners(data || [])
    } catch (error) {
      console.error('Error loading banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMovies = async () => {
    try {
      const { data, error } = await databaseService.getMovies()
      if (error) throw error
      setMovies(data || [])
    } catch (error) {
      console.error('Error loading movies:', error)
    }
  }

  const loadChannels = async () => {
    try {
      const { data, error } = await databaseService.getChannels()
      if (error) throw error
      setChannels(data || [])
    } catch (error) {
      console.error('Error loading channels:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const bannerData = {
        banner_image_url: formData.banner_image_url,
        target_movie_id: formData.target_type === 'movie' ? formData.target_movie_id : null,
        target_channel_id: formData.target_type === 'channel' ? formData.target_channel_id : null
      }

      const { error } = await databaseService.createBanner(bannerData)
      if (error) throw error

      resetForm()
      loadBanners()
    } catch (error) {
      console.error('Error saving banner:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      const { error } = await databaseService.deleteBanner(id)
      if (error) throw error
      loadBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      banner_image_url: '',
      target_type: 'movie',
      target_movie_id: '',
      target_channel_id: ''
    })
  }

  const getTargetName = (banner) => {
    if (banner.target_movie_id && banner.movies) {
      return banner.movies.title
    }
    if (banner.target_channel_id && banner.channels) {
      return banner.channels.name
    }
    return 'No target'
  }

  const getTargetType = (banner) => {
    if (banner.target_movie_id) return 'Movie'
    if (banner.target_channel_id) return 'Channel'
    return 'None'
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
        <h1 className="text-3xl font-bold text-white">Banners Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Form */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Add New Banner</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Banner Image URL
              </label>
              <input
                type="url"
                required
                value={formData.banner_image_url}
                onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="https://example.com/banner.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Type
              </label>
              <select
                value={formData.target_type}
                onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
              >
                <option value="movie">Movie</option>
                <option value="channel">Channel</option>
                <option value="none">None</option>
              </select>
            </div>

            {formData.target_type === 'movie' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Movie
                </label>
                <select
                  value={formData.target_movie_id}
                  onChange={(e) => setFormData({ ...formData, target_movie_id: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                >
                  <option value="">Select Movie</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.target_type === 'channel' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Channel
                </label>
                <select
                  value={formData.target_channel_id}
                  onChange={(e) => setFormData({ ...formData, target_channel_id: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                >
                  <option value="">Select Channel</option>
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>{submitting ? 'Adding...' : 'Add Banner'}</span>
            </button>
          </form>
        </div>

        {/* Banners List */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">All Banners ({banners.length})</h2>
          
          <div className="space-y-4">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-gray-750 rounded-lg overflow-hidden">
                <img
                  src={banner.banner_image_url}
                  alt="Banner"
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        {banner.target_movie_id ? (
                          <Film size={16} className="text-red-400" />
                        ) : banner.target_channel_id ? (
                          <Tv size={16} className="text-blue-400" />
                        ) : null}
                        <span className="text-gray-300 text-sm">
                          {getTargetType(banner)}: {getTargetName(banner)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs">
                        Created: {new Date(banner.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {banner.target_movie_id && (
                        <a
                          href={`https://your-user-app.com/movie/${banner.target_movie_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                          title="View Target"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {banner.target_channel_id && (
                        <a
                          href={`https://your-user-app.com/channel/${banner.target_channel_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                          title="View Target"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {banners.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Film size={48} className="mx-auto mb-4" />
                <p>No banners added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Banners
