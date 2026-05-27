'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart, Package, Menu, X, Wallet,
  MapPin, ChevronDown, LogOut, User,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { initials } from '@/lib/auth'
import LocationPickerModal from '@/components/LocationPickerModal'

interface NavbarProps {
  cartCount?: number
  cashback?: number
  onCartOpen?: () => void
}

export default function Navbar({ cartCount = 0, cashback = 0, onCartOpen }: NavbarProps) {
  const router = useRouter()
  const { user, isLoaded, logout } = useAuth()

  const [mobileOpen,      setMobileOpen]      = useState(false)
  const [userMenuOpen,    setUserMenuOpen]     = useState(false)
  const [locationOpen,    setLocationOpen]     = useState(false)
  const [selectedState,   setSelectedState]    = useState<string>('')
  const [locationMounted, setLocationMounted]  = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)

  // Load location from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem('pa_location')
    if (saved) setSelectedState(saved)
    setLocationMounted(true)
  }, [])

  // Close user-menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  function handleSelectState(state: string) {
    setSelectedState(state)
    localStorage.setItem('pa_location', state)
  }

  function handleSignOut() {
    setUserMenuOpen(false)
    setMobileOpen(false)
    logout()
    router.push('/')
  }

  const locationLabel = locationMounted ? (selectedState || 'Set Location') : 'Set Location'

  // Displayed cashback: prefer live user.cashback from context over prop
  const displayCashback = user ? user.cashback : cashback

  // User info
  const userInitials  = user ? initials(user.name) : ''
  const userFirstName = user ? user.name.split(' ')[0] : ''

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-brand-border shadow-nav">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 gradient-orange rounded-xl flex items-center justify-center shadow-sm">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-syne font-extrabold text-xl tracking-tight">
              <span className="text-brand-orange">Package</span>
              <span className="text-brand-dark">-Am</span>
            </span>
          </Link>

          {/* Location chip — desktop */}
          <motion.button
            onClick={() => setLocationOpen(true)}
            className="hidden sm:flex items-center gap-1.5 bg-brand-bg border border-brand-border hover:border-brand-orange rounded-full px-3 py-1.5 text-xs font-semibold text-brand-text hover:text-brand-orange transition-all max-w-[160px]"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
            <span className="truncate">{locationLabel}</span>
            <ChevronDown className="w-3 h-3 text-brand-muted shrink-0" />
          </motion.button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-brand-muted">
            <Link href="/menu"          className="hover:text-brand-orange transition-colors">Menu</Link>
            <Link href="/#how-it-works" className="hover:text-brand-orange transition-colors">How it Works</Link>
            <Link href="/cashback"      className="hover:text-brand-orange transition-colors">Cashback</Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Cashback balance chip */}
            {displayCashback > 0 && (
              <Link
                href="/cashback"
                className="hidden md:flex items-center gap-1.5 bg-brand-cashback-light text-brand-cashback px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-brand-cashback/20 transition-colors"
              >
                <Wallet className="w-3.5 h-3.5" /> ₦{displayCashback.toLocaleString()}
              </Link>
            )}

            {/* Cart button */}
            {onCartOpen && (
              <button
                onClick={onCartOpen}
                className="relative w-9 h-9 gradient-orange rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-4 h-4 text-white" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-brand-yellow text-brand-dark text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )}

            {/* ── Auth area ── */}
            {!isLoaded ? (
              // Skeleton while localStorage hydrates (avoids flash)
              <div className="hidden md:block w-20 h-8 bg-brand-border/40 rounded-full animate-pulse" />
            ) : user ? (
              /* ── Signed-in: user avatar + dropdown (desktop only — mobile uses hamburger) */
              <div className="relative hidden md:block" ref={userMenuRef}>
                <motion.button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-brand-bg transition-colors"
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-8 h-8 gradient-orange rounded-full flex items-center justify-center font-syne font-bold text-white text-xs shrink-0">
                    {userInitials}
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-brand-dark max-w-[80px] truncate">
                    {userFirstName}
                  </span>
                  <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-brand-muted transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-brand-border w-56 z-[200] overflow-hidden"
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    >
                      {/* User info header */}
                      <div className="px-4 py-3.5 border-b border-brand-border">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 gradient-orange rounded-full flex items-center justify-center font-syne font-bold text-white text-xs shrink-0">
                            {userInitials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-brand-dark text-sm truncate">{user.name}</p>
                            <p className="text-brand-muted text-xs truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-2">
                        <Link
                          href="/cashback"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-text hover:bg-brand-bg hover:text-brand-orange transition-colors"
                        >
                          <Wallet className="w-4 h-4 shrink-0" />
                          <span className="flex-1">My Cashback</span>
                          <span className="text-xs font-bold text-brand-cashback">
                            ₦{user.cashback.toLocaleString()}
                          </span>
                        </Link>

                        <Link
                          href="/menu"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-text hover:bg-brand-bg hover:text-brand-orange transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4 shrink-0" />
                          <span>Order Food</span>
                        </Link>

                        <div className="border-t border-brand-border my-1.5" />

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Signed-out: Sign In button */
              <Link
                href="/login"
                className="hidden md:inline-flex items-center gap-1.5 bg-brand-dark text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-text transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center text-brand-dark rounded-lg hover:bg-brand-bg transition-colors"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* ── Mobile dropdown ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden bg-white/98 backdrop-blur-xl border-t border-brand-border px-4 py-4 flex flex-col gap-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {/* Signed-in user header */}
              {isLoaded && user && (
                <div className="flex items-center gap-3 px-3 py-3 mb-1 bg-brand-bg rounded-xl">
                  <div className="w-10 h-10 gradient-orange rounded-full flex items-center justify-center font-syne font-bold text-white text-sm shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-dark text-sm truncate">{user.name}</p>
                    <p className="text-brand-muted text-xs truncate">{user.email}</p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-brand-cashback shrink-0">
                    ₦{user.cashback.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Location row */}
              <button
                onClick={() => { setLocationOpen(true); setMobileOpen(false) }}
                className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-brand-text hover:bg-brand-bg transition-colors"
              >
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span className="font-medium text-sm flex-1 text-left">{locationLabel}</span>
                <ChevronDown className="w-4 h-4 text-brand-muted" />
              </button>

              <div className="h-px bg-brand-border my-1" />

              {[
                { href: '/menu',          label: 'Menu'        },
                { href: '/#how-it-works', label: 'How it Works'},
                { href: '/cashback',      label: 'Cashback'    },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-2.5 px-3 rounded-xl text-brand-text font-medium hover:bg-brand-bg hover:text-brand-orange transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 pt-3 border-t border-brand-border flex flex-col gap-2">
                {isLoaded && user ? (
                  <button
                    onClick={handleSignOut}
                    className="py-3 flex items-center justify-center gap-2 border border-red-200 text-red-500 rounded-full font-semibold text-sm hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="py-3 bg-brand-orange text-white rounded-full text-center font-semibold text-sm hover:opacity-90 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="py-3 border border-brand-border text-brand-text rounded-full text-center font-semibold text-sm hover:border-brand-orange hover:text-brand-orange transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Location picker modal */}
      <LocationPickerModal
        open={locationOpen}
        current={selectedState}
        onSelect={handleSelectState}
        onClose={() => setLocationOpen(false)}
      />
    </>
  )
}
