'use client'

import { useState, useCallback, type FormEvent, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Package, LayoutDashboard, UtensilsCrossed, ClipboardList,
  TrendingUp, Settings, LogOut, Bell, ChevronRight, Star,
  CheckCircle, Timer, Plus, ToggleLeft, ToggleRight,
  X, Menu, ArrowUpRight, Wallet, Smartphone, Wifi, Receipt,
  ArrowDownLeft, CreditCard, Send, Banknote, BadgePercent, Bike,
} from 'lucide-react'
import { VENDOR_ORDERS, VENDOR_MENU, VENDOR_TRANSACTIONS, WEEKLY_REVENUE } from '@/lib/data'
import type { Order, MenuItem } from '@/types'

type Tab         = 'dashboard' | 'orders' | 'menu' | 'earnings' | 'wallet' | 'profile'
type OrderStatus = Order['status'] | 'all'

const STATUS_CONFIG: Record<Order['status'], { label: string; bg: string; text: string }> = {
  pending:   { label: 'Pending',   bg: 'bg-brand-yellow/10',      text: 'text-amber-600'      },
  preparing: { label: 'Preparing', bg: 'bg-brand-orange/10',      text: 'text-brand-orange'   },
  ready:     { label: 'Ready',     bg: 'bg-brand-green/10',       text: 'text-brand-green'    },
  delivered: { label: 'Delivered', bg: 'bg-brand-cashback-light', text: 'text-brand-cashback' },
}

const NEXT_STATUS: Partial<Record<Order['status'], Order['status']>> = {
  pending: 'preparing', preparing: 'ready', ready: 'delivered',
}
const NEXT_LABEL: Partial<Record<Order['status'], string>> = {
  pending: 'Accept & Prepare', preparing: 'Mark Ready', ready: 'Mark Delivered',
}

// ── Top nav ───────────────────────────────────────────────────
function VendorNav({ isOnline, setIsOnline, onMenuToggle, onWalletClick, walletBalance }: {
  isOnline: boolean
  setIsOnline: (v: boolean) => void
  onMenuToggle: () => void
  onWalletClick: () => void
  walletBalance: number
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

        <p className="hidden md:block font-syne font-semibold text-brand-dark text-sm">Mama Cass Kitchen</p>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wallet chip */}
          <button
            onClick={onWalletClick}
            className="flex items-center gap-1.5 gradient-cashback text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">₦{walletBalance.toLocaleString()}</span>
          </button>

          {/* Online toggle */}
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
            <span className="absolute -top-1 -right-1 w-4 h-4 gradient-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
          </button>

          <div className="w-9 h-9 gradient-orange rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
            MC
          </div>
        </div>
      </div>
    </header>
  )
}

