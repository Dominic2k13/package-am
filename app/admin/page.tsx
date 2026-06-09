'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Users, Store, ShoppingBag, TrendingUp,
  CheckCircle, XCircle, Clock, RefreshCw, LogOut,
  ChevronDown, ChevronUp, MapPin, Phone, Tag, Eye, EyeOff,
  LayoutDashboard, Bell,
} from 'lucide-react'
import {
  api, type AdminVendorRow, type AdminUserRow, type AdminOrderRow, type AdminStats,
} from '@/lib/api'

const ADMIN_TOKEN_KEY = 'pa_admin_token'

const fmt   = (n: number) => `₦${(n || 0).toLocaleString()}`
const fmtDt = (iso: string) => {
  try { return new Date(iso).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'2-digit' }) }
  catch { return '—' }
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, sub, accent = false }: {
  label: string; value: string; icon: React.ElementType; sub?: string; accent?: boolean
}) {
  return (
    <div className={`rounded-2xl p-4 sm:p-5 border ${accent ? 'border-orange-500/30 bg-orange-500/5' : 'border-gray-800 bg-gray-900'}`}>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide leading-tight">{label}</p>
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'gradient-orange' : 'bg-gray-800'}`}>
          <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${accent ? 'text-white' : 'text-gray-400'}`} />
        </div>
      </div>
      <p className={`font-syne font-extrabold text-xl sm:text-2xl ${accent ? 'text-brand-orange' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

// ── Vendor application card ────────────────────────────────────
function VendorAppCard({ app, onReview }: {
  app: AdminVendorRow
  onReview: (id: number, approved: boolean, reason?: string) => void
}) {
  const [expanded, setExpanded]     = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason]         = useState('')

  const statusColor = app.status === 'approved'
    ? 'bg-green-900/40 text-green-400 border-green-800'
    : app.status === 'rejected'
    ? 'bg-red-900/40 text-red-400 border-red-800'
    : 'bg-yellow-900/40 text-yellow-400 border-yellow-800'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpanded(e => !e)}>
        <span className="text-xl sm:text-2xl shrink-0">{app.emoji || '🍽️'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white text-sm sm:text-base truncate">{app.name}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize shrink-0 ${statusColor}`}>
              {app.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">{app.ownerName} · {app.ownerEmail}</p>
        </div>
        <div className="text-gray-600 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-gray-800"
          >
            <div className="p-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-2.5 text-sm">
                <div className="flex items-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-brand-orange" />
                  <span className="text-xs sm:text-sm">{app.address}, {app.city}, {app.state}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4 shrink-0 text-brand-orange" />
                  <span className="text-xs sm:text-sm">{app.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-400 sm:col-span-2">
                  <Tag className="w-4 h-4 shrink-0 mt-0.5 text-brand-orange" />
                  <span className="text-xs sm:text-sm">{(app.categories || []).join(', ')}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-400 bg-gray-800 rounded-xl p-3 leading-relaxed">
                {app.description}
              </p>
              <p className="text-xs text-gray-600">Applied {fmtDt(app.appliedAt)}</p>

              {app.status === 'rejected' && app.rejectionReason && (
                <p className="text-xs text-red-400 bg-red-900/20 rounded-xl px-3 py-2">
                  Rejection reason: {app.rejectionReason}
                </p>
              )}

              {app.status === 'pending' && (
                <div className="space-y-2">
                  <AnimatePresence>
                    {showReject && (
                      <motion.textarea
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        value={reason} onChange={e => setReason(e.target.value)}
                        placeholder="Reason for rejection (optional)…" rows={2}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 resize-none"
                      />
                    )}
                  </AnimatePresence>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => { onReview(app.id, true); setExpanded(false) }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    {showReject ? (
                      <div className="flex gap-2 flex-1">
                        <button
                          onClick={() => { onReview(app.id, false, reason); setExpanded(false) }}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Confirm Reject
                        </button>
                        <button
                          onClick={() => setShowReject(false)}
                          className="px-3 flex items-center bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowReject(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-red-900/30 text-red-400 py-2.5 rounded-xl font-semibold text-sm transition-colors border border-gray-700 hover:border-red-700"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main admin page ────────────────────────────────────────────
export default function AdminPage() {
  const [adminToken, setAdminToken]       = useState<string | null>(null)
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [showPass, setShowPass]           = useState(false)
  const [loginErr, setLoginErr]           = useState('')
  const [loginLoading, setLoginLoading]   = useState(false)
  const [tab, setTab]                     = useState<'overview' | 'vendors' | 'users' | 'orders'>('overview')
  const [vendorFilter, setVendorFilter]   = useState<string>('')
  const [dataLoading, setDataLoading]     = useState(false)

  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [vendors, setVendors]       = useState<AdminVendorRow[]>([])
  const [users, setUsers]           = useState<AdminUserRow[]>([])
  const [orders, setOrders]         = useState<AdminOrderRow[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (stored) { setAdminToken(stored); loadData(stored) }
  }, [])

  async function loadData(token: string) {
    setDataLoading(true)
    try {
      const [stats, vens, usrs, ords] = await Promise.all([
        api.admin.stats(token),
        api.admin.vendors(token),
        api.admin.users(token),
        api.admin.orders(token),
      ])
      setAdminStats(stats)
      setVendors(vens)
      setUsers(usrs)
      setOrders(ords)
    } catch (err: unknown) {
      if ((err as { status?: number })?.status === 401) handleLogout()
    } finally {
      setDataLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginErr('')
    setLoginLoading(true)
    try {
      const { token, user } = await api.auth.login({ email, password })
      if (user.role !== 'admin') {
        setLoginErr('This account does not have admin access.')
        return
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, token)
      setAdminToken(token)
      loadData(token)
    } catch (err: unknown) {
      setLoginErr(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    setAdminToken(null)
    setAdminStats(null)
    setVendors([])
    setUsers([])
    setOrders([])
    setEmail(''); setPassword('')
  }

  async function handleReview(id: number, approved: boolean, reason?: string) {
    if (!adminToken) return
    try {
      await api.admin.reviewVendor(adminToken, id, approved, reason)
      // Reload vendors after review
      const updated = await api.admin.vendors(adminToken)
      setVendors(updated)
      // Update stats pending count
      const stats = await api.admin.stats(adminToken)
      setAdminStats(stats)
    } catch (err) {
      console.error('Review failed', err)
    }
  }

  // ── Derived values ──────────────────────────────────────────
  const pendingCount  = adminStats?.pendingVendors ?? 0
  const filteredVends = vendorFilter ? vendors.filter(v => v.status === vendorFilter) : vendors

  const TABS = [
    { id: 'overview', label: 'Overview',   shortLabel: 'Overview', icon: LayoutDashboard },
    { id: 'vendors',  label: 'Vendors',    shortLabel: 'Vendors',  icon: Store           },
    { id: 'users',    label: 'Users',      shortLabel: 'Users',    icon: Users           },
    { id: 'orders',   label: 'Orders',     shortLabel: 'Orders',   icon: ShoppingBag     },
  ] as const

  // ── Login screen ────────────────────────────────────────────
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-sm"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        >
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 gradient-orange rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-syne font-bold text-white text-lg leading-tight">Admin Panel</h1>
              <p className="text-xs text-gray-500">Package-Am Control Center</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Email address</label>
              <input
                type="email" value={email} onChange={e => { setEmail(e.target.value); setLoginErr('') }}
                placeholder="admin@package-am.com" required autoFocus
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password} onChange={e => { setPassword(e.target.value); setLoginErr('') }}
                  placeholder="••••••••••" required
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                />
                <button
                  type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {loginErr && (
                <motion.p
                  className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-2.5"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                >
                  {loginErr}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit" disabled={loginLoading}
              className="w-full gradient-orange text-white py-3.5 rounded-xl font-syne font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm mt-1 disabled:opacity-50"
            >
              {loginLoading ? 'Signing in…' : 'Sign In to Admin'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-700 mt-6">Package-Am · Admin Access Only</p>
        </motion.div>
      </div>
    )
  }

  // ── Dashboard ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── Top bar ── */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-13 sm:h-14 flex items-center gap-2 sm:gap-3 min-h-[52px]">
          <div className="w-7 h-7 sm:w-8 sm:h-8 gradient-orange rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="font-syne font-extrabold text-sm sm:text-base min-w-0">
            <span className="text-brand-orange">Package</span>
            <span className="text-white">-Am</span>
            <span className="text-gray-500 font-normal ml-1.5 text-xs sm:text-sm hidden xs:inline">Admin</span>
          </span>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-3 shrink-0">
            {pendingCount > 0 && (
              <button
                onClick={() => setTab('vendors')}
                className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-1 rounded-full hover:bg-yellow-500/20 transition-colors sm:hidden"
              >
                <Bell className="w-3 h-3" />
                {pendingCount}
              </button>
            )}
            <button
              onClick={() => adminToken && loadData(adminToken)}
              disabled={dataLoading}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${dataLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 flex overflow-x-auto scrollbar-none">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              <t.icon className="w-3.5 h-3.5 sm:hidden shrink-0" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.shortLabel}</span>
              {t.id === 'vendors' && pendingCount > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full">
                  {pendingCount}
                </span>
              )}
              {t.id === 'users' && (
                <span className="hidden sm:inline text-[10px] text-gray-600 font-normal">({users.length})</span>
              )}
              {t.id === 'orders' && (
                <span className="hidden sm:inline text-[10px] text-gray-600 font-normal">({orders.length})</span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* ══ OVERVIEW ══════════════════════════════════════════ */}
        {tab === 'overview' && (
          <>
            {pendingCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-3.5 sm:p-4 flex items-start sm:items-center gap-3"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0 mt-0.5 sm:mt-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-yellow-300 text-xs sm:text-sm">
                    {pendingCount} vendor application{pendingCount > 1 ? 's' : ''} waiting for review
                  </p>
                  <p className="text-[10px] sm:text-xs text-yellow-400/60 mt-0.5">Review them in the Vendors tab</p>
                </div>
                <button
                  onClick={() => setTab('vendors')}
                  className="text-[10px] sm:text-xs font-bold text-yellow-400 border border-yellow-500/40 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-yellow-500/20 transition-colors shrink-0"
                >
                  Review →
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <StatCard label="Today's Revenue" value={fmt(adminStats?.todayRevenue ?? 0)}    icon={TrendingUp}  accent sub={`${adminStats?.todayOrders ?? 0} orders today`} />
              <StatCard label="Total Revenue"   value={fmt(adminStats?.totalRevenue ?? 0)}    icon={TrendingUp}  sub="all time" />
              <StatCard label="Total Users"     value={String(adminStats?.totalUsers ?? 0)}   icon={Users}       sub="registered accounts" />
              <StatCard label="Total Orders"    value={String(adminStats?.totalOrders ?? 0)}  icon={ShoppingBag} sub="all time" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <StatCard label="Cashback Paid"   value={fmt(adminStats?.totalCashbackPaid ?? 0)} icon={TrendingUp}  sub="total earned by users" />
              <StatCard label="Total Vendors"   value={String(adminStats?.totalVendors ?? 0)}   icon={Store}       sub={`${pendingCount} pending`} />
              <StatCard label="Avg Order"       value={adminStats && adminStats.totalOrders > 0 ? fmt(Math.round(adminStats.totalRevenue / adminStats.totalOrders)) : '—'} icon={ShoppingBag} />
              <StatCard label="Active Today"    value={String(adminStats?.todayOrders ?? 0)}    icon={Clock}       sub="orders today" />
            </div>

            {/* Recent orders */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="font-syne font-bold text-white text-sm sm:text-base">Recent Orders</h2>
                <button onClick={() => setTab('orders')} className="text-xs text-brand-orange font-semibold hover:underline">View all</button>
              </div>
              {orders.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-10">No orders yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                        <th className="px-5 py-3 font-semibold">Order</th>
                        <th className="px-5 py-3 font-semibold">Customer</th>
                        <th className="px-5 py-3 font-semibold">Recipient</th>
                        <th className="px-5 py-3 font-semibold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 6).map((o, i) => (
                        <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-gray-400">#{o.id.slice(0,8).toUpperCase()}</td>
                          <td className="px-5 py-3 text-gray-400 text-xs">{o.customerName}</td>
                          <td className="px-5 py-3 text-white">{o.recipientName}</td>
                          <td className="px-5 py-3 text-right font-bold text-brand-orange">{fmt(o.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ VENDOR APPLICATIONS ═══════════════════════════════ */}
        {tab === 'vendors' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['', 'pending', 'approved', 'rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => setVendorFilter(s)}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    vendorFilter === s
                      ? 'gradient-orange text-white'
                      : 'bg-gray-900 border border-gray-700 text-gray-400 hover:border-brand-orange'
                  }`}
                >
                  {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  {s === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredVends.map(v => (
                <VendorAppCard key={v.id} app={v} onReview={handleReview} />
              ))}
              {filteredVends.length === 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 sm:p-12 text-center">
                  <Store className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">
                    {vendorFilter ? `No ${vendorFilter} applications` : 'No vendor applications yet'}
                  </p>
                  <p className="text-gray-700 text-xs mt-1">Applications from /vendor/signup appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ USERS ════════════════════════════════════════════ */}
        {tab === 'users' && (
          <>
            {users.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                <Users className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">No registered users yet</p>
              </div>
            ) : (
              <>
                {/* Mobile: user cards */}
                <div className="sm:hidden space-y-2.5">
                  {users.map((u, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{u.email}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5 capitalize">{u.role}</p>
                        </div>
                        <span className="font-bold text-brand-orange text-sm shrink-0">{fmt(u.cashbackBalance)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-gray-800">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 mb-0.5">Orders</p>
                          <p className="font-semibold text-white text-sm">{u.totalOrders}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 mb-0.5">Spent</p>
                          <p className="font-semibold text-white text-sm">{fmt(u.totalSpent)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 mb-0.5">Joined</p>
                          <p className="font-semibold text-white text-sm">{fmtDt(u.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden sm:block bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 bg-gray-800/60">
                          <th className="px-5 py-3.5 font-semibold">Name</th>
                          <th className="px-5 py-3.5 font-semibold">Email</th>
                          <th className="px-5 py-3.5 font-semibold">Role</th>
                          <th className="px-5 py-3.5 font-semibold">Cashback</th>
                          <th className="px-5 py-3.5 font-semibold">Orders</th>
                          <th className="px-5 py-3.5 font-semibold">Spent</th>
                          <th className="px-5 py-3.5 font-semibold">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, i) => (
                          <tr key={i} className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                            <td className="px-5 py-3.5 font-medium text-white">{u.name}</td>
                            <td className="px-5 py-3.5 text-gray-400 text-xs">{u.email}</td>
                            <td className="px-5 py-3.5 text-gray-400 text-xs capitalize">{u.role}</td>
                            <td className="px-5 py-3.5 font-semibold text-brand-orange">{fmt(u.cashbackBalance)}</td>
                            <td className="px-5 py-3.5 text-gray-300">{u.totalOrders}</td>
                            <td className="px-5 py-3.5 text-gray-300">{fmt(u.totalSpent)}</td>
                            <td className="px-5 py-3.5 text-gray-600 text-xs">{fmtDt(u.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ══ ORDERS ═══════════════════════════════════════════ */}
        {tab === 'orders' && (
          <>
            {orders.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                <ShoppingBag className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">No orders yet</p>
              </div>
            ) : (
              <>
                {/* Mobile: order cards */}
                <div className="sm:hidden space-y-2.5">
                  {orders.map((o, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] text-gray-500">#{o.id.slice(0,8).toUpperCase()}</p>
                          <p className="font-semibold text-white text-sm mt-0.5">{o.recipientName}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{o.customerName}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-bold text-brand-orange">{fmt(o.total)}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5">{fmtDt(o.placedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 capitalize bg-gray-800 px-2.5 py-1 rounded-full">{o.status}</span>
                        {o.cashbackEarned > 0 && (
                          <p className="text-xs text-green-400 font-semibold">Cashback: +{fmt(o.cashbackEarned)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden sm:block bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 bg-gray-800/60">
                          <th className="px-5 py-3.5 font-semibold">Order ID</th>
                          <th className="px-5 py-3.5 font-semibold">Customer</th>
                          <th className="px-5 py-3.5 font-semibold">Recipient</th>
                          <th className="px-5 py-3.5 font-semibold">Status</th>
                          <th className="px-5 py-3.5 font-semibold">Cashback</th>
                          <th className="px-5 py-3.5 font-semibold text-right">Total</th>
                          <th className="px-5 py-3.5 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o, i) => (
                          <tr key={i} className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-xs text-gray-500">#{o.id.slice(0,8).toUpperCase()}</td>
                            <td className="px-5 py-3.5 text-gray-400 text-xs">{o.customerName}</td>
                            <td className="px-5 py-3.5 text-white font-medium">{o.recipientName}</td>
                            <td className="px-5 py-3.5 text-gray-400 text-xs capitalize">{o.status}</td>
                            <td className="px-5 py-3.5 text-green-400 font-semibold">{fmt(o.cashbackEarned)}</td>
                            <td className="px-5 py-3.5 text-right font-bold text-brand-orange">{fmt(o.total)}</td>
                            <td className="px-5 py-3.5 text-gray-600 text-xs">{fmtDt(o.placedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

      </main>
    </div>
  )
}
