'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Users, Phone, MapPin, ChevronDown, ArrowLeft } from 'lucide-react'
import { NIGERIAN_STATES } from '@/lib/nigerianStates'
import type { CartItem } from '@/types'

// ── Types ──────────────────────────────────────────────────────
export type OrderFor = 'myself' | 'friend'

export interface DeliveryDetails {
  orderFor:      OrderFor
  myName:        string
  myPhone:       string
  myState:       string
  myAddress:     string
  friendName:    string
  friendPhone:   string
  friendState:   string
  friendAddress: string
}

interface CheckoutModalProps {
  open:      boolean
  items:     CartItem[]
  onClose:   () => void
  onConfirm: (details: DeliveryDetails) => void
  /** Pre-fill name/phone from auth context for logged-in users */
  prefill?:  { name?: string; phone?: string }
}

const ORDER_FOR_OPTIONS = [
  { val: 'myself' as const, Icon: User,  label: 'For Me'       },
  { val: 'friend' as const, Icon: Users, label: 'For a Friend' },
]

const BLANK: DeliveryDetails = {
  orderFor: 'myself',
  myName: '', myPhone: '', myState: '', myAddress: '',
  friendName: '', friendPhone: '', friendState: '', friendAddress: '',
}

type Errors = Partial<Record<keyof DeliveryDetails, string>>

// ── Shared input class builders ────────────────────────────────
const inputCls = (err?: string) =>
  `w-full bg-brand-bg border rounded-xl px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 transition-all ${
    err ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
        : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/10'
  }`

const phoneCls = (err?: string) =>
  `w-full bg-brand-bg border rounded-xl pl-9 pr-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 transition-all ${
    err ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
        : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/10'
  }`

// ── Sub-components ─────────────────────────────────────────────
function ErrMsg({ msg }: { msg?: string }) {
  return msg ? <p className="text-red-500 text-[11px] mt-1">{msg}</p> : null
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <p className="text-xs font-bold text-brand-muted uppercase tracking-wide mb-1">
      {text}{required && <span className="text-red-400 ml-0.5 normal-case tracking-normal">*</span>}
    </p>
  )
}

