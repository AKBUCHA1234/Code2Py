import { useEffect, useState } from 'react'

function getTime() {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/* A boarding-pass styled "learner pass" — streak + identity, like a flight ticket. */
export function TicketWidget({ streak = 1, email }: { streak?: number; email: string }) {
  const [time, setTime] = useState(getTime())
  useEffect(() => {
    const id = setInterval(() => setTime(getTime()), 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="ticket">
      <div className="ticket-strip">
        <div className="ticket-strip-text">🔥 CODE2PY</div>
      </div>
      <div className="ticket-notch top" />
      <div className="ticket-notch bottom" />
      <div className="ticket-perf" />
      <div className="ticket-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="ticket-label">Daily streak</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', lineHeight: 1 }}>
              {streak} 🔥
            </div>
          </div>
          <div
            style={{
              background: 'var(--primary)', color: '#fff', borderRadius: 10,
              padding: '0.2rem 0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem',
            }}
          >
            DSA
          </div>
        </div>
        <div className="ticket-label">Learner</div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </div>
        <div className="ticket-label">Updated</div>
        <div style={{ fontWeight: 700 }}>{time}</div>
      </div>
    </div>
  )
}
