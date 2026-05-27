// ── Auth storage helpers ───────────────────────────────────────
// No real backend — user data lives in localStorage.
// pa_session → currently logged-in user
// pa_users   → registered users array (for login lookup)

export interface AuthUser {
  name:      string
  email:     string
  phone?:    string
  cashback:  number
  createdAt: string
}

const SESSION_KEY = 'pa_session'
const USERS_KEY   = 'pa_users'

// ── Session ────────────────────────────────────────────────────
export function getSession(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch { return null }
}

export function setSession(user: AuthUser): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

// ── Registered users ───────────────────────────────────────────
function getAllUsers(): AuthUser[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as AuthUser[]) : []
  } catch { return [] }
}

export function registerUser(user: AuthUser): void {
  const users = getAllUsers()
  const idx   = users.findIndex(u => u.email === user.email)
  if (idx >= 0) users[idx] = user
  else users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUserByEmail(email: string): AuthUser | null {
  return getAllUsers().find(u => u.email === email) ?? null
}

// ── Helpers ────────────────────────────────────────────────────
/** Turn "chidi@example.com" → "Chidi" as a fallback display name */
export function nameFromEmail(email: string): string {
  const base = email.split('@')[0].replace(/[._-]/g, ' ')
  return base
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Get user initials ("Chidi Okonkwo" → "CO") */
export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('')
}
