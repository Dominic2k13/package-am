'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Users, Phone, MapPin, ChevronDown, Package } from 'lucide-react'
import { NIGERIAN_STATES } from '@/lib/nigerianStates'
import type { CartItem } from '@/types'

// ── Types ──────────────────────────────────────────────────────
export type OrderFor = 'myself' | 'friend'

export interface DeliveryDetails {
  orderFor: OrderFor
  // For myself
  myName:    string
  myPhone:   string
  myState:   string
  myAddress: string
  // For a friend
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
}

// ── Order-for options ──────────────────────────────────────────
const ORDER_FOR_OPTIONS = [
  { val: 'myself' as const, Icon: User,  label: 'For Me'         },
  { val: 'friend' as const, Icon: Users, label: 'For a Friend'   },
]

// ── Helpers ────────────────────────────────────────────────────
const BLANK: DeliveryDetails = {
  orderFor: 'myself',
  myName: '', myPhone: '', myState: '', myAddress: '',
  friendName: '', friendPhone: '', friendState: '', friendAddress: '',
}

type Errors = Partial<Record<keyof DeliveryDetails, string>>

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-brand-dark mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

function ErrorMsg({ msg }: { msg?: string }) {
  return msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null
}

const inputCls = (err?: string) =>
  `w-full bg-brand-bg border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 transition-all ${
    err
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/10'
  }`

const textareaCls = (err?: string) =>
  `w-full bg-brand-bg border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 transition-all resize-none ${
    err
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/10'
  }`

