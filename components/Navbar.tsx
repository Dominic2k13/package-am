'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Package, Menu, X, Wallet } from 'lucide-react'

interface NavbarProps {
  cartCount?: number
  cashback?: number
  onCartOpen?: () => void
}

export default function Navbar({ cartCount = 0, cashback = 0, onCartOpen }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-brand-border shadow-nav">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 gradient-orange rounded-xl flex items-center justify-center shadow-sm">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-syne font-extrabold text-xl tracking-tight">
            <span className="text-brand-orange">Package</span>
            <span className="text-brand-dark">-Am</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-brand-muted">
          <Link href="/menu"           className="hover:text-brand-orange transition-colors duration-200">Menu</Link>
          <Link href="/#how-it-works"  className="hover:text-brand-orange transition-colors duration-200">How it Works</Link>
          <Link href="/cashback"        className="hover:text-brand-orange transition-colors duration-200">Cashback</Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {cashback > 0 && (
            <Link
              href="/cashback"
              className="hidden md:flex items-center gap-1.5 bg-brand-cashback-light text-brand-cashback px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-brand-cashback/20 transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" /> ₦{cashback.toLocaleString()}
            </Link>
          )}

          {onCartOpen && (
            <button
              onClick={onCartOpen}
              className="relative w-9 h-9 gradient-orange rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-yellow text-brand-dark text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          )}

          <Link
            href="/login"
            className="hidden md:inline-flex items-center bg-brand-dark text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-text transition-colors duration-200"
          >
            Sign In
          </Link>

          <button
            className="md:hidden w-9 h-9 flex items-center justify-center text-brand-dark rounded-lg hover:bg-brand-bg transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-brand-border px-4 py-5 flex flex-col gap-1 animate-fade-up">
          {[
            { href: '/menu',          label: 'Menu' },
            { href: '/#how-it-works', label: 'How it Works' },
            { href: '/cashback',      label: 'Cashback' },
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
          <div className="mt-3 pt-3 border-t border-brand-border flex flex-col gap-2">
            <Link
              href="/login"
              className="py-3 bg-brand-orange text-white rounded-full text-center font-semibold text-sm hover:bg-brand-orange-dark transition-colors"
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
          </div>
        </div>
      )}
    </header>
  )
}
