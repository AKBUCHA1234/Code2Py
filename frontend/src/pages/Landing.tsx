import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { BentoOverview } from '../components/Bento'
import { Mascot } from '../components/Mascot'
import { Tilt } from '../components/Tilt'
import Shuffle from '../components/Shuffle'

// PixelBlast pulls in three.js + postprocessing (heavy). Load it lazily so it
// never blocks first paint, and only on capable devices (see useRichVisuals).
const PixelBlast = lazy(() => import('../components/PixelBlast'))

// Rich GPU/motion visuals only where they belong: a precise pointer (desktop)
// and no reduced-motion preference. Phones get the clean static hero.
function useRichVisuals() {
  const [on] = useState(
    () =>
      typeof window !== 'undefined' &&
      !!window.matchMedia &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  return on
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const FEATURES = [
  { icon: '🔁', title: 'Code Translation', body: 'C, C++ and Java converted to clean, idiomatic Python.' },
  { icon: '📈', title: 'Complexity Analysis', body: 'Big-O time and space, so you know how it scales.' },
  { icon: '🔬', title: 'Dry Run Visualization', body: 'Step through the logic line by line.' },
  { icon: '🧠', title: 'Algorithm Detection', body: 'Automatically identifies the technique used.' },
  { icon: '🎯', title: 'Interview Tips', body: 'What to say and watch for in a real interview.' },
  { icon: '🗺️', title: 'Learning Paths', body: 'Prerequisites and what to study next.' },
  { icon: '📝', title: 'Notes Generator', body: 'Personalised study notes you can save.' },
  { icon: '🟧', title: 'LeetCode Suggestions', body: 'Related problems to practise the concept.' },
  { icon: '▶️', title: 'Concept Videos', body: 'Curated YouTube lessons for each topic.' },
]

const STEPS = [
  { title: 'Paste code', body: 'Drop in any C, C++ or Java snippet.' },
  { title: 'Analyze', body: 'A local AI model translates and explains it.' },
  { title: 'Learn faster', body: 'Understand the algorithm, then practise it.' },
]

function Landing() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const richVisuals = useRichVisuals()
  // Theme-matched accent (light orange in light mode, warmer orange in dark).
  const primary = theme === 'dark' ? '#F0954A' : '#ED8B3F'
  const accentFrom = '#E8B24A' // soft yellow → orange tween while shuffling
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="hero-section">
        {richVisuals && (
          <Suspense fallback={null}>
            <div className="hero-bg" aria-hidden="true">
              <PixelBlast
                variant="circle"
                color={primary}
                pixelSize={6}
                patternScale={3}
                patternDensity={0.9}
                pixelSizeJitter={0.4}
                enableRipples={false}
                speed={0.4}
                edgeFade={0.3}
                transparent
              />
            </div>
          </Suspense>
        )}
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div className="hero" variants={stagger} initial="hidden" animate="show">
            {/* left */}
            <div>
              <motion.div className="eyebrow" variants={fadeUp} style={{ marginBottom: '1rem' }}>
                Local AI · runs at ₹0
              </motion.div>
              <motion.h1 variants={fadeUp}>
                Convert DSA code into Python and{' '}
                <Shuffle
                  tag="span"
                  text="understand algorithms faster"
                  className="hero-accent-shuffle"
                  style={{ color: primary, display: 'inline-block' }}
                  textAlign="inherit"
                  shuffleDirection="right"
                  duration={0.32}
                  animationMode="evenodd"
                  stagger={0.025}
                  shuffleTimes={1}
                  ease="power3.out"
                  colorFrom={accentFrom}
                  colorTo={primary}
                  triggerOnce
                  triggerOnHover
                  respectReducedMotion
                />
              </motion.h1>
            <motion.p variants={fadeUp} style={{ fontSize: '1.18rem', maxWidth: 480, marginTop: '1rem' }}>
              Paste C, C++, or Java. Code2Py explains the logic, detects the algorithm,
              and breaks down complexity — then points you to problems and videos to master it.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginTop: '1.75rem' }}>
              <Link to="/analyze" className="btn">Try it now →</Link>
              {user ? (
                <Link to="/dashboard" className="btn secondary">Go to dashboard</Link>
              ) : (
                <Link to="/login" className="btn secondary">Create account</Link>
              )}
            </motion.div>
          </div>

          {/* right: mock editor + analysis preview */}
          <motion.div variants={fadeUp} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <span className="badge" style={{ background: 'var(--surface)' }}>Hi, I'm Cody 👋</span>
              <Mascot size={72} />
            </div>
            <Tilt max={8} className="window">
              <div className="window-bar">
                <span className="window-dot" style={{ background: '#E0726A' }} />
                <span className="window-dot" style={{ background: '#E3C04A' }} />
                <span className="window-dot" style={{ background: '#7FA05A' }} />
                <span className="window-title">search.cpp</span>
              </div>
              <pre>{`int binarySearch(int a[], int n, int x) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (a[mid] == x) return mid;
        if (a[mid] < x) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`}</pre>
            </Tilt>

            <Tilt max={7}>
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <span className="badge yellow">Binary Search</span>
                  <span className="badge">Time O(log n)</span>
                  <span className="badge">Space O(1)</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.92rem' }}>
                  Repeatedly halves the search range, comparing the middle element to the target.
                </p>
              </motion.div>
            </Tilt>
          </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <div className="container section">
        <div className="section-head">
          <div className="eyebrow">Everything you need</div>
          <h2>From confusing code to clear understanding</h2>
        </div>
        <motion.div
          className="feature-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {FEATURES.map((f) => (
            <Tilt key={f.title} max={10} className="tilt-cell">
              <motion.div className="card interactive" variants={fadeUp} style={{ height: '100%' }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p style={{ marginBottom: 0, fontSize: '0.92rem' }}>{f.body}</p>
              </motion.div>
            </Tilt>
          ))}
        </motion.div>
      </div>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <div className="container section">
        <div className="section-head">
          <div className="eyebrow">How it works</div>
          <h2>Paste → Analyze → Learn faster</h2>
        </div>
        <motion.div className="steps" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {STEPS.map((s, i) => (
            <motion.div key={s.title} className="card" variants={fadeUp}>
              <div className="step-num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p style={{ marginBottom: 0 }}>{s.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ---------------- BENTO OVERVIEW ---------------- */}
      <div className="container section">
        <div className="section-head">
          <div className="eyebrow">At a glance</div>
          <h2>A learning companion, not just a translator</h2>
        </div>
        <BentoOverview />

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/analyze" className="btn">Start analyzing →</Link>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', marginTop: '2rem' }}>
        <div className="container" style={{ padding: '2rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Code2Py — built with FastAPI, React & a local Llama-family model.
        </div>
      </footer>
    </>
  )
}

export default Landing
