import React, { useState, useEffect } from 'react'
import { databaseService } from '../supabaseClient'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

const Movies = () => {
  const [movies, setMovies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    poster_url: '',
    description: '',
    rating: '',
    release_year: '',
    category_id: '',
    watch_link: ''
  })
  const [editingMovie, setEditingMovie] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadMovies()
    loadCategories()
  }, [])

  const loadMovies = async () => {
    try {
      const { data, error } = await databaseService.getMovies()
      if (error) throw error
      setMovies(data || [])
    } catch (error) {
      console.error('Error loading movies:', error)
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
      const movieData = {
        title: formData.title,
        poster_url: formData.poster_url,
        description: formData.description,
        rating: parseFloat(formData.rating),
        release_year: parseInt(formData.release_year),
        category_id: formData.category_id,
        watch_link: formData.watch_link
      }

      if (editingMovie) {
        const { error } = await databaseService.updateMovie(editingMovie.id, movieData)
        if (error) throw error
      } else {
        const { error } = await databaseService.createMovie(movieData)
        if (error) throw error
      }

      resetForm()
      loadMovies()
    } catch (error) {
      console.error('Error saving movie:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (movie) => {
    setEditingMovie(movie)
    setFormData({
      title: movie.title,
      poster_url: movie.poster_url,
      description: movie.description,
      rating: movie.rating.toString(),
      release_year: movie.release_year.toString(),
      category_id: movie.category_id,
      watch_link: movie.watch_link
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this movie?')) return

    try {
      const { error } = await databaseService.deleteMovie(id)
      if (error) throw error
      loadMovies()
    } catch (error) {
      console.error('Error deleting movie:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      poster_url: '',
      description: '',
      rating: '',
      release_year: '',
      category_id: '',
      watch_link: ''
    })
    setEditingMovie(null)
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
        <h1 className="text-3xl font-bold text-white">Movies Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Edit Form */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingMovie ? 'Edit Movie' : 'Add New Movie'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
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
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
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
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Release Year
                </label>
                <input
                  type="number"
                  min="1900"
                  max="2030"
                  required
                  value={formData.release_year}
                  onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
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
                Watch Link
              </label>
              <input
                type="url"
                required
                value={formData.watch_link}
                onChange={(e) => setFormData({ ...formData, watch_link: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="https://example.com/watch"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>{submitting ? 'Saving...' : (editingMovie ? 'Update Movie' : 'Add Movie')}</span>
              </button>

              {editingMovie && (
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

        {/* Movies List */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">All Movies ({movies.length})</h2>
          
          <div className="space-y-4">
            {movies.map((movie) => (
              <div key={movie.id} className="flex items-center space-x-4 p-4 bg-gray-750 rounded-lg">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-16 h-20 object-cover rounded"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm truncate">{movie.title}</h4>
                  <p className="text-gray-400 text-xs">{movie.release_year}</p>
                  <p className="text-gray-300 text-sm mt-1 line-clamp-2">{movie.description}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-yellow-400 font-semibold mb-2">
                    ⭐ {movie.rating}
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={`https://your-user-app.com/movie/${movie.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                      title="View"
                    >
                      <Eye size={14} />
                    </a>
                    <button
                      onClick={() => handleEdit(movie)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(movie.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {movies.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Plus size={48} className="mx-auto mb-4" />
                <p>No movies added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Movies