// ── Sidebar ───────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, walletBalance, open, onClose }: {
  activeTab: Tab
  setActiveTab: (t: Tab) => void
  walletBalance: number
  open: boolean
  onClose: () => void
}) {
  const NAV_MAIN: { tab: Tab; icon: React.ElementType; label: string }[] = [
    { tab: 'dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
    { tab: 'orders',    icon: ClipboardList,   label: 'Orders'     },
    { tab: 'menu',      icon: UtensilsCrossed, label: 'Menu Items' },
    { tab: 'earnings',  icon: TrendingUp,      label: 'Earnings'   },
    { tab: 'wallet',    icon: Wallet,          label: 'Wallet'     },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
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
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-bg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable nav */}
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
              {tab === 'wallet' && activeTab !== 'wallet' && (
                <span className="text-[10px] font-bold bg-brand-cashback-light text-brand-cashback px-1.5 py-0.5 rounded-full">
                  💜
                </span>
              )}
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
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-muted hover:bg-red-50 hover:text-red-500 transition-all mt-1"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Logout
            </Link>
          </div>
        </nav>

        {/* Wallet preview — always visible at bottom */}
        <div className="p-4 border-t border-brand-border shrink-0">
          <button
            onClick={() => { setActiveTab('wallet'); onClose() }}
            className="w-full gradient-cashback rounded-2xl p-4 text-white text-left hover:opacity-95 active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-white/80" />
                <p className="text-white/70 text-xs font-medium">Cashback Wallet</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
            </div>
            <p className="font-syne font-extrabold text-2xl">₦{walletBalance.toLocaleString()}</p>
            <p className="text-white/60 text-xs mt-1">Tap to redeem</p>
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Dashboard tab ─────────────────────────────────────────────
function DashboardTab({ onWalletClick }: { onWalletClick: () => void }) {
  const STATS = [
    { label: "Today's Orders",  value: '24',      sub: '+12% from yesterday', icon: Receipt,     color: 'text-brand-orange',   bg: 'bg-brand-orange/10'       },
    { label: "Today's Revenue", value: '₦84,500', sub: '+8% from yesterday',  icon: TrendingUp,  color: 'text-brand-green',    bg: 'bg-brand-green/10'        },
    { label: 'Pending Orders',  value: '3',       sub: 'Live right now',       icon: Timer,       color: 'text-amber-500',      bg: 'bg-brand-yellow/10'       },
    { label: 'Avg. Rating',     value: '4.8',     sub: 'Based on 240 reviews', icon: Star,        color: 'text-brand-cashback', bg: 'bg-brand-cashback-light'  },
  ]

  const maxRevenue = Math.max(...WEEKLY_REVENUE.map(d => d.amount))
  const liveOrders = VENDOR_ORDERS.filter(o => o.status !== 'delivered').slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-syne font-extrabold text-2xl text-brand-dark mb-0.5">Good afternoon, Mama Cass 👋</h2>
        <p className="text-brand-muted text-sm">Here&apos;s what&apos;s happening with your restaurant today</p>
      </div>

      {/* Wallet quick-access banner */}
      <button
        onClick={onWalletClick}
        className="w-full gradient-cashback rounded-2xl p-5 flex items-center justify-between group hover:opacity-95 active:scale-[0.99] transition-all shadow-card text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs mb-0.5">Available Cashback Balance</p>
            <p className="font-syne font-extrabold text-white text-2xl">₦12,450</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/80 text-sm font-semibold group-hover:text-white transition-colors">
          <span className="hidden sm:inline">Redeem Now</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-card border border-brand-border/50">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="font-syne font-extrabold text-2xl text-brand-dark">{stat.value}</p>
            <p className="text-brand-muted text-xs mt-0.5">{stat.label}</p>
            <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${stat.color}`}>
              <ArrowUpRight className="w-3 h-3" />{stat.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-brand-border/50">
          <h3 className="font-syne font-bold text-brand-dark mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
            Live Orders
          </h3>
          <div className="space-y-3">
            {liveOrders.map(order => {
              const cfg = STATUS_CONFIG[order.status]
              return (
                <div key={order.id} className="flex items-center justify-between p-4 bg-brand-bg rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 gradient-orange rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0">
                      {order.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-dark text-sm">{order.customer}</p>
                      <p className="text-brand-muted text-xs">{order.items.slice(0, 2).join(', ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    <p className="text-brand-muted text-xs mt-1">{order.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-border/50">
          <h3 className="font-syne font-bold text-brand-dark mb-4">Revenue This Week</h3>
          <div className="flex items-end gap-1.5 h-32">
            {WEEKLY_REVENUE.map(({ day, amount }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full gradient-orange rounded-t-md transition-all duration-500"
                  style={{ height: `${(amount / maxRevenue) * 100}%` }}
                />
                <p className="text-[10px] text-brand-muted">{day}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-brand-border">
            <p className="text-brand-muted text-xs">Week total</p>
            <p className="font-syne font-bold text-brand-orange">
              ₦{WEEKLY_REVENUE.reduce((s, d) => s + d.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Top selling */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-border/50">
        <h3 className="font-syne font-bold text-brand-dark mb-4">Top Selling Items Today</h3>
        <div className="space-y-3">
          {[...VENDOR_MENU].sort((a, b) => b.ordersToday - a.ordersToday).slice(0, 4).map((item, i) => (
            <div key={item.id} className="flex items-center gap-4">
              <span className="w-6 text-center font-syne font-bold text-brand-muted text-sm">{i + 1}</span>
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0">
                <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-dark text-sm truncate">{item.name}</p>
                <p className="text-brand-muted text-xs">{item.ordersToday} orders today</p>
              </div>
              <p className="font-syne font-bold text-brand-orange text-sm shrink-0">
                ₦{item.price.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Orders tab ────────────────────────────────────────────────
function OrdersTab() {
  const [filter, setFilter] = useState<OrderStatus>('all')
  const [orders, setOrders] = useState<Order[]>(VENDOR_ORDERS)
  const [detail, setDetail] = useState<Order | null>(null)

  const FILTERS: { value: OrderStatus; label: string }[] = [
    { value: 'all',       label: 'All'       },
    { value: 'pending',   label: 'Pending'   },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready',     label: 'Ready'     },
    { value: 'delivered', label: 'Delivered' },
  ]

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const advanceOrder = useCallback((id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o
      const next = NEXT_STATUS[o.status]
      return next ? { ...o, status: next } : o
    }))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="font-syne font-extrabold text-2xl text-brand-dark">Orders</h2>

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(order => {
          const cfg  = STATUS_CONFIG[order.status]
          const next = NEXT_STATUS[order.status]
          return (
            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-card border border-brand-border/50 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-syne font-bold text-brand-dark text-sm">{order.id}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-orange rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">{order.avatar}</div>
                <div>
                  <p className="font-semibold text-brand-dark text-sm">{order.customer}</p>
                  <p className="text-brand-muted text-xs flex items-center gap-1"><Bike className="w-3 h-3" />{order.address}</p>
                </div>
              </div>
              <div>
                {order.items.map(item => (
                  <p key={item} className="text-brand-text text-sm flex items-center gap-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 bg-brand-orange rounded-full shrink-0" />{item}
                  </p>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-brand-border">
                <div>
                  <p className="font-syne font-bold text-brand-orange">₦{order.total.toLocaleString()}</p>
                  <p className="text-brand-cashback text-xs">💜 ₦{order.cashbackEarned} cashback</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setDetail(order)} className="text-brand-muted hover:text-brand-orange text-xs font-medium transition-colors">Details</button>
                  {next && (
                    <button
                      onClick={() => advanceOrder(order.id)}
                      className="gradient-orange text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
                    >
                      {NEXT_LABEL[order.status]}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-syne font-bold text-brand-dark text-lg">{detail.id}</h3>
              <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center hover:bg-brand-border transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-brand-bg rounded-xl p-4">
                <div className="w-10 h-10 gradient-orange rounded-full flex items-center justify-center font-bold text-white text-sm">{detail.avatar}</div>
                <div>
                  <p className="font-semibold text-brand-dark text-sm">{detail.customer}</p>
                  <p className="text-brand-muted text-xs">{detail.address}</p>
                </div>
              </div>
              <div>
                <p className="text-brand-muted text-xs font-semibold uppercase tracking-wider mb-2">Items Ordered</p>
                {detail.items.map(item => (
                  <div key={item} className="flex items-center justify-between py-1.5 border-b border-brand-border last:border-0">
                    <span className="text-brand-text text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-syne font-bold text-brand-dark pt-2">
                <span>Total</span>
                <span className="text-brand-orange">₦{detail.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Menu tab ──────────────────────────────────────────────────
function MenuTab() {
  const [items, setItems] = useState<MenuItem[]>(VENDOR_MENU)

  const toggle = useCallback((id: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-syne font-extrabold text-2xl text-brand-dark">Menu Items</h2>
        <button className="flex items-center gap-2 gradient-orange text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-card">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className={`bg-white rounded-2xl overflow-hidden shadow-card border transition-opacity ${item.available ? 'border-brand-border/50 opacity-100' : 'border-brand-border/30 opacity-60'}`}>
            <div className="relative h-36 overflow-hidden">
              <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              <button onClick={() => toggle(item.id)} className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1" aria-label="Toggle availability">
                {item.available ? <ToggleRight className="w-5 h-5 text-brand-green" /> : <ToggleLeft className="w-5 h-5 text-brand-muted" />}
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-syne font-semibold text-brand-dark text-sm leading-snug">{item.name}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${item.available ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-400'}`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-brand-muted text-xs mb-2">{item.category} · {item.prepTime}</p>
              <div className="flex items-center justify-between">
                <span className="font-syne font-bold text-brand-orange">₦{item.price.toLocaleString()}</span>
                <span className="text-brand-muted text-xs">{item.ordersToday} orders today</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Earnings tab ──────────────────────────────────────────────
function EarningsTab() {
  const CARDS = [
    { label: 'Total Revenue (Month)', value: '₦386,500', icon: TrendingUp,  gradient: 'gradient-orange'   },
    { label: 'Cashback Given',        value: '₦19,325',  icon: BadgePercent,gradient: 'gradient-cashback' },
    { label: 'Net Payout (Pending)',  value: '₦367,175', icon: Banknote,    gradient: 'bg-brand-dark'     },
  ]

  return (
    <div className="space-y-8">
      <h2 className="font-syne font-extrabold text-2xl text-brand-dark">Earnings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CARDS.map(card => (
          <div key={card.label} className={`${card.gradient} rounded-2xl p-6 shadow-card`}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-syne font-extrabold text-white text-2xl mb-0.5">{card.value}</p>
            <p className="text-white/70 text-xs">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-brand-border/50">
        <div className="p-6 border-b border-brand-border">
          <h3 className="font-syne font-bold text-brand-dark">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-brand-border">
          {VENDOR_TRANSACTIONS.map(tx => (
            <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-brand-bg transition-colors">
              <div className="w-10 h-10 gradient-orange rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">{tx.avatar}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-dark text-sm">{tx.customer}</p>
                <p className="text-brand-muted text-xs">{tx.orderId} · {tx.time}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-syne font-bold text-brand-orange text-sm">₦{tx.amount.toLocaleString()}</p>
                <p className="text-brand-cashback text-xs">💜 ₦{tx.cashback} back</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Wallet tab ────────────────────────────────────────────────
function WalletTab() {
  type RedeemType = 'airtime' | 'data' | 'food'

  const [balance,       setBalance]       = useState(12450)
  const [redeemType,    setRedeemType]    = useState<RedeemType>('airtime')
  const [phone,         setPhone]         = useState('')
  const [amount,        setAmount]        = useState('')
  const [loading,       setLoading]       = useState(false)
  const [success,       setSuccess]       = useState(false)
  const [error,         setError]         = useState('')

  const REDEEM_OPTIONS: { type: RedeemType; icon: React.ElementType; label: string; placeholder: string }[] = [
    { type: 'airtime', icon: Smartphone,      label: 'Buy Airtime', placeholder: 'Enter phone number' },
    { type: 'data',    icon: Wifi,           label: 'Buy Data',    placeholder: 'Enter phone number' },
    { type: 'food',    icon: UtensilsCrossed,label: 'Food Credit', placeholder: 'Enter account ID'   },
  ]

  const STATS = [
    { label: 'Earned Today',  value: '₦635',   color: 'text-brand-orange'   },
    { label: 'This Month',    value: '₦12,450', color: 'text-brand-cashback' },
    { label: 'All Time',      value: '₦47,200', color: 'text-brand-dark'     },
  ]

  async function handleRedeem(e: FormEvent) {
    e.preventDefault()
    setError('')

    const amt = Number(amount)
    if (!phone.trim())           return setError('Please enter a phone/account number.')
    if (!amount || isNaN(amt) || amt <= 0)  return setError('Please enter a valid amount.')
    if (amt > balance)           return setError(`Insufficient balance. You have ₦${balance.toLocaleString()}.`)
    if (amt < 100)               return setError('Minimum redemption is ₦100.')

    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setBalance(b => b - amt)
    setLoading(false)
    setSuccess(true)
    setPhone('')
    setAmount('')
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 gradient-cashback rounded-xl flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-syne font-extrabold text-2xl text-brand-dark">Cashback Wallet</h2>
          <p className="text-brand-muted text-sm">Redeem your rewards — airtime, data, or food credit</p>
        </div>
      </div>

      {/* Balance hero card */}
      <div className="gradient-cashback rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-card">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-black/10 rounded-full" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-white/60" />
              <p className="text-white/60 text-sm font-medium">Available Balance</p>
            </div>
            <p className="font-syne font-extrabold text-white text-5xl mb-1">
              ₦{balance.toLocaleString()}
            </p>
            <p className="text-white/50 text-xs flex items-center gap-1.5">
              <ArrowDownLeft className="w-3.5 h-3.5 text-white/40" />
              Earned from {VENDOR_TRANSACTIONS.length} orders this month
            </p>
          </div>

          {/* Card chip */}
          <div className="flex flex-col items-end gap-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <p className="text-white/50 text-[10px] font-mono">•••• 4521</p>
          </div>
        </div>

        {/* Mini stats row */}
        <div className="relative mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-4">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-white/50 text-[10px] mb-0.5">{s.label}</p>
              <p className="font-syne font-bold text-white text-base">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem section */}
      <div className="bg-white rounded-2xl shadow-card border border-brand-border/50 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-brand-border">
          <h3 className="font-syne font-bold text-brand-dark text-lg flex items-center gap-2">
            <Send className="w-4 h-4 text-brand-cashback" />
            Redeem Cashback
          </h3>
          <p className="text-brand-muted text-sm mt-0.5">Choose how you&apos;d like to use your balance</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Redeem type selector */}
          <div className="grid grid-cols-3 gap-3">
            {REDEEM_OPTIONS.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setRedeemType(type)}
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all ${
                  redeemType === type
                    ? 'border-brand-cashback bg-brand-cashback-light'
                    : 'border-brand-border bg-brand-bg hover:border-brand-cashback/40'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  redeemType === type ? 'gradient-cashback' : 'bg-white border border-brand-border'
                }`}>
                  <Icon className={`w-5 h-5 ${redeemType === type ? 'text-white' : 'text-brand-muted'}`} />
                </div>
                <span className={`text-xs font-semibold ${redeemType === type ? 'text-brand-cashback' : 'text-brand-muted'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Form */}
          {success && (
            <div className="flex items-center gap-3 bg-brand-green/10 border border-brand-green/20 text-brand-green rounded-xl px-4 py-3 animate-fade-up">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Redemption Successful!</p>
                <p className="text-xs opacity-80">Your request has been processed.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleRedeem} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">
                {REDEEM_OPTIONS.find(o => o.type === redeemType)?.placeholder.replace('Enter ', '')}
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={REDEEM_OPTIONS.find(o => o.type === redeemType)?.placeholder}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-cashback focus:ring-2 focus:ring-brand-cashback/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">Amount (₦)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted text-sm font-semibold">₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  min={100}
                  max={balance}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl pl-8 pr-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-cashback focus:ring-2 focus:ring-brand-cashback/10 transition-all"
                />
              </div>
              {/* Quick-fill amounts */}
              <div className="flex gap-2 mt-2">
                {[500, 1000, 2000, 5000].filter(v => v <= balance).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className="text-xs bg-brand-cashback-light text-brand-cashback px-2.5 py-1 rounded-full font-medium hover:bg-brand-cashback/20 transition-colors"
                  >
                    ₦{v.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || balance === 0}
              className="w-full gradient-cashback text-white py-3.5 rounded-full font-syne font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-card"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Redeem ₦{amount ? Number(amount).toLocaleString() : '0'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Recent cashback activity */}
      <div className="bg-white rounded-2xl shadow-card border border-brand-border/50">
        <div className="px-6 py-5 border-b border-brand-border flex items-center justify-between">
          <h3 className="font-syne font-bold text-brand-dark flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4 text-brand-cashback" />
            Cashback Activity
          </h3>
          <span className="text-xs text-brand-muted">This month</span>
        </div>
        <div className="divide-y divide-brand-border">
          {VENDOR_TRANSACTIONS.map(tx => (
            <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-brand-bg transition-colors">
              <div className="w-10 h-10 gradient-cashback rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
                {tx.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-dark text-sm">{tx.customer}</p>
                <p className="text-brand-muted text-xs">{tx.orderId} · {tx.time}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-syne font-bold text-brand-cashback text-sm">+₦{tx.cashback}</p>
                <p className="text-brand-muted text-xs">from ₦{tx.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-brand-cashback-light/50 rounded-b-2xl flex items-center justify-between">
          <span className="text-brand-cashback text-sm font-semibold">Total earned this month</span>
          <span className="font-syne font-extrabold text-brand-cashback">
            ₦{VENDOR_TRANSACTIONS.reduce((s, t) => s + t.cashback, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Profile tab ───────────────────────────────────────────────
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
          <div className="w-16 h-16 gradient-orange rounded-2xl flex items-center justify-center font-syne font-extrabold text-white text-2xl shrink-0">MC</div>
          <div>
            <p className="font-syne font-bold text-brand-dark text-lg">Mama Cass Kitchen</p>
            <p className="text-brand-muted text-sm">Joined January 2024</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow" />
              <span className="font-semibold text-brand-dark text-sm">4.8</span>
              <span className="text-brand-muted text-xs">(240 reviews)</span>
            </div>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { id: 'restName', label: 'Restaurant Name', defaultValue: 'Mama Cass Kitchen',            type: 'text' },
            { id: 'address',  label: 'Address',          defaultValue: '14 Allen Avenue, Ikeja Lagos', type: 'text' },
            { id: 'phone',    label: 'Phone Number',     defaultValue: '+234 801 234 5678',            type: 'tel'  },
            { id: 'category', label: 'Category',         defaultValue: 'Nigerian & Continental',       type: 'text' },
          ].map(field => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-semibold text-brand-dark mb-1.5">{field.label}</label>
              <input id={field.id} type={field.type} defaultValue={field.defaultValue}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="opens" className="block text-sm font-semibold text-brand-dark mb-1.5">Opening Time</label>
              <input type="time" id="opens" defaultValue="08:00" className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all" />
            </div>
            <div>
              <label htmlFor="closes" className="block text-sm font-semibold text-brand-dark mb-1.5">Closing Time</label>
              <input type="time" id="closes" defaultValue="22:00" className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all" />
            </div>
          </div>
          <div className="pt-2 flex items-center gap-3">
            <button type="submit" className="gradient-orange text-white px-6 py-3 rounded-full font-syne font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-card">
              Save Changes
            </button>
            {saved && (
              <span className="flex items-center gap-2 text-brand-green font-medium text-sm animate-fade-up">
                <CheckCircle className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function VendorPage() {
  const [activeTab,   setActiveTab]   = useState<Tab>('dashboard')
  const [isOnline,    setIsOnline]    = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const walletBalance = 12450

  const CONTENT: Record<Tab, ReactNode> = {
    dashboard: <DashboardTab onWalletClick={() => setActiveTab('wallet')} />,
    orders:    <OrdersTab />,
    menu:      <MenuTab />,
    earnings:  <EarningsTab />,
    wallet:    <WalletTab />,
    profile:   <ProfileTab />,
  }

  return (
    // h-screen + overflow-hidden = viewport-locked layout; flex-col stacks nav above body
    <div className="h-screen flex flex-col overflow-hidden bg-brand-bg">

      {/* ── Sticky nav (shrinks to its natural 64px, never scrolls away) */}
      <VendorNav
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        onMenuToggle={() => setSidebarOpen(o => !o)}
        onWalletClick={() => setActiveTab('wallet')}
        walletBalance={walletBalance}
      />

      {/* ── Body row: min-h-0 lets flex children shrink & scroll independently */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar — sticky because the parent row is height-constrained */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          walletBalance={walletBalance}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content — the ONLY thing that scrolls */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {CONTENT[activeTab]}
        </main>
      </div>
    </div>
  )
}
