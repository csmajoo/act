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
    return 'http://localhost:5080'
  }
  // Production - no backend API available
  return null
}

console.log(`[Environment] Running in ${isProduction() ? 'PRODUCTION' : 'DEVELOPMENT'} mode`)
console.log(`[API Base URL] ${getApiBaseUrl() || 'Not available (Supabase mode)'}`)