function StateSelect({
  value, onChange, err,
}: { value: string; onChange: (v: string) => void; err?: string }) {
  return (
    <div className="relative">
      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full appearance-none bg-brand-bg border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
          err
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100 text-brand-text'
            : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/10'
        } ${!value ? 'text-brand-muted' : 'text-brand-text'}`}
      >
        <option value="">Select state…</option>
        {NIGERIAN_STATES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
export default function CheckoutModal({ open, items, onClose, onConfirm }: CheckoutModalProps) {
  const [details, setDetails] = useState<DeliveryDetails>(BLANK)
  const [errors,  setErrors]  = useState<Errors>({})

  const subtotal       = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee    = 500
  const total          = subtotal + deliveryFee
  const earnedCashback = Math.floor(subtotal * 0.05)
  const itemCount      = items.reduce((s, i) => s + i.quantity, 0)

  function set<K extends keyof DeliveryDetails>(key: K, val: DeliveryDetails[K]) {
    setDetails(d => ({ ...d, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  function validate(): boolean {
    const e: Errors = {}
    if (details.orderFor === 'myself') {
      if (!details.myPhone.trim())   e.myPhone   = 'Phone number is required'
      if (!details.myState)          e.myState   = 'Please select your state'
      if (!details.myAddress.trim()) e.myAddress = 'Delivery address is required'
    } else {
      if (!details.friendName.trim())    e.friendName    = "Friend's name is required"
      if (!details.friendPhone.trim())   e.friendPhone   = "Friend's phone is required"
      if (!details.friendState)          e.friendState   = 'Please select their state'
      if (!details.friendAddress.trim()) e.friendAddress = 'Delivery address is required'
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

  const isFriend = details.orderFor === 'friend'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <div className="fixed inset-0 z-[301] flex items-end sm:items-center justify-center">
            <motion.div
              className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col shadow-2xl"
              initial={{ y: '100%', opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-0 sm:hidden shrink-0">
                <div className="w-10 h-1 bg-brand-border rounded-full" />
              </div>

              {/* ── Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-orange rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-syne font-bold text-brand-dark text-lg leading-tight">Checkout</h2>
                    <p className="text-brand-muted text-xs">
                      {itemCount} item{itemCount !== 1 ? 's' : ''} · ₦{total.toLocaleString()} total
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-brand-bg hover:bg-brand-border flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-brand-text" />
                </motion.button>
              </div>

              {/* ── Scrollable body */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5 space-y-6">

                {/* Order summary */}
                <div className="bg-brand-bg rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">Your Order</p>
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <p className="flex-1 text-brand-dark text-sm font-medium truncate">{item.name}</p>
                      <span className="text-brand-muted text-xs shrink-0">×{item.quantity}</span>
                      <span className="text-brand-orange font-bold text-sm shrink-0">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Who is this for? */}
                <div>
                  <p className="text-sm font-bold text-brand-dark mb-3">Who is this order for?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {ORDER_FOR_OPTIONS.map(({ val, Icon, label }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => set('orderFor', val)}
                        className={`flex flex-col items-center gap-2.5 py-4 px-3 rounded-2xl border-2 transition-all ${
                          details.orderFor === val
                            ? 'border-brand-orange bg-brand-orange/5'
                            : 'border-brand-border bg-brand-bg hover:border-brand-orange/40'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                          details.orderFor === val ? 'gradient-orange shadow-sm' : 'bg-white border border-brand-border'
                        }`}>
                          <Icon className={`w-5 h-5 ${details.orderFor === val ? 'text-white' : 'text-brand-muted'}`} />
                        </div>
                        <span className={`text-sm font-semibold ${details.orderFor === val ? 'text-brand-orange' : 'text-brand-muted'}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery form — switches between myself / friend */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={details.orderFor}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="space-y-4"
                  >
                    {isFriend ? (
                      /* ── Friend delivery form */
                      <>
                        <div className="flex items-start gap-2 bg-brand-cashback-light rounded-xl px-4 py-3">
                          <span className="text-base mt-0.5">💜</span>
                          <p className="text-brand-cashback text-xs font-medium">
                            Fill in your friend&apos;s details below — the order will go straight to them!
                          </p>
                        </div>

                        {/* Friend name */}
                        <div>
                          <FieldLabel label="Friend's Full Name" required />
                          <input
                            type="text"
                            value={details.friendName}
                            onChange={e => set('friendName', e.target.value)}
                            placeholder="e.g. Amaka Okafor"
                            className={inputCls(errors.friendName)}
                          />
                          <ErrorMsg msg={errors.friendName} />
                        </div>

                        {/* Friend phone */}
                        <div>
                          <FieldLabel label="Friend's Phone Number" required />
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                            <input
                              type="tel"
                              value={details.friendPhone}
                              onChange={e => set('friendPhone', e.target.value)}
                              placeholder="080 0000 0000"
                              className={`w-full bg-brand-bg border rounded-xl pl-10 pr-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 transition-all ${
                                errors.friendPhone
                                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                  : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/10'
                              }`}
                            />
                          </div>
                          <ErrorMsg msg={errors.friendPhone} />
                        </div>

                        {/* Friend state */}
                        <div>
                          <FieldLabel label="Friend's State" required />
                          <StateSelect
                            value={details.friendState}
                            onChange={v => set('friendState', v)}
                            err={errors.friendState}
                          />
                          <ErrorMsg msg={errors.friendState} />
                        </div>

                        {/* Friend address */}
                        <div>
                          <FieldLabel label="Friend's Delivery Address" required />
                          <textarea
                            value={details.friendAddress}
                            onChange={e => set('friendAddress', e.target.value)}
                            placeholder="e.g. 14 Allen Avenue, Ikeja"
                            rows={2}
                            className={textareaCls(errors.friendAddress)}
                          />
                          <ErrorMsg msg={errors.friendAddress} />
                        </div>
                      </>
                    ) : (
                      /* ── Self delivery form */
                      <>
                        {/* My name (optional) */}
                        <div>
                          <FieldLabel label="Your Full Name" />
                          <input
                            type="text"
                            value={details.myName}
                            onChange={e => set('myName', e.target.value)}
                            placeholder="e.g. Chidi Okonkwo"
                            className={inputCls()}
                          />
                        </div>

                        {/* My phone */}
                        <div>
                          <FieldLabel label="Your Phone Number" required />
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                            <input
                              type="tel"
                              value={details.myPhone}
                              onChange={e => set('myPhone', e.target.value)}
                              placeholder="080 0000 0000"
                              className={`w-full bg-brand-bg border rounded-xl pl-10 pr-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 transition-all ${
                                errors.myPhone
                                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                  : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/10'
                              }`}
                            />
                          </div>
                          <ErrorMsg msg={errors.myPhone} />
                        </div>

                        {/* My state */}
                        <div>
                          <FieldLabel label="Your State" required />
                          <StateSelect
                            value={details.myState}
                            onChange={v => set('myState', v)}
                            err={errors.myState}
                          />
                          <ErrorMsg msg={errors.myState} />
                        </div>

                        {/* My address */}
                        <div>
                          <FieldLabel label="Delivery Address" required />
                          <textarea
                            value={details.myAddress}
                            onChange={e => set('myAddress', e.target.value)}
                            placeholder="e.g. 14 Allen Avenue, Ikeja, Lagos"
                            rows={2}
                            className={textareaCls(errors.myAddress)}
                          />
                          <ErrorMsg msg={errors.myAddress} />
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ── Footer: totals + CTA */}
              <div className="px-6 py-5 border-t border-brand-border shrink-0 space-y-4 bg-white rounded-b-3xl">
                {/* Price breakdown */}
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
                    <span className="text-brand-orange text-lg">₦{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Cashback pill */}
                <div className="bg-brand-cashback-light rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <span>💜</span>
                  <p className="text-brand-cashback text-xs font-medium">
                    You&apos;ll earn <strong>₦{earnedCashback.toLocaleString()}</strong> cashback on this order!
                  </p>
                </div>

                {/* Confirm button */}
                <motion.button
                  onClick={handleConfirm}
                  className="w-full gradient-orange text-white py-4 rounded-full font-syne font-semibold text-sm shadow-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  Confirm Order · ₦{total.toLocaleString()}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
