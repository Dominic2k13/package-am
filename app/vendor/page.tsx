'use client'

import { useState, useEffect, useCallback, type FormEvent, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { StaggerGrid, StaggerItem } from '@/components/ui/StaggerGrid'
import AnimateIn from '@/components/ui/AnimateIn'
import {
  Package, LayoutDashboard, UtensilsCrossed, ClipboardList,
  TrendingUp, Settings, LogOut, Bell, ChevronRight, Star,
  CheckCircle, Timer, Plus, ToggleLeft, ToggleRight,
  X, Menu, ArrowUpRight, Bike, Banknote, Receipt, Edit2, Trash2,
} from 'lucide-react'
import {
  api, getToken, setToken, clearToken,
  type VendorStats, type ApiOrder, type ApiMenuItem,
} from '@/lib/api'

type Tab = 'dashboard' | 'orders' | 'menu' | 'earnings' | 'profile'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Pending',   bg: 'bg-brand-yellow/10', text: 'text-amber-600'      },
  preparing: { label: 'Preparing', bg: 'bg-brand-orange/10', text: 'text-brand-orange'   },
  ready:     { label: 'Ready',     bg: 'bg-brand-green/10',  text: 'text-brand-green'    },
  delivered: { label: 'Delivered', bg: 'bg-gray-100',        text: 'text-gray-500'       },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50',          text: 'text-red-500'        },
}

const NEXT_STATUS: Record<string, string> = {
  pending: 'preparing', preparing: 'ready', ready: 'delivered',
}
const NEXT_LABEL: Record<string, string> = {
  pending: 'Accept & Prepare', preparing: 'Mark Ready', ready: 'Mark Delivered',
}

// ── Spinner ────────────────────────────────────────────────────
function Spinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  return (
    <svg className={`animate-spin ${cls} text-brand-orange`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ── Login screen ───────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await api.auth.login({ email, password })
      if (user.role !== 'vendor' && user.role !== 'admin') {
        setError('This account is not a vendor account.')
        return
      }
      setToken(token)
      onLogin(token)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <AnimateIn direction="up">
        <div className="bg-white rounded-3xl shadow-card border border-brand-border p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 gradient-orange rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-syne font-extrabold text-brand-dark">
                <span className="text-brand-orange">Package</span>-Am
              </p>
              <p className="text-brand-muted text-xs">Vendor Dashboard</p>
            </div>
          </div>

          <h1 className="font-syne font-extrabold text-2xl text-brand-dark mb-1">Welcome back</h1>
          <p className="text-brand-muted text-sm mb-6">Sign in to your vendor account</p>

          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              >
                <span>⚠️</span> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vendor@email.com"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">Password</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full gradient-orange text-white py-3.5 rounded-full font-syne font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-card flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-brand-muted text-xs mt-6">
            Not a vendor yet?{' '}
            <Link href="/vendor/signup" className="text-brand-orange font-semibold hover:underline">Apply here</Link>
          </p>
        </div>
      </AnimateIn>
    </div>
  )
}

// ── Top nav ────────────────────────────────────────────────────
function VendorNav({ isOnline, setIsOnline, onMenuToggle }: {
  isOnline: boolean
  setIsOnline: (v: boolean) => void
  onMenuToggle: () => void
}) {
  return (
    <header className="h-16 shrink-0 bg-white border-b border-brand-border shadow-nav z-50 flex items-center">
      <div className="w-full px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-brand-dark rounded-lg hover:bg-brand-bg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-orange rounded-xl flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-syne font-extrabold text-lg hidden sm:block">
              <span className="text-brand-orange">Package</span><span className="text-brand-dark">-Am</span>
            </span>
            <span className="text-[10px] font-bold bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">Vendor</span>
          </Link>
        </div>

        <p className="hidden md:block font-syne font-semibold text-brand-dark text-sm">Gineer Tasty Grills</p>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              isOnline
                ? 'bg-brand-green/10 border-brand-green/30 text-brand-green'
                : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-brand-green animate-pulse' : 'bg-gray-400'}`} />
            {isOnline ? 'Online' : 'Offline'}
          </button>

          <button className="relative w-9 h-9 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center hover:border-brand-orange transition-colors">
            <Bell className="w-4 h-4 text-brand-muted" />
          </button>

          <div className="w-9 h-9 gradient-orange rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 text-base">
            🍕
          </div>
        </div>
      </div>
    </header>
  )
}

// ── Sidebar ────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, open, onClose, onLogout }: {
  activeTab: Tab
  setActiveTab: (t: Tab) => void
  open: boolean
  onClose: () => void
  onLogout: () => void
}) {
  const NAV_MAIN: { tab: Tab; icon: React.ElementType; label: string }[] = [
    { tab: 'dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
    { tab: 'orders',    icon: ClipboardList,   label: 'Orders'     },
    { tab: 'menu',      icon: UtensilsCrossed, label: 'Menu Items' },
    { tab: 'earnings',  icon: TrendingUp,      label: 'Earnings'   },
  ]

  return (
    <>
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          lg:relative lg:inset-y-auto lg:left-auto lg:z-auto
          w-64 shrink-0 bg-white border-r border-brand-border
          flex flex-col transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile header */}
        <div className="h-16 shrink-0 flex items-center justify-between px-4 lg:hidden border-b border-brand-border">
          <span className="font-syne font-bold text-brand-dark">Menu</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-bg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vendor info */}
        <div className="p-4 border-b border-brand-border hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 gradient-orange rounded-xl flex items-center justify-center text-2xl shrink-0">🍕</div>
            <div className="min-w-0">
              <p className="font-syne font-bold text-brand-dark text-sm truncate">Gineer Tasty Grills</p>
              <p className="text-brand-muted text-xs">Enugu, Enugu State</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-4 space-y-1">
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest px-3 mb-3">Main</p>
          {NAV_MAIN.map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); onClose() }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'gradient-orange text-white shadow-card'
                  : 'text-brand-muted hover:bg-brand-bg hover:text-brand-dark'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {activeTab === tab && <ChevronRight className="w-3 h-3 ml-auto shrink-0" />}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-brand-border">
            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest px-3 mb-3">Settings</p>
            <button
              onClick={() => { setActiveTab('profile'); onClose() }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'gradient-orange text-white shadow-card'
                  : 'text-brand-muted hover:bg-brand-bg hover:text-brand-dark'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              Store Profile
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-muted hover:bg-red-50 hover:text-red-500 transition-all mt-1"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Logout
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}

