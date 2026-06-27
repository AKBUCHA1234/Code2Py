import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api, getToken, setToken, type User } from '../lib/api'

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    phone: string,
    age: number,
  ) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On first load: if a token is stored, verify it by fetching the user.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    api
      .me()
      .then(setUser)
      .catch(() => setToken(null)) // token expired/invalid → drop it
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const res = await api.login(email, password)
    setToken(res.access_token)
    setUser(res.user)
  }

  async function register(email: string, password: string, phone: string, age: number) {
    const res = await api.register(email, password, phone, age)
    setToken(res.access_token)
    setUser(res.user)
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook so components just call useAuth() to access auth state.
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