function StateSelect({ value, onChange, err }: { value: string; onChange: (v: string) => void; err?: string }) {
  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted pointer-events-none" />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full appearance-none bg-brand-bg border rounded-xl pl-8 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
          err ? 'border-red-300 focus:border-red-400 focus:ring-red-100 text-brand-text'
              : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/10'
        } ${!value ? 'text-brand-muted' : 'text-brand-text'}`}
      >
        <option value="">Select state…</option>
        {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted pointer-events-none" />
    </div>
  )
}

// ── Delivery form (shared between mobile + desktop) ────────────
function DeliveryForm({
  details, errors, set, isFriend,
}: {
  details:  DeliveryDetails
  errors:   Errors
  set:      <K extends keyof DeliveryDetails>(k: K, v: DeliveryDetails[K]) => void
  isFriend: boolean
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={details.orderFor}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.16 }}
        className="space-y-3"
      >
        {isFriend ? (
          <>
            <div className="flex items-start gap-2 bg-brand-cashback-light rounded-xl px-3 py-2.5">
              <span className="text-sm mt-0.5">💜</span>
              <p className="text-brand-cashback text-xs font-medium">
                Fill in your friend&apos;s details — the order goes straight to them!
              </p>
            </div>

            {/* Name + Phone on same row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label text="Friend's Name" required />
                <input type="text" value={details.friendName}
                  onChange={e => set('friendName', e.target.value)}
                  placeholder="Amaka Okafor" className={inputCls(errors.friendName)} />
                <ErrMsg msg={errors.friendName} />
              </div>
              <div>
                <Label text="Friend's Phone" required />
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted pointer-events-none" />
                  <input type="tel" value={details.friendPhone}
                    onChange={e => set('friendPhone', e.target.value)}
                    placeholder="080 0000 0000" className={phoneCls(errors.friendPhone)} />
                </div>
                <ErrMsg msg={errors.friendPhone} />
              </div>
            </div>

            {/* State */}
            <div>
              <Label text="Friend's State" required />
              <StateSelect value={details.friendState}
                onChange={v => set('friendState', v)} err={errors.friendState} />
              <ErrMsg msg={errors.friendState} />
            </div>

            {/* Address */}
            <div>
              <Label text="Friend's Delivery Address" required />
              <textarea value={details.friendAddress} rows={2}
                onChange={e => set('friendAddress', e.target.value)}
                placeholder="e.g. 14 Allen Avenue, Ikeja"
                className={`w-full bg-brand-bg border rounded-xl px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.friendAddress ? 'border-red-300 focus:ring-red-100' : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/10'
                }`} />
              <ErrMsg msg={errors.friendAddress} />
            </div>
          </>
        ) : (
          <>
            {/* Name + Phone on same row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label text="Your Name" />
                <input type="text" value={details.myName}
                  onChange={e => set('myName', e.target.value)}
                  placeholder="Chidi Okonkwo" className={inputCls()} />
              </div>
              <div>
                <Label text="Your Phone" required />
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted pointer-events-none" />
                  <input type="tel" value={details.myPhone}
                    onChange={e => set('myPhone', e.target.value)}
                    placeholder="080 0000 0000" className={phoneCls(errors.myPhone)} />
                </div>
                <ErrMsg msg={errors.myPhone} />
              </div>
            </div>

            {/* State */}
            <div>
              <Label text="Your State" required />
              <StateSelect value={details.myState}
                onChange={v => set('myState', v)} err={errors.myState} />
              <ErrMsg msg={errors.myState} />
            </div>

            {/* Address */}
            <div>
              <Label text="Delivery Address" required />
              <textarea value={details.myAddress} rows={2}
                onChange={e => set('myAddress', e.target.value)}
                placeholder="e.g. 14 Allen Avenue, Ikeja, Lagos"
                className={`w-full bg-brand-bg border rounded-xl px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.myAddress ? 'border-red-300 focus:ring-red-100' : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/10'
                }`} />
              <ErrMsg msg={errors.myAddress} />
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main export ────────────────────────────────────────────────
export default function CheckoutModal({ open, items, onClose, onConfirm, prefill }: CheckoutModalProps) {
  const [details, setDetails] = useState<DeliveryDetails>(BLANK)
  const [errors,  setErrors]  = useState<Errors>({})

  // Reset form each time the modal opens, seeding with auth prefill
  useEffect(() => {
    if (open) {
      setDetails({
        ...BLANK,
        myName:  prefill?.name  ?? '',
        myPhone: prefill?.phone ?? '',
      })
      setErrors({})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const subtotal       = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee    = 500
  const total          = subtotal + deliveryFee
  const earnedCashback = Math.floor(subtotal * 0.05)
  const itemCount      = items.reduce((s, i) => s + i.quantity, 0)
  const isFriend       = details.orderFor === 'friend'

  function set<K extends keyof DeliveryDetails>(key: K, val: DeliveryDetails[K]) {
    setDetails(d => ({ ...d, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  function validate(): boolean {
    const e: Errors = {}
    if (isFriend) {
      if (!details.friendName.trim())    e.friendName    = "Friend's name is required"
      if (!details.friendPhone.trim())   e.friendPhone   = "Friend's phone is required"
      if (!details.friendState)          e.friendState   = 'Please select their state'
      if (!details.friendAddress.trim()) e.friendAddress = 'Delivery address is required'
    } else {
      if (!details.myPhone.trim())   e.myPhone   = 'Phone number is required'
      if (!details.myState)          e.myState   = 'Please select your state'
      if (!details.myAddress.trim()) e.myAddress = 'Delivery address is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleConfirm() {
    if (validate()) {
      onConfirm(details)
      setDetails(BLANK)
      setErrors({})
    }
  }

  // ── Price summary block (reused in both layouts) ─────────────
  const PriceSummary = () => (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-brand-muted">
        <span>Subtotal</span>
        <span className="text-brand-text font-medium">₦{subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-brand-muted">
        <span>Delivery fee</span>
        <span className="text-brand-text font-medium">₦{deliveryFee.toLocaleString()}</span>
      </div>
      <div className="flex justify-between font-syne font-bold text-brand-dark pt-2 border-t border-brand-border/60">
        <span>Total</span>
        <span className="text-brand-orange">₦{total.toLocaleString()}</span>
      </div>
    </div>
  )

  const CashbackPill = () => (
    <div className="bg-brand-cashback-light rounded-xl px-3 py-2.5 flex items-center gap-2">
      <span className="text-base">💜</span>
      <p className="text-brand-cashback text-xs font-medium">
        You&apos;ll earn <strong>₦{earnedCashback.toLocaleString()}</strong> cashback!
      </p>
    </div>
  )

  // NOTE: ConfirmBtn is NOT defined as an inner component — doing so causes
  // React to unmount/remount the motion.button on every render (new function
  // reference = new component type), which swallows the click mid-press.
  // The button JSX is inlined directly at both usage sites below.

  // ── Who-is-this-for toggle ───────────────────────────────────
  const OrderForToggle = () => (
    <div>
      <p className="text-xs font-bold text-brand-muted uppercase tracking-wide mb-2">Who is this for?</p>
      <div className="grid grid-cols-2 gap-2.5">
        {ORDER_FOR_OPTIONS.map(({ val, Icon, label }) => (
          <button key={val} type="button" onClick={() => set('orderFor', val)}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all ${
              details.orderFor === val
                ? 'border-brand-orange bg-brand-orange/5'
                : 'border-brand-border bg-brand-bg hover:border-brand-orange/40'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
              details.orderFor === val ? 'gradient-orange' : 'bg-white border border-brand-border'
            }`}>
              <Icon className={`w-4 h-4 ${details.orderFor === val ? 'text-white' : 'text-brand-muted'}`} />
            </div>
            <span className={`text-sm font-semibold ${details.orderFor === val ? 'text-brand-orange' : 'text-brand-muted'}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — desktop only (mobile is full page, no backdrop needed) */}
          <motion.div
            className="hidden md:block fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Wrapper */}
          <div className="fixed inset-0 z-[301] flex items-end md:items-center justify-center">
            <motion.div
              className={[
                // Mobile: full screen page
                'bg-white w-full h-full flex flex-col',
                // Desktop: centered dialog with 2-col layout
                'md:h-auto md:max-h-[88vh] md:max-w-3xl md:rounded-3xl md:shadow-2xl md:overflow-hidden',
              ].join(' ')}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            >

              {/* ── Shared header ─────────────────────────────── */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-brand-border shrink-0 bg-white">
                {/* Mobile: back arrow */}
                <button
                  onClick={onClose}
                  className="md:hidden w-9 h-9 -ml-1 flex items-center justify-center rounded-xl hover:bg-brand-bg transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5 text-brand-dark" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="hidden md:flex w-9 h-9 gradient-orange rounded-xl items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-syne font-bold text-brand-dark text-base sm:text-lg leading-tight">Checkout</h2>
                    <p className="text-brand-muted text-xs">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Desktop: X close button */}
                <motion.button
                  onClick={onClose}
                  className="hidden md:flex w-8 h-8 rounded-full bg-brand-bg hover:bg-brand-border items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-brand-text" />
                </motion.button>

                {/* Mobile: step indicator */}
                <div className="md:hidden text-xs font-semibold text-brand-muted">
                  ₦{total.toLocaleString()}
                </div>
              </div>

              {/* ── Body: side-by-side on desktop, stacked on mobile ── */}
              <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden min-h-0">

                {/* ── LEFT panel — desktop only: order + totals ── */}
                <div className="hidden md:flex flex-col w-72 shrink-0 bg-brand-bg border-r border-brand-border p-6 overflow-y-auto">

                  {/* Order items */}
                  <div className="mb-5">
                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3">Your Order</p>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-brand-border">
                            <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-brand-dark text-xs font-semibold truncate">{item.name}</p>
                            <p className="text-brand-muted text-[11px]">×{item.quantity}</p>
                          </div>
                          <span className="text-brand-orange font-bold text-xs shrink-0">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-brand-border mb-5" />

                  {/* Price summary */}
                  <PriceSummary />

                  {/* Cashback */}
                  <div className="mt-4">
                    <CashbackPill />
                  </div>
                </div>

                {/* ── RIGHT panel: form ──────────────────────── */}
                <div className="flex-1 flex flex-col min-h-0">

                  {/* Mobile: compact order summary strip */}
                  <div className="md:hidden bg-brand-bg border-b border-brand-border px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Your Order</p>
                      <span className="text-brand-orange font-bold text-sm">₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center gap-2.5">
                          <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0">
                            <Image src={item.image} alt={item.name} fill sizes="28px" className="object-cover" />
                          </div>
                          <p className="flex-1 text-xs text-brand-dark font-medium truncate">{item.name}</p>
                          <span className="text-brand-muted text-xs">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scrollable form body */}
                  <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 py-4 space-y-4">
                    <OrderForToggle />
                    <DeliveryForm details={details} errors={errors} set={set} isFriend={isFriend} />
                  </div>

                  {/* Mobile footer: totals + button */}
                  <div className="md:hidden border-t border-brand-border px-4 py-4 space-y-3 shrink-0 bg-white">
                    <PriceSummary />
                    <CashbackPill />
                    <button
                      onClick={handleConfirm}
                      className="w-full gradient-orange text-white py-3.5 rounded-full font-syne font-semibold text-sm shadow-card hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      Confirm Order · ₦{total.toLocaleString()}
                    </button>
                  </div>

                  {/* Desktop footer: just the button (totals on left) */}
                  <div className="hidden md:block border-t border-brand-border px-6 py-4 shrink-0 bg-white">
                    <button
                      onClick={handleConfirm}
                      className="w-full gradient-orange text-white py-3.5 rounded-full font-syne font-semibold text-sm shadow-card hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      Confirm Order · ₦{total.toLocaleString()}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
