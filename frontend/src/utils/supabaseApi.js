import { supabase } from './supabase'

/**
 * Supabase API wrapper - provides axios-like interface for Supabase queries
 * Used in production mode to replace Node.js backend
 */

class SupabaseAPI {
  async get(endpoint, config = {}) {
    try {
      const table = this.parseEndpoint(endpoint)
      const filters = config.params || {}

      let query = supabase.from(table).select('*')

      // Apply filters
      if (filters.userId) query = query.eq('on_duty_user_id', filters.userId)
      if (filters.teamLeaderId) query = query.eq('team_leader_id', filters.teamLeaderId)
      if (filters.startDate) query = query.gte('activity_date', filters.startDate)
      if (filters.endDate) query = query.lte('activity_date', filters.endDate)
      if (filters.date) query = query.eq('activity_date', filters.date)
      if (filters.id) query = query.eq('id', filters.id)

      const { data, error } = await query

      if (error) throw error
      return { data }
    } catch (error) {
      return Promise.reject({
        response: { data: { error: error.message } },
        message: error.message
      })
    }
  }

  async post(endpoint, payload) {
    try {
      const table = this.parseEndpoint(endpoint)

      const { data, error } = await supabase
        .from(table)
        .insert([payload])
        .select()

      if (error) throw error
      return { data: data?.[0] || data }
    } catch (error) {
      return Promise.reject({
        response: { data: { error: error.message } },
        message: error.message
      })
    }
  }

  async put(endpoint, payload) {
    try {
      const { table, id } = this.parseEndpointWithId(endpoint)

      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .select()

      if (error) throw error
      return { data: data?.[0] || data }
    } catch (error) {
      return Promise.reject({
        response: { data: { error: error.message } },
        message: error.message
      })
    }
  }

  async delete(endpoint) {
    try {
      const { table, id } = this.parseEndpointWithId(endpoint)

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error
      return { data: { success: true } }
    } catch (error) {
      return Promise.reject({
        response: { data: { error: error.message } },
        message: error.message
      })
    }
  }

  parseEndpoint(endpoint) {
    // Map API endpoints to Supabase tables
    const mapping = {
      '/users': 'users',
      '/activities': 'daily_activities',
      '/categories': 'activity_categories',
      '/users/categories': 'activity_categories',
      '/sources': 'activity_sources',
      '/users/sources': 'activity_sources',
      '/tasks': 'handover_tasks',
      '/templates': 'activity_templates',
      '/reports': 'daily_activities'
    }

    for (const [key, table] of Object.entries(mapping)) {
      if (endpoint.includes(key)) return table
    }

    return 'daily_activities'  // default
  }

  parseEndpointWithId(endpoint) {
    const parts = endpoint.split('/')
    const id = parseInt(parts[parts.length - 1])
    const table = this.parseEndpoint(endpoint)
    return { table, id }
  }
}

export default new SupabaseAPI()
