import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault() // stop the browser's default full-page form submit
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, phone, Number(age))
      }
      navigate('/analyze') // success → go to the app
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: '5rem' }}>
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 style={{ color: 'var(--text)', marginBottom: '0.25rem' }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          {mode === 'login'
            ? 'Log in to access your analyses.'
            : 'Sign up to save your history and notes.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {mode === 'register' && (
            <>
              <label style={{ display: 'grid', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mobile number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </label>
              <label style={{ display: 'grid', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Age</span>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="20"
                  required
                />
              </label>
            </>
          )}

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</div>
          )}

          <button type="submit" className="btn" disabled={busy} style={{ justifyContent: 'center' }}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p style={{ marginTop: '1.25rem', marginBottom: 0, fontSize: '0.9rem' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError(null)
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              font: 'inherit',
              padding: 0,
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}

export default Login
