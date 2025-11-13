import { createClient } from '@supabase/supabase-js'

// ==================== CONFIGURATION ====================
const SUPABASE_URL = 'https://dsopddfjpfwsibzvpvxz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzb3BkZGZqcGZ3c2lienZwdnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDQ2MjEsImV4cCI6MjA3ODYyMDYyMX0.MWMayxipYe51wNoIqEtDTlMTl6fkSG1Lj_OWqWVYRcA'

// Use environment variables if available, otherwise use hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY

console.log('🚀 Initializing Supabase Client...')
console.log('🔗 Supabase URL:', supabaseUrl ? '✅' : '❌')
console.log('🔑 Supabase Key:', supabaseKey ? '✅' : '❌')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ CRITICAL: Supabase credentials missing!')
  throw new Error('Supabase credentials are required')
}

// ==================== CLIENT INITIALIZATION ====================
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// ==================== CONNECTION TEST ====================
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return { 
        success: false, 
        error: error.message,
        connected: false
      }
    }
    
    console.log('✅ Supabase connected successfully!')
    console.log('📊 Session:', data.session ? 'Active' : 'No active session')
    
    return { 
      success: true, 
      session: data.session,
      connected: true
    }
  } catch (error) {
    console.error('❌ Connection test error:', error)
    return { 
      success: false, 
      error: error.message,
      connected: false
    }
  }
}

// Initialize connection test on import
testConnection().then(result => {
  if (result.connected) {
    console.log('🎉 Supabase is ready to use!')
  } else {
    console.warn('⚠️ Supabase connection issues - some features may not work')
  }
})

