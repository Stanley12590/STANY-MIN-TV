
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );
        console.error('❌ Logout error:', error)
        return { error }
      }
      console.log('✅ Logout successful')
      return { error: null }
    } catch (error) {
      console.error('❌ Logout exception:', error)
      return { error }
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('❌ Get user error:', error)
        return { user: null, error }
      }
      return { user, error: null }
    } catch (error) {
      console.error('❌ Get user exception:', error)
      return { user: null, error }
    }
  },

  // ==================== MOVIES FUNCTIONS ====================
  async getMovies(limit = null) {
    try {
      let query = supabase
        .from('movies')
        .select(`
          *,
          categories (category_name)
        `)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query
      
      if (error) {
        console.error('❌ Get movies error:', error)
        return { data: null, error }
      }
      
      console.log(`✅ Loaded ${data?.length || 0} movies`)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Get movies exception:', error)
      return { data: null, error }
    }
  },

  async getMovieById(id) {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select(`
          *,
          categories (category_name)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Get movie by ID error:', error)
        return { data: null, error }
      }

      console.log('✅ Loaded movie:', data?.title)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Get movie by ID exception:', error)
      return { data: null, error }
    }
  },

  async createMovie(movieData) {
    try {
      const { data, error } = await supabase
        .from('movies')
        .insert([{
          title: movieData.title?.trim(),
          poster_url: movieData.poster_url?.trim(),
          description: movieData.description?.trim(),
          rating: parseFloat(movieData.rating) || 0,
          release_year: parseInt(movieData.release_year) || new Date().getFullYear(),
          category_id: movieData.category_id,
          watch_link: movieData.watch_link?.trim()
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Create movie error:', error)
        return { data: null, error }
      }

      console.log('✅ Movie created:', data.title)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create movie exception:', error)
      return { data: null, error }
    }
  },

  async updateMovie(id, movieData) {
    try {
      const { data, error } = await supabase
        .from('movies')
        .update({
          title: movieData.title?.trim(),
          poster_url: movieData.poster_url?.trim(),
          description: movieData.description?.trim(),
          rating: parseFloat(movieData.rating) || 0,
          release_year: parseInt(movieData.release_year) || new Date().getFullYear(),
          category_id: movieData.category_id,
          watch_link: movieData.watch_link?.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Update movie error:', error)
        return { data: null, error }
      }

      console.log('✅ Movie updated:', data.title)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Update movie exception:', error)
      return { data: null, error }
    }
  },

  async deleteMovie(id) {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Delete movie error:', error)
        return { error }
      }

      console.log('✅ Movie deleted:', id)
      return { error: null }
    } catch (error) {
      console.error('❌ Delete movie exception:', error)
      return { error }
    }
  },

  // ==================== CHANNELS FUNCTIONS ====================
  async getChannels(limit = null) {
    try {
      let query = supabase
        .from('channels')
        .select(`
          *,
          categories (category_name)
        `)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query
      
      if (error) {
        console.error('❌ Get channels error:', error)
        return { data: null, error }
      }
      
      console.log(`✅ Loaded ${data?.length || 0} channels`)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Get channels exception:', error)
      return { data: null, error }
    }
  },

  async getChannelById(id) {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select(`
          *,
          categories (category_name)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Get channel by ID error:', error)
        return { data: null, error }
      }

      console.log('✅ Loaded channel:', data?.name)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Get channel by ID exception:', error)
      return { data: null, error }
    }
  },

  async createChannel(channelData) {
    try {
      const { data, error } = await supabase
        .from('channels')
        .insert([{
          name: channelData.name?.trim(),
          poster_url: channelData.poster_url?.trim(),
          description: channelData.description?.trim(),
          category_id: channelData.category_id,
          watch_link: channelData.watch_link?.trim()
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Create channel error:', error)
        return { data: null, error }
      }

      console.log('✅ Channel created:', data.name)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create channel exception:', error)
      return { data: null, error }
    }
  },

  async updateChannel(id, channelData) {
    try {
      const { data, error } = await supabase
        .from('channels')
        .update({
          name: channelData.name?.trim(),
          poster_url: channelData.poster_url?.trim(),
          description: channelData.description?.trim(),
          category_id: channelData.category_id,
          watch_link: channelData.watch_link?.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Update channel error:', error)
        return { data: null, error }
      }

      console.log('✅ Channel updated:', data.name)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Update channel exception:', error)
      return { data: null, error }
    }
  },

  async deleteChannel(id) {
    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Delete channel error:', error)
        return { error }
      }

      console.log('✅ Channel deleted:', id)
      return { error: null }
    } catch (error) {
      console.error('❌ Delete channel exception:', error)
      return { error }
    }
  },

  // ==================== CATEGORIES FUNCTIONS ====================
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('category_name', { ascending: true })

      if (error) {
        console.error('❌ Get categories error:', error)
        return { data: null, error }
      }

      console.log(`✅ Loaded ${data?.length || 0} categories`)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Get categories exception:', error)
      return { data: null, error }
    }
  },

  async getCategoryById(id) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Get category by ID error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ Get category by ID exception:', error)
      return { data: null, error }
    }
  },

  async createCategory(categoryData) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          category_name: categoryData.category_name?.trim()
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Create category error:', error)
        return { data: null, error }
      }

      console.log('✅ Category created:', data.category_name)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create category exception:', error)
      return { data: null, error }
    }
  },

  async updateCategory(id, categoryData) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          category_name: categoryData.category_name?.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Update category error:', error)
        return { data: null, error }
      }

      console.log('✅ Category updated:', data.category_name)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Update category exception:', error)
      return { data: null, error }
    }
  },

  async deleteCategory(id) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Delete category error:', error)
        return { error }
      }

      console.log('✅ Category deleted:', id)
      return { error: null }
    } catch (error) {
      console.error('❌ Delete category exception:', error)
      return { error }
    }
  },

  // ==================== BANNERS FUNCTIONS ====================
  async getBanners(limit = null) {
    try {
      let query = supabase
        .from('banners')
        .select(`
          *,
          movies (title),
          channels (name)
        `)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query
      
      if (error) {
        console.error('❌ Get banners error:', error)
        return { data: null, error }
      }
      
      console.log(`✅ Loaded ${data?.length || 0} banners`)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Get banners exception:', error)
      return { data: null, error }
    }
  },

  async getBannerById(id) {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select(`
          *,
          movies (title),
          channels (name)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Get banner by ID error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ Get banner by ID exception:', error)
      return { data: null, error }
    }
  },

  async createBanner(bannerData) {
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert([{
          banner_image_url: bannerData.banner_image_url?.trim(),
          target_movie_id: bannerData.target_movie_id || null,
          target_channel_id: bannerData.target_channel_id || null
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Create banner error:', error)
        return { data: null, error }
      }

      console.log('✅ Banner created')
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create banner exception:', error)
      return { data: null, error }
    }
  },

  async updateBanner(id, bannerData) {
    try {
      const { data, error } = await supabase
        .from('banners')
        .update({
          banner_image_url: bannerData.banner_image_url?.trim(),
          target_movie_id: bannerData.target_movie_id || null,
          target_channel_id: bannerData.target_channel_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Update banner error:', error)
        return { data: null, error }
      }

      console.log('✅ Banner updated')
      return { data, error: null }
    } catch (error) {
      console.error('❌ Update banner exception:', error)
      return { data: null, error }
    }
  },

  async deleteBanner(id) {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Delete banner error:', error)
        return { error }
      }

      console.log('✅ Banner deleted:', id)
      return { error: null }
    } catch (error) {
      console.error('❌ Delete banner exception:', error)
      return { error }
    }
  },

  // ==================== DASHBOARD FUNCTIONS ====================
  async getDashboardCounts() {
    try {
      const [
        moviesCount,
        channelsCount,
        categoriesCount,
        bannersCount
      ] = await Promise.all([
        supabase.from('movies').select('*', { count: 'exact', head: true }),
        supabase.from('channels').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('banners').select('*', { count: 'exact', head: true })
      ])

      const counts = {
        movies: moviesCount.count || 0,
        channels: channelsCount.count || 0,
        categories: categoriesCount.count || 0,
        banners: bannersCount.count || 0
      }

      console.log('📊 Dashboard counts:', counts)
      return counts
    } catch (error) {
      console.error('❌ Get dashboard counts error:', error)
      return {
        movies: 0,
        channels: 0,
        categories: 0,
        banners: 0
      }
    }
  },

  // ==================== UTILITY FUNCTIONS ====================
  async healthCheck() {
    try {
      const { data, error } = await supabase.from('categories').select('count').limit(1)
      return {
        healthy: !error,
        error: error?.message
      }
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      }
    }
  },

  // Real-time subscriptions
  subscribeToTable(tableName, callback) {
    return supabase
      .channel('public:' + tableName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: tableName }, 
        callback
      )
      .subscribe()
  },

  // File upload (if needed later)
  async uploadFile(bucketName, filePath, file) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file)

      if (error) {
        console.error('❌ File upload error:', error)
        return { data: null, error }
      }

      console.log('✅ File uploaded:', filePath)
      return { data, error: null }
    } catch (error) {
      console.error('❌ File upload exception:', error)
      return { data: null, error }
    }
  }
}

// Export default for convenience
export default databaseService

// Utility function to check if we're connected
export const isSupabaseConnected = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('count').limit(1)
    return !error
  } catch (error) {
    return false
  }
}

// Initialize and log connection status
isSupabaseConnected().then(connected => {
  if (connected) {
    console.log('🎉 Supabase is fully connected and ready!')
  } else {
    console.log('⚠️ Supabase connection check failed')
  }
})
