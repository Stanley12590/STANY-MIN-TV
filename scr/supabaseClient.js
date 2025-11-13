import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Service
export const databaseService = {
  // Auth functions
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Movies functions
  async getMovies() {
    const { data, error } = await supabase
      .from('movies')
      .select(`
        *,
        categories (category_name)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getMovieById(id) {
    const { data, error } = await supabase
      .from('movies')
      .select(`
        *,
        categories (category_name)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createMovie(movieData) {
    const { data, error } = await supabase
      .from('movies')
      .insert([movieData])
      .select()
    return { data, error }
  },

  async updateMovie(id, movieData) {
    const { data, error } = await supabase
      .from('movies')
      .update(movieData)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async deleteMovie(id) {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Channels functions
  async getChannels() {
    const { data, error } = await supabase
      .from('channels')
      .select(`
        *,
        categories (category_name)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getChannelById(id) {
    const { data, error } = await supabase
      .from('channels')
      .select(`
        *,
        categories (category_name)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createChannel(channelData) {
    const { data, error } = await supabase
      .from('channels')
      .insert([channelData])
      .select()
    return { data, error }
  },

  async updateChannel(id, channelData) {
    const { data, error } = await supabase
      .from('channels')
      .update(channelData)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async deleteChannel(id) {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Categories functions
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('category_name', { ascending: true })
    return { data, error }
  },

  async createCategory(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
    return { data, error }
  },

  async updateCategory(id, categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async deleteCategory(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Banners functions
  async getBanners() {
    const { data, error } = await supabase
      .from('banners')
      .select(`
        *,
        movies (title),
        channels (name)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createBanner(bannerData) {
    const { data, error } = await supabase
      .from('banners')
      .insert([bannerData])
      .select()
    return { data, error }
  },

  async deleteBanner(id) {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Dashboard counts
  async getDashboardCounts() {
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

    return {
      movies: moviesCount.count || 0,
      channels: channelsCount.count || 0,
      categories: categoriesCount.count || 0,
      banners: bannersCount.count || 0
    }
  }
}
