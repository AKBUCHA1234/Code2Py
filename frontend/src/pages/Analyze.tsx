import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  api,
  ApiError,
  leetcodeSearchUrl,
  youtubeSearchUrl,
  type TranslationDetail,
} from '../lib/api'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { celebrate } from '../lib/confetti'
import { runPython } from '../lib/pyRunner'
import { ChatPanel } from '../components/ChatPanel'

// A distinct starter snippet per language, so switching the dropdown shows a
// fitting example instead of the same C++ factorial everywhere.
const SAMPLES: Record<string, string> = {
  cpp: `int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,
  c: `int binary_search(int arr[], int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
  java: `class Solution {
    public void bubbleSort(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            for (int j = 0; j < a.length - 1 - i; j++) {
                if (a[j] > a[j + 1]) {
                    int tmp = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = tmp;
                }
            }
        }
    }
}`,
}

// Used to tell "untouched example" from "the user's own code": only auto-swap
// the snippet on language change if the editor still holds a known sample.
const SAMPLE_VALUES = new Set(Object.values(SAMPLES).map((s) => s.trim()))

const LANGUAGES = [
  { value: 'cpp', label: 'C++', monaco: 'cpp' },
  { value: 'c', label: 'C', monaco: 'c' },
  { value: 'java', label: 'Java', monaco: 'java' },
]

const TABS = ['Python', 'Explanation', 'Complexity', 'LeetCode', 'Videos', 'Chat'] as const
type Tab = (typeof TABS)[number]

function Analyze() {
  const { theme } = useTheme()
  const { toast } = useToast()
  // a Daily Challenge (or other page) can pass a snippet via router state
  const incoming = useLocation().state as { code?: string; language?: string } | null
  const [language, setLanguage] = useState(incoming?.language ?? 'cpp')
  const [code, setCode] = useState(
    incoming?.code ?? SAMPLES[incoming?.language ?? 'cpp'] ?? SAMPLES.cpp,
  )
  const [jobId, setJobId] = useState<number | null>(null)
  const [detail, setDetail] = useState<TranslationDetail | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('Python')
  const [copied, setCopied] = useState(false)
  const [ocrBusy, setOcrBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [pyOut, setPyOut] = useState<string | null>(null)
  const [pyRunning, setPyRunning] = useState(false)

  const monacoLang = LANGUAGES.find((l) => l.value === language)?.monaco ?? 'cpp'

  // Swap the example when the language changes — but only if the editor still
  // holds an untouched sample, so we never clobber code the user typed/pasted.
  function changeLanguage(next: string) {
    setCode((prev) =>
      prev.trim() === '' || SAMPLE_VALUES.has(prev.trim()) ? SAMPLES[next] : prev,
    )
    setLanguage(next)
  }

  async function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setOcrBusy(true)
    setError(null)
    try {
      // A multimodal model reads the code AND judges whether it's really code,
      // so a random photo no longer produces an invented answer.
      const res = await api.extractImage(file)
      if (!res.is_code || !res.code.trim()) {
        toast("That image didn't look like code — try a clearer screenshot.", 'error')
      } else {
        setCode(res.code)
        if (res.language === 'c' || res.language === 'cpp' || res.language === 'java') {
          setLanguage(res.language) // auto-detected language
        }
        toast('Code extracted from image ✓', 'success')
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not read that image.')
    } finally {
      setOcrBusy(false)
      if (fileRef.current) fileRef.current.value = '' // allow re-uploading same file
    }
  }

  async function handleSubmit() {
    setError(null)
    setDetail(null)
    setSubmitting(true)
    setTab('Python')
    try {
      const job = await api.createTranslation(language, code)
      setJobId(job.id)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Request failed')
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (jobId == null) return
    let active = true
    async function poll() {
      try {
        const d = await api.getTranslation(jobId!)
        if (!active) return
        if (d.status === 'completed' || d.status === 'failed') {
          setDetail(d)
          setSubmitting(false)
          clearInterval(timer)
          if (d.status === 'completed') {
            celebrate()
            toast('Analysis ready 🎉', 'success')
          } else {
            toast('Analysis failed', 'error')
          }
        }
      } catch {
        /* keep polling */
      }
    }
    const timer = setInterval(poll, 1500)
    poll()
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [jobId])

  const analyzing = submitting && !detail
  const r = detail?.status === 'completed' ? detail.result : null

  function copyPython() {
    if (r) {
      navigator.clipboard.writeText(r.python_code)
      setCopied(true)
      toast('Copied to clipboard', 'success')
      setTimeout(() => setCopied(false), 1500)
    }
  }

  async function handleRun() {
    if (!r) return
    setPyRunning(true)
    setPyOut(null)
    try {
      setPyOut(await runPython(r.python_code))
    } catch {
      setPyOut('Failed to start the Python runtime.')
    } finally {
      setPyRunning(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2.25rem', paddingBottom: '3rem' }}>
      <h2>Analyze code</h2>
      <p>Paste C, C++, or Java — Code2Py converts and explains it.</p>

      <div className="analyze-grid">
        {/* ---- input ---- */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select value={language} onChange={(e) => changeLanguage(e.target.value)} style={{ width: 'auto' }}>
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImage}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn secondary"
                onClick={() => fileRef.current?.click()}
                disabled={ocrBusy}
                title="Extract code from a photo or screenshot"
                style={{ width: 'auto' }}
              >
                {ocrBusy ? 'Reading…' : '📷 Image'}
              </button>
            </div>
            <button className="btn" onClick={handleSubmit} disabled={analyzing || !code.trim()}>
              {analyzing ? 'Analyzing…' : 'Translate →'}
            </button>
          </div>
          <div style={{ border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <Editor
              height="400px"
              language={monacoLang}
              value={code}
              onChange={(v) => setCode(v ?? '')}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                scrollBeyondLastLine: false,
                padding: { top: 12 },
              }}
            />
          </div>
        </div>

        {/* ---- result ---- */}
        <div className="card" style={{ minHeight: 460 }}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--danger)' }}>
                {error}
              </motion.p>
            )}

            {analyzing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}
              >
                <span className="pulse-dot" /> Running the model… a few seconds.
              </motion.div>
            )}

            {!analyzing && !error && !r && detail?.status !== 'failed' && (
              <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ margin: 0 }}>
                Results will appear here.
              </motion.p>
            )}

            {detail?.status === 'failed' && (
              <motion.p key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--danger)' }}>
                Analysis failed: {detail.error}
              </motion.p>
            )}

            {r && (
              <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="tab-row">
                  {TABS.map((t) => (
                    <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                      {t}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    {tab === 'Python' && !r.python_code.trim() && (
                      <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.7 }}>
                        {r.explanation || "That input didn't look like code, so there's nothing to translate. Paste C, C++, or Java and try again."}
                      </p>
                    )}

                    {tab === 'Python' && r.python_code.trim() && (
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                          <button
                            className="btn secondary"
                            onClick={copyPython}
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.85rem', width: 'auto' }}
                          >
                            {copied ? 'Copied ✓' : 'Copy'}
                          </button>
                          <button
                            className="btn"
                            onClick={handleRun}
                            disabled={pyRunning}
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.85rem', width: 'auto' }}
                          >
                            {pyRunning ? 'Running…' : '▶ Run'}
                          </button>
                        </div>
                        <pre className="code-block">{r.python_code}</pre>
                        {pyOut !== null && (
                          <div style={{ marginTop: '0.6rem' }}>
                            <div className="ticket-label" style={{ color: 'var(--text-muted)' }}>Output</div>
                            <pre className="code-block" style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>{pyOut}</pre>
                          </div>
                        )}
                      </div>
                    )}

                    {tab === 'Explanation' && (
                      <p style={{ color: 'var(--text)', margin: 0, lineHeight: 1.7 }}>{r.explanation}</p>
                    )}

                    {tab === 'Complexity' && (
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <Row label="Algorithm"><span className="badge yellow">{r.algorithm}</span></Row>
                        <Row label="Time"><span className="badge">{r.time_complexity}</span></Row>
                        <Row label="Space"><span className="badge">{r.space_complexity}</span></Row>
                      </div>
                    )}

                    {tab === 'LeetCode' && (
                      <div style={{ display: 'grid', gap: '0.6rem' }}>
                        {r.leetcode.length === 0 && <p style={{ margin: 0 }}>No suggestions.</p>}
                        {r.leetcode.map((p) => (
                          <a
                            key={p}
                            href={leetcodeSearchUrl(p)}
                            target="_blank"
                            rel="noreferrer"
                            className="card interactive"
                            style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <span style={{ color: 'var(--text)' }}>🟧 {p}</span>
                            <span style={{ color: 'var(--text-muted)' }}>↗</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {tab === 'Videos' && (
                      <div style={{ display: 'grid', gap: '0.6rem' }}>
                        {r.videos.length === 0 && <p style={{ margin: 0 }}>No suggestions.</p>}
                        {r.videos.map((v) => (
                          <a
                            key={v}
                            href={youtubeSearchUrl(v)}
                            target="_blank"
                            rel="noreferrer"
                            className="card interactive"
                            style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <span style={{ color: 'var(--text)' }}>▶️ {v}</span>
                            <span style={{ color: 'var(--text-muted)' }}>↗</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {tab === 'Chat' && detail && <ChatPanel translationId={detail.id} />}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span style={{ color: 'var(--text-muted)' }}>{label}: </span>
      {children}
    </div>
  )
}

export default Analyze
