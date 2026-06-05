import axios from 'axios'
import { getApiBaseUrl, isDevelopment, isSupabaseMode } from './env'

const apiBaseUrl = getApiBaseUrl() === 'supabase' ? null : (getApiBaseUrl() || 'http://localhost:5000/api')

// Safe default responses - returns empty arrays so .reduce/.map/.filter don't crash
const safeEmptyResponse = (endpoint) => {
  // Most endpoints return arrays
  return { data: [] }
}

// Mock API that returns empty data for all requests
// Used when backend is not available (production without backend)
const mockApi = {
  get: (endpoint) => {
    console.warn(`[Mock API] GET ${endpoint} - returning empty data`)
    return Promise.resolve(safeEmptyResponse(endpoint))
  },
  post: (endpoint, data) => {
    console.warn(`[Mock API] POST ${endpoint} - not available in production`)
    return Promise.resolve({ data: { success: false, message: 'Backend not available' } })
  },
  put: (endpoint, data) => {
    console.warn(`[Mock API] PUT ${endpoint} - not available in production`)
    return Promise.resolve({ data: { success: false, message: 'Backend not available' } })
  },
  delete: (endpoint) => {
    console.warn(`[Mock API] DELETE ${endpoint} - not available in production`)
    return Promise.resolve({ data: { success: false, message: 'Backend not available' } })
  }
}

let api

if (apiBaseUrl) {
  // Use real axios instance (development with backend)
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
      // In production, silently ignore connection errors and return empty data
      if (!isDevelopment()) {
        if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.message === 'Network Error') {
          console.warn('[API] Backend not available - returning empty data')
          return Promise.resolve({ data: [] })
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
} else {
  // Production mode without backend - use mock API
  console.log('[API] Backend not available - using mock API (empty data fallback)')
  api = mockApi
}

export default api
export { isDevelopment, isSupabaseMode }
