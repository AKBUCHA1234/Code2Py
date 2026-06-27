import { useEffect, useRef, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { api, type ChatMessage } from '../lib/api'

/** Ask follow-up questions about one analysis. Backed by /translate/{id}/chat. */
export function ChatPanel({ translationId }: { translationId: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.listChat(translationId).then((r) => setMessages(r.items)).catch(() => {})
  }, [translationId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  async function send(e: FormEvent) {
    e.preventDefault()
    const q = input.trim()
    if (!q) return
    setInput('')
    // optimistically show the user's message
    setMessages((m) => [
      ...m,
      { id: Date.now(), translation_id: translationId, role: 'user', content: q, created_at: '' },
    ])
    setSending(true)
    try {
      const reply = await api.sendChat(translationId, q)
      setMessages((m) => [...m, reply])
    } catch {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, translation_id: translationId, role: 'assistant', content: '⚠ Could not get a reply.', created_at: '' },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 360 }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gap: '0.6rem', paddingRight: '0.25rem' }}>
        {messages.length === 0 && (
          <p style={{ margin: 0 }}>Ask a follow-up question about this analysis.</p>
        )}
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: '0.6rem 0.85rem',
              borderRadius: 12,
              background: m.role === 'user' ? 'var(--primary)' : 'var(--surface-2)',
              color: m.role === 'user' ? '#fff' : 'var(--text)',
              fontSize: '0.92rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {m.content}
          </motion.div>
        ))}
        {sending && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="pulse-dot" /> thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Why is it O(log n)?"
          disabled={sending}
        />
        <button className="btn" disabled={sending || !input.trim()} style={{ width: 'auto' }}>
          Send
        </button>
      </form>
    </div>
  )
}
