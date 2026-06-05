// Environment detection utility
// Auto-detect if running locally or deployed on GitHub Pages

export const isProduction = () => {
  return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
}

export const isDevelopment = () => {
  return !isProduction()
}

export const getApiBaseUrl = () => {
  if (isDevelopment()) {
    return 'http://localhost:5000/api'
  }
  // Production - check if using Supabase
  if (process.env.REACT_APP_USE_SUPABASE === 'true') {
    return 'supabase'  // Special flag to indicate Supabase mode
  }
  return process.env.REACT_APP_API_URL || null
}

export const isSupabaseMode = () => {
  return getApiBaseUrl() === 'supabase'
}

console.log(`[Environment] Running in ${isProduction() ? 'PRODUCTION' : 'DEVELOPMENT'} mode`)
console.log(`[API Base URL] ${getApiBaseUrl() || 'Not available (Supabase mode)'}`)
