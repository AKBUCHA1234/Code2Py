import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  function handleLogout() {
    logout()
    close()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          Code2<span>Py</span>
        </Link>

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/analyze" onClick={close}>Analyze</NavLink>
          <NavLink to="/dashboard" onClick={close}>Dashboard</NavLink>
          {user && <NavLink to="/notes" onClick={close}>Notes</NavLink>}
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            style={{
              width: 'auto', background: 'none', border: '1px solid var(--border-strong)',
              borderRadius: 8, padding: '0.35rem 0.55rem', cursor: 'pointer', fontSize: '1rem',
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {user ? (
            <>
              <span className="nav-email">{user.email}</span>
              <button type="button" className="btn secondary" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn" onClick={close}>
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
