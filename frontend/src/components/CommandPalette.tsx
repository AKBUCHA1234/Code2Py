import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { getTodaysChallenge } from '../lib/challenges'

interface Command {
  label: string
  hint: string
  run: () => void
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { toggle } = useTheme()

  // ⌘K / Ctrl+K toggles; Esc closes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const commands: Command[] = useMemo(() => {
    const go = (path: string) => () => {
      navigate(path)
      setOpen(false)
    }
    return [
      {
        label: "Today's challenge",
        hint: 'Solve',
        run: () => {
          const ch = getTodaysChallenge()
          navigate('/analyze', { state: { code: ch.code, language: ch.language } })
          setOpen(false)
        },
      },
      { label: 'Analyze code', hint: 'Go', run: go('/analyze') },
      { label: 'Dashboard', hint: 'Go', run: go('/dashboard') },
      { label: 'Notes', hint: 'Go', run: go('/notes') },
      { label: 'Learning path', hint: 'Go', run: go('/learning-path') },
      { label: 'Home', hint: 'Go', run: go('/') },
      { label: 'Toggle theme', hint: 'Action', run: () => { toggle(); setOpen(false) } },
    ]
  }, [navigate, toggle])

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmdk-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="cmdk"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or page…"
              className="cmdk-input"
            />
            <div className="cmdk-list">
              {filtered.length === 0 && <div className="cmdk-empty">No matches</div>}
              {filtered.map((c) => (
                <button key={c.label} className="cmdk-item" onClick={c.run}>
                  <span>{c.label}</span>
                  <span className="badge" style={{ fontSize: '0.7rem' }}>{c.hint}</span>
                </button>
              ))}
            </div>
            <div className="cmdk-foot">
              <span className="badge" style={{ fontSize: '0.7rem' }}>⌘K</span> to toggle · Esc to close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
