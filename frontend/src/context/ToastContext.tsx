import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ToastType = 'success' | 'error' | 'info'
interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastState {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastState | undefined>(undefined)

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-wrap">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`toast toast-${t.type}`}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
            >
              <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '⚠' : 'ℹ'}</span>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
