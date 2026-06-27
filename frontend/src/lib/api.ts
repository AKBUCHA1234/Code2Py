// Central API client. Everything that talks to the backend goes through here,
// so token handling and error parsing live in ONE place.

// Configurable per environment. Set VITE_API_URL in production (e.g. on Vercel);
// falls back to the local backend in development.
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// The JWT, kept in memory and mirrored to localStorage so a page refresh
// keeps you logged in.
let authToken: string | null = localStorage.getItem('token')

export function setToken(token: string | null) {
  authToken = token
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

export function getToken() {
  return authToken
}

// A typed error so UI code can read err.status / err.message.
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let detail = res.statusText
    try {
      detail = (await res.json()).detail ?? detail
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(res.status, detail)
  }

  if (res.status === 204) return undefined as T // No Content
  return (await res.json()) as T
}

// ---- shared types (mirror the backend schemas) ----
export interface User {
  id: number
  email: string
  created_at: string
}

export interface AuthResponse {
  user: User
  access_token: string
  token_type: string
}

export interface TranslationResult {
  python_code: string
  explanation: string
  algorithm: string
  time_complexity: string
  space_complexity: string
  leetcode: string[]
  videos: string[]
}

export interface ChatMessage {
  id: number
  translation_id: number
  role: string
  content: string
  created_at: string
}

export interface Note {
  id: number
  title: string
  content: string
  category: string | null
  translation_id: number | null
  created_at: string
  updated_at: string
}

export interface NoteListResponse {
  items: Note[]
  total: number
  limit: number
  offset: number
}

export interface NoteCreate {
  title: string
  content: string
  category?: string | null
}

export interface TranslationSummary {
  id: number
  source_language: string
  algorithm: string | null
  status: string
  created_at: string
}

export interface TranslationListResponse {
  items: TranslationSummary[]
  total: number
  limit: number
  offset: number
}

export interface TranslationJob {
  id: number
  status: string
  source_language: string
  created_at: string
}

export interface TranslationDetail {
  id: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  source_language: string
  result: TranslationResult | null
  error: string | null
  created_at: string
  completed_at: string | null
}

// ---- endpoint functions ----
export const api = {
  register: (email: string, password: string, phone: string, age: number) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, phone, age }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>('/auth/me'),

  createTranslation: (source_language: string, code: string) =>
    request<TranslationJob>('/translate', {
      method: 'POST',
      body: JSON.stringify({ source_language, code }),
    }),
  getTranslation: (id: number) => request<TranslationDetail>(`/translate/${id}`),
  listTranslations: (limit = 20, offset = 0) =>
    request<TranslationListResponse>(`/translations?limit=${limit}&offset=${offset}`),

  // notes
  createNote: (data: NoteCreate) =>
    request<Note>('/notes', { method: 'POST', body: JSON.stringify(data) }),
  listNotes: (q = '', category = '') => {
    const params = new URLSearchParams({ limit: '50' })
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    return request<NoteListResponse>(`/notes?${params.toString()}`)
  },
  deleteNote: (id: number) => request<void>(`/notes/${id}`, { method: 'DELETE' }),

  // chat (about a specific translation)
  listChat: (translationId: number) =>
    request<{ items: ChatMessage[] }>(`/translate/${translationId}/chat`),
  sendChat: (translationId: number, message: string) =>
    request<ChatMessage>(`/translate/${translationId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
}

// helpers to build safe external links from AI-suggested names
export const leetcodeSearchUrl = (title: string) =>
  `https://leetcode.com/problemset/?search=${encodeURIComponent(title)}`
export const youtubeSearchUrl = (topic: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}`
