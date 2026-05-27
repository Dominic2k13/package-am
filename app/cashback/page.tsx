'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Wallet, Smartphone, Wifi, UtensilsCrossed, ArrowRight,
  CheckCircle, AlertCircle, Clock, TrendingUp, Gift,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimateIn from '@/components/ui/AnimateIn'
import { StaggerGrid, StaggerItem } from '@/components/ui/StaggerGrid'

const CASHBACK_HISTORY = [
  { id: 1, label: 'Jollof Rice + Chicken',   amount: 225,  date: 'Today, 1:42 PM',     type: 'earn'  },
  { id: 2, label: 'Airtime Redemption',       amount: -500, date: 'Yesterday, 7:10 PM', type: 'redeem'},
  { id: 3, label: 'Peppered Suya',            amount: 150,  date: 'Mon, 19 May',        type: 'earn'  },
  { id: 4, label: 'Fried Rice & Plantain',    amount: 190,  date: 'Sat, 17 May',        type: 'earn'  },
  { id: 5, label: 'Data Bundle Redemption',   amount: -300, date: 'Fri, 16 May',        type: 'redeem'},
]

const REDEEM_TYPES = [
  { id: 'airtime',     label: 'Airtime',     icon: Smartphone      },
  { id: 'data',        label: 'Data',        icon: Wifi            },
  { id: 'food_credit', label: 'Food Credit', icon: UtensilsCrossed },
] as const

type RedeemType = typeof REDEEM_TYPES[number]['id']

const QUICK_AMOUNTS = [200, 500, 1000]

export default function CashbackPage() {
  const [balance,     setBalance]     = useState(1250)
  const [redeemType,  setRedeemType]  = useState<RedeemType>('airtime')
  const [phone,       setPhone]       = useState('')
  const [amount,      setAmount]      = useState('')
  const [loading,     setLoading]     = useState(false)
  const [success,     setSuccess]     = useState('')
  const [error,       setError]       = useState('')
  const [history,     setHistory]     = useState(CASHBACK_HISTORY)

  const numAmount = parseInt(amount) || 0

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const dest = redeemType === 'food_credit' ? 'account' : 'phone number'
    if (!phone.trim())      return setError(`Please enter a ${dest}.`)
    if (!amount)            return setError('Please enter an amount.')
    if (numAmount < 100)    return setError('Minimum redemption is ₦100.')
    if (numAmount > balance) return setError(`You only have ₦${balance.toLocaleString()} available.`)

    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)

    setBalance(b => b - numAmount)
    setHistory(h => [
      { id: Date.now(), label: `${REDEEM_TYPES.find(r => r.id === redeemType)!.label} Redemption`, amount: -numAmount, date: 'Just now', type: 'redeem' },
      ...h,
    ])
    setSuccess(`₦${numAmount.toLocaleString()} redeemed successfully${redeemType !== 'food_credit' ? ` to ${phone}` : ''}!`)
    setAmount('')
    setPhone('')
  }

  return (
    <>
      <Navbar cashback={balance} />

      <main className="min-h-[calc(100vh-4rem)] bg-brand-bg">

        {/* ── Balance hero ───────────────────────────────────── */}
        <section className="gradient-cashback py-14 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <AnimateIn direction="down" duration={0.5}>
              <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <Wallet className="w-4 h-4" /> My Cashback Wallet
              </div>
            </AnimateIn>
            <AnimateIn direction="up" delay={0.1} duration={0.55}>
              <p className="text-white/70 text-sm mb-2">Available balance</p>
              <motion.p
                className="font-syne font-extrabold text-white text-4xl sm:text-5xl md:text-6xl mb-2"
                key={balance}
                initial={{ scale: 1.08, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                ₦{balance.toLocaleString()}
              </motion.p>
              <p className="text-white/60 text-sm">5% back on every order — no expiry, no hassle</p>
            </AnimateIn>

            {/* Mini stats */}
            <AnimateIn direction="up" delay={0.22} duration={0.5}>
              <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-white/70" />
                    <span className="text-white/60 text-xs">Total Earned</span>
                  </div>
                  <p className="font-syne font-bold text-white text-xl">₦2,050</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 text-white/70" />
                    <span className="text-white/60 text-xs">Total Redeemed</span>
                  </div>
                  <p className="font-syne font-bold text-white text-xl">₦800</p>
                </div>
              </div>
            </AnimateIn>
          </div>
        </section>

        <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

          {/* ── Redeem form ──────────────────────────────────── */}
          <AnimateIn direction="up" delay={0.05}>
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-syne font-bold text-brand-dark text-lg mb-5">Redeem Cashback</h2>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {REDEEM_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setRedeemType(id); setError(''); setSuccess('') }}
                  className={`flex flex-col items-center gap-2 rounded-xl py-4 px-2 border-2 transition-all ${
                    redeemType === id
                      ? 'border-brand-cashback bg-brand-cashback-light'
                      : 'border-brand-border bg-brand-bg hover:border-brand-cashback/40'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${redeemType === id ? 'text-brand-cashback' : 'text-brand-muted'}`} />
                  <span className={`text-xs font-semibold ${redeemType === id ? 'text-brand-cashback' : 'text-brand-muted'}`}>{label}</span>
                </button>
              ))}
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {success && (
                <motion.div
                  key="success-alert"
                  className="mb-5 flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}
              {error && (
                <motion.div
                  key="error-alert"
                  className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleRedeem} className="space-y-4">
              {/* Phone / account field */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">
                  {redeemType === 'food_credit' ? 'Account / Username' : 'Phone Number'}
                </label>
                <input
                  type={redeemType === 'food_credit' ? 'text' : 'tel'}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder={redeemType === 'food_credit' ? 'your@email.com or username' : '080 0000 0000'}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-cashback focus:ring-2 focus:ring-brand-cashback/10 transition-all"
                />
              </div>

              {/* Amount field */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Amount (₦)</label>
                <input
                  type="number"
                  min={100}
                  max={balance}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-cashback focus:ring-2 focus:ring-brand-cashback/10 transition-all"
                />

                {/* Quick-fill */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {QUICK_AMOUNTS.map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(String(Math.min(q, balance)))}
                      className="flex-1 py-1.5 bg-brand-cashback-light text-brand-cashback text-xs font-semibold rounded-lg hover:bg-brand-cashback/20 transition-colors"
                    >
                      ₦{q}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount(String(balance))}
                    className="flex-1 py-1.5 bg-brand-cashback-light text-brand-cashback text-xs font-semibold rounded-lg hover:bg-brand-cashback/20 transition-colors"
                  >
                    All
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || balance === 0}
                className="w-full gradient-cashback text-white py-3.5 rounded-full font-syne font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-card"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing…
                  </>
                ) : (
                  <>Redeem ₦{numAmount > 0 ? numAmount.toLocaleString() : '0'} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
          </AnimateIn>

          {/* ── Earn more CTA ────────────────────────────────── */}
          <AnimateIn direction="up" delay={0.08}>
          <div className="gradient-orange rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white text-center sm:text-left">
              <p className="font-syne font-bold text-lg mb-1">Order more, earn more</p>
              <p className="text-white/80 text-sm">Every order puts 5% straight back in your wallet.</p>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-white text-brand-orange px-6 py-3 rounded-full font-syne font-semibold text-sm hover:bg-orange-50 transition-colors whitespace-nowrap shrink-0"
            >
              Order Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          </AnimateIn>

          {/* ── Recent activity ──────────────────────────────── */}
          <AnimateIn direction="up" delay={0.05}>
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-syne font-bold text-brand-dark text-lg mb-5">Recent Activity</h2>
            <StaggerGrid className="divide-y divide-brand-border">
              {history.map(tx => (
                <StaggerItem key={tx.id}>
                <div className="flex items-center gap-4 py-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'earn' ? 'bg-brand-cashback-light' : 'bg-orange-50'}`}>
                    {tx.type === 'earn'
                      ? <TrendingUp className="w-4 h-4 text-brand-cashback" />
                      : <Wallet className="w-4 h-4 text-brand-orange" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-brand-dark text-sm font-medium truncate max-w-[180px] sm:max-w-none">{tx.label}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-brand-muted" />
                      <span className="text-brand-muted text-xs">{tx.date}</span>
                    </div>
                  </div>
                  <span className={`font-syne font-bold text-sm shrink-0 ${tx.amount > 0 ? 'text-brand-cashback' : 'text-brand-orange'}`}>
                    {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
          </AnimateIn>

        </div>
      </main>

      <Footer />
    </>
  )
}
