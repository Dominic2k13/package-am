'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin, Phone, Clock, CheckCircle, ArrowRight,
  UtensilsCrossed, Package, ShoppingBag,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/context/AuthContext'
import { loadAllOrders, loadOrdersByEmail, type StoredOrder } from '@/lib/orders'

// ── Relative time helper ───────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hrs   = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)    return 'Just now'
  if (mins < 60)   return `${mins}m ago`
  if (hrs  < 24)   return `${hrs}h ago`
  if (days === 1)  return 'Yesterday'
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Order card ─────────────────────────────────────────────────
function OrderCard({ order, index }: { order: StoredOrder; index: number }) {
  const isFriend = order.orderFor === 'friend'

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
      className="bg-white rounded-2xl shadow-card overflow-hidden"
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Package className="w-3.5 h-3.5 text-brand-orange" />
            <span className="font-syne font-bold text-brand-dark text-sm">{order.orderId}</span>
          </div>
          <p className="text-brand-muted text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {relativeTime(order.placedAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3 h-3" />
            Delivered
          </div>
          {isFriend && (
            <span className="text-[10px] font-semibold text-brand-cashback bg-brand-cashback-light px-2 py-0.5 rounded-full">
              Gift order
            </span>
          )}
        </div>
      </div>

      {/* Items list */}
      <div className="px-5 py-4 space-y-2 border-b border-brand-border">
        {order.items.map((item, j) => (
          <div key={j} className="flex items-center justify-between text-sm">
            <span className="text-brand-muted">
              {item.name}
              <span className="ml-1 font-semibold text-brand-text">×{item.quantity}</span>
            </span>
            <span className="text-brand-dark font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Delivery info */}
      <div className="px-5 py-3 bg-brand-bg space-y-1.5 border-b border-brand-border">
        <div className="flex items-center gap-2 text-xs text-brand-muted">
          <Phone className="w-3.5 h-3.5 text-brand-orange shrink-0" />
          <span className="flex-1">{order.recipientPhone}</span>
          {isFriend && (
            <span className="font-semibold text-brand-cashback">for {order.recipientName}</span>
          )}
        </div>
        <div className="flex items-start gap-2 text-xs text-brand-muted">
          <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
          <span>{order.recipientAddress}, {order.recipientState}</span>
        </div>
      </div>

      {/* Footer: totals + cashback */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="text-sm">
          <span className="text-brand-muted">Total </span>
          <span className="font-syne font-bold text-brand-orange">₦{order.total.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-cashback-light text-brand-cashback px-3 py-1.5 rounded-full text-xs font-semibold">
          💜 +₦{order.cashbackEarned.toLocaleString()} earned
        </div>
      </div>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────
export default function OrdersPage() {
  const { user, isLoaded } = useAuth()
  const [orders,  setOrders]  = useState<StoredOrder[]>([])
  const [mounted, setMounted] = useState(false)

  // Load from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setMounted(true)
    const loaded = user
      ? loadOrdersByEmail(user.email)
      : loadAllOrders()
    setOrders(loaded)
  }, [user])

  const totalCashback = orders.reduce((s, o) => s + o.cashbackEarned, 0)
  const totalSpent    = orders.reduce((s, o) => s + o.total, 0)

  // Show skeleton until both auth and localStorage are ready
  if (!isLoaded || !mounted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-brand-bg flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 gradient-orange rounded-full animate-pulse" />
            <p className="text-brand-muted text-sm">Loading orders…</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg pb-20">

        {/* ── Page header ─────────────────────────────────── */}
        <div className="bg-white border-b border-brand-border">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-brand-dark mb-1">
                  📦 Order History
                </h1>
                <p className="text-brand-muted text-sm">
                  {orders.length === 0
                    ? 'No orders yet'
                    : `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`}
                </p>
              </div>

              {/* Quick stats (only when there are orders) */}
              {orders.length > 0 && (
                <div className="hidden sm:flex gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-brand-muted">Total spent</p>
                    <p className="font-syne font-bold text-brand-dark">₦{totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="w-px bg-brand-border" />
                  <div className="text-right">
                    <p className="text-xs text-brand-muted">Cashback earned</p>
                    <p className="font-syne font-bold text-brand-cashback">₦{totalCashback.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile quick stats */}
            {orders.length > 0 && (
              <div className="sm:hidden mt-4 grid grid-cols-2 gap-3">
                <div className="bg-brand-bg rounded-xl px-4 py-3">
                  <p className="text-xs text-brand-muted mb-0.5">Total spent</p>
                  <p className="font-syne font-bold text-brand-dark">₦{totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-brand-cashback-light rounded-xl px-4 py-3">
                  <p className="text-xs text-brand-muted mb-0.5">Cashback earned</p>
                  <p className="font-syne font-bold text-brand-cashback">₦{totalCashback.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

          {orders.length === 0 ? (

            /* ── Empty state ──────────────────────────────── */
            <motion.div
              className="flex flex-col items-center justify-center py-24 text-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-card">
                <UtensilsCrossed className="w-9 h-9 text-brand-muted" />
              </div>
              <div>
                <h2 className="font-syne font-bold text-brand-dark text-xl mb-2">No orders yet</h2>
                <p className="text-brand-muted text-sm max-w-xs">
                  {user
                    ? 'Place your first order and it will show up here.'
                    : 'Sign in to see your order history, or place your first order now.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center gap-2 gradient-orange text-white px-7 py-3.5 rounded-full font-syne font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-card"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Order Food Now
                </Link>
                {!user && (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 border border-brand-border text-brand-text px-7 py-3.5 rounded-full font-syne font-semibold text-sm hover:border-brand-orange hover:text-brand-orange transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>

          ) : (

            /* ── Order list ───────────────────────────────── */
            <div className="space-y-4">
              {orders.map((order, i) => (
                <OrderCard key={order.orderId} order={order} index={i} />
              ))}

              {/* CTA to order again */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: orders.length * 0.07 + 0.1 }}
                className="gradient-orange rounded-2xl p-6 flex items-center justify-between gap-4"
              >
                <div className="text-white">
                  <p className="font-syne font-bold text-base">Ready for another round?</p>
                  <p className="text-white/70 text-sm">Every order earns you more cashback.</p>
                </div>
                <Link
                  href="/menu"
                  className="shrink-0 inline-flex items-center gap-1.5 bg-white text-brand-orange px-5 py-2.5 rounded-full font-syne font-semibold text-sm hover:bg-orange-50 transition-colors"
                >
                  Order Now <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
