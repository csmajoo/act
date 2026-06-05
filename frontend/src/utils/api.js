import axios from 'axios'
import { getApiBaseUrl, isDevelopment, isSupabaseMode } from './env'
import supabaseApi from './supabaseApi'

const apiBaseUrl = getApiBaseUrl() || 'http://localhost:5000/api'

let api

// Use Supabase API in production mode
if (isSupabaseMode()) {
  console.log('[API] Using Supabase API mode')
  api = supabaseApi
} else {
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

  // Handle errors - production mode shows graceful fallback
  api.interceptors.response.use(
    res => res,
    err => {
      // In production, silently ignore connection errors to backend
      if (!isDevelopment()) {
        if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
          console.warn('[API] Backend not available in production mode')
          return { data: null, error: 'Backend unavailable' }
        }
      }

      // Handle 401: clear session and reload
      if (err.response?.status === 401 && err.config?.url !== '/auth/me' && err.config?.url !== '/auth/verify-otp' && err.config?.url !== '/auth/request-otp') {
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
