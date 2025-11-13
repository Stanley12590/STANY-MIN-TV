import React, { useState, useEffect } from 'react'
import { databaseService } from '../supabaseClient'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

const LiveChannels = () => {
  const [channels, setChannels] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    poster_url: '',
    description: '',
    category_id: '',
    watch_link: ''
  })
  const [editingChannel, setEditingChannel] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadChannels()
    loadCategories()
  }, [])

  const loadChannels = async () => {
    try {
      const { data, error } = await databaseService.getChannels()
      if (error) throw error
      setChannels(data || [])
    } catch (error) {
      console.error('Error loading channels:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await databaseService.getCategories()
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const channelData = {
        name: formData.name,
        poster_url: formData.poster_url,
        description: formData.description,
        category_id: formData.category_id,
        watch_link: formData.watch_link
      }

      if (editingChannel) {
        const { error } = await databaseService.updateChannel(editingChannel.id, channelData)
        if (error) throw error
      } else {
        const { error } = await databaseService.createChannel(channelData)
        if (error) throw error
      }

      resetForm()
      loadChannels()
    } catch (error) {
      console.error('Error saving channel:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (channel) => {
    setEditingChannel(channel)
    setFormData({
      name: channel.name,
      poster_url: channel.poster_url,
      description: channel.description,
      category_id: channel.category_id,
      watch_link: channel.watch_link
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this channel?')) return

    try {
      const { error } = await databaseService.deleteChannel(id)
      if (error) throw error
      loadChannels()
    } catch (error) {
      console.error('Error deleting channel:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      poster_url: '',
      description: '',
      category_id: '',
      watch_link: ''
    })
    setEditingChannel(null)
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
        <h1 className="text-3xl font-bold text-white">Live Channels Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Edit Form */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingChannel ? 'Edit Channel' : 'Add New Channel'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Channel Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Poster URL
              </label>
              <input
                type="url"
                required
                value={formData.poster_url}
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="https://example.com/poster.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stream Link
              </label>
              <input
                type="url"
                required
                value={formData.watch_link}
                onChange={(e) => setFormData({ ...formData, watch_link: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="https://example.com/stream.m3u8"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>{submitting ? 'Saving...' : (editingChannel ? 'Update Channel' : 'Add Channel')}</span>
              </button>

              {editingChannel && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Channels List */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">All Channels ({channels.length})</h2>
          
          <div className="space-y-4">
            {channels.map((channel) => (
              <div key={channel.id} className="flex items-center space-x-4 p-4 bg-gray-750 rounded-lg">
                <img
                  src={channel.poster_url}
                  alt={channel.name}
                  className="w-16 h-20 object-cover rounded"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm truncate">{channel.name}</h4>
                  <p className="text-gray-300 text-sm mt-1 line-clamp-2">{channel.description}</p>
                </div>
                
                <div className="text-right">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center mb-2">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </span>
                  <div className="flex space-x-2">
                    <a
                      href={`https://your-user-app.com/channel/${channel.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                      title="View"
                    >
                      <Eye size={14} />
                    </a>
                    <button
                      onClick={() => handleEdit(channel)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(channel.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {channels.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Plus size={48} className="mx-auto mb-4" />
                <p>No channels added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveChannels
