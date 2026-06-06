/**
 * Package-Am API client
 * Wraps fetch with auth token injection and consistent error handling.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try { msg = (await res.json()).error ?? msg } catch { /* ignore */ }
    throw new ApiError(res.status, msg)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── Token helpers (vendor / admin use a separate localStorage key) ──────────
export const TOKEN_KEY = 'pa_api_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(t: string) { localStorage.setItem(TOKEN_KEY, t) }
export function clearToken() { localStorage.removeItem(TOKEN_KEY) }

// ── Auth ───────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    signup: (body: { name: string; email: string; password: string }) =>
      request<{ token: string; user: ApiUser }>('/api/v1/auth/signup', { method: 'POST', body: JSON.stringify(body) }),

    login: (body: { email: string; password: string }) =>
      request<{ token: string; user: ApiUser }>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body) }),

    me: (token: string) =>
      request<ApiUser>('/api/v1/auth/me', {}, token),

    vendorSignup: (body: VendorSignupBody) =>
      request<{ message: string; vendorId: number; user: ApiUser }>(
        '/api/v1/auth/vendor/signup', { method: 'POST', body: JSON.stringify(body) }),
  },

  vendor: {
    stats:          (t: string) => request<VendorStats>('/api/v1/vendor/stats', {}, t),
    orders:         (t: string, status?: string) =>
      request<ApiOrder[]>(`/api/v1/vendor/orders${status ? `?status=${status}` : ''}`, {}, t),
    updateStatus:   (t: string, id: string, status: string) =>
      request('/api/v1/vendor/orders/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) }, t),
    menu:           (t: string) => request<ApiMenuItem[]>('/api/v1/vendor/menu', {}, t),
    createItem:     (t: string, body: MenuItemBody) =>
      request<ApiMenuItem>('/api/v1/vendor/menu', { method: 'POST', body: JSON.stringify(body) }, t),
    updateItem:     (t: string, id: number, body: MenuItemBody) =>
      request<ApiMenuItem>('/api/v1/vendor/menu/' + id, { method: 'PATCH', body: JSON.stringify(body) }, t),
    toggleItem:     (t: string, id: number) =>
      request<{ isAvailable: boolean }>('/api/v1/vendor/menu/' + id + '/toggle', { method: 'PATCH' }, t),
    deleteItem:     (t: string, id: number) =>
      request('/api/v1/vendor/menu/' + id, { method: 'DELETE' }, t),
  },

  admin: {
    stats:         (t: string) => request<AdminStats>('/api/v1/admin/stats', {}, t),
    vendors:       (t: string, status?: string) =>
      request<AdminVendorRow[]>(`/api/v1/admin/vendors${status ? `?status=${status}` : ''}`, {}, t),
    reviewVendor:  (t: string, id: number, approved: boolean, reason?: string) =>
      request('/api/v1/admin/vendors/' + id + '/review', { method: 'PATCH', body: JSON.stringify({ approved, reason: reason ?? '' }) }, t),
    users:         (t: string) => request<AdminUserRow[]>('/api/v1/admin/users', {}, t),
    orders:        (t: string) => request<AdminOrderRow[]>('/api/v1/admin/orders', {}, t),
  },
}

// ── Types ──────────────────────────────────────────────────────────────────
export interface ApiUser {
  id: string; name: string; email: string
  cashbackBalance: number; role: 'customer' | 'vendor' | 'admin'
  vendorId?: number
}
export interface VendorSignupBody {
  ownerName: string; email: string; password: string; phone: string
  businessName: string; tagline?: string; description: string
  address: string; city: string; state: string; categories: string[]; emoji?: string
}
export interface VendorStats {
  todayRevenue: number; todayOrders: number; pendingOrders: number
  totalMenuItems: number; totalOrders: number; totalRevenue: number
}
export interface ApiOrder {
  id: string; status: string; orderFor: string
  recipientName: string; recipientPhone: string
  recipientState: string; recipientAddress: string
  subtotal: number; deliveryFee: number; total: number
  cashbackEarned: number; placedAt: string
  items: ApiOrderItem[]
}
export interface ApiOrderItem {
  id: number; orderId: string; menuItemId: number
  name: string; price: number; quantity: number; image: string
}
export interface ApiMenuItem {
  id: number; vendorId?: number; name: string; category: string
  price: number; rating: number; time: string; image: string
  badge?: string; isAvailable: boolean
}
export interface MenuItemBody {
  name: string; category: string; price: number
  prepTime?: string; image?: string; badge?: string; isAvailable?: boolean
}
export interface AdminStats {
  totalUsers: number; totalVendors: number; pendingVendors: number
  totalOrders: number; todayOrders: number; totalRevenue: number
  todayRevenue: number; totalCashbackPaid: number
}
export interface AdminVendorRow {
  id: number; name: string; emoji: string; ownerName: string; ownerEmail: string
  phone: string; address: string; city: string; state: string
  description: string; categories: string[]; status: string
  rejectionReason?: string; appliedAt: string
  totalOrders: number; totalRevenue: number
}
export interface AdminUserRow {
  id: string; name: string; email: string; role: string
  cashbackBalance: number; totalOrders: number; totalSpent: number; createdAt: string
}
export interface AdminOrderRow {
  id: string; status: string; recipientName: string; total: number
  cashbackEarned: number; placedAt: string; customerName: string; customerEmail: string
}
