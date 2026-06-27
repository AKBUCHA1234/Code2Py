// Runs Python entirely in the browser via Pyodide (loaded from a free CDN).
// No backend, ₹0. First run downloads the runtime (~a few MB), then it's cached.

const PYODIDE_VERSION = 'v0.26.4'
const CDN = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`

let pyodidePromise: Promise<any> | null = null

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<any>
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Pyodide'))
    document.head.appendChild(s)
  })
}

async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      await loadScript(`${CDN}pyodide.js`)
      return window.loadPyodide!({ indexURL: CDN })
    })()
  }
  return pyodidePromise
}

/** Run Python source and return its captured stdout/stderr. */
export async function runPython(code: string): Promise<string> {
  const pyodide = await getPyodide()
  const buffer: string[] = []
  pyodide.setStdout({ batched: (s: string) => buffer.push(s) })
  pyodide.setStderr({ batched: (s: string) => buffer.push(s) })
  try {
    await pyodide.runPythonAsync(code)
  } catch (err) {
    buffer.push(String(err))
  }
  const out = buffer.join('\n').trim()
  return out || '(no output — add a print() to see results)'
}
