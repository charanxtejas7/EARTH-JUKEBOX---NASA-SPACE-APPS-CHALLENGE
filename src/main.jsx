import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Earth Jukebox encountered an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          color: '#f1ecff',
          backgroundColor: '#17114a',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h2 style={{ color: '#ff5cb0' }}>Something went wrong loading Earth Jukebox</h2>
          <pre style={{
            background: '#0f0a33',
            padding: '1rem',
            borderRadius: '8px',
            color: '#7ff0ff',
            overflow: 'auto',
            marginTop: '1rem'
          }}>
            {this.state.error?.toString()}
            {'\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem',
              padding: '0.6rem 1.2rem',
              background: '#ff5cb0',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
