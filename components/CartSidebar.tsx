'use client'

import Image from 'next/image'
import { X, Minus, Plus, UtensilsCrossed } from 'lucide-react'
import type { CartItem } from '@/types'

interface CartSidebarProps {
  open: boolean
  items: CartItem[]
  cashback: number
  onClose: () => void
  onChangeQty: (id: number, delta: number) => void
  onCheckout: () => void
}

export default function CartSidebar({
  open, items, cashback, onClose, onChangeQty, onCheckout,
}: CartSidebarProps) {
  const subtotal       = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const earnedCashback = Math.floor(subtotal * 0.05)
  const deliveryFee    = subtotal > 0 ? 500 : 0

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[201] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border shrink-0">
          <div>
            <h2 className="font-syne font-bold text-brand-dark text-lg">Your Cart</h2>
            {items.length > 0 && (
              <p className="text-xs text-brand-muted mt-0.5">{items.reduce((s, i) => s + i.quantity, 0)} item{items.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-brand-bg hover:bg-brand-border flex items-center justify-center transition-colors"
            aria-label="Close cart"
          >
            <X className="w-4 h-4 text-brand-text" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-20">
              <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-7 h-7 text-brand-muted" />
              </div>
              <div>
                <p className="text-brand-dark font-semibold font-syne mb-1">Your cart is empty</p>
                <p className="text-brand-muted text-sm">Add some delicious food!</p>
              </div>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 items-center bg-brand-bg rounded-xl p-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-dark text-xs leading-tight truncate mb-1">{item.name}</p>
                  <p className="text-brand-orange font-bold text-sm">₦{(item.price * item.quantity).toLocaleString()}</p>
                  <p className="text-brand-cashback text-xs mt-0.5">💜 +₦{Math.floor(item.price * item.quantity * 0.05)} back</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onChangeQty(item.id, -1)}
                    className="w-7 h-7 rounded-full border border-brand-border bg-white flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-brand-dark text-sm">{item.quantity}</span>
                  <button
                    onClick={() => onChangeQty(item.id, 1)}
                    className="w-7 h-7 rounded-full gradient-orange text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-brand-border shrink-0 space-y-3">
            {/* Cashback balance */}
            {cashback > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Your cashback balance</span>
                <span className="text-brand-cashback font-semibold">₦{cashback.toLocaleString()}</span>
              </div>
            )}

            {/* Earn message */}
            <div className="bg-brand-cashback-light rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-lg">💜</span>
              <p className="text-brand-cashback text-xs font-medium">
                You&apos;ll earn <strong>₦{earnedCashback.toLocaleString()}</strong> cashback on this order!
              </p>
            </div>

            {/* Order summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span className="text-brand-text font-medium">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Delivery fee</span>
                <span className="text-brand-text font-medium">₦{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-syne font-bold text-brand-dark pt-2 border-t border-brand-border">
                <span>Total</span>
                <span className="text-brand-orange text-lg">₦{(subtotal + deliveryFee).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full gradient-orange text-white py-3.5 rounded-full font-syne font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-card"
            >
              Place Order
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
