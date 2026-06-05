import React, { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Email dan password harus diisi')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      })
      
      if (authError) {
        setError(authError.message === 'Invalid login credentials' ? 'Email atau password salah' : authError.message)
        setLoading(false)
        return
      }

      // Get user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim())
        .single()
      
      if (userError) {
        setError('User profile tidak ditemukan')
        setLoading(false)
        return
      }

      // Store auth token and user info
      localStorage.setItem('auth_token', data.session.access_token)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      
      onLogin(userData)
    } catch (err) {
      setError(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4ECDC4 0%, #17A697 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(23, 166, 151, 0.25)',
        maxWidth: '420px', width: '100%',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(90deg, #4ECDC4 0%, #17A697 100%)',
          color: 'white', padding: '28px 30px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '38px', marginBottom: '6px' }}>📊</div>
          <h1 style={{ fontSize: '26px', margin: 0, fontWeight: 700 }}>Productivity Tracker</h1>
          <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>Customer Support Team Management</p>
        </div>

        {/* Body */}
        <div style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>Login</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-light)', marginBottom: '20px' }}>
            Masukkan email dan password untuk login
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@majoo.id"
                autoFocus
                style={{
                  fontSize: '15px', padding: '12px',
                  width: '100%', border: '1px solid var(--border)',
                  borderRadius: '6px', fontFamily: 'inherit', boxSizing: 'border-box'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
                style={{
                  fontSize: '15px', padding: '12px',
                  width: '100%', border: '1px solid var(--border)',
                  borderRadius: '6px', fontFamily: 'inherit', boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 12px', background: '#fee2e2', color: '#991b1b',
                border: '1px solid #fecaca', borderRadius: '6px',
                fontSize: '15px', marginBottom: '14px'
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '12px', fontSize: '17px', fontWeight: 600,
                background: loading ? '#ccc' : 'linear-gradient(90deg, #4ECDC4 0%, #17A697 100%)',
                color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer'
              }}>
              {loading ? '⏳ Login...' : '🔐 Login'}
            </button>
          </form>

          {/* Info */}
          <div style={{
            marginTop: '20px', padding: '10px 12px',
            background: '#dbeafe', color: '#1e40af',
            border: '1px solid #93c5fd', borderRadius: '6px',
            fontSize: '13px'
          }}>
            ℹ️ Powered by <strong>Supabase</strong> · Data tersimpan di cloud
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 30px', background: '#f8fafc', borderTop: '1px solid var(--border)',
          fontSize: '13px', color: 'var(--text-light)', textAlign: 'center'
        }}>
          Hanya user terdaftar yang dapat login
        </div>
      </div>
    </div>
  )
}
