'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, TrendingUp, ShoppingBag, Clock, UtensilsCrossed,
  ToggleLeft, ToggleRight, Trash2, Plus, LogOut,
  ChevronRight, CheckCircle, RefreshCw, Eye
} from 'lucide-react'
import { api, getToken, setToken, clearToken, type ApiOrder, type ApiMenuItem, type VendorStats } from '@/lib/api'

// ── tiny helpers ──────────────────────────────────────────────
const fmt = (n: number) => `₦${n.toLocaleString()}`
const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  preparing: 'bg-blue-100 text-blue-700',
  ready:     'bg-green-100 text-green-700',
  delivered: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-500',
}
const STATUS_NEXT: Record<string, string> = {
  pending: 'preparing', preparing: 'ready', ready: 'delivered',
}

// ── Login form ────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.auth.login({ email, password })
      if (res.user.role !== 'vendor' && res.user.role !== 'admin') {
        setError('This account does not have vendor access')
        return
      }
      setToken(res.token)
      onLogin(res.token)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <motion.div className="bg-white rounded-3xl shadow-card p-8 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 gradient-orange rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-syne font-bold text-brand-dark text-lg">Vendor Dashboard</h1>
            <p className="text-xs text-brand-muted">Package-Am Partner Portal</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-muted mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <div>
            <label className="text-xs font-semibold text-brand-muted mb-1 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full gradient-orange text-white py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-xs text-brand-muted mt-6">
          Not a vendor yet?{' '}
          <Link href="/vendor/signup" className="text-brand-orange font-semibold">Apply to join</Link>
        </p>
      </motion.div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, sub, color = 'orange' }: { label: string; value: string; icon: React.ElementType; sub?: string; color?: string }) {
  const bg = color === 'green' ? 'bg-green-50 text-green-600' : color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-brand-orange/10 text-brand-orange'
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-border">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="font-syne font-extrabold text-2xl text-brand-dark">{value}</p>
      {sub && <p className="text-xs text-brand-muted mt-1">{sub}</p>}
    </div>
  )
}

