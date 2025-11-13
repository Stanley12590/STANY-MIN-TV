import React, { useState, useEffect } from 'react'
import { databaseService } from '../supabaseClient'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data, error } = await databaseService.getCategories()
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    setSubmitting(true)

    try {
      if (editingCategory) {
        const { error } = await databaseService.updateCategory(editingCategory.id, { category_name: categoryName })
        if (error) throw error
      } else {
        const { error } = await databaseService.createCategory({ category_name: categoryName })
        if (error) throw error
      }

      resetForm()
      loadCategories()
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setCategoryName(category.category_name)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category? This will affect all movies and channels in this category.')) return

    try {
      const { error } = await databaseService.deleteCategory(id)
      if (error) throw error
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const resetForm = () => {
    setCategoryName('')
    setEditingCategory(null)
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
        <h1 className="text-3xl font-bold text-white">Categories Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Edit Form */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category Name
              </label>
              <input
                type="text"
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter category name"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting || !categoryName.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>{submitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}</span>
              </button>

              {editingCategory && (
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

        {/* Categories List */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">All Categories ({categories.length})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Tag size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{category.category_name}</h4>
                    <p className="text-gray-400 text-xs">
                      Created: {new Date(category.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-400">
                <Tag size={48} className="mx-auto mb-4" />
                <p>No categories added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories
