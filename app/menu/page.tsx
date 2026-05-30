'use client'

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, CheckCircle, MapPin, Phone, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FoodCard from '@/components/FoodCard'
import CartSidebar from '@/components/CartSidebar'
import CheckoutModal, { type DeliveryDetails } from '@/components/CheckoutModal'
import { StaggerGrid, StaggerItem } from '@/components/ui/StaggerGrid'
import { FOOD_ITEMS, CATEGORIES } from '@/lib/data'
import { useAuth } from '@/context/AuthContext'
import { saveOrder } from '@/lib/orders'
import type { FoodItem, CartItem } from '@/types'

// ── Order Success modal ────────────────────────────────────────
function OrderSuccessModal({
  orderId, earnedCashback, details, onClose,
}: { orderId: string; earnedCashback: number; details: DeliveryDetails; onClose: () => void }) {
  const isFriend   = details.orderFor === 'friend'
  const recipientName    = isFriend ? details.friendName    : (details.myName || 'You')
  const recipientPhone   = isFriend ? details.friendPhone   : details.myPhone
  const recipientState   = isFriend ? details.friendState   : details.myState
  const recipientAddress = isFriend ? details.friendAddress : details.myAddress

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[320] flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center"
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      >
        <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-brand-green" />
        </div>
        <h2 className="font-syne font-extrabold text-brand-dark text-2xl mb-1">Order Placed! 🎉</h2>
        <p className="text-brand-muted text-sm mb-5">
          {isFriend
            ? `Your gift order for ${details.friendName} is being prepared!`
            : 'Your food is being prepared and will arrive soon.'}
        </p>

        {/* Order details */}
        <div className="bg-brand-bg rounded-2xl p-4 text-left mb-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-brand-muted">Order ID</span>
            <span className="font-semibold text-brand-dark">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted">Est. Delivery</span>
            <span className="font-semibold text-brand-dark">25–35 mins</span>
          </div>
          {isFriend && (
            <div className="flex items-center gap-2 pt-1.5 border-t border-brand-border">
              <User className="w-3.5 h-3.5 text-brand-muted shrink-0" />
              <span className="text-brand-muted">Recipient</span>
              <span className="font-semibold text-brand-dark ml-auto">{recipientName}</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Phone className="w-3.5 h-3.5 text-brand-muted shrink-0 mt-0.5" />
            <span className="text-brand-muted">Phone</span>
            <span className="font-semibold text-brand-dark ml-auto">{recipientPhone}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-muted shrink-0 mt-0.5" />
            <span className="text-brand-muted shrink-0">Address</span>
            <span className="font-semibold text-brand-dark ml-auto text-right leading-snug">
              {recipientAddress}, {recipientState}
            </span>
          </div>
        </div>

        <div className="bg-brand-cashback-light rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">💜</span>
          <div className="text-left">
            <p className="text-brand-cashback font-bold text-sm">Cashback earned!</p>
            <p className="text-brand-cashback/70 text-xs">₦{earnedCashback.toLocaleString()} has been added to your balance</p>
          </div>
        </div>

        <motion.button
          onClick={onClose}
          className="w-full gradient-orange text-white py-3.5 rounded-full font-syne font-semibold hover:opacity-90 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Continue Shopping
        </motion.button>
      </motion.div>
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
    <motion.div
      className="fixed bottom-6 left-1/2 z-[400] bg-brand-dark text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl whitespace-nowrap"
      style={{ x: '-50%' }}
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      {message}
    </motion.div>
  )
}

// ── Location banner (reads localStorage after mount) ───────────
function LocationBanner() {
  const [state, setState] = useState('')
  useEffect(() => {
    const saved = localStorage.getItem('pa_location')
    if (saved) setState(saved)
  }, [])

  if (!state) {
    return <p className="text-brand-muted text-sm mb-5">Fresh from the best restaurants near you</p>
  }
  return (
    <p className="text-brand-muted text-sm mb-5 flex items-center gap-1.5">
      <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
      Showing restaurants in <span className="font-semibold text-brand-orange">{state}</span>
    </p>
  )
}

// ── Inner component (uses useSearchParams) ─────────────────────
function MenuPageInner() {
  const searchParams  = useSearchParams()
  const initialCat    = searchParams.get('cat') ?? 'all'
  const { user, refresh } = useAuth()

  const [activeCategory, setActiveCategory] = useState(initialCat)
  const [searchTerm,     setSearchTerm]     = useState('')
  const [cart,           setCart]           = useState<CartItem[]>([])
  const [guestCashback,  setGuestCashback]  = useState(0)   // fallback for guests
  const [cartOpen,       setCartOpen]       = useState(false)
  const [checkoutOpen,   setCheckoutOpen]   = useState(false)
  const [successData,    setSuccessData]    = useState<{ orderId: string; cashback: number; details: DeliveryDetails } | null>(null)
  const [toast,          setToast]          = useState('')

  // Cashback to display in cart: prefer live auth value, else local guest counter
  const displayCashback = user ? user.cashback : guestCashback

  // Restore cart that was saved before the user was redirected to login/signup
  useEffect(() => {
    if (!user) return
    try {
      const saved = localStorage.getItem('pa_cart_save')
      if (!saved) return
      const savedItems: CartItem[] = JSON.parse(saved)
      if (savedItems.length > 0) {
        setCart(savedItems)
        setCartOpen(true)
        setToast('🛒 Your cart has been restored!')
      }
    } catch { /* ignore malformed data */ }
    localStorage.removeItem('pa_cart_save')
  }, [user])

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

  // Opens checkout form (cart closes, checkout modal opens)
  const openCheckout = useCallback(() => {
    setCartOpen(false)
    setCheckoutOpen(true)
  }, [])

  // Called when checkout form is submitted with delivery details
  const confirmCheckout = useCallback((details: DeliveryDetails) => {
    const subtotal     = cart.reduce((s, i) => s + i.price * i.quantity, 0)
    const deliveryFee  = 500
    const total        = subtotal + deliveryFee
    const earned       = Math.floor(subtotal * 0.05)
    const orderId      = `#PA-${String(Math.floor(Math.random() * 9000) + 1000)}`

    // Update cashback: logged-in user gets persistent update, guest gets local counter
    if (user) {
      refresh({ cashback: (user.cashback || 0) + earned })
    } else {
      setGuestCashback(c => c + earned)
    }

    // Persist order to localStorage (for history page)
    const isFriend = details.orderFor === 'friend'
    saveOrder({
      orderId,
      items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, image: i.image })),
      subtotal,
      deliveryFee,
      total,
      cashbackEarned:   earned,
      orderFor:         details.orderFor,
      recipientName:    isFriend ? details.friendName    : (details.myName || user?.name || ''),
      recipientPhone:   isFriend ? details.friendPhone   : details.myPhone,
      recipientState:   isFriend ? details.friendState   : details.myState,
      recipientAddress: isFriend ? details.friendAddress : details.myAddress,
      placedAt:         new Date().toISOString(),
      userEmail:        user?.email,
    })

    setCart([])
    setCheckoutOpen(false)
    setSuccessData({ orderId, cashback: earned, details })
  }, [cart, user, refresh])

  return (
    <>
      <Navbar cartCount={cartCount} cashback={displayCashback} onCartOpen={() => setCartOpen(true)} />

      <main className="min-h-screen bg-brand-bg pb-16">
        {/* Header */}
        <div className="bg-white border-b border-brand-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-brand-dark mb-1">🍽️ What Are You Craving?</h1>
            <LocationBanner />

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
          <AnimatePresence mode="wait">
            {filteredItems.length === 0 ? (
              <motion.div
                key="empty"
                className="flex flex-col items-center justify-center py-24 text-center gap-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="text-5xl"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                >🍽️</motion.div>
                <div>
                  <p className="font-syne font-bold text-brand-dark text-lg mb-1">No results found</p>
                  <p className="text-brand-muted text-sm">Try a different category or search term</p>
                </div>
                <motion.button
                  onClick={() => { setActiveCategory('all'); setSearchTerm('') }}
                  className="mt-2 gradient-orange text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Clear Filters
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-brand-muted text-sm mb-6">{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found</p>
                <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredItems.map(item => (
                    <StaggerItem key={item.id}>
                      <FoodCard item={item} onAdd={addToCart} />
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />

      <CartSidebar
        open={cartOpen}
        items={cart}
        cashback={displayCashback}
        onClose={() => setCartOpen(false)}
        onChangeQty={changeQty}
        onCheckout={openCheckout}
      />

      <CheckoutModal
        open={checkoutOpen}
        items={cart}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={confirmCheckout}
        prefill={{ name: user?.name, phone: user?.phone }}
      />

      <AnimatePresence>
        {successData && (
          <OrderSuccessModal
            key="success-modal"
            orderId={successData.orderId}
            earnedCashback={successData.cashback}
            details={successData.details}
            onClose={() => setSuccessData(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast key={toast} message={toast} onDone={() => setToast('')} />}
      </AnimatePresence>
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
