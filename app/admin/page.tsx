'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Users, Store, ShoppingBag, TrendingUp,
  CheckCircle, XCircle, Clock, RefreshCw, LogOut,
  ChevronDown, ChevronUp, MapPin, Phone, Tag, Eye, EyeOff,
} from 'lucide-react'

// ── Admin credentials (change NEXT_PUBLIC_ADMIN_PASSWORD in Netlify env to override) ──
const ADMIN_EMAIL    = process.env.NEXT_PUBLIC_ADMIN_EMAIL    || 'admin@package-am.com'
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'PackageAm@2024'
const SESSION_KEY    = 'pa_admin_session'

const fmt = (n: number) => `₦${(n || 0).toLocaleString()}`

// ── LocalStorage helpers ───────────────────────────────────────
interface StoredUser {
  id: string; name: string; email: string
  cashback: number; createdAt: string
}
interface StoredOrder {
  orderId: string; items: { name: string; quantity: number; price: number; image: string }[]
  subtotal: number; deliveryFee: number; total: number
  cashbackEarned: number; orderFor: string
  recipientName: string; recipientPhone: string
  recipientState: string; recipientAddress: string
  placedAt: string; userEmail?: string
}
interface VendorApp {
  id: string; businessName: string; ownerName: string; email: string
  phone: string; address: string; city: string; state: string
  categories: string[]; description: string; emoji: string; tagline: string
  appliedAt: string; status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
}

function loadUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem('pa_users') || '[]') } catch { return [] }
}
function loadOrders(): StoredOrder[] {
  try { return JSON.parse(localStorage.getItem('pa_orders') || '[]') } catch { return [] }
}
function loadVendorApps(): VendorApp[] {
  try { return JSON.parse(localStorage.getItem('pa_vendor_apps') || '[]') } catch { return [] }
}
function saveVendorApps(apps: VendorApp[]) {
  localStorage.setItem('pa_vendor_apps', JSON.stringify(apps))
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, sub, accent = false }: {
  label: string; value: string; icon: React.ElementType; sub?: string; accent?: boolean
}) {
  return (
    <div className={`rounded-2xl p-5 border ${accent ? 'border-orange-500/30 bg-orange-500/5' : 'border-gray-800 bg-gray-900'}`}>
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

// ── Vendor application card ────────────────────────────────────
function VendorAppCard({ app, onReview }: {
  app: VendorApp
  onReview: (id: string, approved: boolean, reason?: string) => void
}) {
  const [expanded, setExpanded]       = useState(false)
  const [showReject, setShowReject]   = useState(false)
  const [reason, setReason]           = useState('')

  const statusColor = app.status === 'approved'
    ? 'bg-green-900/40 text-green-400 border-green-800'
    : app.status === 'rejected'
    ? 'bg-red-900/40 text-red-400 border-red-800'
    : 'bg-yellow-900/40 text-yellow-400 border-yellow-800'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpanded(e => !e)}>
        <span className="text-2xl">{app.emoji || '🍽️'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white">{app.businessName}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${statusColor}`}>
              {app.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">{app.ownerName} · {app.email}</p>
        </div>
        <div className="text-gray-600">
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
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-brand-orange" />
                  <span>{app.address}, {app.city}, {app.state}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4 shrink-0 text-brand-orange" />
                  <span>{app.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-400 sm:col-span-2">
                  <Tag className="w-4 h-4 shrink-0 mt-0.5 text-brand-orange" />
                  <span>{app.categories.join(', ')}</span>
                </div>
              </div>

              <p className="text-sm text-gray-400 bg-gray-800 rounded-xl p-3 leading-relaxed">
                {app.description}
              </p>

              <p className="text-xs text-gray-600">
                Applied {new Date(app.appliedAt).toLocaleString()}
              </p>

              {app.status === 'rejected' && app.rejectionReason && (
                <p className="text-xs text-red-400 bg-red-900/20 rounded-xl px-3 py-2">
                  Rejection reason: {app.rejectionReason}
                </p>
              )}

              {/* Actions */}
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onReview(app.id, true); setExpanded(false) }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    {showReject ? (
                      <>
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
                      </>
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
  const [authed, setAuthed]       = useState(false)
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loginErr, setLoginErr]   = useState('')
  const [tab, setTab]             = useState<'overview' | 'vendors' | 'users' | 'orders'>('overview')
  const [vendorFilter, setVendorFilter] = useState<string>('')

  const [users, setUsers]         = useState<StoredUser[]>([])
  const [orders, setOrders]       = useState<StoredOrder[]>([])
  const [vendorApps, setVendorApps] = useState<VendorApp[]>([])

  // Check existing session on mount
  useEffect(() => {
    if (localStorage.getItem(SESSION_KEY) === 'true') {
      setAuthed(true)
      loadData()
    }
  }, [])

  function loadData() {
    setUsers(loadUsers())
    setOrders(loadOrders())
    setVendorApps(loadVendorApps())
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(SESSION_KEY, 'true')
      setAuthed(true)
      loadData()
    } else {
      setLoginErr('Incorrect email or password')
    }
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY)
    setAuthed(false)
    setEmail(''); setPassword('')
  }

  function handleReview(id: string, approved: boolean, reason?: string) {
    const updated = vendorApps.map(a =>
      a.id === id
        ? { ...a, status: (approved ? 'approved' : 'rejected') as VendorApp['status'], rejectionReason: reason }
        : a
    )
    setVendorApps(updated)
    saveVendorApps(updated)
  }

  // ── Stats ──────────────────────────────────────────────────
  const totalRevenue   = orders.reduce((s, o) => s + o.total, 0)
  const totalCashback  = orders.reduce((s, o) => s + o.cashbackEarned, 0)
  const todayOrders    = orders.filter(o => new Date(o.placedAt).toDateString() === new Date().toDateString())
  const todayRevenue   = todayOrders.reduce((s, o) => s + o.total, 0)
  const pendingCount   = vendorApps.filter(a => a.status === 'pending').length
  const filteredApps   = vendorFilter ? vendorApps.filter(a => a.status === vendorFilter) : vendorApps

  // ── Login screen ───────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-full max-w-sm"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 gradient-orange rounded-xl flex items-center justify-center shadow-sm">
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
              type="submit"
              className="w-full gradient-orange text-white py-3.5 rounded-xl font-syne font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm mt-2"
            >
              Sign In to Admin
            </button>
          </form>

          <p className="text-center text-xs text-gray-700 mt-6">
            Package-Am · Admin Access Only
          </p>
        </motion.div>
      </div>
    )
  }

  // ── Dashboard ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950">

      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 gradient-orange rounded-xl flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-syne font-extrabold">
            <span className="text-brand-orange">Package</span>
            <span className="text-white">-Am</span>
            <span className="text-gray-500 font-normal ml-2 text-sm">Admin</span>
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => loadData()}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-800 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto">
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'vendors',  label: 'Vendor Applications' },
            { id: 'users',    label: `Users (${users.length})` },
            { id: 'orders',   label: `Orders (${orders.length})` },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                tab === t.id ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              {t.label}
              {t.id === 'vendors' && pendingCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ── Overview ───────────────────────────────────────── */}
        {tab === 'overview' && (
          <>
            {/* Pending alert */}
            {pendingCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-3"
              >
                <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-300 text-sm">
                    {pendingCount} vendor application{pendingCount > 1 ? 's' : ''} waiting for review
                  </p>
                  <p className="text-xs text-yellow-400/60 mt-0.5">Review them in the Vendor Applications tab</p>
                </div>
                <button
                  onClick={() => setTab('vendors')}
                  className="text-xs font-bold text-yellow-400 border border-yellow-500/40 px-3 py-1.5 rounded-full hover:bg-yellow-500/20 transition-colors shrink-0"
                >
                  Review →
                </button>
              </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Today's Revenue" value={fmt(todayRevenue)} icon={TrendingUp} accent sub={`${todayOrders.length} orders today`} />
              <StatCard label="Total Revenue"   value={fmt(totalRevenue)} icon={TrendingUp} sub="all time" />
              <StatCard label="Total Users"     value={users.length.toString()} icon={Users} sub="registered accounts" />
              <StatCard label="Total Orders"    value={orders.length.toString()} icon={ShoppingBag} sub="all time" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Cashback Paid"   value={fmt(totalCashback)} icon={TrendingUp} sub="total earned by users" />
              <StatCard label="Vendor Apps"     value={vendorApps.length.toString()} icon={Store} sub={`${pendingCount} pending`} />
              <StatCard label="Avg Order Value" value={orders.length ? fmt(Math.round(totalRevenue / orders.length)) : '—'} icon={ShoppingBag} />
              <StatCard label="Active Today"    value={todayOrders.length.toString()} icon={Clock} sub="orders placed today" />
            </div>

            {/* Recent orders table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="font-syne font-bold text-white">Recent Orders</h2>
                <button onClick={() => setTab('orders')} className="text-xs text-brand-orange font-semibold hover:underline">
                  View all
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                      <th className="px-5 py-3 font-semibold">Order</th>
                      <th className="px-5 py-3 font-semibold">Customer</th>
                      <th className="px-5 py-3 font-semibold">Items</th>
                      <th className="px-5 py-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 6).map((o, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-gray-400">#{o.orderId.slice(0,8).toUpperCase()}</td>
                        <td className="px-5 py-3 text-white">{o.recipientName}</td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{o.items.map(i => i.name).join(', ').slice(0,40)}{o.items.length > 1 ? '…' : ''}</td>
                        <td className="px-5 py-3 text-right font-bold text-brand-orange">{fmt(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-10">No orders yet</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Vendor Applications ─────────────────────────────── */}
        {tab === 'vendors' && (
          <div className="space-y-4">
            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['', 'pending', 'approved', 'rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => setVendorFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
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
              {filteredApps.map(app => (
                <VendorAppCard key={app.id} app={app} onReview={handleReview} />
              ))}
              {filteredApps.length === 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                  <Store className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">
                    {vendorFilter ? `No ${vendorFilter} applications` : 'No vendor applications yet'}
                  </p>
                  <p className="text-gray-700 text-xs mt-1">Applications submitted via /vendor/signup will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Users ──────────────────────────────────────────── */}
        {tab === 'users' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 bg-gray-800/60">
                    <th className="px-5 py-3.5 font-semibold">Name</th>
                    <th className="px-5 py-3.5 font-semibold">Email</th>
                    <th className="px-5 py-3.5 font-semibold">Cashback</th>
                    <th className="px-5 py-3.5 font-semibold">Orders</th>
                    <th className="px-5 py-3.5 font-semibold">Spent</th>
                    <th className="px-5 py-3.5 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const userOrders = orders.filter(o => o.userEmail === u.email)
                    const spent      = userOrders.reduce((s, o) => s + o.total, 0)
                    return (
                      <tr key={i} className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-white">{u.name}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs">{u.email}</td>
                        <td className="px-5 py-3.5 font-semibold text-brand-orange">{fmt(u.cashback)}</td>
                        <td className="px-5 py-3.5 text-gray-300">{userOrders.length}</td>
                        <td className="px-5 py-3.5 text-gray-300">{fmt(spent)}</td>
                        <td className="px-5 py-3.5 text-gray-600 text-xs">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-10">No registered users yet</p>
              )}
            </div>
          </div>
        )}

        {/* ── Orders ─────────────────────────────────────────── */}
        {tab === 'orders' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 bg-gray-800/60">
                    <th className="px-5 py-3.5 font-semibold">Order ID</th>
                    <th className="px-5 py-3.5 font-semibold">Recipient</th>
                    <th className="px-5 py-3.5 font-semibold">State</th>
                    <th className="px-5 py-3.5 font-semibold">Items</th>
                    <th className="px-5 py-3.5 font-semibold">Cashback</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Total</th>
                    <th className="px-5 py-3.5 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={i} className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">#{o.orderId.slice(0,8).toUpperCase()}</td>
                      <td className="px-5 py-3.5 text-white font-medium">{o.recipientName}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{o.recipientState}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs max-w-[180px] truncate">
                        {o.items.map(it => `${it.name} ×${it.quantity}`).join(', ')}
                      </td>
                      <td className="px-5 py-3.5 text-green-400 font-semibold">{fmt(o.cashbackEarned)}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-brand-orange">{fmt(o.total)}</td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">{new Date(o.placedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-10">No orders yet</p>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
