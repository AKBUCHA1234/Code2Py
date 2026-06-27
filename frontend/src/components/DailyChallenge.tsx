import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getTodaysChallenge, todaysKey } from '../lib/challenges'

const LANG_LABEL: Record<string, string> = { c: 'C', cpp: 'C++', java: 'Java' }

export function DailyChallenge() {
  const navigate = useNavigate()
  const ch = getTodaysChallenge()
  const [done, setDone] = useState(() => localStorage.getItem(todaysKey()) === '1')

  function solve() {
    localStorage.setItem(todaysKey(), '1')
    setDone(true)
    // hand the snippet to the analyzer via router state
    navigate('/analyze', { state: { code: ch.code, language: ch.language } })
  }

  // first lines as a teaser
  const preview = ch.code.split('\n').slice(0, 6).join('\n')

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ borderColor: 'var(--primary)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span className="eyebrow">🎯 Daily challenge</span>
        {done && <span className="badge" style={{ color: 'var(--success)' }}>✓ Done today</span>}
      </div>

      <h3 style={{ margin: '0 0 0.5rem' }}>{ch.title}</h3>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <span className="badge yellow">{ch.topic}</span>
        <span className="badge">{LANG_LABEL[ch.language]}</span>
      </div>

      <pre className="code-block" style={{ fontSize: '0.8rem', maxHeight: 150 }}>{preview}</pre>

      <button className="btn" onClick={solve} style={{ marginTop: '0.9rem' }}>
        {done ? 'Solve again →' : 'Solve this →'}
      </button>
    </motion.div>
  )
}
