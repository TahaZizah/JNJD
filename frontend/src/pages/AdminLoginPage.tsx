import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { LockIcon, UserIcon, AlertCircleIcon, TrophyIcon } from 'lucide-react'
import { adminLogin } from '../api/admin'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () => adminLogin(username, password),
    onSuccess: (data) => {
      localStorage.setItem('admin_token', data.token)
      navigate('/admin/dashboard')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username && password) mutation.mutate()
  }

  const getError = () => {
    const err = mutation.error as any
    if (!err) return null
    if (err?.response?.status === 401) return 'Invalid username or password.'
    return 'Login failed. Please try again.'
  }

  return (
    <div className="admin-layout" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      {/* Decorative orbits */}
      <div className="admin-orbit-1" />
      <div className="admin-orbit-2" />

      <div style={{ maxWidth: 420, width: '100%', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(180deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.04) 100%)',
            border: '1px solid rgba(201,168,76,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 32px rgba(201,168,76,0.2)',
          }}>
            <TrophyIcon size={28} style={{ color: 'var(--text-gold)' }} />
          </div>
          <h1 className="t-display" style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Admin Portal
          </h1>
          <p className="t-mono" style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-gold)' }}>
            JNJD 19th Edition · Registration Management
          </p>
        </div>

        {/* Login card */}
        <div className="glass-gold" style={{ padding: '2rem', borderRadius: 20 }}>
          <form onSubmit={handleSubmit} noValidate>
            {getError() && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                <AlertCircleIcon size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                {getError()}
              </div>
            )}

            <div className="field" style={{ marginBottom: '1rem' }}>
              <label className="field-label" htmlFor="admin-username">Username</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input
                  id="admin-username"
                  type="text"
                  className="input"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="field" style={{ marginBottom: '1.5rem' }}>
              <label className="field-label" htmlFor="admin-password">Password</label>
              <div style={{ position: 'relative' }}>
                <LockIcon size={16} style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input
                  id="admin-password"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={mutation.isPending || !username || !password}
              id="admin-login-btn"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {mutation.isPending ? (
                <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</>
              ) : (
                <><LockIcon size={16} /> Sign In</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
