import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api, ApiError, type Note } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function Notes() {
  const { user, loading } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh(q = '') {
    const res = await api.listNotes(q)
    setNotes(res.items)
  }

  useEffect(() => {
    if (!user) return
    refresh().finally(() => setFetching(false))
  }, [user])

  if (loading) return null
  if (!user) {
    return (
      <div className="container" style={{ maxWidth: 460, paddingTop: '5rem', textAlign: 'center' }}>
        <div className="card">
          <h2>Notes</h2>
          <p>Log in to create and save study notes.</p>
          <Link to="/login" className="btn">Log in</Link>
        </div>
      </div>
    )
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await api.createNote({ title, content, category: category || null })
      setTitle('')
      setContent('')
      setCategory('')
      await refresh(search)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    await api.deleteNote(id)
    setNotes((n) => n.filter((x) => x.id !== id))
  }

  return (
    <div className="container" style={{ paddingTop: '2.25rem', paddingBottom: '3rem', maxWidth: 880 }}>
      <h2>Notes</h2>
      <p>Save study notes for the concepts you learn.</p>

      {/* create form */}
      <form onSubmit={handleCreate} className="card" style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea
          placeholder="Write your note…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ minHeight: 90, fontFamily: 'var(--font-sans)' }}
        />
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Category (optional, e.g. searching)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
          />
          <button className="btn" disabled={saving || !title.trim() || !content.trim()}>
            {saving ? 'Saving…' : 'Add note'}
          </button>
        </div>
        {error && <span style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</span>}
      </form>

      {/* search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>Your notes ({notes.length})</h3>
        <input
          placeholder="Search…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            refresh(e.target.value)
          }}
          style={{ maxWidth: 220 }}
        />
      </div>

      {fetching ? (
        <p>Loading…</p>
      ) : notes.length === 0 ? (
        <div className="card"><p style={{ margin: 0 }}>No notes yet — add your first above.</p></div>
      ) : (
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          <AnimatePresence>
            {notes.map((n) => (
              <motion.div
                key={n.id}
                className="card"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.35rem' }}>{n.title}</h3>
                    {n.category && <span className="badge yellow" style={{ marginBottom: '0.5rem' }}>{n.category}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    title="Delete"
                    style={{ width: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}
                  >
                    🗑️
                  </button>
                </div>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{n.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default Notes
