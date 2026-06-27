import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

/* count up to a target once it scrolls into view */
function useCountUp(target: number, run: boolean, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3)))) // ease-out
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, target, duration])
  return val
}

/* type a string out character by character */
function TypingText({ text, speed = 55 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    const id = setInterval(
      () =>
        setN((v) => {
          if (v >= text.length) {
            clearInterval(id)
            return v
          }
          return v + 1
        }),
      speed,
    )
    return () => clearInterval(id)
  }, [text, speed])
  return (
    <span>
      {text.slice(0, n)}
      <span style={{ opacity: n < text.length ? 0.5 : 0 }}>▌</span>
    </span>
  )
}

export function BentoOverview() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const translated = useCountUp(12480, inView)
  const algos = useCountUp(42, inView)
  const bars = [30, 70, 60, 90, 40, 55, 80]

  return (
    <div ref={ref} className="bento-grid">
      {/* AI typing — big */}
      <div className="bento-card b-orange bento-col-2 bento-row-2">
        <div style={{ fontWeight: 700 }}>🤖 Integrated AI</div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>
            What's the complexity of binary search?
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.15rem', fontFamily: 'var(--font-mono)' }}>
            <TypingText text="It runs in O(log n) time." />
          </div>
        </div>
      </div>

      {/* rating */}
      <div className="bento-card b-amber">
        <div style={{ fontWeight: 700 }}>Highly rated</div>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <span className="bento-big">4.9</span>
          <sup style={{ fontSize: '1.3rem' }}>★</sup>
        </div>
      </div>

      {/* translated counter */}
      <div className="bento-card b-peach">
        <div style={{ fontWeight: 700 }}>Snippets translated</div>
        <div className="bento-big" style={{ marginTop: 'auto', fontSize: '2.4rem' }}>
          {translated.toLocaleString()}+
        </div>
      </div>

      {/* languages */}
      <div className="bento-card b-rose bento-row-2" style={{ gap: '0.55rem', justifyContent: 'center' }}>
        <div className="skill-pill" style={{ background: '#DD7A68', transform: 'rotate(-2deg)' }}>C++</div>
        <div className="skill-pill" style={{ background: '#DD7A68', transform: 'rotate(1.5deg)' }}>Java</div>
        <div className="skill-pill" style={{ background: '#DD7A68' }}>C</div>
      </div>

      {/* bar chart */}
      <div className="bento-card b-sage bento-col-2">
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-end', flex: 1, paddingTop: '0.4rem' }}>
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="mini-bar"
              style={{ background: '#86A867' }}
              initial={{ height: 0 }}
              animate={inView ? { height: `${h}%` } : {}}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            />
          ))}
        </div>
        <div style={{ textAlign: 'center', fontWeight: 700, marginTop: '0.4rem' }}>Weekly activity</div>
      </div>

      {/* algorithms counter */}
      <div className="bento-card b-sky">
        <div style={{ fontWeight: 700 }}>Algorithms detected</div>
        <div className="bento-big" style={{ marginTop: 'auto' }}>{algos}</div>
      </div>

      {/* code glyph */}
      <div className="bento-card b-sand" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <span className="bento-big" style={{ fontFamily: 'var(--font-mono)' }}>&lt;/&gt;</span>
      </div>
    </div>
  )
}
