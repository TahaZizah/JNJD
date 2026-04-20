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
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem 1rem',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,168,75,0.06) 0%, transparent 60%)',
    }}>
      <div style={{ maxWidth: 420, width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-lg)',
            background: 'rgba(200,168,75,0.1)',
            border: '1px solid rgba(200,168,75,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 32px rgba(200,168,75,0.2)',
          }}>
            <TrophyIcon size={28} style={{ color: 'var(--gold)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Admin Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            JNJD 19th Edition — Registration Management
          </p>
        </div>

        {/* Login card */}
        <div className="glass" style={{ padding: '2rem' }}>
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
              className="btn btn-primary btn-lg"
              disabled={mutation.isPending || !username || !password}
              id="admin-login-btn"
              style={{ width: '100%' }}
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
