'use client'

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FoodCard from '@/components/FoodCard'
import CartSidebar from '@/components/CartSidebar'
import { FOOD_ITEMS, CATEGORIES } from '@/lib/data'
import type { FoodItem, CartItem } from '@/types'

// ── Order Success modal ────────────────────────────────────────
function OrderSuccessModal({
  orderId, earnedCashback, onClose,
}: { orderId: string; earnedCashback: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-fade-up">
        <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-brand-green" />
        </div>
        <h2 className="font-syne font-extrabold text-brand-dark text-2xl mb-2">Order Placed! 🎉</h2>
        <p className="text-brand-muted text-sm mb-6">Your food is being prepared and will arrive soon.</p>

        <div className="bg-brand-bg rounded-2xl p-4 text-left mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-brand-muted">Order ID</span>
            <span className="font-semibold text-brand-dark">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted">Est. Delivery</span>
            <span className="font-semibold text-brand-dark">25–35 mins</span>
          </div>
        </div>

        <div className="bg-brand-cashback-light rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">💜</span>
          <div className="text-left">
            <p className="text-brand-cashback font-bold text-sm">Cashback earned!</p>
            <p className="text-brand-cashback/70 text-xs">₦{earnedCashback.toLocaleString()} has been added to your balance</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full gradient-orange text-white py-3.5 rounded-full font-syne font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

// ── Toast ───────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-brand-dark text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl animate-fade-up whitespace-nowrap">
      {message}
    </div>
  )
}

// ── Inner component (uses useSearchParams) ─────────────────────
function MenuPageInner() {
  const searchParams  = useSearchParams()
  const initialCat    = searchParams.get('cat') ?? 'all'

  const [activeCategory, setActiveCategory] = useState(initialCat)
  const [searchTerm,     setSearchTerm]     = useState('')
  const [cart,           setCart]           = useState<CartItem[]>([])
  const [cashback,       setCashback]       = useState(1250)
  const [cartOpen,       setCartOpen]       = useState(false)
  const [successData,    setSuccessData]    = useState<{ orderId: string; cashback: number } | null>(null)
  const [toast,          setToast]          = useState('')

  const filteredItems = useMemo(() => {
    return FOOD_ITEMS.filter(item => {
      const catMatch  = activeCategory === 'all' || item.category === activeCategory
      const termMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      return catMatch && termMatch
    })
  }, [activeCategory, searchTerm])

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const addToCart = useCallback((item: FoodItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...item, quantity: 1 }]
    })
    setToast(`${item.name} added to cart!`)
  }, [])

  const changeQty = useCallback((id: number, delta: number) => {
    setCart(prev =>
      prev
        .map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
    )
  }, [])

  const checkout = useCallback(() => {
    const subtotal     = cart.reduce((s, i) => s + i.price * i.quantity, 0)
    const earned       = Math.floor(subtotal * 0.05)
    const orderId      = `#PA-${String(Math.floor(Math.random() * 9000) + 1000)}`
    setCashback(c => c + earned)
    setCart([])
    setCartOpen(false)
    setSuccessData({ orderId, cashback: earned })
  }, [cart])

  return (
    <>
      <Navbar cartCount={cartCount} cashback={cashback} onCartOpen={() => setCartOpen(true)} />

      <main className="min-h-screen bg-brand-bg pb-16">
        {/* Header */}
        <div className="bg-white border-b border-brand-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="font-syne font-extrabold text-3xl text-brand-dark mb-1">🍽️ What Are You Craving?</h1>
            <p className="text-brand-muted text-sm mb-6">Fresh from the best restaurants near you</p>

            {/* Search */}
            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search for jollof rice, pizza, burgers…"
                className="w-full bg-brand-bg border border-brand-border rounded-full pl-11 pr-10 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-brand-muted/20 flex items-center justify-center hover:bg-brand-muted/30 transition-colors">
                  <X className="w-3 h-3 text-brand-muted" />
                </button>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shrink-0 ${
                    activeCategory === cat.id
                      ? 'gradient-orange text-white shadow-card'
                      : 'bg-brand-bg border border-brand-border text-brand-text hover:border-brand-orange hover:text-brand-orange'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="text-5xl">🍽️</div>
              <div>
                <p className="font-syne font-bold text-brand-dark text-lg mb-1">No results found</p>
                <p className="text-brand-muted text-sm">Try a different category or search term</p>
              </div>
              <button
                onClick={() => { setActiveCategory('all'); setSearchTerm('') }}
                className="mt-2 gradient-orange text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-brand-muted text-sm mb-6">{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map(item => (
                  <FoodCard key={item.id} item={item} onAdd={addToCart} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      <CartSidebar
        open={cartOpen}
        items={cart}
        cashback={cashback}
        onClose={() => setCartOpen(false)}
        onChangeQty={changeQty}
        onCheckout={checkout}
      />

      {successData && (
        <OrderSuccessModal
          orderId={successData.orderId}
          earnedCashback={successData.cashback}
          onClose={() => setSuccessData(null)}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </>
  )
}

// ── Page export (wraps Suspense for useSearchParams) ───────────
export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="text-center">
          <div className="w-12 h-12 gradient-orange rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-lg">🍽️</span>
          </div>
          <p className="text-brand-muted text-sm">Loading menu…</p>
        </div>
      </div>
    }>
      <MenuPageInner />
    </Suspense>
  )
}
