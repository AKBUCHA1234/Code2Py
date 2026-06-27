import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api, type TranslationSummary } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { TicketWidget } from '../components/TicketWidget'
import { SkeletonRows } from '../components/Skeleton'
import { DailyChallenge } from '../components/DailyChallenge'

const LANG_LABEL: Record<string, string> = { c: 'C', cpp: 'C++', java: 'Java' }

/** Count consecutive days (ending today or yesterday) with at least one analysis. */
function computeStreak(dates: string[]): number {
  const days = new Set(dates.map((d) => new Date(d).toDateString()))
  const cur = new Date()
  if (!days.has(cur.toDateString())) {
    cur.setDate(cur.getDate() - 1)
    if (!days.has(cur.toDateString())) return 0
  }
  let streak = 0
  while (days.has(cur.toDateString())) {
    streak++
    cur.setDate(cur.getDate() - 1)
  }
  return streak
}

function Dashboard() {
  const { user, loading } = useAuth()
  const [items, setItems] = useState<TranslationSummary[]>([])
  const [total, setTotal] = useState(0)
  const [streak, setStreak] = useState(0)
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    api
      .listTranslations(50, 0)
      .then((res) => {
        setItems(res.items)
        setTotal(res.total)
        setStreak(computeStreak(res.items.map((i) => i.created_at)))
      })
      .finally(() => setFetching(false))
  }, [user])

  if (loading) return null
  if (!user) return <NotLoggedIn />

  const completed = items.filter((i) => i.status === 'completed').length
  const languages = new Set(items.map((i) => i.source_language)).size
  const filtered = items.filter((i) => {
    const q = search.toLowerCase()
    return (
      (i.algorithm ?? '').toLowerCase().includes(q) ||
      (LANG_LABEL[i.source_language] ?? i.source_language).toLowerCase().includes(q)
    )
  })

  const stats = [
    { n: total, l: 'Total analyses' },
    { n: completed, l: 'Completed' },
    { n: languages, l: 'Languages used' },
    { n: `🔥 ${streak}`, l: 'Day streak' },
  ]

  return (
    <div className="container dash">
      {/* sidebar */}
      <aside className="sidebar">
        <div className="side-profile">
          <div className="avatar">{user.email[0].toUpperCase()}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Free plan</div>
          </div>
        </div>
        <button className="side-item active">📊 Overview</button>
        <Link to="/analyze" className="side-item">➕ New analysis</Link>
        <Link to="/notes" className="side-item">📝 Notes</Link>
        <Link to="/learning-path" className="side-item">🗺️ Learning path</Link>
      </aside>

      {/* main */}
      <main>
        <h2 style={{ marginBottom: '1.25rem' }}>Overview</h2>

        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
          <TicketWidget streak={streak} email={user.email} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <DailyChallenge />
          </div>
        </div>

        <motion.div
          className="stat-grid"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {stats.map((s) => (
            <motion.div
              key={s.l}
              className="stat-card"
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            >
              <div className="stat-num">{s.n}</div>
              <div className="stat-label">{s.l}</div>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Recent analyses</h3>
          <input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 220 }}
          />
        </div>

        {fetching ? (
          <SkeletonRows rows={4} />
        ) : filtered.length === 0 ? (
          <div className="card">
            <p style={{ margin: 0 }}>
              {items.length === 0 ? 'No analyses yet. ' : 'No matches. '}
              <Link to="/analyze">Analyze some code →</Link>
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {filtered.map((it) => (
              <div key={it.id} className="activity-row">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span className="badge">{LANG_LABEL[it.source_language] ?? it.source_language}</span>
                  <span style={{ color: 'var(--text)' }}>{it.algorithm ?? 'Analysis'}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {new Date(it.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function NotLoggedIn() {
  return (
    <div className="container" style={{ maxWidth: 460, paddingTop: '5rem', textAlign: 'center' }}>
      <div className="card">
        <h2>Your dashboard</h2>
        <p>Log in to see your analysis history, stats, and progress.</p>
        <Link to="/login" className="btn">Log in</Link>
      </div>
    </div>
  )
}

export default Dashboard
