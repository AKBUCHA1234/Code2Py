import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

// A curated DSA roadmap. A topic counts as "explored" once you've analyzed
// code whose detected algorithm matches one of its keywords.
const ROADMAP = [
  { topic: 'Arrays & Strings', keys: ['array', 'string'] },
  { topic: 'Two Pointers', keys: ['two pointer'] },
  { topic: 'Sliding Window', keys: ['sliding window'] },
  { topic: 'Binary Search', keys: ['binary search'] },
  { topic: 'Recursion', keys: ['recursion', 'recursive'] },
  { topic: 'Sorting', keys: ['sort', 'bubble', 'merge', 'quick'] },
  { topic: 'Hashing', keys: ['hash', 'map'] },
  { topic: 'Linked Lists', keys: ['linked list'] },
  { topic: 'Stacks & Queues', keys: ['stack', 'queue'] },
  { topic: 'Trees', keys: ['tree', 'bst'] },
  { topic: 'Graphs', keys: ['graph', 'bfs', 'dfs'] },
  { topic: 'Dynamic Programming', keys: ['dynamic programming', 'dp', 'memo'] },
  { topic: 'Greedy', keys: ['greedy'] },
  { topic: 'Backtracking', keys: ['backtrack'] },
]

function LearningPath() {
  const { user } = useAuth()
  const [done, setDone] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!user) return
    api.listTranslations(50, 0).then((res) => {
      const algos = res.items.map((i) => (i.algorithm ?? '').toLowerCase())
      const explored = new Set<number>()
      ROADMAP.forEach((node, idx) => {
        if (algos.some((a) => node.keys.some((k) => a.includes(k)))) explored.add(idx)
      })
      setDone(explored)
    })
  }, [user])

  const pct = Math.round((done.size / ROADMAP.length) * 100)

  return (
    <div className="container" style={{ paddingTop: '2.25rem', paddingBottom: '3rem', maxWidth: 760 }}>
      <h2>Learning path</h2>
      <p>A roadmap from arrays to dynamic programming. Topics light up as you analyze related code.</p>

      {!user && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <p style={{ margin: 0 }}>
            <Link to="/login">Log in</Link> to track your progress along this path.
          </p>
        </div>
      )}

      {/* progress bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{done.size} / {ROADMAP.length} topics explored</span>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{pct}%</span>
        </div>
        <div style={{ height: 10, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }}
            style={{ height: '100%', background: 'var(--primary)' }}
          />
        </div>
      </div>

      {/* roadmap */}
      <div style={{ display: 'grid', gap: '0.7rem' }}>
        {ROADMAP.map((node, idx) => {
          const explored = done.has(idx)
          return (
            <motion.div
              key={node.topic}
              className="card"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.1rem',
                borderColor: explored ? 'var(--primary)' : 'var(--border)',
              }}
            >
              <div
                style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  display: 'grid', placeItems: 'center', fontSize: '0.9rem', fontWeight: 700,
                  background: explored ? 'var(--primary)' : 'var(--surface-2)',
                  color: explored ? '#fbfae8' : 'var(--text-muted)',
                }}
              >
                {explored ? '✓' : idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{node.topic}</span>
              </div>
              <span className="badge" style={{ opacity: explored ? 1 : 0.5 }}>
                {explored ? 'Explored' : 'Not yet'}
              </span>
            </motion.div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/analyze" className="btn">Analyze code to progress →</Link>
      </div>
    </div>
  )
}

export default LearningPath