// ==================== DATABASE SERVICE ====================
export const databaseService = {
  
  // ==================== AUTHENTICATION ====================
  async signIn(email, password) {
    try {
      console.log('🔐 Attempting login for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      })
      
      if (error) {
        console.error('❌ Login failed:', error.message)
        return { 
          success: false, 
          error: error.message,
          user: null 
        }
      }
      
      console.log('✅ Login successful for:', data.user.email)
      return { 
        success: true, 
        user: data.user,
        session: data.session,
        error: null 
      }
    } catch (error) {
      console.error('❌ Login exception:', error)
      return { 
        success: false, 
        error: error.message,
        user: null 
      }
    }
  },

  async signOut() {
    try {
      console.log('🚪 Logging out...')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Logout failed:', error.message)
        return { success: false, error: error.message }
      }
      
      console.log('✅ Logout successful')
      return { success: true, error: null }
    } catch (error) {
      console.error('❌ Logout exception:', error)
      return { success: false, error: error.message }
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('❌ Get user failed:', error.message)
        return { user: null, error: error.message }
      }
      
      return { user, error: null }
    } catch (error) {
      console.error('❌ Get user exception:', error)
      return { user: null, error: error.message }
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        return { session: null, error: error.message }
      }
      
      return { session, error: null }
    } catch (error) {
      return { session: null, error: error.message }
    }
  },

  // ==================== MOVIES CRUD ====================
  async getMovies(limit = null, categoryId = null) {
    try {
      let query = supabase
        .from('movies')
        .select(`
          *,
          categories (category_name)
        `)
        .order('created_at', { ascending: false })

      if (limit) query = query.limit(limit)
      if (categoryId) query = query.eq('category_id', categoryId)

      const { data, error, count } = await query
      
      if (error) {
        console.error('❌ Get movies failed:', error.message)
        return { data: null, error: error.message, count: 0 }
      }
      
      console.log(`✅ Loaded ${data?.length || 0} movies`)
      return { data, error: null, count: data?.length || 0 }
    } catch (error) {
      console.error('❌ Get movies exception:', error)
      return { data: null, error: error.message, count: 0 }
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
        console.error('❌ Get movie failed:', error.message)
        return { data: null, error: error.message }
      }

      console.log('✅ Loaded movie:', data?.title)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Get movie exception:', error)
      return { data: null, error: error.message }
    }
  },

  async createMovie(movieData) {
    try {
      // Validate required fields
      if (!movieData.title?.trim()) {
        return { data: null, error: 'Movie title is required' }
      }
      if (!movieData.poster_url?.trim()) {
        return { data: null, error: 'Poster URL is required' }
      }

      const moviePayload = {
        title: movieData.title.trim(),
        poster_url: movieData.poster_url.trim(),
        description: movieData.description?.trim() || '',
        rating: parseFloat(movieData.rating) || 0,
        release_year: parseInt(movieData.release_year) || new Date().getFullYear(),
        category_id: movieData.category_id || null,
        watch_link: movieData.watch_link?.trim() || '',
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('movies')
        .insert([moviePayload])
        .select()
        .single()

      if (error) {
        console.error('❌ Create movie failed:', error.message)
        return { data: null, error: error.message }
      }

      console.log('✅ Movie created:', data.title)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create movie exception:', error)
      return { data: null, error: error.message }
    }
  },

  async updateMovie(id, movieData) {
    try {
      const updatePayload = {
        title: movieData.title?.trim(),
        poster_url: movieData.poster_url?.trim(),
        description: movieData.description?.trim(),
        rating: parseFloat(movieData.rating) || 0,
        release_year: parseInt(movieData.release_year) || new Date().getFullYear(),
        category_id: movieData.category_id,
        watch_link: movieData.watch_link?.trim(),
        updated_at: new Date().toISOString()
      }

      // Remove undefined fields
      Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined) {
          delete updatePayload[key]
        }
      })

      const { data, error } = await supabase
        .from('movies')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Update movie failed:', error.message)
        return { data: null, error: error.message }
      }

      console.log('✅ Movie updated:', data.title)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Update movie exception:', error)
      return { data: null, error: error.message }
    }
  },

  async deleteMovie(id) {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Delete movie failed:', error.message)
        return { error: error.message }
      }

      console.log('✅ Movie deleted:', id)
      return { error: null }
    } catch (error) {
      console.error('❌ Delete movie exception:', error)
      return { error: error.message }
    }
  },

  // ==================== CHANNELS CRUD ====================
  async getChannels(limit = null, categoryId = null) {
    try {
      let query = supabase
        .from('channels')
        .select(`
          *,
          categories (category_name)
        `)
        .order('created_at', { ascending: false })

      if (limit) query = query.limit(limit)
      if (categoryId) query = query.eq('category_id', categoryId)

      const { data, error, count } = await query
      
      if (error) {
        console.error('❌ Get channels failed:', error.message)
        return { data: null, error: error.message, count: 0 }
      }
      
      console.log(`✅ Loaded ${data?.length || 0} channels`)
      return { data, error: null, count: data?.length || 0 }
    } catch (error) {
      console.error('❌ Get channels exception:', error)
      return { data: null, error: error.message, count: 0 }
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
        console.error('❌ Get channel failed:', error.message)
        return { data: null, error: error.message }
      }

      console.log('✅ Loaded channel:', data?.name)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Get channel exception:', error)
      return { data: null, error: error.message }
    }
  },

  async createChannel(channelData) {
    try {
      // Validate required fields
      if (!channelData.name?.trim()) {
        return { data: null, error: 'Channel name is required' }
      }
      if (!channelData.poster_url?.trim()) {
        return { data: null, error: 'Poster URL is required' }
      }

      const channelPayload = {
        name: channelData.name.trim(),
        poster_url: channelData.poster_url.trim(),
        description: channelData.description?.trim() || '',
        category_id: channelData.category_id || null,
        watch_link: channelData.watch_link?.trim() || '',
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('channels')
        .insert([channelPayload])
        .select()
        .single()

      if (error) {
        console.error('❌ Create channel failed:', error.message)
        return { data: null, error: error.message }
      }

      console.log('✅ Channel created:', data.name)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create channel exception:', error)
      return { data: null, error: error.message }
    }
  },

  async updateChannel(id, channelData) {
    try {
      const updatePayload = {
        name: channelData.name?.trim(),
        poster_url: channelData.poster_url?.trim(),
        description: channelData.description?.trim(),
        category_id: channelData.category_id,
        watch_link: channelData.watch_link?.trim(),
        updated_at: new Date().toISOString()
      }

      // Remove undefined fields
      Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined) {
          delete updatePayload[key]
        }
      })

      const { data, error } = await supabase
        .from('channels')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Update channel failed:', error.message)
        return { data: null, error: error.message }
      }

      console.log('✅ Channel updated:', data.name)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Update channel exception:', error)
      return { data: null, error: error.message }
    }
  },

  async deleteChannel(id) {
    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Delete channel failed:', error.message)
        return { error: error.message }
      }

      console.log('✅ Channel deleted:', id)
      return { error: null }
    } catch (error) {
      console.error('❌ Delete channel exception:', error)
      return { error: error.message }
    }
  },

  // ==================== CATEGORIES CRUD ====================
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('category_name', { ascending: true })

      if (error) {
        console.error('❌ Get categories failed:', error.message)
        return { data: null, error: error.message }
      }

      console.log(`✅ Loaded ${data?.length || 0} categories`)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Get categories exception:', error)
      return { data: null, error: error.message }
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
        console.error('❌ Get category failed:', error.message)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ Get category exception:', error)
      return { data: null, error: error.message }
    }
  },

  async createCategory(categoryData) {
    try {
      if (!categoryData.category_name?.trim()) {
        return { data: null, error: 'Category name is required' }
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          category_name: categoryData.category_name.trim(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Create category failed:', error.message)
        return { data: null, error: error.message }
      }

      console.log('✅ Category created:', data.category_name)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create category exception:', error)
      return { data: null, error: error.message }
    }
  },

  async updateCategory(id, categoryData) {
    try {
      if (!categoryData.category_name?.trim()) {
        return { data: null, error: 'Category name is required' }
      }

      const { data, error } = await supabase
        .from('categories')
        .update({
          category_name: categoryData.category_name.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Update category failed:', error.message)
        return { data: null, error: error.message }
      }

      console.log('✅ Category updated:', data.category_name)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Update category exception:', error)
      return { data: null, error: error.message }
    }
  },

  async deleteCategory(id) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Delete category failed:', error.message)
        return { error: error.message }
      }

      console.log('✅ Category deleted:', id)
      return { error: null }
    } catch (error) {
      console.error('❌ Delete category exception:', error)
      return { error: error.message }
    }
  },

  // ==================== BANNERS CRUD ====================
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

      if (limit) query = query.limit(limit)

      const { data, error } = await query
      
      if (error) {
        console.error('❌ Get banners failed:', error.message)
        return { data: null, error: error.message }
      }
      
      console.log(`✅ Loaded ${data?.length || 0} banners`)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Get banners exception:', error)
      return { data: null, error: error.message }
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
        console.error('❌ Get banner failed:', error.message)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ Get banner exception:', error)
      return { data: null, error: error.message }
    }
  },

  async createBanner(bannerData) {
    try {
      if (!bannerData.banner_image_url?.trim()) {
        return { data: null, error: 'Banner image URL is required' }
      }

      const bannerPayload = {
        banner_image_url: bannerData.banner_image_url.trim(),
        target_movie_id: bannerData.target_movie_id || null,
        target_channel_id: bannerData.target_channel_id || null,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('banners')
        .insert([bannerPayload])
        .select()
        .single()

      if (error) {
        console.error('❌ Create banner failed:', error.message)
        return { data: null, error: error.message }
      }

      console.log('✅ Banner created')
      return { data, error: null }
    } catch (error) {
      console.error('❌ Create banner exception:', error)
      return { data: null, error: error.message }
    }
  },

  async updateBanner(id, bannerData) {
    try {
      const updatePayload = {
        banner_image_url: bannerData.banner_image_url?.trim(),
        target_movie_id: bannerData.target_movie_id || null,
        target_channel_id: bannerData.target_channel_id || null,
        updated_at: new Date().toISOString()
      }

      // Remove undefined fields
      Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined) {
          delete updatePayload[key]
        }
      })

      const { data, error } = await supabase
        .from('banners')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Update banner failed:', error.message)
        return { data: null, error: error.message }
      }

      console.log('✅ Banner updated')
      return { data, error: null }
    } catch (error) {
      console.error('❌ Update banner exception:', error)
      return { data: null, error: error.message }
    }
  },

  async deleteBanner(id) {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Delete banner failed:', error.message)
        return { error: error.message }
      }

      console.log('✅ Banner deleted:', id)
      return { error: null }
    } catch (error) {
      console.error('❌ Delete banner exception:', error)
      return { error: error.message }
    }
  },

  // ==================== DASHBOARD & UTILITIES ====================
  async getDashboardCounts() {
    try {
      console.log('📊 Loading dashboard counts...')
      
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

      console.log('📊 Dashboard counts loaded:', counts)
      return counts
    } catch (error) {
      console.error('❌ Get dashboard counts failed:', error)
      return {
        movies: 0,
        channels: 0,
        categories: 0,
        banners: 0
      }
    }
  },

  async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('count')
        .limit(1)

      return {
        healthy: !error,
        error: error?.message,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  },

  // Real-time subscriptions
  subscribeToTable(tableName, callback) {
    const subscription = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName
        },
        callback
      )
      .subscribe()

    return subscription
  },

  // File upload utility (for future use)
  async uploadFile(bucketName, filePath, file) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file)

      if (error) {
        console.error('❌ File upload failed:', error.message)
        return { data: null, error: error.message }
      }

      console.log('✅ File uploaded:', filePath)
      return { data, error: null }
    } catch (error) {
      console.error('❌ File upload exception:', error)
      return { data: null, error: error.message }
    }
  },

  // Search functionality
  async searchContent(query, type = 'all') {
    try {
      let results = {}
      
      if (type === 'all' || type === 'movies') {
        const { data: movies } = await supabase
          .from('movies')
          .select('*')
          .textSearch('title', query)
          .limit(10)
        results.movies = movies || []
      }

      if (type === 'all' || type === 'channels') {
        const { data: channels } = await supabase
          .from('channels')
          .select('*')
          .textSearch('name', query)
          .limit(10)
        results.channels = channels || []
      }

      return { data: results, error: null }
    } catch (error) {
      console.error('❌ Search failed:', error)
      return { data: null, error: error.message }
    }
  }
}

// ==================== EXPORT DEFAULT ====================
export default databaseService

// ==================== UTILITY FUNCTIONS ====================
export const isSupabaseConnected = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('count').limit(1)
    return !error
  } catch (error) {
    return false
  }
}

export const getConnectionStatus = async () => {
  const connectionTest = await testConnection()
  const healthCheck = await databaseService.healthCheck()
  
  return {
    auth: connectionTest.connected,
    database: healthCheck.healthy,
    overall: connectionTest.connected && healthCheck.healthy,
    lastChecked: new Date().toISOString()
  }
}

// Initialize and log final status
setTimeout(async () => {
  const status = await getConnectionStatus()
  console.log('🔍 Final Connection Status:', status)
}, 2000)
