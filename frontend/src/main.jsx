import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Error Boundary to catch and display errors instead of blank screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 React Error Boundary caught:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'monospace',
          background: '#fee',
          color: '#900',
          minHeight: '100vh'
        }}>
          <h1 style={{ marginBottom: '16px' }}>⚠️ Application Error</h1>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #fcc'
          }}>
            <h3 style={{ color: '#c00', marginBottom: '8px' }}>Error Message:</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>
              {this.state.error?.message || String(this.state.error)}
            </pre>
          </div>
          {this.state.errorInfo && (
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #fcc'
            }}>
              <h3 style={{ color: '#c00', marginBottom: '8px' }}>Component Stack:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: '#17A697',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              🔄 Reload App
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Global error handlers
window.addEventListener('error', (e) => {
  console.error('🚨 Global error:', e.error || e.message)
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('🚨 Unhandled promise rejection:', e.reason)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
