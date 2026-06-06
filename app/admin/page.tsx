'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Users, Store, ShoppingBag, TrendingUp, CheckCircle,
  XCircle, Clock, RefreshCw, LogOut, ChevronDown, ChevronUp,
  MapPin, Phone, Tag,
} from 'lucide-react'
import { api, getToken, setToken, clearToken, type AdminStats, type AdminVendorRow, type AdminUserRow, type AdminOrderRow } from '@/lib/api'

const fmt = (n: number) => `₦${n.toLocaleString()}`

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved:  'bg-green-100 text-green-700 border-green-200',
  rejected:  'bg-red-100 text-red-500 border-red-200',
}

// ── Admin Login ───────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.auth.login({ email, password })
      if (res.user.role !== 'admin') {
        setError('This account does not have admin access')
        return
      }
      setToken(res.token)
      onLogin(res.token)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 gradient-orange rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-syne font-bold text-white text-lg">Admin Panel</h1>
            <p className="text-xs text-gray-500">Package-Am Control Center</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {[
            { label: 'Email', type: 'email', value: email, set: setEmail },
            { label: 'Password', type: 'password', value: password, set: setPassword },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-semibold text-gray-400 mb-1 block">{f.label}</label>
              <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-orange" />
            </div>
          ))}
          {error && <p className="text-sm text-red-400 bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full gradient-orange text-white py-3 rounded-full font-semibold text-sm hover:opacity-90 disabled:opacity-60">
            {loading ? 'Signing in…' : 'Access Admin Panel'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, sub, accent = false }: { label: string; value: string; icon: React.ElementType; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${accent ? 'bg-brand-orange/5 border-brand-orange/20' : 'bg-gray-900 border-gray-800'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? 'gradient-orange' : 'bg-gray-800'}`}>
          <Icon className={`w-4 h-4 ${accent ? 'text-white' : 'text-gray-400'}`} />
        </div>
      </div>
      <p className={`font-syne font-extrabold text-2xl ${accent ? 'text-brand-orange' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

// ── Vendor card ───────────────────────────────────────────────
function VendorCard({ vendor, onReview }: { vendor: AdminVendorRow; onReview: (id: number, approved: boolean, reason?: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpanded(e => !e)}>
        <span className="text-2xl">{vendor.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white">{vendor.name}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[vendor.status]}`}>{vendor.status}</span>
          </div>
          <p className="text-xs text-gray-500 truncate">{vendor.ownerName} · {vendor.ownerEmail}</p>
        </div>
        <div className="shrink-0 text-gray-500">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4 border-t border-gray-800 pt-4">
              {/* Details */}
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-brand-orange" />
                  <span>{vendor.address}, {vendor.city}, {vendor.state}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4 shrink-0 text-brand-orange" />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-400 sm:col-span-2">
                  <Tag className="w-4 h-4 shrink-0 mt-0.5 text-brand-orange" />
                  <span>{vendor.categories.join(', ')}</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 bg-gray-800 rounded-xl p-3">{vendor.description}</p>
              <div className="flex gap-4 text-sm">
                <div className="text-gray-400">Applied: <strong className="text-white">{new Date(vendor.appliedAt).toLocaleDateString()}</strong></div>
                {vendor.totalOrders > 0 && <>
                  <div className="text-gray-400">Orders: <strong className="text-white">{vendor.totalOrders}</strong></div>
                  <div className="text-gray-400">Revenue: <strong className="text-brand-orange">{fmt(vendor.totalRevenue)}</strong></div>
                </>}
              </div>

              {/* Rejection reason input */}
              <AnimatePresence>
                {showReject && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection (optional but helpful)…" rows={2}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 resize-none" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons — only for pending vendors */}
              {vendor.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => onReview(vendor.id, true)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  {showReject ? (
                    <>
                      <button onClick={() => onReview(vendor.id, false, rejectReason)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                        <XCircle className="w-4 h-4" /> Confirm Reject
                      </button>
                      <button onClick={() => setShowReject(false)}
                        className="w-10 flex items-center justify-center bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setShowReject(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-red-900/30 text-red-400 py-2.5 rounded-xl font-semibold text-sm transition-colors border border-gray-700 hover:border-red-500">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  )}
                </div>
              )}
              {vendor.status !== 'pending' && (
                <p className="text-xs text-gray-500 text-center">
                  Vendor is <strong className={vendor.status === 'approved' ? 'text-green-400' : 'text-red-400'}>{vendor.status}</strong>
                  {vendor.rejectionReason && ` — ${vendor.rejectionReason}`}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main admin dashboard ──────────────────────────────────────
export default function AdminPage() {
  const [token, setTok]     = useState<string | null>(null)
  const [tab, setTab]       = useState<'overview' | 'vendors' | 'users' | 'orders'>('overview')
  const [vendorFilter, setVendorFilter] = useState('')
  const [stats, setStats]   = useState<AdminStats | null>(null)
  const [vendors, setVendors] = useState<AdminVendorRow[]>([])
  const [users, setUsers]   = useState<AdminUserRow[]>([])
  const [orders, setOrders] = useState<AdminOrderRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = getToken()
    if (t) setTok(t)
  }, [])

  const loadAll = useCallback(async (t: string) => {
    setLoading(true)
    try {
      const [s, v, u, o] = await Promise.all([
        api.admin.stats(t),
        api.admin.vendors(t),
        api.admin.users(t),
        api.admin.orders(t),
      ])
      setStats(s); setVendors(v); setUsers(u); setOrders(o)
    } catch { /* login gate */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (token) loadAll(token) }, [token, loadAll])

  function handleLogin(t: string) { setTok(t); loadAll(t) }
  function handleLogout() { clearToken(); setTok(null) }

  async function handleReview(id: number, approved: boolean, reason?: string) {
    if (!token) return
    await api.admin.reviewVendor(token, id, approved, reason)
    setVendors(prev => prev.map(v => v.id === id
      ? { ...v, status: approved ? 'approved' : 'rejected', rejectionReason: reason }
      : v))
  }

  if (!token) return <AdminLogin onLogin={handleLogin} />

  const filteredVendors = vendorFilter ? vendors.filter(v => v.status === vendorFilter) : vendors
  const pendingCount    = vendors.filter(v => v.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 gradient-orange rounded-xl flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-syne font-extrabold text-white">
            <span className="text-brand-orange">Package</span>-Am Admin
          </span>
          <div className="ml-auto flex items-center gap-3">
            {loading && <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />}
            <button onClick={() => token && loadAll(token)} title="Refresh"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-800 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-400 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-0.5 overflow-x-auto">
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'vendors',  label: `Vendors${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}` },
            { id: 'users',    label: `Users (${users.length})` },
            { id: 'orders',   label: `Orders (${orders.length})` },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-white'}`}>
              {t.label}
              {t.id === 'vendors' && pendingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {pendingCount > 0 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-300 text-sm">
                    {pendingCount} vendor application{pendingCount > 1 ? 's' : ''} waiting for review
                  </p>
                  <p className="text-xs text-yellow-400/70">Review them in the Vendors tab</p>
                </div>
                <button onClick={() => setTab('vendors')}
                  className="text-xs font-semibold text-yellow-400 border border-yellow-500/40 px-3 py-1.5 rounded-full hover:bg-yellow-500/20 transition-colors">
                  Review now
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Today's Revenue" value={stats ? fmt(stats.todayRevenue) : '—'} icon={TrendingUp} accent />
              <StatCard label="Today's Orders"  value={stats?.todayOrders.toString() ?? '—'} icon={ShoppingBag} sub="placed today" />
              <StatCard label="Total Users"     value={stats?.totalUsers.toString() ?? '—'} icon={Users} sub="customers" />
              <StatCard label="Active Vendors"  value={stats?.totalVendors.toString() ?? '—'} icon={Store} sub="approved" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Revenue"   value={stats ? fmt(stats.totalRevenue) : '—'} icon={TrendingUp} />
              <StatCard label="Total Orders"    value={stats?.totalOrders.toString() ?? '—'} icon={ShoppingBag} />
              <StatCard label="Cashback Paid"   value={stats ? fmt(stats.totalCashbackPaid) : '—'} icon={TrendingUp} />
              <StatCard label="Pending Apps"    value={pendingCount.toString()} icon={Clock} />
            </div>

            {/* Recent orders */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="font-syne font-bold text-white mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 text-xs">
                      <th className="pb-3 font-semibold">Order ID</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {orders.slice(0, 8).map(o => (
                      <tr key={o.id}>
                        <td className="py-2.5 font-mono text-xs text-gray-400">#{o.id.slice(0,8).toUpperCase()}</td>
                        <td className="py-2.5 text-white">{o.customerName}</td>
                        <td className="py-2.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            o.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400' :
                            o.status === 'delivered' ? 'bg-green-900/50 text-green-400' :
                            'bg-gray-800 text-gray-400'
                          }`}>{o.status}</span>
                        </td>
                        <td className="py-2.5 text-right font-semibold text-brand-orange">{fmt(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No orders yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Vendors ── */}
        {tab === 'vendors' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['', 'pending', 'approved', 'rejected'].map(s => (
                <button key={s} onClick={() => setVendorFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${vendorFilter === s ? 'gradient-orange text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:border-brand-orange'}`}>
                  {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  {s === 'pending' && pendingCount > 0 && <span className="ml-1 font-bold">({pendingCount})</span>}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredVendors.map(v => (
                <VendorCard key={v.id} vendor={v} onReview={handleReview} />
              ))}
              {filteredVendors.length === 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                  <p className="text-gray-500 text-sm">No {vendorFilter || ''} vendors</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr className="text-left text-gray-400 text-xs">
                    {['Name','Email','Role','Cashback','Orders','Spent','Joined'].map(h => (
                      <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${u.role === 'admin' ? 'bg-purple-900/50 text-purple-400' : u.role === 'vendor' ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-orange font-semibold">{fmt(u.cashbackBalance)}</td>
                      <td className="px-4 py-3 text-gray-300">{u.totalOrders}</td>
                      <td className="px-4 py-3 text-gray-300">{fmt(u.totalSpent)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="text-gray-500 text-sm text-center py-10">No users yet</p>}
            </div>
          </div>
        )}

        {/* ── Orders ── */}
        {tab === 'orders' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr className="text-left text-gray-400 text-xs">
                    {['Order ID','Customer','Recipient','Status','Total','Cashback','Date'].map(h => (
                      <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">#{o.id.slice(0,8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-white">{o.customerName}</td>
                      <td className="px-4 py-3 text-gray-400">{o.recipientName}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          o.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400' :
                          o.status === 'delivered' ? 'bg-green-900/50 text-green-400' :
                          o.status === 'preparing' ? 'bg-blue-900/50 text-blue-400' :
                          'bg-gray-800 text-gray-400'
                        }`}>{o.status}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand-orange">{fmt(o.total)}</td>
                      <td className="px-4 py-3 text-green-400">{fmt(o.cashbackEarned)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.placedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <p className="text-gray-500 text-sm text-center py-10">No orders yet</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