// ── Order card ────────────────────────────────────────────────
function OrderCard({ order, onStatusUpdate }: { order: ApiOrder; onStatusUpdate: (id: string, s: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const token = getToken()!
  const next = STATUS_NEXT[order.status]

  async function advance() {
    if (!next) return
    setUpdating(true)
    try {
      await api.vendor.updateStatus(token, order.id, next)
      onStatusUpdate(order.id, next)
    } catch { /* ignore */ }
    finally { setUpdating(false) }
  }

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    return `${Math.floor(m / 60)}h ago`
  }

  return (
    <div className="bg-white border border-brand-border rounded-2xl overflow-hidden">
      <button className="w-full flex items-center gap-3 p-4" onClick={() => setExpanded(e => !e)}>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-brand-dark">#{order.id.slice(0, 8).toUpperCase()}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-brand-muted">{order.recipientName} · {timeAgo(order.placedAt)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-brand-dark text-sm">{fmt(order.total)}</p>
          <p className="text-xs text-brand-muted">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
        </div>
        <ChevronRight className={`w-4 h-4 text-brand-muted transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-brand-border">
            <div className="p-4 space-y-3">
              {/* Items */}
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-brand-bg">
                      <Image src={item.image || '/gineer/pizzza.jpg'} alt={item.name} fill className="object-cover" />
                    </div>
                    <span className="flex-1 text-brand-dark font-medium">{item.name}</span>
                    <span className="text-brand-muted">×{item.quantity}</span>
                    <span className="font-semibold text-brand-dark">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              {/* Delivery info */}
              <div className="bg-brand-bg rounded-xl p-3 text-xs text-brand-muted space-y-1">
                <p><strong className="text-brand-dark">Deliver to:</strong> {order.recipientAddress}, {order.recipientState}</p>
                <p><strong className="text-brand-dark">Phone:</strong> {order.recipientPhone}</p>
                <p><strong className="text-brand-dark">Order total:</strong> {fmt(order.total)}</p>
              </div>
              {/* Actions */}
              {next && (
                <button onClick={advance} disabled={updating}
                  className="w-full gradient-orange text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Mark as {next.charAt(0).toUpperCase() + next.slice(1)}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Menu item row ─────────────────────────────────────────────
function MenuRow({ item, onToggle, onDelete }: {
  item: ApiMenuItem
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-brand-border last:border-0">
      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-brand-bg">
        <Image src={item.image || '/gineer/pizzza.jpg'} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-brand-dark truncate">{item.name}</p>
        <p className="text-xs text-brand-muted capitalize">{item.category} · ₦{item.price.toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onToggle(item.id)} title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}>
          {item.isAvailable
            ? <ToggleRight className="w-6 h-6 text-green-500" />
            : <ToggleLeft className="w-6 h-6 text-brand-muted" />}
        </button>
        <button onClick={() => onDelete(item.id)} className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────
export default function VendorDashboard() {
  const [token, setTok]   = useState<string | null>(null)
  const [tab, setTab]     = useState<'overview' | 'orders' | 'menu'>('overview')
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [menu, setMenu]   = useState<ApiMenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [orderFilter, setOrderFilter] = useState<string>('')

  useEffect(() => {
    const t = getToken()
    if (t) setTok(t)
  }, [])

  const loadAll = useCallback(async (t: string) => {
    setLoading(true)
    try {
      const [s, o, m] = await Promise.all([
        api.vendor.stats(t),
        api.vendor.orders(t),
        api.vendor.menu(t),
      ])
      setStats(s); setOrders(o); setMenu(m)
    } catch { /* handled by login gate */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (token) loadAll(token) }, [token, loadAll])

  function handleLogin(t: string) { setTok(t); loadAll(t) }
  function handleLogout() { clearToken(); setTok(null); setStats(null); setOrders([]); setMenu([]) }
  function onStatusUpdate(id: string, status: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }
  async function handleToggle(id: number) {
    if (!token) return
    const res = await api.vendor.toggleItem(token, id)
    setMenu(prev => prev.map(m => m.id === id ? { ...m, isAvailable: res.isAvailable } : m))
  }
  async function handleDelete(id: number) {
    if (!token || !confirm('Delete this item?')) return
    await api.vendor.deleteItem(token, id)
    setMenu(prev => prev.filter(m => m.id !== id))
  }

  if (!token) return <LoginForm onLogin={handleLogin} />

  const filteredOrders = orderFilter ? orders.filter(o => o.status === orderFilter) : orders

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Top bar */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 gradient-orange rounded-xl flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-syne font-extrabold text-brand-dark">
            <span className="text-brand-orange">Gineer</span> Dashboard
          </span>
          <div className="ml-auto flex items-center gap-3">
            {loading && <RefreshCw className="w-4 h-4 text-brand-muted animate-spin" />}
            <button onClick={() => token && loadAll(token)} title="Refresh"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-muted hover:bg-brand-bg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-red-500 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-0.5 pb-0 overflow-x-auto">
          {(['overview','orders','menu'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-colors whitespace-nowrap ${tab === t ? 'border-brand-orange text-brand-orange' : 'border-transparent text-brand-muted hover:text-brand-dark'}`}>
              {t}
              {t === 'orders' && orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 gradient-orange text-white text-[10px] font-bold rounded-full">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Today's Revenue" value={stats ? fmt(stats.todayRevenue) : '—'} icon={TrendingUp} sub="orders today" color="orange" />
              <StatCard label="Today's Orders" value={stats?.todayOrders.toString() ?? '—'} icon={ShoppingBag} sub="across all items" color="blue" />
              <StatCard label="Pending Now" value={stats?.pendingOrders.toString() ?? '—'} icon={Clock} sub="need action" color="purple" />
              <StatCard label="Menu Items" value={stats?.totalMenuItems.toString() ?? '—'} icon={UtensilsCrossed} sub="in your menu" color="green" />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Recent orders */}
              <div className="bg-white rounded-2xl border border-brand-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-syne font-bold text-brand-dark">Recent Orders</h2>
                  <button onClick={() => setTab('orders')} className="text-xs text-brand-orange font-semibold flex items-center gap-1">
                    View all <Eye className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 4).map(o => (
                    <div key={o.id} className="flex items-center gap-3 text-sm">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${o.status === 'pending' ? 'bg-yellow-400' : o.status === 'preparing' ? 'bg-blue-400' : o.status === 'ready' ? 'bg-green-400' : 'bg-gray-300'}`} />
                      <span className="text-brand-dark font-medium flex-1 truncate">#{o.id.slice(0,8).toUpperCase()} — {o.recipientName}</span>
                      <span className="text-brand-muted shrink-0">{fmt(o.total)}</span>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-sm text-brand-muted text-center py-4">No orders yet</p>}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-white rounded-2xl border border-brand-border p-5">
                <h2 className="font-syne font-bold text-brand-dark mb-4">All-time</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Total Revenue', value: stats ? fmt(stats.totalRevenue) : '—' },
                    { label: 'Total Orders',  value: stats?.totalOrders.toString() ?? '—' },
                    { label: 'Menu Items',    value: stats?.totalMenuItems.toString() ?? '—' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-sm text-brand-muted">{s.label}</span>
                      <span className="font-syne font-bold text-brand-dark">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Orders ── */}
        {tab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['', 'pending', 'preparing', 'ready', 'delivered'].map(s => (
                <button key={s} onClick={() => setOrderFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${orderFilter === s ? 'gradient-orange text-white' : 'bg-white border border-brand-border text-brand-muted hover:border-brand-orange'}`}>
                  {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  {s === 'pending' && orders.filter(o => o.status === 'pending').length > 0 &&
                    <span className="ml-1 font-bold">({orders.filter(o => o.status === 'pending').length})</span>}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredOrders.map(o => (
                <OrderCard key={o.id} order={o} onStatusUpdate={onStatusUpdate} />
              ))}
              {filteredOrders.length === 0 && (
                <div className="bg-white rounded-2xl border border-brand-border p-10 text-center">
                  <p className="text-brand-muted text-sm">No {orderFilter || ''} orders</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Menu ── */}
        {tab === 'menu' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-syne font-bold text-xl text-brand-dark">Your Menu ({menu.length} items)</h2>
              <Link href="/vendor/menu/new"
                className="flex items-center gap-1.5 gradient-orange text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all">
                <Plus className="w-4 h-4" /> Add Item
              </Link>
            </div>

            {/* Group by category */}
            {Array.from(new Set(menu.map(m => m.category))).map(cat => (
              <div key={cat} className="bg-white rounded-2xl border border-brand-border p-4">
                <h3 className="font-semibold text-sm text-brand-muted capitalize mb-2 pb-2 border-b border-brand-border">{cat}</h3>
                {menu.filter(m => m.category === cat).map(item => (
                  <MenuRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            ))}

            {menu.length === 0 && (
              <div className="bg-white rounded-2xl border border-brand-border p-10 text-center">
                <UtensilsCrossed className="w-10 h-10 text-brand-muted mx-auto mb-3" />
                <p className="text-brand-muted text-sm">No menu items yet</p>
                <Link href="/vendor/menu/new" className="inline-flex items-center gap-1 mt-3 text-brand-orange font-semibold text-sm">
                  <Plus className="w-4 h-4" /> Add your first item
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
