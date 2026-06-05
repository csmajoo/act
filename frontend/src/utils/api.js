import axios from 'axios'
import { getApiBaseUrl, isDevelopment, isSupabaseMode } from './env'
import supabaseApi from './supabaseApi'

let api

if (isSupabaseMode()) {
  // Production: use Supabase API service
  console.log('[API] Using Supabase API service')
  api = supabaseApi
} else {
  // Development: use axios with Node.js backend
  const apiBaseUrl = getApiBaseUrl() || 'http://localhost:5000/api'
  console.log(`[API] Using axios with backend: ${apiBaseUrl}`)

  api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Attach Bearer token automatically
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  // Handle 401: clear session and reload
  api.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401 &&
          err.config?.url !== '/auth/me' &&
          err.config?.url !== '/auth/login') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        window.location.reload()
      }
      return Promise.reject(err)
    }
  )
}

export default api
export { isDevelopment, isSupabaseMode }