// ── Dashboard tab ──────────────────────────────────────────────
function DashboardTab({ stats, orders, loading }: {
  stats: VendorStats | null
  orders: ApiOrder[]
  loading: boolean
}) {
  const WEEKLY_MOCK = [42000, 58000, 35000, 72000, 91000, 84500, stats?.todayRevenue ?? 0]
  const DAYS        = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today']
  const maxRevenue  = Math.max(...WEEKLY_MOCK, 1)

  const statCards = [
    { label: "Today's Orders",  value: String(stats?.todayOrders  ?? 0), sub: 'Orders placed today',      icon: Receipt,    color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
    { label: "Today's Revenue", value: `₦${(stats?.todayRevenue  ?? 0).toLocaleString()}`, sub: 'Revenue so far today', icon: TrendingUp, color: 'text-brand-green',  bg: 'bg-brand-green/10'  },
    { label: 'Pending Orders',  value: String(stats?.pendingOrders ?? 0), sub: 'Awaiting your action',    icon: Timer,      color: 'text-amber-500',    bg: 'bg-brand-yellow/10' },
    { label: 'Avg. Rating',     value: '4.9',                             sub: 'Based on 243 reviews',    icon: Star,       color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  ]

  const liveOrders = orders
    .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-syne font-extrabold text-2xl text-brand-dark mb-0.5">Good afternoon, Gineer 👋</h2>
        <p className="text-brand-muted text-sm">Here&apos;s what&apos;s happening at Gineer Tasty Grills today</p>
      </div>

      {/* Stats grid */}
      <StaggerGrid className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map(stat => (
          <StaggerItem key={stat.label}>
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-card border border-brand-border/50">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
              </div>
              {loading ? (
                <div className="h-7 w-16 bg-brand-border/40 rounded-lg animate-pulse mb-1" />
              ) : (
                <p className="font-syne font-extrabold text-xl sm:text-2xl text-brand-dark">{stat.value}</p>
              )}
              <p className="text-brand-muted text-[11px] sm:text-xs mt-0.5 leading-tight">{stat.label}</p>
              <p className={`text-[10px] sm:text-xs font-medium mt-1 flex items-center gap-0.5 ${stat.color}`}>
                <ArrowUpRight className="w-3 h-3 shrink-0" /><span className="truncate">{stat.sub}</span>
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-brand-border/50">
          <h3 className="font-syne font-bold text-brand-dark mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
            Live Orders
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-brand-bg rounded-xl animate-pulse" />)}
            </div>
          ) : liveOrders.length === 0 ? (
            <p className="text-brand-muted text-sm text-center py-8">No active orders right now</p>
          ) : (
            <StaggerGrid className="space-y-3">
              {liveOrders.map(order => {
                const cfg      = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
                const initials = order.recipientName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <StaggerItem key={order.id}>
                    <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-brand-bg rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 gradient-orange rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-brand-dark text-sm truncate">{order.recipientName}</p>
                          <p className="text-brand-muted text-xs truncate">
                            {order.items.slice(0, 2).map(i => i.name).join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                        <p className="text-brand-muted text-xs mt-1">₦{order.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </StaggerItem>
                )
              })}
            </StaggerGrid>
          )}
        </div>

        {/* Revenue mini-chart */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-border/50">
          <h3 className="font-syne font-bold text-brand-dark mb-4">Revenue This Week</h3>
          <div className="flex items-end gap-1.5 h-32">
            {WEEKLY_MOCK.map((amount, i) => (
              <div key={DAYS[i]} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${i === 6 ? 'gradient-orange' : 'bg-brand-orange/30'}`}
                  style={{ height: `${(amount / maxRevenue) * 100}%` }}
                />
                <p className="text-[10px] text-brand-muted">{DAYS[i]}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-brand-border">
            <p className="text-brand-muted text-xs">All-time revenue</p>
            <p className="font-syne font-bold text-brand-orange">
              {loading ? '—' : `₦${(stats?.totalRevenue ?? 0).toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Orders tab ─────────────────────────────────────────────────
function OrdersTab({ token }: { token: string }) {
  const [filter,   setFilter]   = useState('all')
  const [orders,   setOrders]   = useState<ApiOrder[]>([])
  const [loading,  setLoading]  = useState(true)
  const [detail,   setDetail]   = useState<ApiOrder | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.vendor.orders(token).then(setOrders).catch(console.error).finally(() => setLoading(false))
  }, [token])

  const FILTERS = [
    { value: 'all',       label: 'All'       },
    { value: 'pending',   label: 'Pending'   },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready',     label: 'Ready'     },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const advanceOrder = useCallback(async (id: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus]
    if (!next) return
    setUpdating(id)
    try {
      await api.vendor.updateStatus(token, id, next)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o))
    } catch (err) {
      console.error('Update failed:', err)
    } finally {
      setUpdating(null)
    }
  }, [token])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-syne font-extrabold text-2xl text-brand-dark">Orders</h2>
        {loading && <Spinner />}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
              filter === f.value
                ? 'gradient-orange text-white shadow-card'
                : 'bg-white border border-brand-border text-brand-text hover:border-brand-orange hover:text-brand-orange'
            }`}
          >
            {f.value !== 'all' && (
              <span className={`w-2 h-2 rounded-full ${filter === f.value ? 'bg-white' : 'bg-brand-muted/40'}`} />
            )}
            {f.label}
            <span className="ml-1 text-xs opacity-70">
              ({orders.filter(o => f.value === 'all' || o.status === f.value).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-52 bg-white rounded-2xl animate-pulse border border-brand-border/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-muted">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No {filter === 'all' ? '' : filter} orders</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(order => {
            const cfg      = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
            const next     = NEXT_STATUS[order.status]
            const initials = order.recipientName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={order.id} className="bg-white rounded-2xl p-5 shadow-card border border-brand-border/50 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-syne font-bold text-brand-dark text-sm">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 gradient-orange rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-dark text-sm truncate">{order.recipientName}</p>
                    <p className="text-brand-muted text-xs flex items-center gap-1 truncate">
                      <Bike className="w-3 h-3 shrink-0" />{order.recipientAddress}
                    </p>
                  </div>
                </div>

                <div>
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-brand-text text-sm flex items-center gap-1.5 py-0.5">
                      <span className="w-1.5 h-1.5 bg-brand-orange rounded-full shrink-0" />
                      {item.quantity}× {item.name}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-brand-border">
                  <p className="font-syne font-bold text-brand-orange">₦{order.total.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDetail(order)}
                      className="text-brand-muted hover:text-brand-orange text-xs font-medium transition-colors"
                    >
                      Details
                    </button>
                    {next && (
                      <button
                        onClick={() => advanceOrder(order.id, order.status)}
                        disabled={updating === order.id}
                        className="gradient-orange text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1"
                      >
                        {updating === order.id ? <><Spinner size="sm" /> …</> : NEXT_LABEL[order.status]}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Order detail modal */}
      <AnimatePresence>
        {detail && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7"
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-syne font-bold text-brand-dark text-lg">
                  #{detail.id.slice(0, 8).toUpperCase()}
                </h3>
                <button
                  onClick={() => setDetail(null)}
                  className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center hover:bg-brand-border transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-brand-bg rounded-xl p-4">
                  <p className="font-semibold text-brand-dark text-sm">{detail.recipientName}</p>
                  <p className="text-brand-muted text-xs mt-0.5">{detail.recipientPhone}</p>
                  <p className="text-brand-muted text-xs mt-0.5">{detail.recipientAddress}, {detail.recipientState}</p>
                </div>

                <div>
                  <p className="text-brand-muted text-xs font-semibold uppercase tracking-wider mb-2">Items Ordered</p>
                  {detail.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 border-b border-brand-border last:border-0">
                      <span className="text-brand-text text-sm">{item.quantity}× {item.name}</span>
                      <span className="text-brand-muted text-sm">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-brand-muted text-sm">
                    <span>Subtotal</span><span>₦{detail.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-brand-muted text-sm">
                    <span>Delivery Fee</span><span>₦{detail.deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-syne font-bold text-brand-dark pt-2 border-t border-brand-border">
                    <span>Total</span>
                    <span className="text-brand-orange">₦{detail.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Menu item form modal ───────────────────────────────────────
function MenuItemForm({ token, editItem, onClose, onSaved }: {
  token: string
  editItem: ApiMenuItem | null
  onClose: () => void
  onSaved: (item: ApiMenuItem) => void
}) {
  const [name,     setName]     = useState(editItem?.name     ?? '')
  const [category, setCategory] = useState(editItem?.category ?? '')
  const [price,    setPrice]    = useState(editItem?.price    ? String(editItem.price) : '')
  const [prepTime, setPrepTime] = useState(editItem?.time     ?? '')
  const [image,    setImage]    = useState(editItem?.image    ?? '')
  const [badge,    setBadge]    = useState(editItem?.badge    ?? '')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const CATEGORIES = ['pizza', 'shawarma', 'fast-food', 'drinks', 'snacks', 'nigerian', 'rice', 'soups']

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const priceNum = Number(price)
    if (!name.trim() || !category || isNaN(priceNum) || priceNum < 1) {
      setError('Name, category, and a valid price are required.')
      return
    }
    setLoading(true)
    try {
      const body = {
        name: name.trim(), category, price: priceNum,
        prepTime: prepTime || undefined,
        image:    image    || undefined,
        badge:    badge    || undefined,
      }
      const item = editItem
        ? await api.vendor.updateItem(token, editItem.id, body)
        : await api.vendor.createItem(token, body)
      onSaved(item)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-syne font-bold text-brand-dark text-lg">
            {editItem ? 'Edit Item' : 'Add Menu Item'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center hover:bg-brand-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            >
              <span>⚠️</span> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'name',     label: 'Item Name *',     value: name,     set: setName,     type: 'text',   placeholder: 'e.g. Chicken Shawarma (King Size)' },
            { id: 'prepTime', label: 'Prep Time',        value: prepTime, set: setPrepTime, type: 'text',   placeholder: 'e.g. 15–25 min'                  },
            { id: 'image',    label: 'Image Path',       value: image,    set: setImage,    type: 'text',   placeholder: 'e.g. /gineer/sharwama.jpg'         },
            { id: 'badge',    label: 'Badge (optional)', value: badge,    set: setBadge,    type: 'text',   placeholder: 'e.g. 🔥 Bestseller'               },
          ].map(field => (
            <div key={field.id}>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">{field.label}</label>
              <input
                type={field.type} value={field.value}
                onChange={e => field.set(e.target.value)}
                placeholder={field.placeholder}
                required={field.id === 'name'}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1.5">Category *</label>
            <select
              value={category} onChange={e => setCategory(e.target.value)} required
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1.5">Price (₦) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted text-sm font-semibold">₦</span>
              <input
                type="number" required value={price} onChange={e => setPrice(e.target.value)}
                placeholder="0" min={1}
                className="w-full bg-brand-bg border border-brand-border rounded-xl pl-8 pr-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 bg-brand-bg border border-brand-border text-brand-text py-3 rounded-full font-syne font-semibold text-sm hover:bg-brand-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 gradient-orange text-white py-3 rounded-full font-syne font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-card flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner size="sm" /> Saving…</> : editItem ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Menu tab ───────────────────────────────────────────────────
function MenuTab({ token }: { token: string }) {
  const [items,    setItems]    = useState<ApiMenuItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<ApiMenuItem | null>(null)

  useEffect(() => {
    api.vendor.menu(token)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const toggle = useCallback(async (id: number) => {
    setToggling(id)
    try {
      const { isAvailable } = await api.vendor.toggleItem(token, id)
      setItems(prev => prev.map(i => i.id === id ? { ...i, isAvailable } : i))
    } catch (err) {
      console.error('Toggle failed:', err)
    } finally {
      setToggling(null)
    }
  }, [token])

  const deleteItem = useCallback(async (id: number) => {
    if (!confirm('Delete this menu item?')) return
    try {
      await api.vendor.deleteItem(token, id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }, [token])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-syne font-extrabold text-2xl text-brand-dark">Menu Items</h2>
        <button
          onClick={() => { setEditItem(null); setShowForm(true) }}
          className="flex items-center gap-2 gradient-orange text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-card"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-56 bg-white rounded-2xl animate-pulse border border-brand-border/50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-brand-muted">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No menu items yet</p>
          <p className="text-sm mt-1">Add your first item to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl overflow-hidden shadow-card border transition-opacity ${
                item.isAvailable ? 'border-brand-border/50 opacity-100' : 'border-brand-border/30 opacity-60'
              }`}
            >
              <div className="relative h-36 overflow-hidden bg-brand-bg">
                {item.image ? (
                  <Image
                    src={item.image} alt={item.name} fill
                    sizes="(max-width: 640px) 100vw, 33vw" className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                )}
                <button
                  onClick={() => toggle(item.id)}
                  disabled={toggling === item.id}
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1 disabled:opacity-50"
                  aria-label="Toggle availability"
                >
                  {toggling === item.id
                    ? <span className="w-5 h-5 flex items-center justify-center"><Spinner size="sm" /></span>
                    : item.isAvailable
                      ? <ToggleRight className="w-5 h-5 text-brand-green" />
                      : <ToggleLeft  className="w-5 h-5 text-brand-muted" />
                  }
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-syne font-semibold text-brand-dark text-sm leading-snug">{item.name}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    item.isAvailable ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-brand-muted text-xs mb-2">{item.category} · {item.time || '—'}</p>
                {item.badge && (
                  <p className="text-[10px] font-semibold text-brand-orange mb-2">{item.badge}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-syne font-bold text-brand-orange">₦{item.price.toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditItem(item); setShowForm(true) }}
                      className="text-brand-muted hover:text-brand-orange transition-colors"
                      aria-label="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-brand-muted hover:text-red-500 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <MenuItemForm
            token={token}
            editItem={editItem}
            onClose={() => setShowForm(false)}
            onSaved={item => {
              setItems(prev => {
                const idx = prev.findIndex(i => i.id === item.id)
                return idx >= 0
                  ? prev.map(i => i.id === item.id ? item : i)
                  : [...prev, item]
              })
              setShowForm(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Earnings tab ───────────────────────────────────────────────
function EarningsTab({ stats, orders, loading }: {
  stats: VendorStats | null
  orders: ApiOrder[]
  loading: boolean
}) {
  const CARDS = [
    { label: 'All-time Revenue',   value: `₦${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: TrendingUp, gradient: 'gradient-orange' },
    { label: 'All-time Orders',    value: String(stats?.totalOrders ?? 0),                   icon: Receipt,    gradient: 'bg-brand-dark'   },
    { label: "Today's Revenue",    value: `₦${(stats?.todayRevenue ?? 0).toLocaleString()}`, icon: Banknote,   gradient: 'bg-amber-500'    },
  ]

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    .slice(0, 20)

  return (
    <div className="space-y-8">
      <h2 className="font-syne font-extrabold text-2xl text-brand-dark">Earnings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CARDS.map(card => (
          <div key={card.label} className={`${card.gradient} rounded-2xl p-6 shadow-card`}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <card.icon className="w-5 h-5 text-white" />
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-white/20 rounded-lg animate-pulse mb-1" />
            ) : (
              <p className="font-syne font-extrabold text-white text-2xl mb-0.5">{card.value}</p>
            )}
            <p className="text-white/70 text-xs">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-brand-border/50">
        <div className="p-6 border-b border-brand-border">
          <h3 className="font-syne font-bold text-brand-dark">Order History</h3>
        </div>
        {loading ? (
          <div className="divide-y divide-brand-border">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="px-6 py-4">
                <div className="h-4 bg-brand-bg rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12 text-brand-muted">No orders yet</div>
        ) : (
          <div className="divide-y divide-brand-border">
            {recentOrders.map(order => {
              const initials = order.recipientName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
              return (
                <div key={order.id} className="flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-brand-bg transition-colors">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 gradient-orange rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-dark text-sm truncate">{order.recipientName}</p>
                    <p className="text-brand-muted text-xs truncate">
                      #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.placedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-syne font-bold text-brand-orange text-sm">₦{order.total.toLocaleString()}</p>
                    <p className={`text-xs capitalize ${(STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending).text}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Profile tab ────────────────────────────────────────────────
function ProfileTab() {
  const [saved, setSaved] = useState(false)

  function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-syne font-extrabold text-2xl text-brand-dark">Store Profile</h2>
      <div className="bg-white rounded-2xl shadow-card border border-brand-border/50 p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 gradient-orange rounded-2xl flex items-center justify-center text-4xl shrink-0">🍕</div>
          <div>
            <p className="font-syne font-bold text-brand-dark text-lg">Gineer Tasty Grills</p>
            <p className="text-brand-muted text-sm">Enugu, Enugu State</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow" />
              <span className="font-semibold text-brand-dark text-sm">4.9</span>
              <span className="text-brand-muted text-xs">(243 reviews)</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {[
            { id: 'restName',  label: 'Restaurant Name', defaultValue: 'Gineer Tasty Grills',                                           type: 'text' },
            { id: 'tagline',   label: 'Tagline',          defaultValue: 'Tickle Your Taste Bud',                                         type: 'text' },
            { id: 'address',   label: 'Address',          defaultValue: 'Amazon Extension, Rangers Avenue, Beside Ignition Lounge',      type: 'text' },
            { id: 'city',      label: 'City',             defaultValue: 'Enugu',                                                         type: 'text' },
            { id: 'phone',     label: 'Phone Number',     defaultValue: '08064129532',                                                   type: 'tel'  },
            { id: 'instagram', label: 'Instagram',        defaultValue: '@gineertasty',                                                  type: 'text' },
            { id: 'tiktok',    label: 'TikTok',           defaultValue: 'gineer.tasty.grill',                                            type: 'text' },
          ].map(field => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-semibold text-brand-dark mb-1.5">{field.label}</label>
              <input
                id={field.id} type={field.type} defaultValue={field.defaultValue}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
              />
            </div>
          ))}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="gradient-orange text-white px-6 py-3 rounded-full font-syne font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-card"
            >
              Save Changes
            </button>
            <AnimatePresence>
              {saved && (
                <motion.span
                  className="flex items-center gap-2 text-brand-green font-medium text-sm"
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}
                >
                  <CheckCircle className="w-4 h-4" /> Saved!
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────
export default function VendorPage() {
  const [token,        setTokenState]   = useState<string | null>(null)
  const [activeTab,    setActiveTab]    = useState<Tab>('dashboard')
  const [isOnline,     setIsOnline]     = useState(true)
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [stats,        setStats]        = useState<VendorStats | null>(null)
  const [orders,       setOrders]       = useState<ApiOrder[]>([])
  const [statsLoading, setStatsLoading] = useState(false)
  const [ordersLoading,setOrdersLoading]= useState(false)

  // Hydrate token on mount
  useEffect(() => {
    const t = getToken()
    if (t) setTokenState(t)
  }, [])

  // Load dashboard data whenever we have a token
  useEffect(() => {
    if (!token) return

    setStatsLoading(true)
    api.vendor.stats(token)
      .then(setStats)
      .catch(err => {
        if (err?.status === 401 || err?.status === 403) handleLogout()
      })
      .finally(() => setStatsLoading(false))

    setOrdersLoading(true)
    api.vendor.orders(token)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setOrdersLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function handleLogin(t: string) {
    setTokenState(t)
  }

  function handleLogout() {
    clearToken()
    setTokenState(null)
    setStats(null)
    setOrders([])
  }

  if (!token) return <LoginScreen onLogin={handleLogin} />

  const CONTENT: Record<Tab, ReactNode> = {
    dashboard: <DashboardTab stats={stats} orders={orders} loading={statsLoading} />,
    orders:    <OrdersTab    token={token} />,
    menu:      <MenuTab      token={token} />,
    earnings:  <EarningsTab  stats={stats} orders={orders} loading={statsLoading || ordersLoading} />,
    profile:   <ProfileTab />,
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-brand-bg">
      <VendorNav
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        onMenuToggle={() => setSidebarOpen(o => !o)}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {CONTENT[activeTab]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
